import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prismadb"
import { getSSLExpiration } from "@/lib/sslChecker"

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json() as { id?: string }

    if (!id) {
      return NextResponse.json({ error: "Domain id is required" }, { status: 400 })
    }

    // Fetch the domain record from the database
    const domain = await prisma.domain.findUnique({ where: { id } })
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    // Re-check the SSL expiration date
    const newExpirationDate = await getSSLExpiration(domain.domainName)

    // Update the domain record in the database
    const updatedDomain = await prisma.domain.update({
      where: { id },
      data: { sslExpiresAt: newExpirationDate },
    })

    return NextResponse.json(updatedDomain, { status: 200 })
  } catch (error: unknown) {
    let message = "Internal Server Error"
    if (error instanceof Error) {
      message = error.message
    }
    console.error("Error refreshing domain:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
