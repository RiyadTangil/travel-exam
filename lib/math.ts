/**
 * Rounds a number to a fixed number of decimal places (default 2).
 * Essential for financial calculations to avoid floating point precision issues
 * like 1.9399999999999977.
 * 
 * @param val - The number to round
 * @param decimals - Number of decimal places (default 2)
 * @returns The rounded number
 */
export function roundTo(val: number, decimals: number = 2): number {
  if (typeof val !== 'number' || isNaN(val)) return 0
  const factor = Math.pow(10, decimals)
  return Math.round((val + Number.EPSILON) * factor) / factor
}

/**
 * Safely adds two numbers and rounds the result.
 */
export function safeAdd(a: number, b: number): number {
  return roundTo(roundTo(a) + roundTo(b))
}

/**
 * Safely subtracts two numbers and rounds the result.
 */
export function safeSubtract(a: number, b: number): number {
  return roundTo(roundTo(a) - roundTo(b))
}
