export default function TestPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CallReady AI - Test Page
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          This page is working! If you can see this, the basic Next.js app is functioning.
        </p>

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#374151'
          }}>
            Next Steps:
          </h3>
          <ol style={{
            color: '#4b5563',
            lineHeight: '1.6',
            paddingLeft: '1.5rem'
          }}>
            <li>Check <code style={{ backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>/api/debug</code> for environment variable status</li>
            <li>Verify all required environment variables are set in Vercel</li>
            <li>Ensure DATABASE_URL is a valid PostgreSQL connection string</li>
            <li>Make sure NEXTAUTH_SECRET is set (32+ characters)</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a
            href="/api/debug"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Check Debug Info
          </a>
          
          <a
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}



