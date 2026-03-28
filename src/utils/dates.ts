export function today(): string {
  return new Date().toISOString().split('T')[0];
}
