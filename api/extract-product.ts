import { GoogleGenAI, Type } from '@google/genai';

function parseHtmlMeta(html: string, sourceUrl = '') {
  const getMeta = (prop: string) => {
    const match =
      html.match(
        new RegExp(
          `<meta[^>]*(?:property|name|itemprop)=["']${prop}["'][^>]*content=["']([^"']*)["']`,
          'i'
        )
      ) ||
      html.match(
        new RegExp(
          `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${prop}["']`,
          'i'
        )
      );
    return match ? match[1] : null;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

  // Suporte dedicado para Amazon (productTitle, priceAmount, landingImage / images/I)
  const isAmazon = /amazon\./i.test(sourceUrl);
  let amazonTitle = '';
  let amazonPrice: string | null = null;
  let amazonImage = '';

  if (isAmazon) {
    const prodTitleMatch = html.match(
      /<span[^>]*id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i
    );
    if (prodTitleMatch) {
      amazonTitle = prodTitleMatch[1].replace(/\s+/g, ' ').trim();
    }

    const priceAmountMatch = html.match(/"priceAmount"\s*:\s*([0-9]+(?:\.[0-9]+)?)/);
    if (priceAmountMatch) {
      amazonPrice = priceAmountMatch[1];
    } else {
      const wholeMatch = html.match(/<span[^>]*class=["'][^"']*a-price-whole[^"']*["'][^>]*>([\d.]+)/i);
      const fracMatch = html.match(/<span[^>]*class=["'][^"']*a-price-fraction[^"']*["'][^>]*>(\d+)/i);
      if (wholeMatch) {
        const whole = wholeMatch[1].replace(/\./g, '');
        const frac = fracMatch ? fracMatch[1] : '00';
        amazonPrice = `${whole}.${frac}`;
      }
    }

    const hiResMatch = html.match(/"hiRes"\s*:\s*"(https:\/\/[^"]+)"/);
    const largeMatch = html.match(/"large"\s*:\s*"(https:\/\/[^"]+)"/);
    const landingImgMatch =
      html.match(/<img[^>]*id=["']landingImage["'][^>]*src=["'](https:\/\/[^"']+)["']/i) ||
      html.match(/<img[^>]*src=["'](https:\/\/[^"']+)["'][^>]*id=["']landingImage["']/i);
    const amazonCdnMatch = html.match(
      /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+_-]+\.(?:jpg|jpeg|png|webp)/i
    );

    amazonImage =
      hiResMatch?.[1] ||
      largeMatch?.[1] ||
      landingImgMatch?.[1] ||
      amazonCdnMatch?.[0] ||
      '';
  }

  let jsonLdProduct: any = null;
  const ldJsonMatches = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  ];

  for (const m of ldJsonMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      const candidates = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.['@graph'])
          ? parsed['@graph']
          : [parsed];
      const found = candidates.find(
        (item: any) =>
          item?.['@type'] === 'Product' ||
          (Array.isArray(item?.['@type']) && item['@type'].includes('Product'))
      );
      if (found) {
        jsonLdProduct = found;
        break;
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  }

  const imageMatches = [
    ...html.matchAll(
      /<img[^>]*src=["']([^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi
    )
  ];
  const extractedImages = imageMatches
    .map((m) => m[1])
    .filter(
      (u) =>
        u.startsWith('http') &&
        !u.toLowerCase().includes('icon') &&
        !u.toLowerCase().includes('logo') &&
        !u.toLowerCase().includes('.svg')
    );

  const ldOffer = Array.isArray(jsonLdProduct?.offers)
    ? jsonLdProduct.offers[0]
    : jsonLdProduct?.offers;
  const ldImage = Array.isArray(jsonLdProduct?.image)
    ? jsonLdProduct.image[0]
    : typeof jsonLdProduct?.image === 'string'
      ? jsonLdProduct.image
      : jsonLdProduct?.image?.url;

  const rawPrice =
    ldOffer?.price ??
    ldOffer?.lowPrice ??
    getMeta('product:price:amount') ??
    getMeta('og:price:amount') ??
    null;

  return {
    title:
      amazonTitle ||
      jsonLdProduct?.name ||
      getMeta('og:title') ||
      (titleMatch ? titleMatch[1].trim() : ''),
    description:
      jsonLdProduct?.description ||
      getMeta('og:description') ||
      getMeta('description') ||
      '',
    image:
      amazonImage ||
      ldImage ||
      getMeta('og:image') ||
      getMeta('twitter:image') ||
      getMeta('image') ||
      (extractedImages.length > 0 ? extractedImages[0] : ''),
    price: amazonPrice ?? rawPrice,
    images: amazonImage ? [amazonImage, ...extractedImages].slice(0, 4) : extractedImages.slice(0, 4)
  };
}

const WEPINK_PRESETS: Record<string, any> = {
  'heaven-pink': {
    name: 'Body Splash Desodorante Colônia Heaven Pink 200ml',
    subtitle: 'Fragrância floral oriental doce, envolvente e viciante',
    category: 'bodysplash',
    price: 79.9,
    originalPrice: 129.9,
    volume: '200ml',
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    ],
    description:
      'O Body Splash Heaven Pink traz o acorde mais doce e sensual da perfumaria. Com notas florais marcantes associadas a toques frutados e fundo gourmand de baunilha e caramelo.',
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
    stock: 65
  },
  obsession: {
    name: 'Obsession Rouge Eau de Parfum 100ml',
    subtitle: 'A fragrância mais desejada com fixação superior a 14 horas',
    category: 'perfumaria',
    price: 189.9,
    originalPrice: 289.9,
    volume: '100ml',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
    ],
    description:
      'Fragrância marcante e sofisticada com pirâmide olfativa complexa e projeção envolvente.',
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
    stock: 45
  }
};

function parsePriceNumber(val: unknown): number | null {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return val;
  if (typeof val === 'string') {
    const cleaned = val
      .replace(/[^\d.,]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) return num;
  }
  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return res
        .status(400)
        .json({ success: false, error: 'URL do produto inválida.' });
    }

    const cleanUrl = url.trim();
    const lowerUrl = cleanUrl.toLowerCase();

    for (const [key, preset] of Object.entries(WEPINK_PRESETS)) {
      if (lowerUrl.includes(key)) {
        return res.status(200).json({ success: true, source: 'preset', data: preset });
      }
    }

    let pageHtml = '';
    let fetchedMeta: ReturnType<typeof parseHtmlMeta> | null = null;

    try {
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: AbortSignal.timeout(7000)
      });

      if (response.ok) {
        pageHtml = await response.text();
        fetchedMeta = parseHtmlMeta(pageHtml, cleanUrl);
      }
    } catch {
      // Site bloqueou fetch direto; segue para fallback inteligente
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Você é um extrator de catálogo de e-commerce de cosméticos e perfumaria no Brasil (Boticário, Natura, WePink, Eudora, Sephora).
Analise os dados abaixo e retorne um JSON estrito:
URL: ${cleanUrl}
Título encontrado: ${fetchedMeta?.title || ''}
Descrição encontrada: ${fetchedMeta?.description || ''}
Imagem encontrada: ${fetchedMeta?.image || ''}
Preço encontrado: ${fetchedMeta?.price || ''}
${pageHtml ? `Trecho HTML: ${pageHtml.slice(0, 3500)}` : ''}

Campos obrigatórios:
- name: Nome comercial limpo do produto
- subtitle: Subtítulo curto e atrativo
- category: Exatamente UMA entre "perfumaria", "bodysplash", "skincare", "maquiagem", "combos"
- price: Preço numérico em Reais (ex: 129.90)
- originalPrice: Preço "De" numérico (ex: 169.90)
- volume: Volume ou peso (ex: "100ml", "200ml", "50ml")
- images: Array de URLs de imagem (use a imagem encontrada se começar com http, ou uma imagem de cosmético do Unsplash)
- description: Descrição comercial em Português do Brasil
- benefits: Array com 3 a 4 benefícios curtos
- notes: { topo, coracao, fundo } ou null
- actives: Array de ativos (ou [])
- stock: Inteiro sugerido (ex: 50)`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                category: { type: Type.STRING },
                price: { type: Type.NUMBER },
                originalPrice: { type: Type.NUMBER },
                volume: { type: Type.STRING },
                images: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING },
                benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                notes: {
                  type: Type.OBJECT,
                  properties: {
                    topo: { type: Type.STRING },
                    coracao: { type: Type.STRING },
                    fundo: { type: Type.STRING }
                  }
                },
                actives: { type: Type.ARRAY, items: { type: Type.STRING } },
                stock: { type: Type.INTEGER }
              },
              required: [
                'name',
                'subtitle',
                'category',
                'price',
                'originalPrice',
                'volume',
                'images',
                'description',
                'benefits',
                'stock'
              ]
            }
          }
        });

        if (geminiRes.text) {
          const parsedData = JSON.parse(geminiRes.text.trim());
          if (
            !parsedData.images ||
            parsedData.images.length === 0 ||
            !String(parsedData.images[0]).startsWith('http')
          ) {
            parsedData.images = [
              fetchedMeta?.image && fetchedMeta.image.startsWith('http')
                ? fetchedMeta.image
                : 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
            ];
          }
          return res
            .status(200)
            .json({ success: true, source: 'gemini', data: parsedData });
        }
      } catch {
        // Fallback para extração heurística se Gemini falhar
      }
    }

    const urlParts = cleanUrl.split('?')[0].split('/').filter(Boolean);
    const lastSlug =
      urlParts[urlParts.length - 1] === 'p'
        ? urlParts[urlParts.length - 2]
        : urlParts[urlParts.length - 1];
    const cleanSlug = decodeURIComponent(lastSlug || 'produto')
      .replace(/---.*$/, '')
      .replace(/-\d+$/, '')
      .replace(/-/g, ' ')
      .trim();

    let detectedCat: 'perfumaria' | 'bodysplash' | 'skincare' | 'maquiagem' | 'combos' =
      'perfumaria';
    if (
      lowerUrl.includes('body-splash') ||
      lowerUrl.includes('bodysplash') ||
      lowerUrl.includes('splash')
    ) {
      detectedCat = 'bodysplash';
    } else if (
      lowerUrl.includes('serum') ||
      lowerUrl.includes('skincare') ||
      lowerUrl.includes('hidratante') ||
      lowerUrl.includes('creme') ||
      lowerUrl.includes('locao')
    ) {
      detectedCat = 'skincare';
    } else if (
      lowerUrl.includes('gloss') ||
      lowerUrl.includes('batom') ||
      lowerUrl.includes('base') ||
      lowerUrl.includes('maquiagem') ||
      lowerUrl.includes('mascara')
    ) {
      detectedCat = 'maquiagem';
    } else if (
      lowerUrl.includes('kit') ||
      lowerUrl.includes('combo') ||
      lowerUrl.includes('presente')
    ) {
      detectedCat = 'combos';
    }

    const volumeMatch =
      (fetchedMeta?.title || cleanUrl).match(/(\d+\s?(?:ml|g|kg|l))/i);
    const detectedVolume = volumeMatch ? volumeMatch[1].replace(/\s+/g, '') : '100ml';
    const parsedPrice = parsePriceNumber(fetchedMeta?.price) ?? 89.9;

    const fallbackImage =
      fetchedMeta?.image && fetchedMeta.image.startsWith('http')
        ? fetchedMeta.image
        : detectedCat === 'bodysplash'
          ? 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
          : detectedCat === 'skincare'
            ? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
            : detectedCat === 'maquiagem'
              ? 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80';

    const fallbackTitle =
      fetchedMeta?.title && fetchedMeta.title.length > 3
        ? fetchedMeta.title.split('|')[0].trim()
        : cleanSlug.replace(/\b\w/g, (l) => l.toUpperCase()) || 'Produto Vasconcelos';

    return res.status(200).json({
      success: true,
      source: fetchedMeta?.title ? 'meta' : 'heuristic',
      data: {
        name: fallbackTitle,
        subtitle:
          fetchedMeta?.description?.slice(0, 90) ||
          'Fragrância e cuidado exclusivo com alta qualidade',
        category: detectedCat,
        price: parsedPrice,
        originalPrice: Number((parsedPrice * 1.3).toFixed(2)),
        volume: detectedVolume,
        images: [fallbackImage],
        description:
          fetchedMeta?.description ||
          'Produto selecionado da curadoria VASCONCELOS Cosméticos & Perfumaria.',
        benefits: [
          'Produto original selecionado VASCONCELOS',
          'Entrega rápida via VasconcelosExpress (Frete Grátis)',
          'Atendimento personalizado via WhatsApp'
        ],
        notes:
          detectedCat === 'perfumaria' || detectedCat === 'bodysplash'
            ? {
                topo: 'Notas frescas de saída',
                coracao: 'Acorde floral envolvente',
                fundo: 'Notas quentes de longa fixação'
              }
            : null,
        stock: 50
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro interno ao processar o link do produto.'
    });
  }
}

