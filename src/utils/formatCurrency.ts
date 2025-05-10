/**
 * Format a number as currency (USD by default)
 * @param amount - The amount to format
 * @param currency - The currency code, defaults to 'USD'
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
