'use client'

import { useMutation } from '@tanstack/react-query'
import { recommendMF } from '@/lib/api/mf'
import type { MFRecommendRequest, MFRecommendResponse } from '@/types/api'

export function useMFRecommend() {
  return useMutation<MFRecommendResponse, Error, MFRecommendRequest>({
    mutationKey: ['mf-recommend'],
    mutationFn: recommendMF,
  })
}
