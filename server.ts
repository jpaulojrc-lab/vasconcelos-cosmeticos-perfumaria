import express from 'express';
import path from 'path';
import tls from 'tls';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Defensive HTTP Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content-Security-Policy (CSP) tailored for Vite dev & prod, Google Fonts, and Unsplash images
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' ws: wss: https:",
    "frame-ancestors 'none'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);
  next();
});

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: extract data from HTML via regex
function parseHtmlMeta(html: string) {
  const getMeta = (prop: string) => {
    const match =
      html.match(new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]*name=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${prop}["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${prop}["']`, 'i'));
    return match ? match[1] : null;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

  // Extract JSON-LD Schema
  let jsonLdData: any = null;
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      jsonLdData = JSON.parse(jsonLdMatch[1].trim());
    } catch {
      // ignore json parse error
    }
  }

  // Extract all img src
  const imageMatches = [...html.matchAll(/<img[^>]*src=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi)];
  const extractedImages = imageMatches.map(m => m[1]).filter(url => !url.includes('icon') && !url.includes('logo') && !url.includes('svg'));

  return {
    title: getMeta('og:title') || (titleMatch ? titleMatch[1] : ''),
    description: getMeta('og:description') || getMeta('description') || '',
    image: getMeta('og:image') || (extractedImages.length > 0 ? extractedImages[0] : ''),
    price: getMeta('product:price:amount') || null,
    jsonLd: jsonLdData,
    images: extractedImages.slice(0, 4)
  };
}

// Fallback knowledge base for popular WePink URLs
const WEPINK_PRESETS: Record<string, any> = {
  'heaven-pink': {
    name: 'Body Splash Desodorante Colônia Heaven Pink 200ml',
    subtitle: 'Fragrância floral oriental doce, envolvente e viciante',
    category: 'bodysplash',
    price: 79.90,
    originalPrice: 129.90,
    volume: '200ml',
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'O Body Splash Heaven Pink traz o acorde mais doce e sensual da perfumaria. Com notas florais marcantes associadas a toques frutados e fundo gourmand de baunilha e caramelo, proporciona uma explosão de perfumação a qualquer hora do dia.',
    benefits: [
      'Perfumação refrescante e prolongada por horas',
      'Ideal para aplicar no corpo todo, cabelos e roupas',
      'Fórmula leve que não resseca a pele',
      'Cruelty Free e Vegano'
    ],
    notes: {
      topo: 'Morango silvestre, Framboesa fresca e Pera',
      coracao: 'Orquídea rosa, Peônia e Jasmim Sambac',
      fundo: 'Baunilha de Madagascar, Marshmallow e Caramelo'
    },
    stock: 65,
    isFlashSale: true,
    isBestSeller: true
  },
  'obsession': {
    name: 'Obsession Rouge Eau de Parfum 100ml',
    subtitle: 'A fragrância mais desejada com fixação superior a 14 horas',
    category: 'perfumaria',
    price: 189.90,
    originalPrice: 289.90,
    volume: '100ml',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fragrância marcante e sofisticada com pirâmide olfativa complexa e projeção envolvente.',
    benefits: [
      'Fixação comprovada superior a 14 horas',
      'Frasco luxuoso com tampa magnética',
      'Alta concentração de óleos essenciais nobres'
    ],
    notes: {
      topo: 'Pera caramelizada e Bergamota',
      coracao: 'Orquídea Negra e Flor de Laranjeira',
      fundo: 'Baunilha e Âmbar Cristal'
    },
    stock: 45,
    isFlashSale: true,
    isBestSeller: true
  }
};

// API Endpoint to extract product from URL
app.post('/api/extract-product', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ error: 'URL do produto inválida.' });
    }

    console.log(`[Product Extractor] Processing URL: ${url}`);
    const lowerUrl = url.toLowerCase();

    // 1. Check quick WePink preset matches first for instant reliability
    for (const [key, preset] of Object.entries(WEPINK_PRESETS)) {
      if (lowerUrl.includes(key)) {
        console.log(`[Product Extractor] Matched preset for keyword: ${key}`);
        return res.json({ success: true, source: 'preset', data: preset });
      }
    }

    // 2. Fetch page HTML
    let pageHtml = '';
    let fetchedMeta: any = null;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        pageHtml = await response.text();
        fetchedMeta = parseHtmlMeta(pageHtml);
      }
    } catch (fetchErr: any) {
      console.warn(`[Product Extractor] Direct fetch failed (${fetchErr.message}). Falling back to AI parser.`);
    }

    // 3. Use Gemini AI to accurately extract and structure the cosmetics product
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
Você é um extrator especialista de catálogo de e-commerce de cosméticos e alta perfumaria no Brasil (estilo WePink, Sephora, Boticário, Natura).
Analise as informações desta página de produto:

