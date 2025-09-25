import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBrief } from "@/lib/brief-storage"
import BriefViewer from "./brief-viewer"

interface BriefPageProps {
  params: {
    id: string
  }
}

export default async function BriefPage({ params }: BriefPageProps) {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Get the brief data from server storage
  const brief = getBrief(params.id)

  return <BriefViewer briefId={params.id} serverBrief={brief} />
}