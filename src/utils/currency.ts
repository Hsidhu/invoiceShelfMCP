/**
 * Format currency from cents to dollars
 * @param cents - Amount in cents
 * @returns Formatted currency string (e.g., "C$ 123.45")
 */
export function formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return `C$ ${dollars.toFixed(2)}`;
}
