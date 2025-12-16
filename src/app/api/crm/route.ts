// CRM Integration Service
// Provides stubs for HubSpot, Salesforce, and Pipedrive integrations

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getBrief } from "@/lib/brief-storage"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { briefId, crmType, action } = body

    if (!briefId || !crmType || !action) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get brief data
    const brief = getBrief(briefId)
    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 })
    }

    // Route to appropriate CRM integration
    switch (crmType) {
      case 'hubspot':
        return handleHubSpotIntegration(brief, action)
      case 'salesforce':
        return handleSalesforceIntegration(brief, action)
      case 'pipedrive':
        return handlePipedriveIntegration(brief, action)
      default:
        return NextResponse.json({ error: "Unsupported CRM type" }, { status: 400 })
    }

  } catch (error) {
    console.error("CRM integration error:", error)
    return NextResponse.json(
      { error: "Failed to integrate with CRM" },
      { status: 500 }
    )
  }
}

async function handleHubSpotIntegration(brief: any, action: string) {
  try {
    // HubSpot API integration stub
    const hubspotData = {
      properties: {
        firstname: brief.prospectName.split(' ')[0],
        lastname: brief.prospectName.split(' ').slice(1).join(' ') || '',
        company: brief.companyName,
        jobtitle: brief.role,
        email: `${brief.prospectName.toLowerCase().replace(' ', '.')}@${brief.companyName.toLowerCase().replace(/\s+/g, '')}.com`, // Mock email
        phone: '555-0123', // Mock phone
        website: `https://${brief.companyName.toLowerCase().replace(/\s+/g, '')}.com`, // Mock website
        industry: 'Technology', // Mock industry
        notes_last_contacted: new Date().toISOString(),
        call_ready_ai_brief: brief.overview,
        call_ready_ai_pain_points: brief.painPoints,
        call_ready_ai_talking_points: brief.talkingPoints,
        call_ready_ai_questions: brief.questions,
        call_ready_ai_buyer_intent: brief.buyerIntentSignals
      }
    }

    switch (action) {
      case 'create_contact':
        return NextResponse.json({
          success: true,
          message: "Contact created in HubSpot",
          data: hubspotData,
          crmUrl: `https://app.hubspot.com/contacts/contacts/list/view/all/?query=${brief.prospectName}`
        })
      
      case 'create_deal':
        const dealData = {
          ...hubspotData,
          properties: {
            ...hubspotData.properties,
            dealname: `${brief.companyName} - ${brief.prospectName}`,
            dealstage: 'appointmentscheduled',
            amount: '50000', // Mock deal amount
            closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          }
        }
        return NextResponse.json({
          success: true,
          message: "Deal created in HubSpot",
          data: dealData,
          crmUrl: `https://app.hubspot.com/sales/deals`
        })
      
      default:
        return NextResponse.json({ error: "Unsupported HubSpot action" }, { status: 400 })
    }

  } catch (error) {
    console.error("HubSpot integration error:", error)
    return NextResponse.json({ error: "HubSpot integration failed" }, { status: 500 })
  }
}

async function handleSalesforceIntegration(brief: any, action: string) {
  try {
    // Salesforce API integration stub
    const salesforceData = {
      FirstName: brief.prospectName.split(' ')[0],
      LastName: brief.prospectName.split(' ').slice(1).join(' ') || '',
      Company: brief.companyName,
      Title: brief.role,
      Email: `${brief.prospectName.toLowerCase().replace(' ', '.')}@${brief.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      Phone: '555-0123',
      Website: `https://${brief.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      Industry: 'Technology',
      Description: `CallReady AI Brief: ${brief.overview}\n\nPain Points: ${brief.painPoints}\n\nTalking Points: ${brief.talkingPoints}\n\nQuestions: ${brief.questions}\n\nBuyer Intent: ${brief.buyerIntentSignals}`
    }

    switch (action) {
      case 'create_lead':
        return NextResponse.json({
          success: true,
          message: "Lead created in Salesforce",
          data: salesforceData,
          crmUrl: `https://yourinstance.lightning.force.com/lightning/o/Lead/list`
        })
      
      case 'create_opportunity':
        const opportunityData = {
          Name: `${brief.companyName} - ${brief.prospectName}`,
          StageName: 'Prospecting',
          CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          Amount: 50000,
          Description: salesforceData.Description,
          LeadSource: 'CallReady AI'
        }
        return NextResponse.json({
          success: true,
          message: "Opportunity created in Salesforce",
          data: opportunityData,
          crmUrl: `https://yourinstance.lightning.force.com/lightning/o/Opportunity/list`
        })
      
      default:
        return NextResponse.json({ error: "Unsupported Salesforce action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Salesforce integration error:", error)
    return NextResponse.json({ error: "Salesforce integration failed" }, { status: 500 })
  }
}

async function handlePipedriveIntegration(brief: any, action: string) {
  try {
    // Pipedrive API integration stub
    const pipedriveData = {
      name: brief.prospectName,
      org_name: brief.companyName,
      email: [
        {
          value: `${brief.prospectName.toLowerCase().replace(' ', '.')}@${brief.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          primary: true
        }
      ],
      phone: [
        {
          value: '555-0123',
          primary: true
        }
      ],
      notes: `CallReady AI Brief:\n${brief.overview}\n\nPain Points: ${brief.painPoints}\n\nTalking Points: ${brief.talkingPoints}\n\nQuestions: ${brief.questions}\n\nBuyer Intent: ${brief.buyerIntentSignals}`
    }

    switch (action) {
      case 'create_person':
        return NextResponse.json({
          success: true,
          message: "Person created in Pipedrive",
          data: pipedriveData,
          crmUrl: `https://yourcompany.pipedrive.com/persons`
        })
      
      case 'create_deal':
        const dealData = {
          title: `${brief.companyName} - ${brief.prospectName}`,
          value: 50000,
          currency: 'USD',
          stage_id: 1, // Mock stage ID
          person_name: brief.prospectName,
          org_name: brief.companyName,
          note: pipedriveData.notes
        }
        return NextResponse.json({
          success: true,
          message: "Deal created in Pipedrive",
          data: dealData,
          crmUrl: `https://yourcompany.pipedrive.com/deals`
        })
      
      default:
        return NextResponse.json({ error: "Unsupported Pipedrive action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Pipedrive integration error:", error)
    return NextResponse.json({ error: "Pipedrive integration failed" }, { status: 500 })
  }
}

// CRM connection status check
export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const crmType = url.searchParams.get('type')

    if (!crmType) {
      return NextResponse.json({ error: "CRM type required" }, { status: 400 })
    }

    // Mock CRM connection status
    const connectionStatus = {
      hubspot: {
        connected: false,
        message: "HubSpot integration requires API key configuration",
        setupUrl: "/dashboard/settings?tab=crm&crm=hubspot"
      },
      salesforce: {
        connected: false,
        message: "Salesforce integration requires OAuth setup",
        setupUrl: "/dashboard/settings?tab=crm&crm=salesforce"
      },
      pipedrive: {
        connected: false,
        message: "Pipedrive integration requires API token",
        setupUrl: "/dashboard/settings?tab=crm&crm=pipedrive"
      }
    }

    return NextResponse.json({
      crmType,
      ...connectionStatus[crmType as keyof typeof connectionStatus]
    })

  } catch (error) {
    console.error("CRM status check error:", error)
    return NextResponse.json({ error: "Failed to check CRM status" }, { status: 500 })
  }
}



