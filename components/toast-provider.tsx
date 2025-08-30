"use client"

import { Toaster } from "react-hot-toast"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        success: {
          iconTheme: {
            primary: 'var(--primary)',
            secondary: 'var(--primary-foreground)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--destructive)',
            secondary: 'var(--destructive-foreground)',
          },
        },
      }}
    />
  )
}
