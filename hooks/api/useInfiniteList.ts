import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";
import { fetcher, ApiResponse } from "@/lib/api/fetcher";
import { queryKeys } from "./queryKeys";

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export function useInfiniteList<T>(
  key: string,
  url: string,
  params?: ListParams,
  options?: Omit<
    UseInfiniteQueryOptions<
      ApiResponse<T>,
      Error,
      InfiniteData<ApiResponse<T>>,
      ApiResponse<T>,
      readonly any[]
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  // Build a stable query key based on params
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && k !== "page") {
        queryParams.append(k, String(v));
      }
    });
  }
  const queryString = queryParams.toString();

  return useInfiniteQuery({
    queryKey: queryKeys.list(key, queryString),
    queryFn: ({ pageParam = 1 }) => {
      const fetchParams = new URLSearchParams(queryString);
      fetchParams.append("page", String(pageParam));
      const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${fetchParams.toString()}`;
      return fetcher<T>(fullUrl);
    },
    getNextPageParam: (lastPage: any) => {
      // Handle cases: pagination in data, meta, or root
      const pagination = lastPage?.data?.pagination || lastPage?.meta || lastPage?.pagination;
      if (pagination) {
        const { page, pages, totalPages } = pagination;
        const lastPageNum = Number(page);
        const maxPages = Number(pages || totalPages);
        return lastPageNum < maxPages ? lastPageNum + 1 : undefined;
      }
      
      if (lastPage?.total !== undefined && lastPage?.pageSize !== undefined && lastPage?.page !== undefined) {
        const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
        return lastPage.page < totalPages ? Number(lastPage.page) + 1 : undefined;
      }
      
      return undefined;
    },
    initialPageParam: 1,
    ...options,
  });
}