// Truncates to 2 decimal places (does NOT round up) - e.g. 5666.0999999 -> "₹5666.09"
export function formatCurrency(value) {
    const num = Number(value) || 0;
    const truncated = Math.floor(num * 100) / 100;
    return `₹${truncated.toFixed(2)}`;
}