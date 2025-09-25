// Simple in-memory brief storage
// In production, this would be replaced with a database

interface BriefData {
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

export function storeBrief(brief: BriefData) {
  briefs.set(brief.id, brief)
  console.log(`Brief stored: ${brief.id}`)
}

export function getBrief(briefId: string): BriefData | null {
  const brief = briefs.get(briefId)
  if (brief) {
    console.log(`Brief retrieved: ${briefId}`)
  } else {
    console.log(`Brief not found: ${briefId}`)
  }
  return brief || null
}

export function getAllBriefsForUser(userId: string): BriefData[] {
  return Array.from(briefs.values()).filter(brief => brief.userId === userId)
}

export function deleteBrief(briefId: string) {
  briefs.delete(briefId)
  console.log(`Brief deleted: ${briefId}`)
}
