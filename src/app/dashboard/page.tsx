import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div style={{ padding: '1.5rem 0' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
        Dashboard
      </h1>
      <div style={{ padding: '1rem 0' }}>
        <div style={{ 
          height: '24rem', 
          borderRadius: '0.5rem', 
          border: '4px dashed #d1d5db',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Welcome {session?.user?.name || session?.user?.email}
          </h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Get started by creating your first brief
          </p>
          <button
            type="button"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            New Brief
          </button>
        </div>
      </div>
    </div>
  )
}