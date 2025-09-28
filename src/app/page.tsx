"use client"

import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    }}>
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Logo */}
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: '#667eea',
          margin: 0
        }}>
          CallReady AI
        </h1>

        {/* Desktop Navigation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem',
          '@media (max-width: 768px)': { display: 'none' }
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>Features</a>
            <a href="#pricing" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>Pricing</a>
            <a href="#about" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>About</a>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link 
              href="/login"
              style={{ 
                padding: '0.5rem 1rem', 
                color: '#6b7280', 
                textDecoration: 'none',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb',
                fontSize: '0.875rem'
              }}
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              style={{ 
                padding: '0.5rem 1rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger Menu */}
        <div style={{ 
          display: 'none',
          '@media (max-width: 768px)': { display: 'block' }
        }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <div style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#667eea',
              transition: 'all 0.3s ease'
            }}></div>
            <div style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#667eea',
              transition: 'all 0.3s ease'
            }}></div>
            <div style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#667eea',
              transition: 'all 0.3s ease'
            }}></div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          display: 'block',
          '@media (min-width: 769px)': { display: 'none' }
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '280px',
            height: '100%',
            backgroundColor: 'white',
            padding: '2rem 1rem',
            boxShadow: '-4px 0 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea', margin: 0 }}>
                CallReady AI
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <a 
                href="#features" 
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  color: '#6b7280', 
                  textDecoration: 'none', 
                  fontSize: '1rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  color: '#6b7280', 
                  textDecoration: 'none', 
                  fontSize: '1rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                Pricing
              </a>
              <a 
                href="#about" 
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  color: '#6b7280', 
                  textDecoration: 'none', 
                  fontSize: '1rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                About
              </a>
              
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link 
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    color: '#6b7280', 
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    fontSize: '0.875rem'
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white', 
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    fontSize: '0.875rem'
                  }}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={{ 
        padding: '2rem 1rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}>
            AI-Powered Sales Call Briefs
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            color: '#64748b', 
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Generate comprehensive, actionable sales call briefs in seconds. 
            Never go into a sales call unprepared again.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Link 
              href="/register"
              style={{ 
                padding: '1rem 2rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                width: '100%',
                maxWidth: '300px',
                textAlign: 'center'
              }}
            >
              Start Free Trial
            </Link>
            <button style={{ 
              padding: '1rem 2rem', 
              backgroundColor: 'white', 
              color: '#667eea', 
              border: '2px solid #667eea',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '300px'
            }}>
              Watch Demo
            </button>
          </div>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#94a3b8', 
            marginTop: '1rem' 
          }}>
            No credit card required • 5 free briefs
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ 
        padding: '2rem 1rem',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            textAlign: 'center',
            color: '#1e293b',
            marginBottom: '2rem'
          }}>
            Why Choose CallReady AI?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                Lightning Fast Briefs
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Generate comprehensive sales briefs in under 30 seconds. 
                No more spending hours researching prospects.
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                AI Call Companion
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Live AI assistant during calls with real-time transcription, 
                talking points, and follow-up suggestions.
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                Buyer Intent Signals
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Real-time company intelligence including funding signals, 
                hiring trends, and tech stack changes.
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                Advanced Analytics
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Track talking point effectiveness, industry performance, 
                and optimize your sales approach with data-driven insights.
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                CRM Integration
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Export briefs directly to HubSpot, Salesforce, and Pipedrive. 
                Seamless workflow integration.
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                Referral Rewards
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Earn 5 free briefs for every successful referral. 
                Grow your network while growing your briefs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ 
        padding: '2rem 1rem',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            textAlign: 'center',
            color: '#1e293b',
            marginBottom: '2rem'
          }}>
            How It Works
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: '#667eea', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto 1rem'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                Enter Prospect Details
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Input prospect info and our AI gathers buyer intent signals, 
                competitive insights, and company intelligence.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: '#667eea', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto 1rem'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                AI Generates Brief
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Get comprehensive briefs with talking points, pain points, 
                questions, and strategic insights in under 30 seconds.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: '#667eea', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto 1rem'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                AI Call Companion
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Use live AI assistant during calls with real-time transcription, 
                talking points, and follow-up suggestions.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: '#667eea', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto 1rem'
              }}>
                4
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                Track & Optimize
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.875rem' }}>
                Export to CRM, track analytics, and optimize your approach 
                with data-driven insights for better results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ 
        padding: '2rem 1rem',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            textAlign: 'center',
            color: '#1e293b',
            marginBottom: '2rem'
          }}>
            Simple, Transparent Pricing
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Free Plan */}
            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                Free
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>$0</span>
                <span style={{ color: '#64748b' }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ 5 AI-generated briefs</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ PDF export</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Email sharing</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Basic templates</li>
              </ul>
              <Link 
                href="/register"
                style={{ 
                  display: 'block',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: '0.875rem'
                }}
              >
                Get Started Free
              </Link>
            </div>

            {/* Starter Plan */}
            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                Starter
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>$19.99</span>
                <span style={{ color: '#64748b' }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ 25 AI-generated briefs</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ PDF export</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Email sharing</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Basic analytics</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Email support</li>
              </ul>
              <button 
                onClick={() => window.open('https://buy.stripe.com/eVq14f9dXdqraTnf4IaVa01', '_blank')}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Start Starter Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: '2px solid #667eea',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-0.75rem',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                Most Popular
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Pro
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$49</span>
                <span style={{ opacity: 0.8 }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.25rem 0', opacity: 0.9, fontSize: '0.875rem' }}>✓ 200 AI-generated briefs</li>
                <li style={{ padding: '0.25rem 0', opacity: 0.9, fontSize: '0.875rem' }}>✓ AI Call Companion</li>
                <li style={{ padding: '0.25rem 0', opacity: 0.9, fontSize: '0.875rem' }}>✓ Buyer Intent Signals</li>
                <li style={{ padding: '0.25rem 0', opacity: 0.9, fontSize: '0.875rem' }}>✓ Advanced Analytics</li>
                <li style={{ padding: '0.25rem 0', opacity: 0.9, fontSize: '0.875rem' }}>✓ CRM Integration</li>
                <li style={{ padding: '0.25rem 0', opacity: 0.9, fontSize: '0.875rem' }}>✓ Priority support</li>
                <li style={{ padding: '0.25rem 0', opacity: 0.9, fontSize: '0.875rem' }}>✓ Custom branding</li>
              </ul>
              <Link 
                href="/register"
                style={{ 
                  display: 'block',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#667eea',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: '0.875rem'
                }}
              >
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div style={{ 
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                Enterprise
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>Custom</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Unlimited briefs</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ All Pro features</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Dedicated support</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Custom integrations</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ SSO</li>
                <li style={{ padding: '0.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>✓ Advanced security</li>
              </ul>
              <button style={{ 
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '2rem 1rem',
        backgroundColor: '#667eea',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem'
          }}>
            Ready to Close More Deals?
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            opacity: 0.9, 
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join thousands of sales professionals who use CallReady AI to prepare for every call.
          </p>
          <Link 
            href="/register"
            style={{ 
              display: 'inline-block',
              padding: '1rem 2rem', 
              backgroundColor: 'white', 
              color: '#667eea', 
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Start Your Free Trial
          </Link>
          <p style={{ 
            fontSize: '0.875rem', 
            opacity: 0.8, 
            marginTop: '1rem' 
          }}>
            No credit card required • Setup in under 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '2rem 1rem',
        backgroundColor: '#1e293b',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            flexDirection: 'column'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea', margin: 0 }}>
                CallReady AI
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: '0.5rem 0 0 0' }}>
                AI-powered sales call briefs
              </p>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/privacy" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Privacy</Link>
              <Link href="/terms" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Terms</Link>
              <a href="mailto:support@callreadyai.com" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Support</a>
            </div>
          </div>
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid #374151',
            opacity: 0.7,
            fontSize: '0.875rem'
          }}>
            © 2024 CallReady AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}