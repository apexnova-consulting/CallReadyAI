import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  return (
    <main style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px' 
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        CallReady AI
      </h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        {session ? (
          <>Welcome, {session.user?.name || session.user?.email}</>
        ) : (
          <>Please sign in to continue</>
        )}
      </p>
      {!session && (
        <a 
          href="/login" 
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '0.375rem' 
          }}
        >
          Sign In
        </a>
      )}
    </main>
  )
}