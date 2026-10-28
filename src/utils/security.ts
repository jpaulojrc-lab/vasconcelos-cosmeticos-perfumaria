/**
 * Utilitários de Segurança e Higienização de Dados
 * vasconcelos Presente — E-commerce de Luxo
 */

/**
 * Higieniza entradas de texto para prevenir ataques de Cross-Site Scripting (XSS).
 * Remove tags HTML, scripts inline, manipuladores de evento e protocolos perigosos.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Remove tags script, style e iframe completas
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove tags HTML remanescentes
    .replace(/<[^>]*>/g, '')
    // Substitui entidades perigosas comuns
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/**
 * Valida o número de cartão de crédito utilizando o Algoritmo de Luhn (módulo 10).
 * Padrão internacional utilizado por Visa, Mastercard, Elo, Amex, etc.
 */
export function isValidCreditCardNumber(cardNumber: string): boolean {
  if (!cardNumber) return false;

  // Remove espaços e traços
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');

  // Cartões válidos devem conter apenas dígitos e ter entre 13 e 19 caracteres
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Itera da direita para a esquerda
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Mascara dados confidenciais (números de cartão, CPF ou telefone)
 * mantendo apenas os últimos dígitos visíveis para conformidade de privacidade.
 */
export function maskSensitiveData(input: string, visibleDigits: number = 4): string {
  if (!input) return '';

  const clean = input.replace(/[\s-]/g, '');
  if (clean.length <= visibleDigits) return input;

  const hiddenPart = '•'.repeat(clean.length - visibleDigits);
  const visiblePart = clean.slice(-visibleDigits);

  return `${hiddenPart} ${visiblePart}`;
}
