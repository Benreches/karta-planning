import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [projects, tasks] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
    ])
    return NextResponse.json({ ok: true, projects, tasks })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
