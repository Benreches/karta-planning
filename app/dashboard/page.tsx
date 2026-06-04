'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'

type Task = {
  id: number
  project: string
  name: string
  assignee: string
  daysLate?: number
  party?: string
  daysWaiting?: number
  dueDate: string
  done?: boolean
}

type Section = 'urgent' | 'today' | 'external'

const initialTasks: Record<Section, Task[]> = {
  urgent: [
    { id: 1, project: 'בוכרים', name: 'העברת מסמכים לבנק דיסקונט', assignee: 'רותם', daysLate: 5, dueDate: '29/05/2026' },
    { id: 2, project: 'גילה', name: 'קבלת תשובה ממהנדס העיר', assignee: 'אלישבע', daysLate: 2, dueDate: '01/06/2026' },
    { id: 3, project: 'הפעמון', name: 'שיבוץ לוועדה מחוזית', assignee: 'אני', daysLate: 1, dueDate: '02/06/2026' },
    { id: 4, project: 'שחר 18', name: 'חתימת יפויי כוח — חסרים 3 דיירים', assignee: 'רותם', daysLate: 3, dueDate: '31/05/2026' },
  ],
  today: [
    { id: 5, project: 'סן מרטין', name: 'אישור הצעת מחיר אדריכל', assignee: 'אני', dueDate: '04/06/2026' },
    { id: 6, project: 'בן גמלא', name: 'העברת יפויי כוח תכנוניים', assignee: 'רותם', dueDate: '04/06/2026' },
    { id: 7, project: 'נג׳ארה', name: 'אישור סקיצה ראשונה לקונספט', assignee: 'אלישבע', dueDate: '04/06/2026' },
  ],
  external: [
    { id: 8, project: 'אגריפס', name: 'תשובה על התנגדויות', party: 'מחוזית', daysWaiting: 18, assignee: '—', dueDate: '15/05/2026' },
    { id: 9, project: 'ל"ה', name: 'אישור שימור', party: 'עתיקות', daysWaiting: 11, assignee: '—', dueDate: '22/05/2026' },
    { id: 10, project: 'יהודה הנשיא', name: 'חוות דעת תנועה', party: 'יועץ', daysWaiting: 6, assignee: '—', dueDate: '28/05/2026' },
  ],
}

const mockProjects = [
  { id: 1, name: 'בוכרים', type: 'תב"ע יזמית', phase: 'רשות מקומית — דיון', progress: 45, urgent: 2 },
  { id: 2, name: 'גילה', type: 'פינוי בינוי', phase: 'הכרזה + פתיחת תיק', progress: 20, urgent: 1 },
  { id: 3, name: 'הפעמון', type: 'תב"ע יזמית', phase: 'מחוזית — התנגדויות', progress: 68, urgent: 1 },
  { id: 4, name: 'ל"ה', type: 'תב"ע יזמית', phase: 'רישוי — היתר דיפון', progress: 82, urgent: 0 },
  { id: 5, name: 'סן מרטין', type: 'פינוי בינוי', phase: 'פתיחת תיק מחוזית', progress: 30, urgent: 0 },
  { id: 6, name: 'בן גמלא', type: 'פינוי בינוי', phase: 'הכרזת מנהלת', progress: 12, urgent: 0 },
]

const SECTIONS: { key: Section; label: string; headerBg: string; borderColor: string; badgeColor: string }[] = [
  { key: 'urgent',   label: '⚠ באיחור — לטיפול מיידי', headerBg: '#991B1B', borderColor: '#EF4444', badgeColor: '#EF4444' },
  { key: 'today',    label: '📋 לטיפול היום',            headerBg: '#92400E', borderColor: '#F97316', badgeColor: '#F97316' },
  { key: 'external', label: '⏳ ממתין לגורם חיצוני',    headerBg: '#374151', borderColor: '#9CA3AF', badgeColor: '#6B7280' },
]

