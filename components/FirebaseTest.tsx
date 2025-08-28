"use client"

import { useEffect, useState } from 'react'
import app from '@/lib/firebase'

export default function FirebaseTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      if (app) {
        setIsConnected(true)
        console.log('Firebase app:', app)
      }
    } catch (error) {
      setIsConnected(false)
      console.error('Firebase error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Database Connected</span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Database Disconnected</span>
        </>
      )}
    </div>
  )
}
