import { useMutation, useQueryClient, UseMutationOptions, QueryKey } from "@tanstack/react-query";
import { fetcher, ApiResponse } from "@/lib/api/fetcher";
import { toast } from "sonner";

interface MutationOptions<T, V> extends Omit<UseMutationOptions<ApiResponse<T>, Error, V>, "mutationFn"> {
  method?: "POST" | "PUT" | "DELETE" | "PATCH";
  invalidateKeys?: readonly (readonly any[])[] | QueryKey[];
  successMessage?: string;
  companyId?: string;
}

export function useMutationApi<T = any, V = any>(
  url: string,
  options?: MutationOptions<T, V>
) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<T>, Error, V>({
    mutationFn: async (variables: V) => {
      const method = options?.method || "POST";
      const isDelete = method === "DELETE";
      
      // Handle dynamic URL for PUT/DELETE/PATCH if 'id' is present in variables
      let targetUrl = url;
      if (variables && typeof variables === "object" && "id" in variables && (method === "PUT" || method === "DELETE" || method === "PATCH")) {
        const id = (variables as any).id;
        // Only append if URL doesn't already end with the ID
        if (!url.endsWith(`/${id}`)) {
          targetUrl = `${url}/${id}`;
        }
      }

      return fetcher<T>(targetUrl, {
        method,
        body: isDelete ? undefined : JSON.stringify(variables),
      });
    },
    onSuccess: (data, variables, context) => {
      if (options?.successMessage) {
        toast.success(options.successMessage);
      } else if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Operation successful");
      }

      // Invalidate query keys matching both exact array and predicate for queryKeys.list standard
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
          if (Array.isArray(key) && key.length === 1 && typeof key[0] === "string") {
            const searchKey = key[0];
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey.includes(searchKey),
            });
          }
        });
      }

      if (options?.onSuccess) {
        // @ts-ignore - handled by generic signature
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // The fetcher already shows the error toast globally
    },
  });
}
