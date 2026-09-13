const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function convertToWords(num: number): string {
  if (num === 0) return "Zero"
  
  if (num < 20) return ones[num]
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "")
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + convertToWords(num % 100) : "")
  if (num < 100000) return convertToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + convertToWords(num % 1000) : "")
  if (num < 10000000) return convertToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + convertToWords(num % 100000) : "")
  return convertToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + convertToWords(num % 10000000) : "")
}

export function numberToWords(amount: number): string {
  const wholePart = Math.floor(amount)
  const fractionalPart = Math.round((amount - wholePart) * 100)
  
  let result = convertToWords(wholePart)
  
  if (fractionalPart > 0) {
    result += " and " + convertToWords(fractionalPart) + " Paisa"
  }
  
  return result + " BDT Only"
}
