import { ProductCategory } from '../types';

export interface ExtractedImageProduct {
  name: string;
  subtitle: string;
  category: ProductCategory;
  volume: string;
  price: number;
  originalPrice: number;
  description: string;
  benefits: string[];
  actives: string[];
  notes?: { topo?: string; coracao?: string; fundo?: string } | null;
  imageDataUrl: string;
  fullImageDataUrl: string;
  source: 'gemini-vision' | 'ocr-local';
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'));
    img.src = src;
  });
}

export async function compressImageFile(
  file: File,
  maxDim = 960
): Promise<{ dataUrl: string; mimeType: string }> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.readAsDataURL(file);
  });

  const img = await loadImageElement(rawDataUrl);
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' };
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
  return { dataUrl, mimeType: 'image/jpeg' };
}

export async function cropImageByBox(
  dataUrl: string,
  cropBox: number[]
): Promise<string> {
  if (!Array.isArray(cropBox) || cropBox.length !== 4) return dataUrl;
  const [ymin, xmin, ymax, xmax] = cropBox.map((n) => Math.max(0, Math.min(1000, Number(n) || 0)));
  if (ymax - ymin < 120 || xmax - xmin < 120) return dataUrl;
  if (ymin <= 30 && xmin <= 30 && ymax >= 970 && xmax >= 970) return dataUrl;

  const img = await loadImageElement(dataUrl);
  // Adiciona margem de 3% ao redor do frasco para não cortar tampas ou sombras
  const pad = 30;
  const sy = Math.max(0, ((ymin - pad) / 1000) * img.height);
  const sx = Math.max(0, ((xmin - pad) / 1000) * img.width);
  const ey = Math.min(img.height, ((ymax + pad) / 1000) * img.height);
  const ex = Math.min(img.width, ((xmax + pad) / 1000) * img.width);
  const sw = Math.max(50, ex - sx);
  const sh = Math.max(50, ey - sy);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.88);
}

function inferCategoryFromText(text: string): ProductCategory {
  const lower = text.toLowerCase();
  if (/body\s*splash|splash/i.test(lower)) return 'bodysplash';
  if (/kit|combo|presente|conjunto/i.test(lower)) return 'combos';
  if (/batom|base|r[íi]mel|m[áa]scara de c[íi]lios|blush|sombra|corretivo|p[óo]\s*compacto|gloss|iluminador/i.test(lower)) {
    return 'maquiagem';
  }
  if (/eau de parfum|perfume|col[ôo]nia|deo\s*parfum|desodorante\s*col[ôo]nia|parfum/i.test(lower)) {
    return 'perfumaria';
  }
  return 'skincare';
}

export function parsePromotionalCardText(rawText: string): Omit<
  ExtractedImageProduct,
  'imageDataUrl' | 'fullImageDataUrl' | 'source'
