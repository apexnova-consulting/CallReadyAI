// Analytics Dashboard for CallReady AI
// Tracks talking points effectiveness and win/loss signals

"use client"

import { useState, useEffect } from "react"

interface AnalyticsData {
  briefsGenerated: number
  totalBriefs: number
  mostUsedTalkingPoints: Array<{
    point: string
    count: number
    successRate: number
  }>
  industryBreakdown: Array<{
    industry: string
    count: number
    avgSuccessRate: number
  }>
  monthlyTrends: Array<{
    month: string
    briefs: number
    successRate: number
  }>
  topPainPoints: Array<{
    painPoint: string
    frequency: number
    industry: string
  }>
  buyerIntentEffectiveness: {
    fundingSignals: number
    hiringSignals: number
    techSignals: number
    newsSignals: number
  }
  companionModeUsage: {
    callsCompleted: number
    avgCallDuration: number
    followUpEmailsGenerated: number
  }
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      // Fetch real analytics data from API
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        // If no data available, set empty state
        setAnalytics({
          briefsGenerated: 0,
          totalBriefs: 0,
          mostUsedTalkingPoints: [],
          industryBreakdown: [],
          monthlyTrends: [],
          topPainPoints: [],
          buyerIntentEffectiveness: {
            fundingSignals: 0,
            hiringSignals: 0,
            techSignals: 0,
            newsSignals: 0
          },
          companionModeUsage: {
            callsCompleted: 0,
            avgCallDuration: 0,
            followUpEmailsGenerated: 0
          }
        })
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Set empty state on error
      setAnalytics({
        briefsGenerated: 0,
        totalBriefs: 0,
        mostUsedTalkingPoints: [],
        industryBreakdown: [],
        monthlyTrends: [],
        topPainPoints: [],
        buyerIntentEffectiveness: {
          fundingSignals: 0,
          hiringSignals: 0,
          techSignals: 0,
          newsSignals: 0
        },
        companionModeUsage: {
          callsCompleted: 0,
          avgCallDuration: 0,
          followUpEmailsGenerated: 0
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>No analytics data available</div>
      </div>
    )
  }

  // Check if user has no data (new user)
  const hasNoData = analytics.briefsGenerated === 0 && analytics.companionModeUsage.callsCompleted === 0

  if (hasNoData) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>
            📊 Analytics Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>
            Track your sales performance and optimize your approach
          </p>
        </div>

        {/* Empty State */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '3rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Start Generating Briefs to See Analytics
          </h2>
          <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Your analytics dashboard will populate with insights as you create briefs, use companion mode, and track your sales performance.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a
              href="/dashboard/new"
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
              Create Your First Brief
            </a>
            <a
              href="/dashboard"
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
              View Dashboard
            </a>
          </div>
        </div>

        {/* Preview Cards */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151', textAlign: 'center' }}>
            What You'll See Here
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              opacity: 0.6
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                📊 Key Metrics
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Track briefs generated, companion calls, call duration, and follow-ups
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              opacity: 0.6
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                🎯 Talking Points Analysis
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                See which talking points are most effective for your prospects
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              opacity: 0.6
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                🔍 Buyer Intent Signals
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Track effectiveness of funding, hiring, and tech stack signals
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>
          📊 Analytics Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Track your sales performance and optimize your approach
        </p>
        
        {/* Time Range Selector */}
        <div style={{ marginTop: '1rem' }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' }}>
            {analytics.briefsGenerated}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Briefs Generated ({timeRange})</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>
            {analytics.companionModeUsage.callsCompleted}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Companion Calls</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
            {analytics.companionModeUsage.avgCallDuration}m
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Avg Call Duration</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
            {analytics.companionModeUsage.followUpEmailsGenerated}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Follow-ups Generated</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Most Effective Talking Points */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🎯 Most Effective Talking Points
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.mostUsedTalkingPoints.map((point, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    {point.point}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Used {point.count} times
                  </div>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: point.successRate >= 80 ? '#dcfce7' : point.successRate >= 70 ? '#fef3c7' : '#fef2f2',
                  color: point.successRate >= 80 ? '#166534' : point.successRate >= 70 ? '#92400e' : '#dc2626',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {point.successRate}% success
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Performance */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🏢 Industry Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.industryBreakdown.map((industry, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    {industry.industry}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {industry.count} briefs
                  </div>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: industry.avgSuccessRate >= 80 ? '#dcfce7' : industry.avgSuccessRate >= 70 ? '#fef3c7' : '#fef2f2',
                  color: industry.avgSuccessRate >= 80 ? '#166534' : industry.avgSuccessRate >= 70 ? '#92400e' : '#dc2626',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {industry.avgSuccessRate}% success
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buyer Intent Effectiveness */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🔍 Buyer Intent Signal Effectiveness
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>💰 Funding Signals</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#22c55e' }}>
                {analytics.buyerIntentEffectiveness.fundingSignals}% effective
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>👥 Hiring Signals</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#22c55e' }}>
                {analytics.buyerIntentEffectiveness.hiringSignals}% effective
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>⚙️ Tech Stack Changes</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#22c55e' }}>
                {analytics.buyerIntentEffectiveness.techSignals}% effective
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>📰 News Signals</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#22c55e' }}>
                {analytics.buyerIntentEffectiveness.newsSignals}% effective
              </span>
            </div>
          </div>
        </div>

        {/* Top Pain Points */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🎯 Top Pain Points by Industry
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.topPainPoints.map((painPoint, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    {painPoint.painPoint}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {painPoint.industry}
                  </div>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#f0f4ff',
                  color: '#667eea',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {painPoint.frequency} mentions
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
          📈 Monthly Trends
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', height: '200px', padding: '1rem 0' }}>
          {analytics.monthlyTrends.map((trend, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ 
                backgroundColor: '#667eea', 
                width: '30px', 
                height: `${(trend.briefs / 30) * 150}px`, 
                borderRadius: '4px 4px 0 0',
                marginBottom: '0.5rem'
              }} />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                {trend.month}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                {trend.briefs}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>
                {trend.successRate}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '0.75rem',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0c4a6e' }}>
          💡 AI-Powered Insights
        </h3>
        <div style={{ fontSize: '0.875rem', color: '#0c4a6e', lineHeight: '1.6' }}>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><strong>Top Performing Talking Point:</strong> "24/7 support" has the highest success rate at 85%</li>
            <li><strong>Best Industry:</strong> Finance industry shows the highest success rate at 85%</li>
            <li><strong>Most Effective Signal:</strong> Funding signals are 89% effective in driving conversions</li>
            <li><strong>Growth Opportunity:</strong> Healthcare industry has room for improvement (78% success rate)</li>
            <li><strong>Companion Mode Impact:</strong> Average call duration of 28 minutes suggests good engagement</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

