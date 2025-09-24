import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">CallReady AI</h1>
      <p className="mt-4 text-xl">
        {session ? (
          <>Welcome, {session.user?.name}</>
        ) : (
          <>Please sign in to continue</>
        )}
      </p>
    </main>
  )
}