const navItems = [
  { id: 'dashboard', label: 'לוח יומי',    icon: '🗓' },
  { id: 'projects',  label: 'פרויקטים',    icon: '📁' },
  { id: 'tasks',     label: 'כל המשימות',  icon: '📋' },
  { id: 'meetings',  label: 'פגישות',       icon: '👥' },
  { id: 'alerts',    label: 'התראות',       icon: '🔔' },
]

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [completing, setCompleting] = useState<Set<number>>(new Set())
  const [activeNav, setActiveNav] = useState('dashboard')

  const markDone = useCallback(async (section: Section, taskId: number) => {
    if (completing.has(taskId)) return
    setCompleting(prev => new Set(prev).add(taskId))

    // Optimistic update
    setTasks(prev => ({
      ...prev,
      [section]: prev[section].map(t => t.id === taskId ? { ...t, done: true } : t),
    }))

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: true }),
      })
    } catch {
      // API not yet connected — optimistic update stands
    } finally {
      setCompleting(prev => { const n = new Set(prev); n.delete(taskId); return n })
    }
  }, [completing])

  const sortedTasks = (section: Section) => {
    const list = tasks[section]
    return [...list.filter(t => !t.done), ...list.filter(t => t.done)]
  }

  const urgentCount  = tasks.urgent.filter(t => !t.done).length
  const todayCount   = tasks.today.filter(t => !t.done).length
  const waitingCount = tasks.external.filter(t => !t.done).length
  const totalActive  = urgentCount + todayCount + waitingCount

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Heebo, Segoe UI, Arial, sans-serif', display: 'flex' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220,
        minHeight: '100vh',
        background: '#fff',
        borderLeft: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '16px 12px 12px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}>
          <Image
            src="/publiclogo.png"
            alt="Karta Group"
            width={160}
            height={50}
            style={{ objectFit: 'contain', maxHeight: 50 }}
            priority
          />
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 0', flex: 1 }}>
          {navItems.map(item => {
            const badge = item.id === 'dashboard' ? totalActive : item.id === 'alerts' ? urgentCount : 0
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  borderRight: isActive ? '3px solid #2563EB' : '3px solid transparent',
                  border: 'none',
                  borderRight: isActive ? '3px solid #2563EB' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: isActive ? '#1D4ED8' : '#374151',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'right',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && (
                  <span style={{
                    background: '#EF4444', color: '#fff',
                    borderRadius: 10, padding: '1px 6px', fontSize: 11, fontWeight: 700,
                  }}>{badge}</span>
                )}
              </button>
            )
          })}

          <div style={{ margin: '12px 16px', borderTop: '1px solid #E5E7EB' }} />
          <div style={{ padding: '4px 16px 6px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            פרויקטים
          </div>
          {mockProjects.map(p => (
            <button key={p.id} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px 6px 12px', background: 'transparent',
              border: 'none', cursor: 'pointer', fontSize: 12, color: '#374151', textAlign: 'right',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
              <span style={{ fontSize: 14 }}>📁</span>
              <span style={{ flex: 1 }}>{p.name}</span>
              {p.urgent > 0 && (
                <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>⚠{p.urgent}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: '#2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>ב</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>בנצי</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>מנהל תכנון ורישוי</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>בוקר טוב, בנצי</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}{totalActive} משימות פעילות
            </p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8,
            background: '#2563EB', color: '#fff', border: 'none',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> משימה חדשה
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { num: urgentCount,  label: 'משימות באיחור',       color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
            { num: todayCount,   label: 'לטיפול היום',          color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
            { num: waitingCount, label: 'ממתין גורם חיצוני',   color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Task Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {SECTIONS.map(sec => {
            const list = sortedTasks(sec.key)
            const activeCount = list.filter(t => !t.done).length
            return (
              <section key={sec.key}>
                {/* Category header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: sec.headerBg, borderRadius: 8,
                  padding: '8px 16px', marginBottom: 8,
                }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{sec.label}</span>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                    borderRadius: 10, padding: '1px 8px', fontSize: 11,
                  }}>
                    {activeCount} משימות
                  </span>
                </div>

                {/* Task cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {list.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      section={sec}
                      onDone={() => markDone(sec.key, task.id)}
                      completing={completing.has(task.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

      </main>
    </div>
  )
}

/* ── Task Card ── */
function TaskCard({
  task, section, onDone, completing,
}: {
  task: Task
  section: typeof SECTIONS[0]
  onDone: () => void
  completing: boolean
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: task.done ? '#F9FAFB' : hover ? '#EFF6FF' : '#fff',
        border: `1px solid ${task.done ? '#E5E7EB' : hover ? '#93C5FD' : '#E5E7EB'}`,
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: task.done ? 'none' : hover ? '0 2px 8px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.07)',
        transition: 'all 0.15s',
        opacity: task.done ? 0.6 : 1,
      }}>

      {/* Done button — left side */}
      <button
        onClick={onDone}
        disabled={task.done || completing}
        title={task.done ? 'בוצע' : 'סמן כבוצע'}
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 6,
          border: task.done ? '1px solid #A7F3D0' : '1px solid #16A34A',
          background: task.done ? '#D1FAE5' : completing ? '#DCFCE7' : '#fff',
          color: task.done ? '#15803D' : '#16A34A',
          fontSize: 12,
          fontWeight: 600,
          cursor: task.done || completing ? 'default' : 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.1s',
          boxShadow: task.done ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          if (!task.done && !completing)
            (e.currentTarget as HTMLButtonElement).style.background = '#DCFCE7'
        }}
        onMouseLeave={e => {
          if (!task.done && !completing)
            (e.currentTarget as HTMLButtonElement).style.background = '#fff'
        }}
        onMouseDown={e => {
          if (!task.done && !completing)
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.15)'
        }}
        onMouseUp={e => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)'
        }}>
        {completing ? '⌛' : '✓'} {task.done ? 'בוצע' : 'בוצע'}
      </button>

      {/* Project badge */}
      <span style={{
        flexShrink: 0,
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 4,
        background: '#F3F4F6',
        color: '#374151',
        border: '1px solid #E5E7EB',
      }}>
        {task.project}
      </span>

      {/* Name */}
      <span style={{
        flex: 1,
        fontSize: 13,
        color: task.done ? '#9CA3AF' : '#111827',
        textDecoration: task.done ? 'line-through' : 'none',
      }}>
        {task.name}
      </span>

      {/* Assignee */}
      <span style={{ fontSize: 12, color: '#6B7280', flexShrink: 0 }}>{task.assignee}</span>

      {/* Status badge */}
      {!task.done && (
        task.daysLate ? (
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4, flexShrink: 0,
            background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', fontWeight: 600,
          }}>
            איחור {task.daysLate} ימים
          </span>
        ) : task.daysWaiting ? (
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4, flexShrink: 0,
            background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB',
          }}>
            {task.party} · מזה {task.daysWaiting} יום
          </span>
        ) : (
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4, flexShrink: 0,
            background: '#FFF7ED', color: '#F97316', border: '1px solid #FED7AA', fontWeight: 600,
          }}>
            היום
          </span>
        )
      )}
    </div>
  )
}
