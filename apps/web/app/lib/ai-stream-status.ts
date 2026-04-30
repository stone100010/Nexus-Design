'use client'

export interface AIStreamStatus {
  active: boolean
  message: string
  phase: string
  elapsed: number
  chars: number
  estimatedTokens: number
  reasoningChars: number
  reasoningEstimatedTokens: number
  pages: number
  firstPageTokens: number | null
  updatedAt: number
}

const STORAGE_KEY = 'nexus-ai-stream-status'
const EVENT_NAME = 'nexus-ai-stream-status'

export function getTotalEstimatedTokens(status: Pick<AIStreamStatus, 'estimatedTokens' | 'reasoningEstimatedTokens'> | null) {
  if (!status) return 0
  return status.estimatedTokens + status.reasoningEstimatedTokens
}

export function readAIStreamStatus(): AIStreamStatus | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as AIStreamStatus : null
  } catch {
    return null
  }
}

export function writeAIStreamStatus(status: AIStreamStatus) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(status))
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: status }))
}

export function clearAIStreamStatus() {
  if (typeof window === 'undefined') return
  const current = readAIStreamStatus()
  if (!current) return
  const next = { ...current, active: false, updatedAt: Date.now() }
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }))
}

export function subscribeAIStreamStatus(callback: (status: AIStreamStatus) => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = (event: Event) => {
    callback((event as CustomEvent<AIStreamStatus>).detail)
  }
  window.addEventListener(EVENT_NAME, handler)
  return () => window.removeEventListener(EVENT_NAME, handler)
}
