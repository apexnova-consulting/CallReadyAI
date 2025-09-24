import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import BriefView from "./brief-view"

interface BriefPageProps {
  params: {
    id: string
  }
}

export default async function BriefPage({ params }: BriefPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  const brief = await db.brief.findUnique({
    where: { id: params.id },
  })

  if (!brief || brief.userId !== session.user.id) {
    notFound()
  }

  return <BriefView brief={brief} />
}