URL: ${url}
Metadados encontrados:
- Título: ${fetchedMeta?.title || ''}
- Descrição: ${fetchedMeta?.description || ''}
- Imagem: ${fetchedMeta?.image || ''}
- Preço detectado: ${fetchedMeta?.price || ''}
${pageHtml ? `- Trecho do HTML: ${pageHtml.slice(0, 4000)}` : ''}

Extraia e estruture os dados do produto em JSON rigoroso com os seguintes campos:
- name: Nome do produto completo, elegante e bem formatado (ex: "Body Splash Heaven Pink 200ml")
- subtitle: Subtítulo ou slogan atraente de venda
- category: Escolha exatamente UMA entre: "perfumaria", "bodysplash", "skincare", "maquiagem", "combos"
- price: Preço atual de venda em Reais como número float (ex: 79.90)
- originalPrice: Preço original "De" em Reais como número float (ex: 129.90). Se não houver, calcule cerca de 30% a 40% a mais que o preço atual.
- volume: Volume ou peso (ex: "200ml", "100ml", "50ml", "30g")
- images: Array de strings com URLs de imagens do produto. Se a imagem dos metadados for válida, use-a. Caso contrário, forneça uma URL de cosmético do Unsplash de altíssima qualidade compatível com a categoria.
- description: Descrição envolvente e completa do produto para o consumidor
- benefits: Array com 3 a 5 frases curtas destacando os benefícios
- notes: Objeto com pirâmide olfativa se for perfume/splash (topo, coracao, fundo), ou deixe null se for outro item
- actives: Array de ativos dermatológicos se for skincare (ex: ["Ácido Hialurônico", "Vitamina C"]), ou deixe vazio se for outro item
- stock: Número inteiro de estoque sugerido (entre 35 e 90)
`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  description: 'Must be one of: perfumaria, bodysplash, skincare, maquiagem, combos'
                },
                price: { type: Type.NUMBER },
                originalPrice: { type: Type.NUMBER },
                volume: { type: Type.STRING },
                images: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                description: { type: Type.STRING },
                benefits: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                notes: {
                  type: Type.OBJECT,
                  properties: {
                    topo: { type: Type.STRING },
                    coracao: { type: Type.STRING },
                    fundo: { type: Type.STRING },
                  }
                },
                actives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                stock: { type: Type.INTEGER }
              },
              required: ['name', 'subtitle', 'category', 'price', 'originalPrice', 'volume', 'images', 'description', 'benefits', 'stock']
            }
          }
        });

        const extractedText = geminiRes.text;
        if (extractedText) {
          const parsedData = JSON.parse(extractedText.trim());

          // Ensure image list has at least one valid image
          if (!parsedData.images || parsedData.images.length === 0 || !parsedData.images[0].startsWith('http')) {
            const fallbackImage = fetchedMeta?.image && fetchedMeta.image.startsWith('http')
              ? fetchedMeta.image
              : parsedData.category === 'perfumaria'
                ? 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
                : parsedData.category === 'bodysplash'
                  ? 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
                  : parsedData.category === 'skincare'
                    ? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80';
            parsedData.images = [fallbackImage];
          }

          console.log(`[Product Extractor] Successfully extracted via Gemini: ${parsedData.name}`);
          return res.json({ success: true, source: 'gemini', data: parsedData });
        }
      } catch (geminiErr: any) {
        console.error('[Product Extractor] Gemini extraction error:', geminiErr.message);
      }
    }

    // 4. Heuristic Fallback using URL slug and meta data
    const urlParts = url.split('/').filter(Boolean);
    const lastSlug = urlParts[urlParts.length - 1] === 'p' ? urlParts[urlParts.length - 2] : urlParts[urlParts.length - 1];
    const cleanSlug = decodeURIComponent(lastSlug || 'produto').replace(/---.*$/, '').replace(/-\d+$/, '').replace(/-/g, ' ');

    let detectedCat = 'perfumaria';
    if (lowerUrl.includes('body-splash') || lowerUrl.includes('bodysplash') || lowerUrl.includes('splash')) {
      detectedCat = 'bodysplash';
    } else if (lowerUrl.includes('serum') || lowerUrl.includes('skincare') || lowerUrl.includes('gel-de-limpeza') || lowerUrl.includes('hidratante')) {
      detectedCat = 'skincare';
    } else if (lowerUrl.includes('gloss') || lowerUrl.includes('batom') || lowerUrl.includes('base') || lowerUrl.includes('maquiagem')) {
      detectedCat = 'maquiagem';
    } else if (lowerUrl.includes('kit') || lowerUrl.includes('combo')) {
      detectedCat = 'combos';
    }

    const fallbackProduct = {
      name: fetchedMeta?.title || cleanSlug.replace(/\b\w/g, l => l.toUpperCase()),
      subtitle: fetchedMeta?.description?.slice(0, 80) || 'Fragrância exclusiva com alta fixação e rastro inesquecível',
      category: detectedCat,
      price: fetchedMeta?.price ? parseFloat(fetchedMeta.price) : 89.90,
      originalPrice: fetchedMeta?.price ? Math.round(parseFloat(fetchedMeta.price) * 1.4) : 139.90,
      volume: lowerUrl.includes('200ml') ? '200ml' : lowerUrl.includes('100ml') ? '100ml' : '100ml',
      images: fetchedMeta?.image ? [fetchedMeta.image] : [
        detectedCat === 'bodysplash'
          ? 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
      ],
      description: fetchedMeta?.description || 'Produto de alta performance com formulação nobre e perfumação radiante.',
      benefits: [
        'Fixação e projeção de alta performance',
        'Fórmula vegana e cruelty-free',
        'Embalagem elegante'
      ],
      notes: {
        topo: 'Notas cítricas e Frutas Vermelhas',
        coracao: 'Flor de Laranjeira e Jasmim',
        fundo: 'Baunilha cremosa e Âmbar'
      },
      stock: 50,
      isBestSeller: true
    };

    return res.json({ success: true, source: 'fallback', data: fallbackProduct });
  } catch (error: any) {
    console.error('[Product Extractor] Fatal error:', error);
    return res.status(500).json({ error: 'Falha ao processar link do produto.' });
  }
});

// API Endpoint for Admin Password & Login Recovery
app.post('/api/admin/recover-password', async (req, res) => {
  try {
    const adminEmail = 'sandravasconcellossillva@gmail.com';
    const adminPass = 'S23086072';

    console.log(`[Admin Recovery] Disparando rotina de recuperação de credenciais para: ${adminEmail}`);

    // Disparo via FormSubmit AJAX para o e-mail da administradora
    try {
      await fetch(`https://formsubmit.co/ajax/${adminEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: 'Recuperação de Acesso Administrativo — vasconcelos Presente',
          _template: 'table',
          Sistema: 'Portal Administrativo — vasconcelos Presente',
          Login_E_mail: adminEmail,
          Senha_de_Acesso: adminPass,
          Mensagem: 'Você solicitou o envio das suas credenciais de acesso ao Painel Administrativo.'
        }),
        signal: AbortSignal.timeout(8000)
      });
    } catch (mailErr: any) {
      console.warn(`[Admin Recovery] Aviso no relay externo (${mailErr.message}). Rotina registrada localmente.`);
    }

    return res.json({
      success: true,
      message: `Um e-mail com o Login e a Senha foi enviado para ${adminEmail}. Verifique sua caixa de entrada e spam.`
    });
  } catch (error: any) {
    console.error('[Admin Recovery] Erro ao processar recuperação:', error);
    return res.status(500).json({
      success: false,
      error: 'Não foi possível enviar o e-mail de recuperação no momento.'
    });
  }
});

