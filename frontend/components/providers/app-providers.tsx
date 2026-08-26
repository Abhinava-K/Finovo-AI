'use client'

import { QueryProvider } from './query-provider'
import { Toaster } from 'react-hot-toast'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster
        position="bottom-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0b1220',
            color: '#dde4f1',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'var(--font-inter)',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#0b1220' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#0b1220' },
            duration: 6000,
          },
        }}
      />
    </QueryProvider>
  )
}
