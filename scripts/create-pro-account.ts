/**
 * Script to create a Pro account for a user
 * Usage: npx tsx scripts/create-pro-account.ts
 */

import { db } from "../src/lib/db"
import bcrypt from "bcryptjs"

const email = "shuchi831@gmail.com"
const password = "Brayden.Aria.2020"
const name = "Shuchi" // You can update this if you have a name

async function createProAccount() {
  try {
    console.log("Creating Pro account for:", email)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      include: { subscription: true }
    })

    if (existingUser) {
      console.log("User already exists, updating to Pro plan...")
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 12)
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: name || existingUser.name
        }
      })

      // Create or update subscription to Pro
      await db.subscription.upsert({
        where: { userId: existingUser.id },
        update: {
          plan: "pro",
          status: "active",
          briefsLimit: 200,
          briefsUsed: 0,
          stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        },
        create: {
          userId: existingUser.id,
          plan: "pro",
          status: "active",
          briefsLimit: 200,
          briefsUsed: 0,
          stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      })

      console.log("✅ User updated to Pro plan successfully!")
      console.log("User ID:", existingUser.id)
      console.log("Email:", existingUser.email)
      console.log("Plan: Pro")
      console.log("Status: Active")
      console.log("Briefs Limit: 200")
    } else {
      // Create new user
      console.log("Creating new user...")
      const hashedPassword = await bcrypt.hash(password, 12)

      // Generate referral code
      const referralCode = `REF${Math.random().toString(36).substring(2, 9).toUpperCase()}`

      const user = await db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          referralCode,
        }
      })

      // Create Pro subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: "pro",
          status: "active",
          briefsLimit: 200,
          briefsUsed: 0,
          stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      })

      console.log("✅ Pro account created successfully!")
      console.log("User ID:", user.id)
      console.log("Email:", user.email)
      console.log("Name:", user.name)
      console.log("Plan: Pro")
      console.log("Status: Active")
      console.log("Briefs Limit: 200")
      console.log("Referral Code:", referralCode)
    }

    console.log("\n✅ Account setup complete!")
    console.log("The user can now login with:")
    console.log("Email:", email)
    console.log("Password:", password)
  } catch (error: any) {
    console.error("❌ Error creating Pro account:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

createProAccount()



