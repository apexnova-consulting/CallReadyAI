import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsForm from "./settings-form"

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Get real user data from session
  const userData = {
    name: session.user.name || "",
    email: session.user.email || ""
  }

  return <SettingsForm userData={userData} />
}