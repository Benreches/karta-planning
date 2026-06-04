'use client'
import { useState, useCallback } from 'react'

type Task = {
  id: number
  project: string
  name: string
  assignee: string
  daysLate?: number
  party?: string
  daysWaiting?: number
  done?: boolean
}

const initialTasks = {
  urgent: [
    { id: 1, project: 'בוכרים', name: 'העברת מסמכים לבנק דיסקונט', assignee: 'רותם', daysLate: 5 },
    { id: 2, project: 'גילה', name: 'קבלת תשובה ממהנדס העיר', assignee: 'אלישבע', daysLate: 2 },
    { id: 3, project: 'הפעמון', name: 'שיבוץ לוועדה מחוזית', assignee: 'אני', daysLate: 1 },
    { id: 4, project: 'שחר 18', name: 'חתימת יפויי כוח — חסרים 3 דיירים', assignee: 'רותם', daysLate: 3 },
  ] as Task[],
  today: [
    { id: 5, project: 'סן מרטין', name: 'אישור הצעת מחיר אדריכל', assignee: 'אני' },
    { id: 6, project: 'בן גמלא', name: 'העברת יפויי כוח תכנוניים', assignee: 'רותם' },
    { id: 7, project: 'נג׳ארה', name: 'אישור סקיצה ראשונה לקונספט', assignee: 'אלישבע' },
  ] as Task[],
  external: [
    { id: 8, project: 'אגריפס', name: 'תשובה על התנגדויות', party: 'מחוזית', daysWaiting: 18 },
    { id: 9, project: 'ל"ה', name: 'אישור שימור', party: 'עתיקות', daysWaiting: 11 },
    { id: 10, project: 'יהודה הנשיא', name: 'חוות דעת תנועה', party: 'יועץ', daysWaiting: 6 },
  ] as Task[],
}

const mockProjects = [
  { id: 1, name: 'בוכרים', type: 'תב"ע יזמית', phase: 'רשות מקומית — דיון', progress: 45, urgent: 2, typeColor: 'blue' },
  { id: 2, name: 'גילה', type: 'פינוי בינוי', phase: 'הכרזה + פתיחת תיק', progress: 20, urgent: 1, typeColor: 'teal' },
  { id: 3, name: 'הפעמון', type: 'תב"ע יזמית', phase: 'מחוזית — התנגדויות', progress: 68, urgent: 1, typeColor: 'blue' },
  { id: 4, name: 'ל"ה', type: 'תב"ע יזמית', phase: 'רישוי — היתר דיפון', progress: 82, urgent: 0, typeColor: 'amber' },
  { id: 5, name: 'סן מרטין', type: 'פינוי בינוי', phase: 'פתיחת תיק מחוזית', progress: 30, urgent: 0, typeColor: 'teal' },
  { id: 6, name: 'בן גמלא', type: 'פינוי בינוי', phase: 'הכרזת מנהלת', progress: 12, urgent: 0, typeColor: 'teal' },
]

