import { PrismaClient, ProjectType, ProjectStatus, PhaseStatus, TaskStatus, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.task.deleteMany()
  await prisma.subPhase.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const benzi = await prisma.user.upsert({
    where: { email: 'benzi@karta.co.il' },
    update: {},
    create: { name: 'בנצי', email: 'benzi@karta.co.il', role: UserRole.PLANNING_MANAGER },
  })
  const elishe = await prisma.user.upsert({
    where: { email: 'elisheva@karta.co.il' },
    update: {},
    create: { name: 'אלישבע', email: 'elisheva@karta.co.il', role: UserRole.COORDINATOR },
  })
  const rotem = await prisma.user.upsert({
    where: { email: 'rotem@karta.co.il' },
    update: {},
    create: { name: 'רותם', email: 'rotem@karta.co.il', role: UserRole.OPERATIONS },
  })
  const yehuda = await prisma.user.upsert({
    where: { email: 'yehuda@karta.co.il' },
    update: {},
    create: { name: 'יהודה', email: 'yehuda@karta.co.il', role: UserRole.EXECUTION },
  })

  const projects: Array<{
    name: string
    type: ProjectType
    status: ProjectStatus
    address: string
    phaseName: string
    phaseStatus: PhaseStatus
    progress: number
    tasks: Array<{ name: string; assigneeId: string; daysOffset: number; status: TaskStatus; externalParty?: string }>
  }> = [
    {
      name: 'בוכרים',
      type: 'TAVA_IZMI',
      status: 'ACTIVE',
      address: 'רחוב בוכרים, ירושלים',
      phaseName: 'רשות מקומית — דיון',
      phaseStatus: 'IN_PROGRESS',
      progress: 45,
      tasks: [
        { name: 'העברת מסמכים לבנק דיסקונט', assigneeId: rotem.id, daysOffset: -5, status: 'IN_PROGRESS' },
        { name: 'עדכון תשריט חלוקה', assigneeId: elishe.id, daysOffset: -3, status: 'OPEN' },
      ],
    },
    {
      name: 'גילה',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      address: 'שכונת גילה, ירושלים',
      phaseName: 'הכרזה + פתיחת תיק',
      phaseStatus: 'IN_PROGRESS',
      progress: 20,
      tasks: [
        { name: 'קבלת תשובה ממהנדס העיר', assigneeId: elishe.id, daysOffset: -2, status: 'OPEN' },
      ],
    },
    {
      name: 'הפעמון',
      type: 'TAVA_IZMI',
      status: 'ACTIVE',
      address: 'רחוב הפעמון, ירושלים',
      phaseName: 'מחוזית — התנגדויות',
      phaseStatus: 'IN_PROGRESS',
      progress: 68,
      tasks: [
        { name: 'שיבוץ לוועדה מחוזית', assigneeId: benzi.id, daysOffset: -1, status: 'OPEN' },
        { name: 'תגובה להתנגדויות', assigneeId: elishe.id, daysOffset: 0, status: 'IN_PROGRESS' },
        { name: 'תשובה על התנגדויות', assigneeId: benzi.id, daysOffset: -18, status: 'WAITING_EXTERNAL', externalParty: 'מחוזית' },
      ],
    },
    {
      name: 'ל"ה',
      type: 'TAVA_IZMI',
      status: 'ACTIVE',
      address: 'רחוב ל"ה, ירושלים',
      phaseName: 'רישוי — היתר דיפון',
      phaseStatus: 'IN_PROGRESS',
      progress: 82,
      tasks: [
        { name: 'אישור שימור', assigneeId: benzi.id, daysOffset: -11, status: 'WAITING_EXTERNAL', externalParty: 'עתיקות' },
        { name: 'הגשת בקשה להיתר', assigneeId: yehuda.id, daysOffset: 7, status: 'OPEN' },
      ],
    },
    {
      name: 'סן מרטין',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      address: 'רחוב סן מרטין, ירושלים',
      phaseName: 'פתיחת תיק מחוזית',
      phaseStatus: 'IN_PROGRESS',
      progress: 30,
      tasks: [
        { name: 'אישור הצעת מחיר אדריכל', assigneeId: benzi.id, daysOffset: 0, status: 'OPEN' },
        { name: 'חוות דעת תנועה', assigneeId: rotem.id, daysOffset: -6, status: 'WAITING_EXTERNAL', externalParty: 'יועץ תנועה' },
      ],
    },
    {
      name: 'בן גמלא',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      address: 'רחוב בן גמלא, ירושלים',
      phaseName: 'הכרזת מנהלת',
      phaseStatus: 'IN_PROGRESS',
      progress: 12,
      tasks: [
        { name: 'העברת יפויי כוח תכנוניים', assigneeId: rotem.id, daysOffset: 0, status: 'OPEN' },
        { name: 'פגישת היכרות דיירים', assigneeId: yehuda.id, daysOffset: 3, status: 'OPEN' },
      ],
    },
  ]

  for (const proj of projects) {
    const project = await prisma.project.create({
      data: {
        name: proj.name,
        address: proj.address,
        type: proj.type,
        status: proj.status,
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })

    const phase = await prisma.phase.create({
      data: {
        projectId: project.id,
        name: proj.phaseName,
        order: 1,
        status: proj.phaseStatus,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    })

    const subPhase = await prisma.subPhase.create({
      data: {
        phaseId: phase.id,
        name: 'משימות שוטפות',
        order: 1,
        status: 'IN_PROGRESS',
      },
    })

    for (let i = 0; i < proj.tasks.length; i++) {
      const t = proj.tasks[i]
      const dueDate = new Date(Date.now() + t.daysOffset * 24 * 60 * 60 * 1000)

      await prisma.task.create({
        data: {
          subPhaseId: subPhase.id,
          name: t.name,
          assigneeId: t.assigneeId,
          dueDate,
          status: t.status,
          externalParty: t.externalParty ?? null,
          trackingDate: t.status === 'WAITING_EXTERNAL' ? new Date(Date.now() + t.daysOffset * 24 * 60 * 60 * 1000) : null,
        },
      })
    }
  }

  console.log('✅ Seed complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
