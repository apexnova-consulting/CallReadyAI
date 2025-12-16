export default function MinimalPage() {
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
          🎉 Minimal Page Working!
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          This is the most basic possible Next.js page. No imports, no external dependencies, no database calls.
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
            If you can see this:
          </h3>
          <ul style={{
            color: '#0c4a6e',
            lineHeight: '1.6',
            paddingLeft: '1.5rem'
          }}>
            <li>✅ Next.js deployment is working</li>
            <li>✅ Basic React rendering works</li>
            <li>✅ The issue is in our app logic</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/"
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
            Test Main Page
          </a>
          
          <a
            href="/simple"
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
            Test Simple Page
          </a>
        </div>
      </div>
    </div>
  )
}



