export default function WorkingPage() {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f0f0f0' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '3rem', 
        borderRadius: '1rem', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#22c55e'
        }}>
          Page is Working!
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          color: '#6b7280', 
          marginBottom: '2rem' 
        }}>
          This page is working correctly. If you can see this, the routing is functional.
        </p>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
