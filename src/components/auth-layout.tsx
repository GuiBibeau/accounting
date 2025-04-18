import type React from 'react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col p-2 bg-background">
      <div className="flex grow items-center justify-center p-6 lg:rounded-lg lg:bg-card lg:p-10 lg:shadow-xs">
        {children}
      </div>
    </main>
  )
}
