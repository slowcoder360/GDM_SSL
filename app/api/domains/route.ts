import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prismadb'
import { getSSLExpiration } from '@/lib/sslChecker'
import * as z from 'zod'

const domainSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const data = domainSchema.parse(json)
    const trimmedDomain = data.domain.trim()

    const expirationDate = await getSSLExpiration(trimmedDomain)

    const newDomain = await prisma.domain.create({
      data: {
        domainName: trimmedDomain,
        sslExpiresAt: expirationDate,
        userId,
      },
    })

    return NextResponse.json(newDomain, { status: 200 })
  } catch (error) {
    console.error("[DOMAIN_CREATE_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    if (error instanceof Error) {
      // Specific known error messages
      if (error.message.includes("ENOTFOUND")) {
        return NextResponse.json({ error: "Domain could not be resolved. Please check if the domain is correct." }, { status: 500 })
      } else if (error.message.includes("UNABLE_TO_VERIFY_LEAF_SIGNATURE")) {
        return NextResponse.json({ error: "Unable to verify the SSL certificate. The certificate may be invalid or self-signed." }, { status: 500 })
      } else {
        // Other errors
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    // If it's not an Error instance, just return a generic error
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
