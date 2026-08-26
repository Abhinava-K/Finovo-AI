import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,   // 5 min — recommendations don't go stale quickly
        gcTime: 30 * 60 * 1000,     // 30 min — keep in cache
        retry: 1,                   // Retry once on failure
        refetchOnWindowFocus: false, // Financial data — don't auto-refetch
      },
      mutations: {
        retry: 0, // Don't retry mutations — user wants fresh data
      },
    },
  })
}
