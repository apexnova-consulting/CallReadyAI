// Template storage system
// In production, this would be replaced with a database

export interface TemplateData {
  id: string
  userId: string
  methodology: string
  callType: string
  industry: string
  templateType: string
  content: string
  createdAt: string
}

// In-memory storage
const templates = new Map<string, TemplateData>()

// Helper function to sync with localStorage
function syncTemplatesToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      const templatesArray = Array.from(templates.values())
      localStorage.setItem('callready_templates', JSON.stringify(templatesArray))
      console.log(`Synced ${templatesArray.length} templates to localStorage`)
    } catch (error) {
      console.error('Failed to sync templates to localStorage:', error)
    }
  }
}

// Helper function to load from localStorage
function loadTemplatesFromLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('callready_templates')
      if (stored) {
        const templatesArray = JSON.parse(stored)
        templatesArray.forEach((template: TemplateData) => {
          templates.set(template.id, template)
        })
        console.log(`Loaded ${templatesArray.length} templates from localStorage`)
      }
    } catch (error) {
      console.error('Failed to load templates from localStorage:', error)
    }
  }
}

export function storeTemplate(template: TemplateData) {
  templates.set(template.id, template)
  console.log(`Template stored: ${template.id} for user: ${template.userId}`)
  console.log(`Total templates in storage: ${templates.size}`)
  
  // Sync to localStorage
  syncTemplatesToLocalStorage()
}

export function getTemplate(templateId: string): TemplateData | null {
  // Try in-memory first
  let template = templates.get(templateId)
  
  if (!template && typeof window !== 'undefined') {
    // Try localStorage as fallback
    try {
      const stored = localStorage.getItem(`template_${templateId}`)
      if (stored) {
        template = JSON.parse(stored)
        // Store back in memory for future requests
        templates.set(templateId, template)
        console.log(`Template loaded from localStorage: ${templateId}`)
      }
    } catch (error) {
      console.error('Failed to load template from localStorage:', error)
    }
  }
  
  return template || null
}

export function getAllTemplatesForUser(userId: string): TemplateData[] {
  // Load from localStorage if in-memory is empty
  if (templates.size === 0) {
    loadTemplatesFromLocalStorage()
  }
  
  return Array.from(templates.values()).filter(template => template.userId === userId)
}

export function getTemplatesCountForUser(userId: string): number {
  return getAllTemplatesForUser(userId).length
}

export function deleteTemplate(templateId: string) {
  templates.delete(templateId)
  
  // Remove from localStorage too
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`template_${templateId}`)
    } catch (error) {
      console.error('Failed to remove template from localStorage:', error)
    }
  }
  
  console.log(`Template deleted: ${templateId}`)
}



