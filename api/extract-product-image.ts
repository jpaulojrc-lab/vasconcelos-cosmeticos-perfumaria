import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Imagem não enviada.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        code: 'missing_api_key',
        error: 'GEMINI_API_KEY não configurada no servidor.'
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const safeMimeType = typeof mimeType === 'string' && mimeType.startsWith('image/')
      ? mimeType
      : 'image/jpeg';

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Você é um especialista em catálogo de cosméticos e perfumaria no Brasil (O Boticário, Natura, Eudora, WePink, Avon, etc.).
Analise esta imagem promocional ou foto de produto e extraia TODAS as informações do produto em JSON estrito:
- Ignorar números de WhatsApp/telefone de revendedora, avisos como "Imagem meramente ilustrativa" e códigos internos curtos (ex: 53388).
- name: Nome principal limpo do produto (sem o volume se já estiver em volume, ou mantenha o nome comercial claro).
- subtitle: Frase de apelo/subtítulo curto e atrativo em Português do Brasil.
- category: Exatamente UMA entre: "perfumaria", "bodysplash", "skincare", "maquiagem", "combos" (sabonetes, óleos, hidratantes e cremes corporais/faciais ficam em "skincare").
- volume: Volume ou peso encontrado (ex: "250ml", "200g", "100ml"). Se não houver, "".
- price: Preço promocional numérico em Reais (ex: 59.90). Se houver "De X por Y", use Y.
- originalPrice: Preço "De" numérico (se não houver na imagem, calcule aproximadamente 25% acima do price, arredondado).
- description: Descrição comercial completa lida na imagem (ou elaborada com base no produto).
- benefits: Array com 3 benefícios curtos do produto.
- actives: Array de ativos/ingredientes mencionados no rótulo ou linha (ex: ["Óleo de Quinoa", "Extrato de Ameixa"]).
- notes: Objeto { topo, coracao, fundo } se for perfume/body splash, ou null se não aplicável.
- cropBox: Coordenadas [ymin, xmin, ymax, xmax] (inteiros de 0 a 1000) da embalagem/frasco principal do produto na imagem, para recortar apenas o produto sem textos promocionais ou telefones ao redor. Se a foto já for só o produto, retorne [0, 0, 1000, 1000].`;

    const geminiRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: cleanBase64, mimeType: safeMimeType } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            category: { type: Type.STRING },
            volume: { type: Type.STRING },
            price: { type: Type.NUMBER },
            originalPrice: { type: Type.NUMBER },
            description: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            actives: { type: Type.ARRAY, items: { type: Type.STRING } },
            notes: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                topo: { type: Type.STRING },
                coracao: { type: Type.STRING },
                fundo: { type: Type.STRING }
              }
            },
            cropBox: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER }
            }
          },
          required: ['name', 'subtitle', 'category', 'price', 'description']
        }
      }
    });

    const text = geminiRes.text;
    if (!text) {
      return res.status(500).json({ success: false, error: 'Resposta vazia da IA.' });
    }

    const parsed = JSON.parse(text);
    const validCategories = ['perfumaria', 'bodysplash', 'skincare', 'maquiagem', 'combos'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'skincare';
    }

    return res.status(200).json({
      success: true,
      source: 'gemini-vision',
      data: parsed
    });
  } catch (err: any) {
    console.error('[Extract Product Image] Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro ao analisar a imagem do produto.'
    });
  }
}
