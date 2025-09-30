// Team Accounts and Multi-Seat Billing System
// Allows organizations to manage multiple users and seats

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { z } from "zod"

const teamSchema = z.object({
  name: z.string().min(1),
  plan: z.enum(['starter', 'pro', 'enterprise']),
  seats: z.number().min(1).max(100)
})

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member')
})

// Team management API
export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'create_team':
        return await createTeam(req, session)
      case 'invite_member':
        return await inviteMember(req, session)
      case 'update_seats':
        return await updateSeats(req, session)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Team management error:", error)
    return NextResponse.json(
      { error: "Team management failed" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'team_info':
        return await getTeamInfo(session.user.id)
      case 'team_members':
        return await getTeamMembers(session.user.id)
      case 'billing_info':
        return await getBillingInfo(session.user.id)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Team fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    )
  }
}

async function createTeam(req: Request, session: any) {
  const body = await req.json()
  const { name, plan, seats } = teamSchema.parse(body)

  const team = {
    id: `team_${Date.now()}`,
    name,
    plan,
    seats,
    usedSeats: 1, // Creator is the first member
    ownerId: session.user.id,
    members: [{
      userId: session.user.id,
      email: session.user.email,
      role: 'admin',
      joinedAt: new Date().toISOString()
    }],
    createdAt: new Date().toISOString(),
    subscription: {
      status: 'active',
      plan,
      seats,
      pricePerSeat: getPricePerSeat(plan),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  // Store team (in production, save to database)
  storeTeam(team)

  return NextResponse.json({
    success: true,
    team,
    message: "Team created successfully"
  })
}

async function inviteMember(req: Request, session: any) {
  const body = await req.json()
  const { email, role } = inviteSchema.parse(body)

  // Get user's team
  const team = getUserTeam(session.user.id)
  if (!team) {
    return NextResponse.json({ error: "User is not part of a team" }, { status: 400 })
  }

  // Check if user is admin
  const userMember = team.members.find(m => m.userId === session.user.id)
  if (!userMember || userMember.role !== 'admin') {
    return NextResponse.json({ error: "Only team admins can invite members" }, { status: 403 })
  }

  // Check seat availability
  if (team.usedSeats >= team.seats) {
    return NextResponse.json({ error: "No available seats" }, { status: 400 })
  }

  const invitation = {
    id: `invite_${Date.now()}`,
    teamId: team.id,
    email,
    role,
    invitedBy: session.user.id,
    createdAt: new Date().toISOString(),
    status: 'pending'
  }

  // Store invitation
  storeInvitation(invitation)

  // Send invitation email (in production, use Resend API)
  await sendTeamInvitation(invitation, team)

  return NextResponse.json({
    success: true,
    invitation,
    message: "Invitation sent successfully"
  })
}

async function updateSeats(req: Request, session: any) {
  const body = await req.json()
  const { seats } = body

  const team = getUserTeam(session.user.id)
  if (!team) {
    return NextResponse.json({ error: "User is not part of a team" }, { status: 400 })
  }

  // Check if user is admin
  const userMember = team.members.find(m => m.userId === session.user.id)
  if (!userMember || userMember.role !== 'admin') {
    return NextResponse.json({ error: "Only team admins can update seats" }, { status: 403 })
  }

  if (seats < team.usedSeats) {
    return NextResponse.json({ error: "Cannot reduce seats below current usage" }, { status: 400 })
  }

  // Update team seats
  team.seats = seats
  team.subscription.seats = seats
  team.subscription.pricePerSeat = getPricePerSeat(team.plan)

  // Update team in storage
  updateTeam(team)

  return NextResponse.json({
    success: true,
    team,
    message: "Seats updated successfully"
  })
}

async function getTeamInfo(userId: string) {
  const team = getUserTeam(userId)
  if (!team) {
    return NextResponse.json({ error: "User is not part of a team" }, { status: 404 })
  }

  return NextResponse.json({ team })
}

async function getTeamMembers(userId: string) {
  const team = getUserTeam(userId)
  if (!team) {
    return NextResponse.json({ error: "User is not part of a team" }, { status: 404 })
  }

  return NextResponse.json({ members: team.members })
}

async function getBillingInfo(userId: string) {
  const team = getUserTeam(userId)
  if (!team) {
    return NextResponse.json({ error: "User is not part of a team" }, { status: 404 })
  }

  const billingInfo = {
    plan: team.plan,
    seats: team.seats,
    usedSeats: team.usedSeats,
    availableSeats: team.seats - team.usedSeats,
    pricePerSeat: team.subscription.pricePerSeat,
    monthlyTotal: team.subscription.pricePerSeat * team.seats,
    nextBillingDate: team.subscription.nextBillingDate,
    status: team.subscription.status
  }

  return NextResponse.json({ billing: billingInfo })
}

function getPricePerSeat(plan: string): number {
  const pricing = {
    starter: 19,
    pro: 49,
    enterprise: 99
  }
  return pricing[plan as keyof typeof pricing] || 49
}

function storeTeam(team: any) {
  const teams = JSON.parse(localStorage.getItem('callready_teams') || '[]')
  teams.push(team)
  localStorage.setItem('callready_teams', JSON.stringify(teams))
}

function getUserTeam(userId: string) {
  const teams = JSON.parse(localStorage.getItem('callready_teams') || '[]')
  return teams.find((team: any) => 
    team.members.some((member: any) => member.userId === userId)
  )
}

function updateTeam(updatedTeam: any) {
  const teams = JSON.parse(localStorage.getItem('callready_teams') || '[]')
  const index = teams.findIndex((team: any) => team.id === updatedTeam.id)
  if (index !== -1) {
    teams[index] = updatedTeam
    localStorage.setItem('callready_teams', JSON.stringify(teams))
  }
}

function storeInvitation(invitation: any) {
  const invitations = JSON.parse(localStorage.getItem('callready_invitations') || '[]')
  invitations.push(invitation)
  localStorage.setItem('callready_invitations', JSON.stringify(invitations))
}

async function sendTeamInvitation(invitation: any, team: any) {
  // In production, send email via Resend API
  console.log(`Sending team invitation to ${invitation.email}`)
  
  const emailContent = `
Hi there!

You've been invited to join the "${team.name}" team on CallReady AI.

Team Details:
- Plan: ${team.plan.charAt(0).toUpperCase() + team.plan.slice(1)}
- Seats: ${team.seats}
- Your Role: ${invitation.role}

To accept this invitation, click the link below:
${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/teams/accept?invite=${invitation.id}

If you don't have an account yet, you'll be prompted to create one.

Best regards,
The CallReady AI Team
  `.trim()

  console.log("Team invitation email:", emailContent)
}


