import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"

interface QueryProviderProps {
  children: React.ReactNode
  enableDevtools?: boolean
}

// Helper to check if we're in a Vite environment
const isViteEnv = typeof import.meta !== 'undefined' && 'env' in import.meta
const getIsDev = () => {
  if (isViteEnv) {
    // Type assertion for Vite's import.meta.env
    const meta = import.meta as {
      env?: {
        DEV?: boolean
        MODE?: string
      }
    }
    return meta.env?.DEV ?? meta.env?.MODE === 'development'
  }
  return process.env.NODE_ENV === 'development'
}

export function QueryProvider({ 
  children, 
  enableDevtools = getIsDev()
}: QueryProviderProps) {
  const [Devtools, setDevtools] = useState<React.ComponentType<any> | null>(null)
    
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  )

  useEffect(() => {
    if (enableDevtools) {
      import('@tanstack/react-query-devtools')
        .then((mod) => {
          setDevtools(() => mod.ReactQueryDevtools)
        })
        .catch(() => {
          // Devtools not available, silently fail
          setDevtools(null)
        })
    }
  }, [enableDevtools])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevtools && Devtools && <Devtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
