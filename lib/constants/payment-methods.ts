export interface PaymentMethodItem {
  id: string
  name: string
}

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: "6a0407a373601487f0db213e", name: "Bank" },
  { id: "6a04073c73601487f0db2133", name: "Cash" },
  { id: "6a0407b173601487f0db2144", name: "Credit Card" },
  { id: "6a0407a873601487f0db2141", name: "Mobile banking" },
]

export const PAYMENT_METHODS_MAP: Record<string, string> = {
  "6a0407a373601487f0db213e": "Bank",
  "6a04073c73601487f0db2133": "Cash",
  "6a0407b173601487f0db2144": "Credit Card",
  "6a0407a873601487f0db2141": "Mobile banking",
}

export function formatPaymentMethod(id?: string | null): string {
  if (!id) return "—"
  return PAYMENT_METHODS_MAP[id] || id
}
