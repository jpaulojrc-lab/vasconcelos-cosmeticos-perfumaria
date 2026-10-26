import express from 'express';
import path from 'path';
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
