import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const subPhases = await prisma.subPhase.findMany({
      include: {
        phase: {
          include: {
            project: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(
      subPhases.map(sp => ({
        id: sp.id,
        name: sp.name,
        project: sp.phase.project.name,
      }))
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'שגיאה' }, { status: 500 })
  }
}
