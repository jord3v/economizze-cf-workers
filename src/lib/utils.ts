export function round(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function money(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

export async function hashPassword(text: string) {
  const myText = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest({ name: 'SHA-256' }, myText);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function parseDateLocal(dateStr: string) {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) return new Date(dateStr);
  const parts = dateStr.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}