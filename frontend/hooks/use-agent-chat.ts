'use client'

import { useState, useCallback } from 'react'
import { chatWithAgent } from '@/lib/api/agent'
import type { ChatMessage } from '@/types/api'

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    }

    // Optimistic: add user message + placeholder assistant message
    const placeholderId = generateId()
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: placeholderId, role: 'assistant', content: '', timestamp: new Date(), isLoading: true },
    ])
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatWithAgent({ query: query.trim() })

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: response.reply, isLoading: false }
            : m
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      // Remove the loading placeholder on error
      setMessages((prev) => prev.filter((m) => m.id !== placeholderId))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearMessages }
}
