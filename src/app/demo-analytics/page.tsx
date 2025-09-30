// Demo Analytics Dashboard for CallReady AI
// Shows impressive test data for investor presentations

"use client"

import { useState } from "react"

interface DemoAnalyticsData {
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

export default function DemoAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Impressive demo data for investor presentation
  const demoAnalytics: DemoAnalyticsData = {
    briefsGenerated: 1247,
    totalBriefs: 1247,
    mostUsedTalkingPoints: [
      { point: "24/7 customer support", count: 89, successRate: 85 },
      { point: "Enterprise-grade security", count: 76, successRate: 82 },
      { point: "Scalable infrastructure", count: 68, successRate: 78 },
      { point: "ROI within 6 months", count: 54, successRate: 91 },
      { point: "Easy integration", count: 45, successRate: 73 }
    ],
    industryBreakdown: [
      { industry: "Finance", count: 234, avgSuccessRate: 87 },
      { industry: "Healthcare", count: 189, avgSuccessRate: 78 },
      { industry: "Technology", count: 156, avgSuccessRate: 84 },
      { industry: "Manufacturing", count: 134, avgSuccessRate: 81 },
      { industry: "Retail", count: 98, avgSuccessRate: 76 }
    ],
    monthlyTrends: [
      { month: "Jan", briefs: 89, successRate: 78 },
      { month: "Feb", briefs: 112, successRate: 82 },
      { month: "Mar", briefs: 134, successRate: 85 },
      { month: "Apr", briefs: 156, successRate: 87 },
      { month: "May", briefs: 178, successRate: 89 },
      { month: "Jun", briefs: 201, successRate: 91 }
    ],
    topPainPoints: [
      { painPoint: "Manual data entry", frequency: 45, industry: "Finance" },
      { painPoint: "Compliance requirements", frequency: 38, industry: "Healthcare" },
      { painPoint: "Integration complexity", frequency: 32, industry: "Technology" },
      { painPoint: "Cost optimization", frequency: 28, industry: "Manufacturing" },
      { painPoint: "Customer retention", frequency: 24, industry: "Retail" }
    ],
    buyerIntentEffectiveness: {
      fundingSignals: 89,
      hiringSignals: 76,
      techSignals: 82,
      newsSignals: 71
    },
    companionModeUsage: {
      callsCompleted: 456,
      avgCallDuration: 28,
      followUpEmailsGenerated: 389
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>
          📊 CallReady AI Analytics Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Demo: Advanced Sales Intelligence & Performance Analytics
        </p>
        
        {/* Time Range Selector */}
        <div style={{ marginTop: '1rem' }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #667eea',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              backgroundColor: 'white',
              fontWeight: '600'
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' }}>
            {demoAnalytics.briefsGenerated.toLocaleString()}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '600' }}>Briefs Generated</p>
          <p style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '0.5rem' }}>↗ +23% vs last month</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>
            {demoAnalytics.companionModeUsage.callsCompleted}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '600' }}>AI Companion Calls</p>
          <p style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '0.5rem' }}>↗ +31% vs last month</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
            {demoAnalytics.companionModeUsage.avgCallDuration}m
          </h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '600' }}>Avg Call Duration</p>
          <p style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '0.5rem' }}>↗ +12% vs last month</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
            {demoAnalytics.companionModeUsage.followUpEmailsGenerated}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '600' }}>Follow-ups Generated</p>
          <p style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '0.5rem' }}>↗ +18% vs last month</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Most Effective Talking Points */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
            🎯 Most Effective Talking Points
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {demoAnalytics.mostUsedTalkingPoints.map((point, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                    {point.point}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Used {point.count} times
                  </div>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: point.successRate >= 85 ? '#dcfce7' : point.successRate >= 80 ? '#fef3c7' : '#fef2f2',
                  color: point.successRate >= 85 ? '#166534' : point.successRate >= 80 ? '#92400e' : '#dc2626',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '700'
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
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
            🏢 Industry Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {demoAnalytics.industryBreakdown.map((industry, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                    {industry.industry}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {industry.count} briefs
                  </div>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: industry.avgSuccessRate >= 85 ? '#dcfce7' : industry.avgSuccessRate >= 80 ? '#fef3c7' : '#fef2f2',
                  color: industry.avgSuccessRate >= 85 ? '#166534' : industry.avgSuccessRate >= 80 ? '#92400e' : '#dc2626',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '700'
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
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
            🔍 Buyer Intent Signal Effectiveness
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>💰 Funding Signals</span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#22c55e' }}>
                {demoAnalytics.buyerIntentEffectiveness.fundingSignals}% effective
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>👥 Hiring Signals</span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#22c55e' }}>
                {demoAnalytics.buyerIntentEffectiveness.hiringSignals}% effective
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>⚙️ Tech Stack Changes</span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#22c55e' }}>
                {demoAnalytics.buyerIntentEffectiveness.techSignals}% effective
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>📰 News Signals</span>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#22c55e' }}>
                {demoAnalytics.buyerIntentEffectiveness.newsSignals}% effective
              </span>
            </div>
          </div>
        </div>

        {/* Top Pain Points */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
            🎯 Top Pain Points by Industry
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {demoAnalytics.topPainPoints.map((painPoint, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                    {painPoint.painPoint}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {painPoint.industry}
                  </div>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#f0f4ff',
                  color: '#667eea',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '700'
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
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>
          📈 Monthly Growth Trends
        </h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'end', 
          height: '300px', 
          padding: '2rem 1rem 1rem 1rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {demoAnalytics.monthlyTrends.map((trend, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              flex: 1,
              position: 'relative',
              minHeight: '250px'
            }}>
              <div style={{ 
                backgroundColor: '#667eea', 
                width: '40px', 
                height: `${Math.min((trend.briefs / 30) * 150, 150)}px`, 
                borderRadius: '8px 8px 0 0',
                marginBottom: '1rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                maxHeight: '150px'
              }} />
              <div style={{ 
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                width: '100%'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {trend.month}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#374151', marginBottom: '0.25rem' }}>
                  {trend.briefs}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#22c55e', fontWeight: '600' }}>
                  {trend.successRate}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Powered Insights */}
      <div style={{
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          💡 AI-Powered Insights & Recommendations
        </h3>
        <div style={{ fontSize: '1rem', lineHeight: '1.8' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>🎯 Performance Highlights</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li><strong>Top Performing Talking Point:</strong> "ROI within 6 months" has 91% success rate</li>
                <li><strong>Best Industry:</strong> Finance industry shows 87% success rate</li>
                <li><strong>Most Effective Signal:</strong> Funding signals are 89% effective</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>📈 Growth Opportunities</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li><strong>Healthcare Expansion:</strong> 78% success rate suggests room for improvement</li>
                <li><strong>News Signal Optimization:</strong> 71% effectiveness can be enhanced</li>
                <li><strong>Companion Mode:</strong> 28min avg duration indicates strong engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '1rem',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#92400e' }}>
          🎬 Demo Dashboard for Investor Presentation
        </h4>
        <p style={{ fontSize: '1rem', color: '#92400e', margin: 0 }}>
          This dashboard showcases CallReady AI's advanced analytics capabilities with realistic demo data. 
          Perfect for demonstrating the platform's intelligence and ROI to potential investors.
        </p>
      </div>
    </div>
  )
}
