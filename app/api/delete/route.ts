import { NextRequest, NextResponse } from 'next/server'
import  prisma  from '@/lib/prismadb'

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() as { id?: string }

    if (!id) {
      return NextResponse.json({ error: "Domain id is required" }, { status: 400 })
    }

    const domain = await prisma.domain.findUnique({ where: { id } })
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    await prisma.domain.delete({ where: { id } })

    return NextResponse.json({ status: "deleted" }, { status: 200 })
  } catch (error: unknown) {
    let message = "Internal Server Error"
    if (error instanceof Error) {
      message = error.message
    }
    console.error("Error removing domain:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
