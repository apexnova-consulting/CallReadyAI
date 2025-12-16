export default function SimplePage() {
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
          color: '#10b981'
        }}>
          ✅ Simple Page Working!
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          This is a minimal page with no database calls, no auth, no external APIs.
          If you can see this, the basic Next.js deployment is working.
        </p>

        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#0369a1'
          }}>
            Next Steps:
          </h3>
          <ol style={{
            color: '#0c4a6e',
            lineHeight: '1.6',
            paddingLeft: '1.5rem'
          }}>
            <li>If this works, the issue is in our app logic</li>
            <li>Check <code style={{ backgroundColor: '#e0f2fe', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>/api/debug</code> for env vars</li>
            <li>Check <code style={{ backgroundColor: '#e0f2fe', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>/api/health</code> for database</li>
            <li>Try <code style={{ backgroundColor: '#e0f2fe', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>/login</code> to test auth</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/api/debug"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
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
            href="/api/health"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Check Health
          </a>
          
          <a
            href="/login"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Test Login
          </a>
        </div>
      </div>
    </div>
  )
}



