export default function TestMinimalPage() {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#22c55e', marginBottom: '1rem' }}>
          ✅ Minimal Page Working
        </h1>
        <p style={{ color: '#6b7280' }}>
          This is the simplest possible Next.js page.
        </p>
      </div>
    </div>
  )
}

