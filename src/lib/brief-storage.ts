// Hybrid brief storage - in-memory + localStorage backup
// In production, this would be replaced with a database

export interface BriefData {
  id: string
  userId: string
  prospectName: string
  companyName: string
  role: string
  meetingLink?: string
  notes?: string
  overview: string
  context: string
  painPoints: string
  talkingPoints: string
  questions: string
  competitive: string
  createdAt: string
}

// In-memory storage
const briefs = new Map<string, BriefData>()

// Helper function to sync with localStorage
function syncToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      const briefsArray = Array.from(briefs.values())
      localStorage.setItem('callready_briefs', JSON.stringify(briefsArray))
      console.log(`Synced ${briefsArray.length} briefs to localStorage`)
    } catch (error) {
      console.error('Failed to sync briefs to localStorage:', error)
    }
  }
}

// Helper function to load from localStorage
function loadFromLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('callready_briefs')
      if (stored) {
        const briefsArray = JSON.parse(stored)
        briefsArray.forEach((brief: BriefData) => {
          briefs.set(brief.id, brief)
        })
        console.log(`Loaded ${briefsArray.length} briefs from localStorage`)
      }
    } catch (error) {
      console.error('Failed to load briefs from localStorage:', error)
    }
  }
}

export function storeBrief(brief: BriefData) {
  briefs.set(brief.id, brief)
  console.log(`Brief stored: ${brief.id} for user: ${brief.userId}`)
  console.log(`Total briefs in storage: ${briefs.size}`)
  
  // Sync to localStorage
  syncToLocalStorage()
}

export function getBrief(briefId: string): BriefData | null {
  // Try in-memory first
  let brief = briefs.get(briefId)
  
  if (!brief && typeof window !== 'undefined') {
    // Try localStorage as fallback
    try {
      const stored = localStorage.getItem(`brief_${briefId}`)
      if (stored) {
        brief = JSON.parse(stored)
        // Store back in memory for future requests
        briefs.set(briefId, brief)
        console.log(`Brief loaded from localStorage: ${briefId}`)
      }
    } catch (error) {
      console.error('Failed to load brief from localStorage:', error)
    }
  }
  
  if (brief) {
    console.log(`Brief retrieved: ${briefId}`)
  } else {
    console.log(`Brief not found: ${briefId}`)
    console.log(`Available brief IDs: ${Array.from(briefs.keys()).join(', ')}`)
  }
  
  return brief || null
}

export function getAllBriefsForUser(userId: string): BriefData[] {
  // Load from localStorage if in-memory is empty
  if (briefs.size === 0) {
    loadFromLocalStorage()
  }
  
  return Array.from(briefs.values()).filter(brief => brief.userId === userId)
}

export function deleteBrief(briefId: string) {
  briefs.delete(briefId)
  
  // Remove from localStorage too
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`brief_${briefId}`)
    } catch (error) {
      console.error('Failed to remove brief from localStorage:', error)
    }
  }
  
  console.log(`Brief deleted: ${briefId}`)
}
