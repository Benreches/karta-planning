import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { done, status } = body

    const updateData: Record<string, unknown> = {}

    if (done === true) {
      updateData.status = 'COMPLETED'
    } else if (status !== undefined) {
      updateData.status = status
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        subPhase: {
          include: {
            tasks: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    // Activate next open task in the same subphase
    if (done === true) {
      const nextTask = task.subPhase.tasks.find(
        (t) => t.id !== task.id && t.status === 'OPEN'
      )
      if (nextTask) {
        await prisma.task.update({
          where: { id: nextTask.id },
          data: { status: 'IN_PROGRESS' },
        })
      }
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('PATCH /api/tasks/[id]', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