type TaskSection = 'urgent' | 'today' | 'external'

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [completing, setCompleting] = useState<Set<number>>(new Set())

  const markDone = useCallback(async (section: TaskSection, taskId: number) => {
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
      // API not yet connected — optimistic update stands for demo
    } finally {
      setCompleting(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }, [completing])

  const sortedTasks = (section: TaskSection) => {
    const list = tasks[section]
    return [...list.filter(t => !t.done), ...list.filter(t => t.done)]
  }

  const activeCounts = {
    urgent: tasks.urgent.filter(t => !t.done).length,
    today: tasks.today.filter(t => !t.done).length,
    external: tasks.external.filter(t => !t.done).length,
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="flex">

        {/* Sidebar */}
        <div className="w-56 min-h-screen flex flex-col flex-shrink-0"
          style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="font-bold text-base" style={{ color: 'var(--text)' }}>קרתא נדל"ן</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>מערכת תכנון ורישוי</div>
          </div>
          <nav className="p-3 flex-1">
            {[
              { icon: '⌂', label: 'לוח יומי', badge: activeCounts.urgent + activeCounts.today, active: true },
              { icon: '◫', label: 'פרויקטים', badge: null, active: false },
              { icon: '✓', label: 'כל המשימות', badge: null, active: false },
              { icon: '📅', label: 'פגישות', badge: null, active: false },
              { icon: '🔔', label: 'התראות', badge: null, active: false },
            ].map(item => (
              <div key={item.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer text-sm transition-all"
                style={{
                  background: item.active ? 'var(--accent)' : 'transparent',
                  color: item.active ? '#fff' : 'var(--text2)',
                }}>
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: 'var(--red)', fontSize: '10px' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                style={{ background: 'var(--accent)' }}>ב</div>
              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>בנצי</div>
                <div className="text-xs" style={{ color: 'var(--text3)' }}>מנהל תכנון ורישוי</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-7">

          {/* Header */}
          <div className="flex justify-between items-start mb-7">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                בוקר טוב, בנצי
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
                {new Date().toLocaleDateString('he-IL', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })} · 15 פרויקטים פעילים
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--accent), #7B8FFF)', boxShadow: '0 4px 16px rgba(91,110,245,0.4)' }}>
              <span className="text-base font-bold">+</span> משימה חדשה
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-7">
            {[
              { num: activeCounts.urgent, label: 'משימות באיחור', color: 'var(--red)', border: 'var(--red)', glow: 'rgba(255,80,80,0.15)' },
              { num: activeCounts.today, label: 'לטיפול היום', color: 'var(--amber)', border: 'var(--amber)', glow: 'rgba(255,180,0,0.12)' },
              { num: 12, label: 'ממתין החלטה שלי', color: 'var(--accent)', border: 'var(--accent)', glow: 'rgba(91,110,245,0.12)' },
              { num: activeCounts.external, label: 'ממתין גורם חיצוני', color: 'var(--text2)', border: 'var(--text3)', glow: 'transparent' },
            ].map(stat => (
              <div key={stat.label}
                className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(145deg, var(--bg2), var(--bg2))`,
                  border: `1px solid var(--border)`,
                  borderTop: `3px solid ${stat.border}`,
                  boxShadow: `0 4px 20px ${stat.glow}`,
                }}>
                <div className="text-3xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.num}</div>
                <div className="text-xs mt-1.5 leading-tight" style={{ color: 'var(--text3)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Task Sections */}
          <div className="space-y-6 mb-7">

            {/* Urgent */}
            <TaskSection
              label="🔴 באיחור — לטיפול מיידי"
              accentColor="var(--red)"
              tasks={sortedTasks('urgent')}
              renderMeta={(t) => (
                <span className="text-xs font-medium" style={{ color: 'var(--red)' }}>
                  לפני {t.daysLate} ימים
                </span>
              )}
              onDone={(id) => markDone('urgent', id)}
              completing={completing}
            />

            {/* Today */}
            <TaskSection
              label="🟡 לטיפול היום"
              accentColor="var(--amber)"
              tasks={sortedTasks('today')}
              renderMeta={() => (
                <span className="text-xs font-medium" style={{ color: 'var(--amber)' }}>היום</span>
              )}
              onDone={(id) => markDone('today', id)}
              completing={completing}
            />

            {/* External */}
            <TaskSection
              label="⏳ ממתין לגורם חיצוני"
              accentColor="var(--text3)"
              tasks={sortedTasks('external')}
              renderMeta={(t) => (
                <>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
                    {t.party}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>מזה {t.daysWaiting} יום</span>
                </>
              )}
              onDone={(id) => markDone('external', id)}
              completing={completing}
            />
          </div>

          {/* Divider */}
          <hr style={{ borderColor: 'var(--border)', marginBottom: '24px' }} />

          {/* Projects */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
                פרויקטים פעילים
              </span>
              <span className="text-xs cursor-pointer transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                כל הפרויקטים
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mockProjects.map(proj => (
                <div key={proj.id}
                  className="rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{proj.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: proj.typeColor === 'teal'
                          ? 'rgba(62,207,170,0.18)'
                          : proj.typeColor === 'amber'
                          ? 'rgba(255,180,0,0.18)'
                          : 'rgba(91,110,245,0.18)',
                        color: proj.typeColor === 'teal'
                          ? 'var(--accent2)'
                          : proj.typeColor === 'amber'
                          ? 'var(--amber)'
                          : 'var(--accent)',
                      }}>
                      {proj.type}
                    </span>
                  </div>
                  <div className="text-xs mb-3" style={{ color: 'var(--text3)' }}>{proj.phase}</div>
                  <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'var(--bg3)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${proj.progress}%`,
                        background: proj.typeColor === 'teal'
                          ? 'var(--accent2)'
                          : proj.typeColor === 'amber'
                          ? 'var(--amber)'
                          : 'var(--accent)',
                      }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>{proj.progress}%</span>
                    {proj.urgent > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,80,80,0.15)', color: 'var(--red)' }}>
                        ⚠ {proj.urgent} באיחור
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ── Task Section Component ── */
function TaskSection({
  label,
  accentColor,
  tasks,
  renderMeta,
  onDone,
  completing,
}: {
  label: string
  accentColor: string
  tasks: Task[]
  renderMeta: (task: Task) => React.ReactNode
  onDone: (id: number) => void
  completing: Set<number>
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
          {label}
        </span>
        <span className="text-xs cursor-pointer transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
          הכל
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
            style={{
              background: task.done ? 'var(--bg3)' : 'var(--bg2)',
              border: `1px solid ${task.done ? 'var(--border)' : 'var(--border)'}`,
              borderRight: task.done ? '3px solid var(--bg3)' : `3px solid ${accentColor}`,
              opacity: task.done ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              if (!task.done) (e.currentTarget as HTMLDivElement).style.transform = 'translateX(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = ''
            }}>

            {/* Done Button — left side (visually right in RTL layout) */}
            <button
              onClick={(e) => { e.stopPropagation(); if (!task.done) onDone(task.id) }}
              disabled={task.done || completing.has(task.id)}
              className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
              style={{
                borderColor: task.done ? 'var(--text3)' : accentColor,
                background: task.done ? 'var(--bg3)' : 'transparent',
                color: task.done ? 'var(--text3)' : accentColor,
                cursor: task.done ? 'default' : 'pointer',
                opacity: completing.has(task.id) ? 0.6 : 1,
              }}
              title={task.done ? 'בוצע' : 'סמן כבוצע'}>
              {completing.has(task.id) ? '…' : task.done ? '✓' : '✓'}
            </button>

            <span className="text-xs px-2 py-0.5 rounded-lg"
              style={{
                background: task.done ? 'transparent' : 'var(--bg3)',
                color: 'var(--text3)',
                border: task.done ? '1px solid var(--border)' : 'none',
              }}>
              {task.project}
            </span>

            <span className="flex-1 text-sm"
              style={{
                color: task.done ? 'var(--text3)' : 'var(--text)',
                textDecoration: task.done ? 'line-through' : 'none',
              }}>
              {task.name}
            </span>

            <span className="text-xs" style={{ color: 'var(--text3)' }}>{task.assignee}</span>

            {renderMeta(task)}
          </div>
        ))}
      </div>
    </div>
  )
}
