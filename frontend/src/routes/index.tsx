import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-semibold tracking-tight">ReinvestWealth</h1>
      <p className="text-neutral-500">Frontend is ready with TanStack Router, Tailwind, Axios, and Zustand.</p>
    </main>
  )
}
