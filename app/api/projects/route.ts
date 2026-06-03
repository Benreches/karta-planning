import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
      include: {
        phases: {
          where: { status: 'IN_PROGRESS' },
          orderBy: { order: 'asc' },
          take: 1,
          include: {
            subPhases: {
              include: {
                tasks: {
                  where: {
                    status: { in: ['OPEN', 'IN_PROGRESS'] },
                    dueDate: { lt: new Date() },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const result = projects.map(p => {
      const activePhase = p.phases[0]
      const allTasks = activePhase?.subPhases.flatMap(sp => sp.tasks) ?? []
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        phase: activePhase?.name ?? 'אין שלב פעיל',
        urgentCount: allTasks.length,
      }
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'שגיאה בטעינת פרויקטים' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, address, type, startDate, targetDate, notes } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'שם וסוג הפרויקט נדרשים' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        address,
        type,
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        notes,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'שגיאה ביצירת פרויקט' }, { status: 500 })
  }
}
