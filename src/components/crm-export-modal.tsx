// CRM Export Modal Component
// Allows users to export brief data to various CRM systems

"use client"

import { useState } from "react"

interface CrmExportModalProps {
  brief: any
  onClose: () => void
}

export default function CrmExportModal({ brief, onClose }: CrmExportModalProps) {
  const [selectedCrm, setSelectedCrm] = useState<string>('')
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<any>(null)

  const crmOptions = [
    { value: 'hubspot', label: 'HubSpot', icon: '🔵' },
    { value: 'salesforce', label: 'Salesforce', icon: '⚡' },
    { value: 'pipedrive', label: 'Pipedrive', icon: '🔶' }
  ]

  const actionOptions = {
    hubspot: [
      { value: 'create_contact', label: 'Create Contact' },
      { value: 'create_deal', label: 'Create Deal' }
    ],
    salesforce: [
      { value: 'create_lead', label: 'Create Lead' },
      { value: 'create_opportunity', label: 'Create Opportunity' }
    ],
    pipedrive: [
      { value: 'create_person', label: 'Create Person' },
      { value: 'create_deal', label: 'Create Deal' }
    ]
  }

  const handleExport = async () => {
    if (!selectedCrm || !selectedAction) return

    setIsExporting(true)
    setExportResult(null)

    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          briefId: brief.id,
          crmType: selectedCrm,
          action: selectedAction
        })
      })

      const result = await response.json()
      setExportResult(result)

      if (response.ok) {
        // Success - could auto-close modal after a delay
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      setExportResult({
        success: false,
        error: 'Failed to export to CRM'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getCurrentActions = () => {
    if (!selectedCrm) return []
    return actionOptions[selectedCrm as keyof typeof actionOptions] || []
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: 0
          }}>
            📊 Export to CRM
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Export Result */}
        {exportResult && (
          <div style={{
            backgroundColor: exportResult.success ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${exportResult.success ? '#22c55e' : '#dc2626'}`,
            color: exportResult.success ? '#166534' : '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {exportResult.success ? (
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  ✅ Export Successful!
                </div>
                <div>{exportResult.message}</div>
                {exportResult.crmUrl && (
                  <a 
                    href={exportResult.crmUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    View in CRM →
                  </a>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  ❌ Export Failed
                </div>
                <div>{exportResult.error}</div>
              </div>
            )}
          </div>
        )}

        {/* CRM Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Select CRM System
          </label>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {crmOptions.map((crm) => (
              <button
                key={crm.value}
                onClick={() => {
                  setSelectedCrm(crm.value)
                  setSelectedAction('') // Reset action when CRM changes
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  border: selectedCrm === crm.value ? '2px solid #667eea' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: selectedCrm === crm.value ? '#f0f4ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: selectedCrm === crm.value ? '600' : '500'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{crm.icon}</span>
                <span>{crm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Selection */}
        {selectedCrm && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Select Action
            </label>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {getCurrentActions().map((action) => (
                <button
                  key={action.value}
                  onClick={() => setSelectedAction(action.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: selectedAction === action.value ? '2px solid #667eea' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: selectedAction === action.value ? '#f0f4ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: selectedAction === action.value ? '600' : '500'
                  }}
                >
                  <span>📋</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Brief Preview */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Brief Preview
          </h4>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4' }}>
            <div><strong>Prospect:</strong> {brief.prospectName}</div>
            <div><strong>Company:</strong> {brief.companyName}</div>
            <div><strong>Role:</strong> {brief.role}</div>
            <div><strong>Pain Points:</strong> {brief.painPoints.substring(0, 100)}...</div>
            <div><strong>Buyer Intent:</strong> {brief.buyerIntentSignals.substring(0, 100)}...</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!selectedCrm || !selectedAction || isExporting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: (!selectedCrm || !selectedAction || isExporting) ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: (!selectedCrm || !selectedAction || isExporting) ? 'not-allowed' : 'pointer'
            }}
          >
            {isExporting ? 'Exporting...' : 'Export to CRM'}
          </button>
        </div>

        {/* Setup Notice */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#92400e'
        }}>
          <strong>Setup Required:</strong> CRM integrations require API configuration. 
          Visit Settings → CRM Integration to connect your accounts.
        </div>
      </div>
    </div>
  )
}

