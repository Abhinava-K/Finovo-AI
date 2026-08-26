import axios, { AxiosError } from 'axios'
import type { FastAPIValidationError } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000, // 60s — AI agent can be slow
})

// ─── Error handling ──────────────────────────────────────────────────────────

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Response interceptor — normalize FastAPI errors into typed errors
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (!error.response) {
      // Network error — backend not reachable
      throw new APIError(
        'Cannot reach the server. Is the backend running on port 8000?',
        0
      )
    }

    const { status, data } = error.response

    if (status === 422) {
      // FastAPI validation error
      const ve = data as FastAPIValidationError
      const fields = ve.detail?.map((d) => ({
        field: String(d.loc[d.loc.length - 1]),
        message: d.msg.replace('Value error, ', ''),
      })) ?? []
      throw new ValidationError('Validation failed', fields)
    }

    if (status === 500) {
      const msg = (data as { detail?: string })?.detail ?? 'Internal server error'
      throw new APIError(msg, 500)
    }

    throw new APIError(`Request failed with status ${status}`, status)
  }
)
