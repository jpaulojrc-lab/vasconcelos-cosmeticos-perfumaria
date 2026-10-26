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
