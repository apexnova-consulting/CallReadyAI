import Link from "next/link"

export default function Home() {
  // Temporarily disable auth check to isolate the issue
  // const session = await auth()
  // if (session) {
  //   redirect("/dashboard")
  // }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
          CallReady AI
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/login"
            style={{ 
              padding: '0.5rem 1rem', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '0.375rem',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            Sign In
          </Link>
          <Link 
            href="/register"
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: 'white', 
              color: '#667eea', 
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontWeight: '600'
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ 
        flex: 1,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            color: 'white',
            lineHeight: '1.1'
          }}>
            AI-Powered Sales Call Briefs
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            marginBottom: '2rem', 
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6'
          }}>
            Generate comprehensive, actionable sales call briefs in seconds. 
            Get the insights you need to close more deals.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/register"
              style={{ 
                padding: '1rem 2rem', 
                backgroundColor: 'white', 
                color: '#667eea', 
                textDecoration: 'none', 
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1.125rem'
              }}
            >
              Start Free Trial
            </Link>
            <Link 
              href="#features"
              style={{ 
                padding: '1rem 2rem', 
                backgroundColor: 'transparent', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '0.5rem',
                border: '2px solid white',
                fontWeight: '600',
                fontSize: '1.125rem'
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{ 
        padding: '4rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '3rem',
            color: 'white'
          }}>
            Why Choose CallReady AI?
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '2rem', 
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'white' }}>
                Instant Briefs
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Generate comprehensive sales call briefs in under 30 seconds using advanced AI.
              </p>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '2rem', 
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'white' }}>
                Actionable Insights
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Get specific talking points, pain points, and questions tailored to each prospect.
              </p>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '2rem', 
              borderRadius: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'white' }}>
                Export & Share
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Export briefs as PDFs or email them directly to your team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        padding: "2.5rem 1rem", 
        width: "100%", 
        textAlign: "center", 
        color: "rgba(255, 255, 255, 0.7)", 
        fontSize: "0.875rem",
        backgroundColor: "rgba(0, 0, 0, 0.1)"
      }}>
        <p style={{ marginBottom: "0.5rem" }}>
          &copy; {new Date().getFullYear()} CallReady AI. All rights reserved.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Link 
            href="/privacy" 
            style={{ 
              color: "rgba(255, 255, 255, 0.7)", 
              textDecoration: "none",
              transition: "color 0.2s"
            }}
          >
            Privacy Policy
          </Link>
          <Link 
            href="/terms" 
            style={{ 
              color: "rgba(255, 255, 255, 0.7)", 
              textDecoration: "none",
              transition: "color 0.2s"
            }}
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  )
}