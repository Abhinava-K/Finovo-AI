'use client'

import { useMutation } from '@tanstack/react-query'
import { recommendCrypto } from '@/lib/api/crypto'
import type { CryptoRecommendRequest, CryptoRecommendResponse } from '@/types/api'

export function useCryptoRecommend() {
  return useMutation<CryptoRecommendResponse, Error, CryptoRecommendRequest>({
    mutationKey: ['crypto-recommend'],
    mutationFn: recommendCrypto,
  })
}
