import { PrismaClient, ProjectType, ProjectStatus, PhaseStatus, TaskStatus, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// Helper: date relative to today
const d = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400_000)

async function main() {
  // Clean existing data
  await prisma.task.deleteMany()
  await prisma.subPhase.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  // ── Users ──────────────────────────────────────────────────────────────────
  const benzi = await prisma.user.create({
    data: { name: 'בנצי', email: 'benzi@karta.co.il', role: UserRole.PLANNING_MANAGER },
  })
  const elisheva = await prisma.user.create({
    data: { name: 'אלישבע', email: 'elisheva@karta.co.il', role: UserRole.COORDINATOR },
  })
  const rotem = await prisma.user.create({
    data: { name: 'רותם', email: 'rotem@karta.co.il', role: UserRole.OPERATIONS },
  })
  const yehuda = await prisma.user.create({
    data: { name: 'יהודה', email: 'yehuda@karta.co.il', role: UserRole.EXECUTION },
  })

  // ── Project definition type ────────────────────────────────────────────────
  type TaskDef = {
    name: string
    assigneeId: string
    daysOffset: number
    status: TaskStatus
    externalParty?: string
    notes?: string
  }
  type ProjDef = {
    name: string
    address: string
    type: ProjectType
    status: ProjectStatus
    startDate: Date
    targetDate: Date
    notes?: string
    phases: Array<{
      name: string
      order: number
      status: PhaseStatus
      startDate: Date
      subPhases: Array<{
        name: string
        order: number
        status: PhaseStatus
        isMilestone?: boolean
        tasks: TaskDef[]
      }>
    }>
  }

  const projects: ProjDef[] = [

    // ── 1. בוכרים (demo project, kept) ────────────────────────────────────────
    {
      name: 'בוכרים',
      address: 'רחוב בוכרים, ירושלים',
      type: 'TAVA_IZMI',
      status: 'ACTIVE',
      startDate: d(-120),
      targetDate: d(400),
      phases: [{
        name: 'רשות מקומית — דיון',
        order: 1,
        status: 'IN_PROGRESS',
        startDate: d(-60),
        subPhases: [{
          name: 'משימות שוטפות',
          order: 1,
          status: 'IN_PROGRESS',
          tasks: [
            { name: 'העברת מסמכים לבנק דיסקונט', assigneeId: rotem.id, daysOffset: -5, status: 'IN_PROGRESS' },
            { name: 'עדכון תשריט חלוקה', assigneeId: elisheva.id, daysOffset: -3, status: 'OPEN' },
          ],
        }],
      }],
    },

    // ── 2. גילה ────────────────────────────────────────────────────────────────
    {
      name: 'גילה',
      address: 'שכונת גילה, ירושלים',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      startDate: d(-180),
      targetDate: d(500),
      phases: [{
        name: 'הכרזה + פתיחת תיק',
        order: 1,
        status: 'IN_PROGRESS',
        startDate: d(-90),
        subPhases: [{
          name: 'משימות שוטפות',
          order: 1,
          status: 'IN_PROGRESS',
          tasks: [
            { name: 'קבלת תשובה ממהנדס העיר', assigneeId: elisheva.id, daysOffset: -2, status: 'OPEN' },
          ],
        }],
      }],
    },

    // ── 3. הפעמון ──────────────────────────────────────────────────────────────
    {
      name: 'הפעמון',
      address: 'רחוב הפעמון, ירושלים',
      type: 'TAVA_IZMI',
      status: 'ACTIVE',
      startDate: d(-300),
      targetDate: d(200),
      phases: [{
        name: 'מחוזית — התנגדויות',
        order: 1,
        status: 'IN_PROGRESS',
        startDate: d(-120),
        subPhases: [{
          name: 'משימות שוטפות',
          order: 1,
          status: 'IN_PROGRESS',
          tasks: [
            { name: 'שיבוץ לוועדה מחוזית', assigneeId: benzi.id, daysOffset: -1, status: 'OPEN' },
            { name: 'תגובה להתנגדויות', assigneeId: elisheva.id, daysOffset: 0, status: 'IN_PROGRESS' },
            { name: 'תשובה על התנגדויות', assigneeId: benzi.id, daysOffset: -18, status: 'WAITING_EXTERNAL', externalParty: 'ועדה מחוזית' },
          ],
        }],
      }],
    },

    // ── 4. בן גמלא ─────────────────────────────────────────────────────────────
    {
      name: 'בן גמלא',
      address: 'רחוב בן גמלא, ירושלים',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      startDate: d(-60),
      targetDate: d(600),
      phases: [{
        name: 'הכרזת מנהלת',
        order: 1,
        status: 'IN_PROGRESS',
        startDate: d(-30),
        subPhases: [{
          name: 'משימות שוטפות',
          order: 1,
          status: 'IN_PROGRESS',
          tasks: [
            { name: 'העברת יפויי כוח תכנוניים', assigneeId: rotem.id, daysOffset: 0, status: 'OPEN' },
            { name: 'פגישת היכרות דיירים', assigneeId: yehuda.id, daysOffset: 3, status: 'OPEN' },
          ],
        }],
      }],
    },

    // ── 5. סן מרטין 4-6 — תכנון מפורט, תב"ע טרם בתוקף ──────────────────────
    {
      name: 'סן מרטין 4-6',
      address: 'רחוב סן מרטין 4-6, ירושלים',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      startDate: d(-730),
      targetDate: d(365),
      notes: 'תב"ע טרם בתוקף. מצב: בין אישור ועדה מקומית לקבלת תוקף מחוזי.',
      phases: [
        {
          name: 'תב"ע — אישור ותוקף',
          order: 1,
          status: 'IN_PROGRESS',
          startDate: d(-200),
          subPhases: [
            {
              name: 'מתן תוקף לתב"ע',
              order: 1,
              status: 'IN_PROGRESS',
              isMilestone: true,
              tasks: [
                {
                  name: 'מעקב אחר פרסום תוקף תב"ע ברשומות',
                  assigneeId: elisheva.id,
                  daysOffset: 7,
                  status: 'IN_PROGRESS',
                  externalParty: 'ועדה מחוזית',
                  notes: 'פרוטוקול 05/2026 — הוחלט לעקוב שבועי עד פרסום',
                },
                {
                  name: 'בדיקת עמידה בתנאי הפקדה — רשימת תנאים פתוחים',
                  assigneeId: benzi.id,
                  daysOffset: 5,
                  status: 'OPEN',
                  notes: 'יש לוודא השלמת חוות דעת ניקוז',
                },
                {
                  name: 'קבלת אישור משרד הבריאות לתנאי הפקדה',
                  assigneeId: rotem.id,
                  daysOffset: -8,
                  status: 'WAITING_EXTERNAL',
                  externalParty: 'משרד הבריאות',
                  notes: 'הוגשה בקשה 12.05.2026',
                },
              ],
            },
          ],
        },
        {
          name: 'תכנון מפורט',
          order: 2,
          status: 'IN_PROGRESS',
          startDate: d(-90),
          subPhases: [
            {
              name: 'תוכניות אדריכלות',
              order: 1,
              status: 'IN_PROGRESS',
              tasks: [
                {
                  name: 'הגשת תוכניות אדריכלות לבדיקת עו"ד',
                  assigneeId: elisheva.id,
                  daysOffset: 10,
                  status: 'OPEN',
                  notes: 'פרוטוקול 06/2026 — תוכניות מוכנות, ממתינות לחתימה',
                },
                {
                  name: 'עדכון תוכנית חניון בהתאם להערות מהנדס',
                  assigneeId: yehuda.id,
                  daysOffset: -4,
                  status: 'IN_PROGRESS',
                  notes: 'הערות התקבלו 28.05.2026',
                },
                {
                  name: 'אישור תוכנית עיצוב חזיתות — ועדה עירונית',
                  assigneeId: benzi.id,
                  daysOffset: -14,
                  status: 'WAITING_EXTERNAL',
                  externalParty: 'ועדה עירונית לתכנון',
                  notes: 'הוגש 20.05.2026',
                },
              ],
            },
            {
              name: 'תשתיות ופיתוח',
              order: 2,
              status: 'IN_PROGRESS',
              tasks: [
                {
                  name: 'תיאום חיבור ביוב עם גיחון',
                  assigneeId: rotem.id,
                  daysOffset: 14,
                  status: 'OPEN',
                  externalParty: 'גיחון',
                  notes: 'נקבעה פגישה לחודש הבא',
                },
                {
                  name: 'קבלת הצעת מחיר לאינסטלציה',
                  assigneeId: yehuda.id,
                  daysOffset: -2,
                  status: 'OPEN',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── 6. ל"ה 23-25 — רישוי, היתר 2014/042 ──────────────────────────────────
    {
      name: 'ל"ה 23-25',
      address: 'רחוב ל"ה 23-25, ירושלים',
      type: 'TAVA_IZMI',
      status: 'ACTIVE',
      startDate: d(-900),
      targetDate: d(180),
      notes: 'תיק היתר 2014/042. בשלב זה: קבלת היתר בנייה לאחר השלמת תנאים.',
      phases: [
        {
          name: 'רישוי — היתר בנייה',
          order: 1,
          status: 'IN_PROGRESS',
          startDate: d(-180),
          subPhases: [
            {
              name: 'השלמת תנאים לפני היתר',
              order: 1,
              status: 'IN_PROGRESS',
              isMilestone: true,
              tasks: [
                {
                  name: 'הגשת חוות דעת קונסטרוקציה מעודכנת — תיק 2014/042',
                  assigneeId: yehuda.id,
                  daysOffset: -3,
                  status: 'IN_PROGRESS',
                  notes: 'פרוטוקול 05/2026 — תנאי חיוני לפני הוצאת היתר',
                },
                {
                  name: 'אישור רשות העתיקות — סקר ארכיאולוגי',
                  assigneeId: benzi.id,
                  daysOffset: -21,
                  status: 'WAITING_EXTERNAL',
                  externalParty: 'רשות העתיקות',
                  notes: 'הוגש 14.05.2026. ממתינים לתשובה.',
                },
                {
                  name: 'עדכון תשריט בינוי בהתאם לתנאי הוועדה',
                  assigneeId: elisheva.id,
                  daysOffset: 6,
                  status: 'OPEN',
                  notes: 'הערות התקבלו בישיבה 02.06.2026',
                },
                {
                  name: 'תשלום אגרות רישוי — עיריית ירושלים',
                  assigneeId: rotem.id,
                  daysOffset: 3,
                  status: 'OPEN',
                  notes: 'לאחר קבלת שובר מהעירייה',
                },
              ],
            },
            {
              name: 'קבלת היתר',
              order: 2,
              status: 'PENDING',
              isMilestone: true,
              tasks: [
                {
                  name: 'מעקב אחר עיבוד הבקשה בעירייה',
                  assigneeId: elisheva.id,
                  daysOffset: 14,
                  status: 'OPEN',
                  externalParty: 'עיריית ירושלים',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── 7. מקור חיים 13 — בין תב"ע לרישוי, תיק 2026/0286.00 ─────────────────
    {
      name: 'מקור חיים 13',
      address: 'רחוב מקור חיים 13, ירושלים',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      startDate: d(-400),
      targetDate: d(300),
      notes: 'תיק רישוי 2026/0286.00 נפתח. עומדים בין מתן תוקף תב"ע לפתיחת הליך רישוי מלא.',
      phases: [
        {
          name: 'מתן תוקף תב"ע',
          order: 1,
          status: 'IN_PROGRESS',
          startDate: d(-120),
          subPhases: [
            {
              name: 'השלמת תנאי הפקדה',
              order: 1,
              status: 'IN_PROGRESS',
              isMilestone: true,
              tasks: [
                {
                  name: 'קבלת אישור נגישות — מרכז הנגישות הממשלתי',
                  assigneeId: elisheva.id,
                  daysOffset: -12,
                  status: 'WAITING_EXTERNAL',
                  externalParty: 'מרכז הנגישות הממשלתי',
                  notes: 'פרוטוקול 05/2026 — הוגשה בקשה, ממתינים',
                },
                {
                  name: 'עדכון נספח תנועה לפי הערות מהנדס תנועה',
                  assigneeId: benzi.id,
                  daysOffset: -1,
                  status: 'IN_PROGRESS',
                  notes: 'יועץ תנועה קיבל הערות 01.06.2026',
                },
                {
                  name: 'הגשת בקשה לאישור רשות מקרקעי ישראל',
                  assigneeId: rotem.id,
                  daysOffset: 5,
                  status: 'OPEN',
                  externalParty: 'רמ"י',
                  notes: 'נדרש לפני פרסום תוקף',
                },
              ],
            },
          ],
        },
        {
          name: 'פתיחת תיק רישוי',
          order: 2,
          status: 'IN_PROGRESS',
          startDate: d(-30),
          subPhases: [
            {
              name: 'תיק 2026/0286.00 — הגשה ראשונית',
              order: 1,
              status: 'IN_PROGRESS',
              tasks: [
                {
                  name: 'הגשת מסמכי פתיחת תיק לעירייה — תיק 2026/0286.00',
                  assigneeId: yehuda.id,
                  daysOffset: -5,
                  status: 'IN_PROGRESS',
                  externalParty: 'עיריית ירושלים',
                  notes: 'תיק נפתח. ממתינים לאישור קבלה',
                },
                {
                  name: 'צירוף שטרות בעלות מעודכנים לתיק',
                  assigneeId: elisheva.id,
                  daysOffset: 3,
                  status: 'OPEN',
                  notes: 'פרוטוקול 06/2026 — חסרים שני שטרות',
                },
                {
                  name: 'הכנת ייפוי כוח נוטריוני לבעלי הנכס',
                  assigneeId: rotem.id,
                  daysOffset: 7,
                  status: 'OPEN',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── 8. דבורה הנביאה 6 — לקראת תוכניות ביצוע ─────────────────────────────
    {
      name: 'דבורה הנביאה 6',
      address: 'רחוב דבורה הנביאה 6, ירושלים',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      startDate: d(-500),
      targetDate: d(240),
      notes: 'לקראת תוכניות ביצוע. תב"ע בתוקף. רישוי בהכנה.',
      phases: [
        {
          name: 'תכנון מפורט',
          order: 1,
          status: 'COMPLETED',
          startDate: d(-300),
          subPhases: [{
            name: 'תוכניות אדריכלות',
            order: 1,
            status: 'COMPLETED',
            tasks: [],
          }],
        },
        {
          name: 'תוכניות ביצוע',
          order: 2,
          status: 'IN_PROGRESS',
          startDate: d(-45),
          subPhases: [
            {
              name: 'תיאום מתכננים',
              order: 1,
              status: 'IN_PROGRESS',
              tasks: [
                {
                  name: 'קבלת הצעת מחיר מהנדס קונסטרוקציה לתוכניות ביצוע',
                  assigneeId: yehuda.id,
                  daysOffset: -6,
                  status: 'IN_PROGRESS',
                  notes: 'פרוטוקול 05/2026 — שלוש הצעות התקבלו, לבחור',
                },
                {
                  name: 'חתימת הסכם עם מהנדס קונסטרוקציה שנבחר',
                  assigneeId: benzi.id,
                  daysOffset: 7,
                  status: 'OPEN',
                },
                {
                  name: 'קבלת הצעת מחיר יועץ חשמל ותאורה',
                  assigneeId: elisheva.id,
                  daysOffset: 10,
                  status: 'OPEN',
                  notes: 'פרוטוקול 06/2026 — להוציא פנייה לשלושה יועצים',
                },
                {
                  name: 'תיאום פגישת קיק-אוף מתכננים',
                  assigneeId: elisheva.id,
                  daysOffset: 14,
                  status: 'OPEN',
                },
              ],
            },
            {
              name: 'רישוי — הגשת בקשה',
              order: 2,
              status: 'PENDING',
              isMilestone: true,
              tasks: [
                {
                  name: 'הכנת תיק רישוי — בדיקת מסמכים נדרשים',
                  assigneeId: rotem.id,
                  daysOffset: 21,
                  status: 'OPEN',
                  notes: 'להשלים לאחר בחירת מהנדס',
                },
              ],
            },
          ],
        },
      ],
    },

    // ── 9. בוכרים מוסיוף 6 — רישוי, תיק היתר פתוח ──────────────────────────
    {
      name: 'בוכרים מוסיוף 6',
      address: 'רחוב בוכרים — מוסיוף 6, ירושלים',
      type: 'PINUI_BINUI',
      status: 'ACTIVE',
      startDate: d(-600),
      targetDate: d(150),
      notes: 'תיק היתר פתוח בעירייה. בשלב בדיקת תוכניות ע"י מחלקת רישוי.',
      phases: [
        {
          name: 'רישוי — בדיקת תוכניות',
          order: 1,
          status: 'IN_PROGRESS',
          startDate: d(-90),
          subPhases: [
            {
              name: 'תיק היתר בבדיקה',
              order: 1,
              status: 'IN_PROGRESS',
              tasks: [
                {
                  name: 'מענה להערות בודק — מחלקת רישוי עיריית ירושלים',
                  assigneeId: yehuda.id,
                  daysOffset: -7,
                  status: 'IN_PROGRESS',
                  externalParty: 'עיריית ירושלים',
                  notes: 'פרוטוקול 06/2026 — התקבלו הערות ראשוניות 28.05.2026, יש להגיש תגובה תוך 14 יום',
                },
                {
                  name: 'עדכון פרטי קונסטרוקציה לפי הערות מהנדס הביקורת',
                  assigneeId: yehuda.id,
                  daysOffset: -3,
                  status: 'IN_PROGRESS',
                  notes: 'תיאום עם אדריכל הפרויקט',
                },
                {
                  name: 'הגשת מענה מלא לבודק — תוכניות מעודכנות',
                  assigneeId: benzi.id,
                  daysOffset: 4,
                  status: 'OPEN',
                  notes: 'מועד יעד: 07.06.2026',
                },
              ],
            },
            {
              name: 'אישורים נלווים',
              order: 2,
              status: 'IN_PROGRESS',
              tasks: [
                {
                  name: 'קבלת אישור כיבוי אש',
                  assigneeId: rotem.id,
                  daysOffset: -25,
                  status: 'WAITING_EXTERNAL',
                  externalParty: 'כיבוי אש',
                  notes: 'הוגש 10.05.2026',
                },
                {
                  name: 'קבלת אישור חברת חשמל — תכנון חיבור',
                  assigneeId: elisheva.id,
                  daysOffset: -18,
                  status: 'WAITING_EXTERNAL',
                  externalParty: 'חברת חשמל',
                  notes: 'הוגשה בקשה 17.05.2026',
                },
                {
                  name: 'תשלום היטל השבחה — אישור שמאי',
                  assigneeId: benzi.id,
                  daysOffset: 10,
                  status: 'OPEN',
                  notes: 'פרוטוקול 06/2026 — השמאי מכין חוות דעת',
                },
              ],
            },
          ],
        },
        {
          name: 'הוצאת היתר בנייה',
          order: 2,
          status: 'PENDING',
          startDate: d(60),
          subPhases: [{
            name: 'מילוסטון — קבלת היתר',
            order: 1,
            status: 'PENDING',
            isMilestone: true,
            tasks: [],
          }],
        },
      ],
    },

  ] // end projects array

  // ── Insert all projects ────────────────────────────────────────────────────
  for (const proj of projects) {
    const project = await prisma.project.create({
      data: {
        name: proj.name,
        address: proj.address,
        type: proj.type,
        status: proj.status,
        startDate: proj.startDate,
        targetDate: proj.targetDate,
        notes: proj.notes,
      },
    })

    for (const phaseDef of proj.phases) {
      const phase = await prisma.phase.create({
        data: {
          projectId: project.id,
          name: phaseDef.name,
          order: phaseDef.order,
          status: phaseDef.status,
          startDate: phaseDef.startDate,
        },
      })

      for (const spDef of phaseDef.subPhases) {
        const subPhase = await prisma.subPhase.create({
          data: {
            phaseId: phase.id,
            name: spDef.name,
            order: spDef.order,
            status: spDef.status,
            isMilestone: spDef.isMilestone ?? false,
          },
        })

        for (const t of spDef.tasks) {
          const dueDate = d(t.daysOffset)
          await prisma.task.create({
            data: {
              subPhaseId: subPhase.id,
              name: t.name,
              assigneeId: t.assigneeId,
              dueDate,
              status: t.status,
              externalParty: t.externalParty ?? null,
              notes: t.notes ?? null,
              trackingDate: t.status === 'WAITING_EXTERNAL' ? dueDate : null,
            },
          })
        }
      }
    }

    console.log(`  ✓ ${proj.name}`)
  }

  console.log('\n✅ Seed complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