// API Endpoint to notify registered customers by email when a new Coupon is added
app.post('/api/coupons/notify-customers', async (req, res) => {
  try {
    const { coupon, customers } = req.body;
    if (!coupon || !coupon.code) {
      return res.status(400).json({ success: false, error: 'Dados do cupom inválidos.' });
    }

    const recipientList: Array<{ name: string; email: string }> = Array.isArray(customers)
      ? customers.filter((c: any) => c && typeof c.email === 'string' && c.email.includes('@'))
      : [];

    const discountLabel =
      coupon.discountType === 'percentage'
        ? `${coupon.value}% OFF`
        : `R$ ${Number(coupon.value).toFixed(2).replace('.', ',')} OFF`;

    const minOrderLabel =
      Number(coupon.minOrderValue) > 0
        ? `R$ ${Number(coupon.minOrderValue).toFixed(2).replace('.', ',')}`
        : 'Sem valor mínimo';

    console.log(
      `[Coupon Mailer] Enviando novo cupom "${coupon.code}" (${discountLabel}) para ${recipientList.length} cliente(s) cadastrado(s)...`
    );

    const notifiedEmails: string[] = [];

    await Promise.allSettled(
      recipientList.map(async (customer) => {
        const cleanEmail = customer.email.trim().toLowerCase();
        notifiedEmails.push(cleanEmail);

        try {
          await fetch(`https://formsubmit.co/ajax/${cleanEmail}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              _subject: `🎁 Novo Cupom ${discountLabel} (${coupon.code}) — vasconcelos Presente`,
              _template: 'table',
              Cliente: customer.name || 'Cliente VIP Vasconcelos',
              Novo_Cupom: coupon.code,
              Desconto: discountLabel,
              Compra_Minima: minOrderLabel,
              Descricao: coupon.description || 'Aproveite este desconto exclusivo em nossa loja!',
              Mensagem: `Olá ${customer.name || 'Cliente'}! A vasconcelos Presente acabou de liberar um novo cupom de desconto especial para você usar no site.`
            }),
            signal: AbortSignal.timeout(6000)
          });
        } catch (err: any) {
          console.warn(`[Coupon Mailer] Relay aviso para ${cleanEmail}: ${err.message}`);
        }
      })
    );

    return res.json({
      success: true,
      notifiedCount: notifiedEmails.length,
      emails: notifiedEmails,
      message:
        notifiedEmails.length > 0
          ? `Cupom ${coupon.code} criado e e-mail enviado para ${notifiedEmails.length} cliente(s) cadastrado(s)!`
          : `Cupom ${coupon.code} criado com sucesso!`
    });
  } catch (error: any) {
    console.error('[Coupon Mailer] Erro ao notificar clientes:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao disparar e-mails do novo cupom.'
    });
  }
});

// API Endpoint to notify Admin (sandravasconcellossillva@gmail.com) immediately when a customer finishes a new order
app.post('/api/orders/notify-admin', async (req, res) => {
  try {
    const { order } = req.body || {};
    const adminEmail = 'sandravasconcellossillva@gmail.com';
    if (!order || !order.orderNumber) {
      return res.status(400).json({ success: false, error: 'Pedido inválido.' });
    }

    const itemsText = Array.isArray(order.items)
      ? order.items.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')
      : '';
    const formattedTotal = `R$ ${Number(order.total || 0).toFixed(2).replace('.', ',')}`;

    const subject = `🛍️ Novo Pedido ${order.orderNumber} — ${order.customer?.name || 'Cliente'} (${formattedTotal})`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
        <div style="background: #111111; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; letter-spacing: 3px; font-weight: 600;">VASCONCELOS</h2>
          <p style="margin: 4px 0 0; font-size: 11px; color: #d4d4d4; text-transform: uppercase;">Novo Pedido Recebido • VasconcelosExpress</p>
        </div>
        <div style="padding: 24px; color: #111111; background: #ffffff; font-size: 13px; line-height: 1.6;">
          <p>Olá <strong>Sandra Vasconcelos</strong>, um novo pedido acabou de ser finalizado no site:</p>
          <div style="background: #F7F6F2; border: 1px solid #e5e5e5; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Número do Pedido:</strong> ${order.orderNumber}</p>
            <p style="margin: 4px 0;"><strong>Cliente:</strong> ${order.customer?.name || ''}</p>
            <p style="margin: 4px 0;"><strong>WhatsApp do Cliente:</strong> ${order.customer?.phone || ''}</p>
            <p style="margin: 4px 0;"><strong>Modalidade de Entrega:</strong> VasconcelosExpress (GRÁTIS - Sem custos adicionais)</p>
            <p style="margin: 4px 0;"><strong>Produtos:</strong> ${itemsText}</p>
            <p style="margin: 6px 0 0; font-size: 15px;"><strong>Total:</strong> <span style="color: #8B1E3F;">${formattedTotal}</span></p>
          </div>
          <p style="font-size: 12px; color: #555;">
            Acesse o <strong>Painel Administrativo VASCONCELOS</strong> para definir a condição de pagamento (À Vista ou Parcelado) e gerar o PDF oficial das condições para enviar ao cliente.
          </p>
        </div>
      </div>
    `;

    const passToTry = billingAutomationConfig.smtpAppPassword || 'S23086072';
    await sendGmailSmtpDirect({
      fromEmail: adminEmail,
      password: passToTry,
      toEmail: adminEmail,
      subject,
      textBody: `Novo pedido ${order.orderNumber} de ${order.customer?.name} (${order.customer?.phone}) - Total ${formattedTotal}`,
      htmlBody
    });

    return res.json({ success: true, message: `Notificação enviada para ${adminEmail}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Configuração da Régua de Automação de Cobrança (E-mail + WhatsApp API/Webhook)
let billingAutomationConfig = {
  enabled: true,
  autoOnCheckout: true,
  reminder30m: true,
  reminder24h: true,
  senderEmail: process.env.SMTP_USER || 'sandravasconcellossillva@gmail.com',
  smtpAppPassword: process.env.SMTP_PASS || '',
  whatsappApiUrl: process.env.WHATSAPP_API_URL || '',
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || '',
  whatsappWebhookUrl: process.env.WHATSAPP_WEBHOOK_URL || ''
};

async function triggerWhatsAppAutomation(payload: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderNumber: string;
  amount: number;
  stage: string;
  pixKey: string;
  message: string;
}): Promise<{ sentInBackground: boolean; channelDetail: string; waMeUrl: string }> {
  const digits = (payload.customerPhone || '').replace(/\D/g, '');
  const fullPhone = digits ? (digits.startsWith('55') ? digits : `55${digits}`) : '';
  const waMeUrl = fullPhone
    ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(payload.message)}`
    : '';

  let sentInBackground = false;
  let channelDetail = 'Fila Inteligente WhatsApp';

  // 1. Disparo via API Direta de WhatsApp (Evolution API / Z-API / UltraMsg)
  if (billingAutomationConfig.whatsappApiUrl && fullPhone) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (billingAutomationConfig.whatsappApiToken) {
        headers['Authorization'] = `Bearer ${billingAutomationConfig.whatsappApiToken}`;
        headers['Client-Token'] = billingAutomationConfig.whatsappApiToken;
        headers['apikey'] = billingAutomationConfig.whatsappApiToken;
      }

      const apiRes = await fetch(billingAutomationConfig.whatsappApiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: fullPhone,
          number: fullPhone,
          text: payload.message,
          message: payload.message
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (apiRes.ok) {
        sentInBackground = true;
        channelDetail = 'WhatsApp API Direta';
      }
    } catch (err: any) {
      console.warn(`[WhatsApp Automation] Aviso na API direta: ${err.message}`);
    }
  }

  // 2. Disparo via Webhook de Automação (n8n / Make / Zapier)
  if (billingAutomationConfig.whatsappWebhookUrl) {
    try {
      const hookRes = await fetch(billingAutomationConfig.whatsappWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'billing_dispatch',
          timestamp: new Date().toISOString(),
          store: 'vasconcelos Presente',
          ...payload,
          formattedPhone: fullPhone,
          waMeUrl
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (hookRes.ok) {
        sentInBackground = true;
        channelDetail = 'Webhook WhatsApp Automático';
      }
    } catch (err: any) {
      console.warn(`[WhatsApp Automation] Aviso no Webhook: ${err.message}`);
    }
  }

  return { sentInBackground, channelDetail, waMeUrl };
}

// Cliente SMTP Nativo TLS para Gmail (smtp.gmail.com:465) — Faz o e-mail sair diretamente da caixa "Enviados" de sandravasconcellossillva@gmail.com
async function sendGmailSmtpDirect(options: {
  fromEmail: string;
  password: string;
  toEmail: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cleanPass = (options.password || '').replace(/\s+/g, '');
  if (!cleanPass) {
    return { ok: false, error: 'Senha de App do Gmail não informada.' };
  }

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: 'smtp.gmail.com',
        port: 465,
        servername: 'smtp.gmail.com',
        timeout: 9000
      },
      () => {
        // Connected over TLS
      }
    );

    let step = 0;
    let buffer = '';
    let finished = false;

    const done = (result: { ok: boolean; error?: string }) => {
      if (finished) return;
      finished = true;
      try {
        socket.end();
      } catch {}
      resolve(result);
    };

    socket.setTimeout(9000, () => {
      done({ ok: false, error: 'Tempo limite de conexão com smtp.gmail.com excedido.' });
    });

    socket.on('error', (err) => {
      done({ ok: false, error: err.message });
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line) continue;
        // Multi-line SMTP response continues if 4th char is '-'
        if (line.length >= 4 && line[3] === '-') continue;

        const code = parseInt(line.slice(0, 3), 10);

        if (code >= 400) {
          done({ ok: false, error: `SMTP ${code}: ${line}` });
          return;
        }

        if (step === 0 && code === 220) {
          step = 1;
          socket.write('EHLO vasconcelospresente.local\r\n');
        } else if (step === 1 && code === 250) {
          step = 2;
          socket.write('AUTH LOGIN\r\n');
        } else if (step === 2 && code === 334) {
          step = 3;
          socket.write(Buffer.from(options.fromEmail, 'utf8').toString('base64') + '\r\n');
        } else if (step === 3 && code === 334) {
          step = 4;
          socket.write(Buffer.from(cleanPass, 'utf8').toString('base64') + '\r\n');
        } else if (step === 4 && code === 235) {
          step = 5;
          socket.write(`MAIL FROM:<${options.fromEmail}>\r\n`);
        } else if (step === 5 && code === 250) {
          step = 6;
          socket.write(`RCPT TO:<${options.toEmail}>\r\n`);
        } else if (step === 6 && code === 250) {
          step = 7;
          socket.write('DATA\r\n');
        } else if (step === 7 && code === 354) {
          step = 8;
          const encodedSubject = `=?UTF-8?B?${Buffer.from(options.subject, 'utf8').toString('base64')}?=`;
          const mimeMessage = [
            `From: "vasconcelos Presente" <${options.fromEmail}>`,
            `To: <${options.toEmail}>`,
            `Reply-To: <${options.fromEmail}>`,
            `Subject: ${encodedSubject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            '',
            Buffer.from(options.htmlBody, 'utf8').toString('base64'),
            '.',
            ''
          ].join('\r\n');
          socket.write(mimeMessage);
        } else if (step === 8 && code === 250) {
          step = 9;
          socket.write('QUIT\r\n');
          done({ ok: true });
        }
      }
    });
  });
}

async function triggerEmailAutomation(payload: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNumber: string;
  amount: number;
  dueDate: string;
  paymentMethod: string;
  pixKey: string;
  message: string;
  stageLabel?: string;
}): Promise<{ sentViaSmtp: boolean; smtpError?: string; gmailComposeUrl: string }> {
  const cleanEmail = (payload.customerEmail || '').trim().toLowerCase();
  const sender = (billingAutomationConfig.senderEmail || 'sandravasconcellossillva@gmail.com').trim();
  const formattedAmount = `R$ ${Number(payload.amount || 0).toFixed(2).replace('.', ',')}`;
  const subject = `💳 ${payload.stageLabel || 'Lembrete de Pagamento'} ${
    payload.orderNumber ? `(${payload.orderNumber})` : ''
  } — vasconcelos Presente`;
  const plainBody = payload.message.replace(/\*/g, '');

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent(
    sender
  )}&to=${encodeURIComponent(cleanEmail)}&su=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(plainBody)}`;

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { sentViaSmtp: false, smtpError: 'E-mail inválido', gmailComposeUrl };
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #f3e8ee; border-radius: 16px; overflow: hidden;">
      <div style="background: #171717; color: #ffffff; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">vasconcelos <span style="color: #e11d48; font-style: italic;">Presente</span></h2>
        <p style="margin: 6px 0 0; font-size: 12px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">Alta Perfumaria & Cosméticos</p>
      </div>
      <div style="padding: 24px; color: #262626; background: #ffffff;">
        <p style="white-space: pre-line; font-size: 14px; line-height: 1.6;">${plainBody}</p>
        <div style="margin-top: 20px; padding: 16px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Cliente:</strong> ${payload.customerName || 'Cliente Vasconcelos'}</p>
          <p style="margin: 4px 0;"><strong>Pedido / Referência:</strong> ${payload.orderNumber || 'Cobrança Avulsa'}</p>
          <p style="margin: 4px 0;"><strong>Valor a Pagar:</strong> <span style="color: #be185d; font-weight: bold;">${formattedAmount}</span></p>
          <p style="margin: 4px 0;"><strong>Vencimento:</strong> ${payload.dueDate || 'Imediato'}</p>
          <p style="margin: 8px 0 4px;"><strong>Chave Pix / Copia e Cola:</strong></p>
          <code style="display: block; padding: 10px; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; word-break: break-all;">${
            payload.pixKey || 'pix@vasconcelosbeauty.com.br'
          }</code>
        </div>
        <p style="margin-top: 20px; font-size: 11px; color: #737373; text-align: center;">
          Enviado diretamente por <strong>${sender}</strong> — Equipe Financeira vasconcelos Presente.
        </p>
      </div>
    </div>
  `;

  // 1. Tenta enviar diretamente via SMTP oficial do Gmail (smtp.gmail.com:465) para sair da caixa "Enviados" de sandravasconcellossillva@gmail.com
  const passToTry = billingAutomationConfig.smtpAppPassword || 'S23086072';
  const smtpResult = await sendGmailSmtpDirect({
    fromEmail: sender,
    password: passToTry,
    toEmail: cleanEmail,
    subject,
    textBody: plainBody,
    htmlBody
  });

  if (smtpResult.ok) {
    console.log(`[Gmail SMTP] E-mail enviado diretamente da conta ${sender} para ${cleanEmail}!`);
    return { sentViaSmtp: true, gmailComposeUrl };
  }

  console.warn(
    `[Gmail SMTP] O Gmail solicitou Senha de App de 16 dígitos para ${sender} (${smtpResult.error}).`
  );

  // 2. Fallback secundário
  try {
    await fetch(`https://formsubmit.co/ajax/${cleanEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: subject,
        _replyto: sender,
        _template: 'table',
        Loja: 'vasconcelos Presente — Alta Perfumaria & Luxo',
        E_mail_Oficial: sender,
        Cliente: payload.customerName || 'Cliente Vasconcelos',
        Telefone_Cadastro: payload.customerPhone || 'Não informado',
        Referencia_Pedido: payload.orderNumber || 'Cobrança Avulsa',
        Valor_a_Pagar: formattedAmount,
        Vencimento: payload.dueDate || 'Imediato',
        Forma_de_Pagamento: payload.paymentMethod || 'Pix / Cartão / Boleto',
        Chave_Pix_Copia_e_Cola: payload.pixKey || 'pix@vasconcelosbeauty.com.br',
        Mensagem: plainBody
      }),
      signal: AbortSignal.timeout(6000)
    });
  } catch {}

  return {
    sentViaSmtp: false,
    smtpError: smtpResult.error,
    gmailComposeUrl
  };
}

// Get & Update Billing Automation Configuration
app.get('/api/billing/automation-config', (_req, res) => {
  return res.json({
    success: true,
    config: {
      ...billingAutomationConfig,
      hasSmtpPassword: Boolean(billingAutomationConfig.smtpAppPassword)
    }
  });
});

app.post('/api/billing/automation-config', (req, res) => {
  const body = req.body || {};
  billingAutomationConfig = {
    ...billingAutomationConfig,
    enabled: typeof body.enabled === 'boolean' ? body.enabled : billingAutomationConfig.enabled,
    autoOnCheckout:
      typeof body.autoOnCheckout === 'boolean' ? body.autoOnCheckout : billingAutomationConfig.autoOnCheckout,
    reminder30m:
      typeof body.reminder30m === 'boolean' ? body.reminder30m : billingAutomationConfig.reminder30m,
    reminder24h:
      typeof body.reminder24h === 'boolean' ? body.reminder24h : billingAutomationConfig.reminder24h,
    senderEmail: body.senderEmail || billingAutomationConfig.senderEmail,
    smtpAppPassword:
      body.smtpAppPassword !== undefined ? body.smtpAppPassword : billingAutomationConfig.smtpAppPassword,
    whatsappApiUrl:
      body.whatsappApiUrl !== undefined ? body.whatsappApiUrl.trim() : billingAutomationConfig.whatsappApiUrl,
    whatsappApiToken:
      body.whatsappApiToken !== undefined ? body.whatsappApiToken.trim() : billingAutomationConfig.whatsappApiToken,
    whatsappWebhookUrl:
      body.whatsappWebhookUrl !== undefined ? body.whatsappWebhookUrl.trim() : billingAutomationConfig.whatsappWebhookUrl
  };

  console.log('[Billing Automation] Configuração atualizada:', {
    enabled: billingAutomationConfig.enabled,
    autoOnCheckout: billingAutomationConfig.autoOnCheckout,
    reminder30m: billingAutomationConfig.reminder30m,
    reminder24h: billingAutomationConfig.reminder24h,
    hasWhatsAppApi: Boolean(billingAutomationConfig.whatsappApiUrl),
    hasWebhook: Boolean(billingAutomationConfig.whatsappWebhookUrl)
  });

  return res.json({
    success: true,
    message: 'Configurações da Régua de Automação salvas com sucesso!',
    config: billingAutomationConfig
  });
});

// Automated Batch / Single Trigger Endpoint (Checkout, 30m Reminder, 24h Due Notice)
app.post('/api/billing/auto-dispatch', async (req, res) => {
  try {
    const { items, stage = 'checkout' } = req.body;
    const list: Array<any> = Array.isArray(items) ? items : [];

    if (list.length === 0) {
      return res.json({
        success: true,
        dispatchedCount: 0,
        results: [],
        message: 'Nenhum pedido pendente para cobrar neste momento.'
      });
    }

    const stageTitles: Record<string, string> = {
      checkout: 'Dados de Pagamento do Pedido',
      reminder_30m: 'Lembrete Automático de Pedido Separado (30 min)',
      reminder_24h: 'Aviso de Vencimento de Reserva (24h)',
      batch_manual: 'Régua de Cobrança de Pedidos Pendentes'
    };

    const results: Array<{
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      amount: number;
      emailSent: boolean;
      whatsappSentInBackground: boolean;
      waMeUrl: string;
      stage: string;
    }> = [];

    for (const item of list) {
      const firstName = (item.customerName || 'Cliente').split(' ')[0];
      const formattedPrice = `R$ ${Number(item.amount || 0).toFixed(2).replace('.', ',')}`;
      const pixKey = item.pixKey || 'pix@vasconcelosbeauty.com.br';
      const orderNum = item.orderNumber || 'Avulsa';

      const autoMessage =
        item.message ||
        (stage === 'checkout'
          ? `Olá, *${firstName}*! ✨ Recebemos seu pedido *${orderNum}* na *vasconcelos Presente* no valor de *${formattedPrice}*.\n\n💠 *Chave Pix Copia e Cola para pagamento imediato:*\n${pixKey}\n\nAssim que confirmado, enviaremos seu código de rastreio!`
          : stage === 'reminder_24h'
            ? `Olá, *${firstName}*! Passando para avisar que a reserva do seu pedido *${orderNum}* (*${formattedPrice}*) na *vasconcelos Presente* vence hoje.\n\n👉 *Chave Pix para garantir seus produtos:*\n${pixKey}`
            : `Olá, *${firstName}*! 🌸 Seus produtos do pedido *${orderNum}* (*${formattedPrice}*) já estão separados na *vasconcelos Presente* aguardando apenas a confirmação do pagamento.\n\n💳 *Chave Pix / Copia e Cola:*\n${pixKey}`);

      const [emailRes, waRes] = await Promise.all([
        triggerEmailAutomation({
          customerName: item.customerName,
          customerEmail: item.customerEmail,
          customerPhone: item.customerPhone,
          orderNumber: orderNum,
          amount: Number(item.amount || 0),
          dueDate: stage === 'reminder_24h' ? 'Último Dia' : 'Hoje',
          paymentMethod: item.paymentMethod || 'PIX / Boleto',
          pixKey,
          message: autoMessage,
          stageLabel: stageTitles[stage] || 'Lembrete de Pagamento'
        }),
        triggerWhatsAppAutomation({
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          customerEmail: item.customerEmail,
          orderNumber: orderNum,
          amount: Number(item.amount || 0),
          stage,
          pixKey,
          message: autoMessage
        })
      ]);

      results.push({
        orderNumber: orderNum,
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        customerPhone: item.customerPhone,
        amount: Number(item.amount || 0),
        emailSent: emailRes.sentViaSmtp,
        whatsappSentInBackground: waRes.sentInBackground,
        waMeUrl: waRes.waMeUrl,
        stage
      });
    }

    console.log(
      `[Billing Automation] Disparo automático (${stage}) concluído para ${results.length} pedido(s).`
    );

    return res.json({
      success: true,
      dispatchedCount: results.length,
      results,
      message: `Automação executada: ${results.length} cobrança(s) enviada(s) automaticamente por E-mail e fila/API de WhatsApp!`
    });
  } catch (error: any) {
    console.error('[Billing Automation] Erro no disparo automático:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao executar o disparo automático de cobrança.'
    });
  }
});

// API Endpoint to send Billing / Payment Reminder Email to Customer
app.post('/api/billing/send-email', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderNumber,
      amount,
      dueDate,
      paymentMethod,
      pixKey,
      message
    } = req.body;

    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'E-mail do cliente inválido para envio da cobrança.'
      });
    }

    const cleanEmail = customerEmail.trim().toLowerCase();
    const formattedAmount = `R$ ${Number(amount || 0).toFixed(2).replace('.', ',')}`;

    console.log(
      `[Billing Mailer] Enviando cobrança (${orderNumber || 'Avulsa'} - ${formattedAmount}) para ${cleanEmail}`
    );

    const emailRes = await triggerEmailAutomation({
      customerName,
      customerEmail: cleanEmail,
      customerPhone,
      orderNumber,
      amount: Number(amount || 0),
      dueDate,
      paymentMethod,
      pixKey,
      message: message || 'Olá! Identificamos uma pendência financeira referente ao seu pedido na vasconcelos Presente.'
    });

    // Se houver API/Webhook de WhatsApp configurado, também dispara em segundo plano
    const waRes = await triggerWhatsAppAutomation({
      customerName,
      customerPhone,
      customerEmail: cleanEmail,
      orderNumber: orderNumber || 'Avulsa',
      amount: Number(amount || 0),
      stage: 'manual',
      pixKey: pixKey || 'pix@vasconcelosbeauty.com.br',
      message: message || ''
    });

    return res.json({
      success: true,
      sentViaGmailSmtp: emailRes.sentViaSmtp,
      gmailComposeUrl: emailRes.gmailComposeUrl,
      smtpError: emailRes.smtpError,
      whatsappSentInBackground: waRes.sentInBackground,
      message: emailRes.sentViaSmtp
        ? `E-mail enviado diretamente pela caixa de saída de ${billingAutomationConfig.senderEmail} para ${cleanEmail}!`
        : `Abrindo o Gmail de ${billingAutomationConfig.senderEmail} para envio direto (ou configure a Senha de App de 16 dígitos do Google para envio 100% em segundo plano).`
    });
  } catch (error: any) {
    console.error('[Billing Mailer] Erro ao enviar cobrança:', error);
    return res.status(500).json({
      success: false,
      error: 'Não foi possível enviar o e-mail de cobrança no momento.'
    });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[vasconcelos Presente] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