> {
  const normalized = rawText
    .replace(/\r/g, '\n')
    .replace(/[|•]/g, ' ')
    .trim();

  // Extrai preços no padrão R$ 59,90 ou R$59.90
  const priceMatches = Array.from(normalized.matchAll(/R\$\s*(\d{1,4}(?:[.,]\d{2})?)/gi))
    .map((m) => parseFloat(m[1].replace(/\./g, '').replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 10000);

  const price = priceMatches.length > 0 ? priceMatches[priceMatches.length - 1] : 0;
  const originalPrice =
    priceMatches.length >= 2 && priceMatches[0] > price
      ? priceMatches[0]
      : price > 0
        ? Math.round(price * 1.25 * 100) / 100
        : 0;

  // Extrai volume (ex: 250ml, 250Ml, 200g)
  const volMatch = normalized.match(/\b(\d+(?:[.,]\d+)?\s*(?:ml|g|kg|l|fl\.?\s*oz))\b/i);
  const volume = volMatch ? volMatch[1].replace(/\s+/g, '').replace(/ml/i, 'ml') : '';

  // Filtra linhas úteis removendo telefones, avisos legais, códigos e valores
  const rawLines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 3);

  const cleanLines = rawLines.filter((line) => {
    if (/pe[çc]a\s*comigo|whatsapp|meramente\s*ilustrativa|divulgador|responsabilidade|condi[çc][õo]es\s*informadas/i.test(line)) {
      return false;
    }
    if (/\(\d{2}\)\s*\d{4,5}[-\s]?\d{4}/.test(line)) return false;
    if (/^R\$\s*\d/i.test(line)) return false;
    if (/^\d{3,8}$/.test(line.replace(/\s+/g, ''))) return false; // código tipo 53388
    if (/^\d+(?:[.,]\d+)?\s*(?:ml|g|kg|l)$/i.test(line)) return false; // linha só com "250Ml"
    return true;
  });

  let name = cleanLines[0] || 'Produto de Catálogo';
  if (volume) {
    name = name.replace(new RegExp(`\\b${volume}\\b`, 'i'), '').trim();
  }
  name = name.replace(/\s{2,}/g, ' ').slice(0, 90);

  const descriptionLines = cleanLines.slice(1).filter((l) => l.length > 8);
  const description =
    descriptionLines.join(' ').slice(0, 420) ||
    `${name} selecionado com curadoria especial vasconcelos Presente.`;

  const subtitle =
    descriptionLines[0]?.slice(0, 95) ||
    'Fragrância marcante e cuidado exclusivo para sua rotina';

  const category = inferCategoryFromText(`${name} ${description}`);

  return {
    name,
    subtitle,
    category,
    volume,
    price,
    originalPrice,
    description,
    benefits: [
      'Produto original selecionado vasconcelos Presente',
      'Entrega rápida via VasconcelosExpress (Frete Grátis)',
      'Qualidade e procedência garantidas'
    ],
    actives: [],
    notes: null
  };
}

let tesseractScriptPromise: Promise<any> | null = null;

function loadTesseractFromCdn(): Promise<any> {
  const w = window as any;
  if (w.Tesseract) return Promise.resolve(w.Tesseract);
  if (tesseractScriptPromise) return tesseractScriptPromise;

  tesseractScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).Tesseract) {
        resolve((window as any).Tesseract);
      } else {
        reject(new Error('Tesseract não inicializou corretamente.'));
      }
    };
    script.onerror = () => {
      tesseractScriptPromise = null;
      reject(new Error('Não foi possível carregar o leitor OCR no navegador.'));
    };
    document.head.appendChild(script);
  });

  return tesseractScriptPromise;
}

export async function extractProductFromImage(file: File): Promise<ExtractedImageProduct> {
  const { dataUrl, mimeType } = await compressImageFile(file, 960);

  // 1. Tenta extração via Gemini Vision (/api/extract-product-image)
  try {
    const res = await fetch('/api/extract-product-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: dataUrl, mimeType })
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.success && json?.data) {
        const d = json.data;
        const croppedUrl = Array.isArray(d.cropBox)
          ? await cropImageByBox(dataUrl, d.cropBox)
          : dataUrl;

        return {
          name: d.name || '',
          subtitle: d.subtitle || '',
          category: d.category || 'skincare',
          volume: d.volume || '',
          price: Number(d.price) || 0,
          originalPrice: Number(d.originalPrice) || Number(d.price) || 0,
          description: d.description || '',
          benefits: Array.isArray(d.benefits) ? d.benefits : [],
          actives: Array.isArray(d.actives) ? d.actives : [],
          notes: d.notes || null,
          imageDataUrl: croppedUrl,
          fullImageDataUrl: dataUrl,
          source: 'gemini-vision'
        };
      }
    }
  } catch {
    // Segue para fallback OCR local no navegador
  }

  // 2. Fallback: OCR local gratuito no navegador via Tesseract.js (Português)
  const Tesseract = await loadTesseractFromCdn();
  const result = await Tesseract.recognize(dataUrl, 'por');
  const rawText = result?.data?.text || '';
  const parsed = parsePromotionalCardText(rawText);

  return {
    ...parsed,
    imageDataUrl: dataUrl,
    fullImageDataUrl: dataUrl,
    source: 'ocr-local'
  };
}
