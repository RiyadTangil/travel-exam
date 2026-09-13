import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS } from "@/lib/api/api-endpoints"
import { fetcher } from "@/lib/api/fetcher"
import type { CrmMetricsData } from "@/services/crmService"

export type { CrmMetricsData }

/**
 * Hook to fetch CRM metrics and statistics
 */
export function useCrmMetrics() {
  return useQuery({
    queryKey: [ENDPOINTS.CRM.METRICS.KEY, "stats"],
    queryFn: () => fetcher<CrmMetricsData>(ENDPOINTS.CRM.METRICS.URL),
  })
}
