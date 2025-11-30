export const cfg = {
  // values in cents
  MIN_DEPOSIT: process.env.NEXT_PUBLIC_MIN_DEPOSIT
    ? Number(process.env.NEXT_PUBLIC_MIN_DEPOSIT)
    : 1000, // R$ 10.00
  MAX_DEPOSIT: process.env.NEXT_PUBLIC_MAX_DEPOSIT
    ? Number(process.env.NEXT_PUBLIC_MAX_DEPOSIT)
    : 1500000, // R$ 15.000,00
  MIN_WITHDRAWAL: process.env.NEXT_PUBLIC_MIN_WITHDRAWAL
    ? Number(process.env.NEXT_PUBLIC_MIN_WITHDRAWAL)
    : 2000, // R$ 20.00
};

export function formatMoney(cents: number, locale = 'pt-BR', currency = 'BRL') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
  } catch {
    // fallback
    return `R$ ${(cents / 100).toFixed(2)}`;
  }
}

export function formatMessage(template: string | undefined, vars: Record<string, string | number>) {
  if (!template) return '';
  return Object.keys(vars).reduce((acc, key) => {
    const value = String(vars[key]);
    return acc.split(`{${key}}`).join(value);
  }, template);
}

export default cfg;
