import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { clerkClient } from '@clerk/nextjs/server'
import { sendEmail } from '@/lib/sendEmail'

export async function GET() {
  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Fetch domains expiring within 30 days
  const domains = await prisma.domain.findMany({
    where: {
      sslExpiresAt: {
        lte: thirtyDaysLater,
      },
    },
  })

  // Await the clerkClient first, to get the actual ClerkClient instance
  const client = await clerkClient()

  for (const d of domains) {
    try {
      // Get the user's information from Clerk using their userId
      const user = await client.users.getUser(d.userId)
      if (!user) {
        console.error(`No user found for userId ${d.userId}`)
        continue
      }

      const email = user.emailAddresses[0]?.emailAddress
      if (!email) {
        console.error(`No email found for user ${d.userId}`)
        continue
      }

      // Send a warning email
      await sendEmail({
        to: email,
        subject: `SSL Expiration Warning for ${d.domainName}`,
        text: `Your SSL certificate for ${d.domainName} will expire on ${new Date(d.sslExpiresAt).toDateString()}. Please renew it soon.`,
      })

      console.log(`Sent warning email to ${email} for ${d.domainName}`)
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }

  return NextResponse.json({ status: "ok" }, { status: 200 })
}
