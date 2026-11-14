export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatInstallment = (total: number, maxInstallments = 10): string => {
  const installmentValue = total / maxInstallments;
  return `${maxInstallments}x de ${formatBRL(installmentValue)} sem juros`;
};

export const formatDate = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
};

/**
 * Sanitizes untrusted or HTML-entity-encoded strings into clean plain text.
 * Uses Document.parseHTML (Sanitizer API) when supported, with an inert DOMParser fallback.
 */
export const sanitizeHtmlToText = (raw?: string): string => {
  if (!raw) return '';

  const parseInertHtml = (html: string): Document | null => {
    if (typeof window === 'undefined') return null;
    if ('parseHTML' in Document) {
      const parseHTML = (
        Document as unknown as {
          parseHTML: (input: string, options?: { sanitizer?: { elements?: string[]; attributes?: string[] } }) => Document;
        }
      ).parseHTML;
      return parseHTML(html, {
        sanitizer: {
          elements: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'div', 'span'],
          attributes: []
        }
      });
    }
    return new DOMParser().parseFromString(html, 'text/html');
  };

  // Pass 1: decode HTML entities (e.g. &lt;strong&gt; -> <strong>) in an inert document
  const entityDoc = typeof window !== 'undefined'
    ? new DOMParser().parseFromString(raw, 'text/html')
    : null;
  const decoded = entityDoc?.documentElement?.textContent ?? raw;

  // Remove any truncated trailing tag or entity caused by DB/text slicing (e.g. "</str" or "&lt;")
  const withoutTrailingPartial = decoded.replace(/(?:<[^>]*|&[a-zA-Z0-9#]+)$/, '').trim();

  // Pass 2: sanitize and extract plain text with spacing around line/block breaks
  const withBreakSpaces = withoutTrailingPartial.replace(/<(br|\/p|\/div|\/li)\b[^>]*>/gi, ' <$1>');
  const doc = parseInertHtml(withBreakSpaces);
  const text = doc?.body?.textContent ?? withoutTrailingPartial.replace(/<[^>]+>/g, ' ');

  return text.replace(/\s+/g, ' ').trim();
};
