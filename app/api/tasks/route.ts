import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') // overdue | today | external

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    let whereClause: Record<string, unknown> = {}

    if (filter === 'overdue') {
      whereClause = {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: { lt: todayStart },
      }
    } else if (filter === 'today') {
      whereClause = {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: { gte: todayStart, lt: todayEnd },
      }
    } else if (filter === 'external') {
      whereClause = {
        status: 'WAITING_EXTERNAL',
      }
    } else {
      whereClause = {
        status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_EXTERNAL'] },
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { name: true } },
        subPhase: {
          include: {
            phase: {
              include: {
                project: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 50,
    })

    const result = tasks.map(t => ({
      id: t.id,
      name: t.name,
      project: t.subPhase.phase.project.name,
      assignee: t.assignee.name,
      dueDate: t.dueDate,
      status: t.status,
      externalParty: t.externalParty,
      daysLate: t.dueDate < todayStart
        ? Math.floor((todayStart.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      daysWaiting: t.trackingDate
        ? Math.floor((now.getTime() - new Date(t.trackingDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }))

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'שגיאה בטעינת משימות' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, subPhaseId, assigneeId, dueDate, status, externalParty, notes } = body

    if (!name || !subPhaseId || !assigneeId || !dueDate) {
      return NextResponse.json({ error: 'שם, שלב, אחראי ותאריך יעד נדרשים' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        subPhaseId,
        assigneeId,
        dueDate: new Date(dueDate),
        status: status ?? 'OPEN',
        externalParty,
        notes,
      },
      include: {
        assignee: { select: { name: true } },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'שגיאה ביצירת משימה' }, { status: 500 })
  }
}
