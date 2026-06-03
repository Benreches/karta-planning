'use client'
import { useState, useEffect, useCallback } from 'react'
import AddTaskModal from '../components/AddTaskModal'

interface Task {
  id: string
  name: string
  project: string
  assignee: string
  dueDate: string
  status: string
  externalParty?: string
  daysLate: number
  daysWaiting: number
}

interface Project {
  id: string
  name: string
  type: string
  phase: string
  urgentCount: number
}

const TYPE_LABELS: Record<string, string> = {
  TAVA_IZMI: 'תב"ע יזמית',
  PINUI_BINUI: 'פינוי בינוי',
}

export default function Dashboard() {
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [externalTasks, setExternalTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [overdueRes, todayRes, externalRes, projectsRes] = await Promise.all([
        fetch('/api/tasks?filter=overdue'),
        fetch('/api/tasks?filter=today'),
        fetch('/api/tasks?filter=external'),
        fetch('/api/projects'),
      ])
      const [overdueData, todayData, externalData, projectsData] = await Promise.all([
        overdueRes.json(),
        todayRes.json(),
        externalRes.json(),
        projectsRes.json(),
      ])
      setOverdueTasks(overdueData)
      setTodayTasks(todayData)
      setExternalTasks(externalData)
      setProjects(projectsData)
    } catch (e) {
      console.error('שגיאה בטעינת נתונים', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const stats = [
    { num: overdueTasks.length, label: 'משימות באיחור', color: 'var(--red)', borderColor: 'var(--red)' },
    { num: todayTasks.length, label: 'לטיפול היום', color: 'var(--amber)', borderColor: 'var(--amber)' },
    { num: externalTasks.length, label: 'ממתין גורם חיצוני', color: 'var(--text2)', borderColor: 'var(--text3)' },
    { num: projects.length, label: 'פרויקטים פעילים', color: 'var(--accent)', borderColor: 'var(--accent)' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onSaved={() => { setShowAddTask(false); loadData() }}
        />
      )}
      <div className="flex">

        {/* Sidebar */}
        <div className="w-56 min-h-screen flex flex-col flex-shrink-0" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="font-bold text-base" style={{ color: 'var(--text)' }}>קרתא נדל"ן</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>מערכת תכנון ורישוי</div>
          </div>
          <nav className="p-3 flex-1">
            {[
              { icon: '⌂', label: 'לוח יומי', badge: overdueTasks.length || null, active: true },
              { icon: '◫', label: 'פרויקטים', badge: null, active: false },
              { icon: '✓', label: 'כל המשימות', badge: null, active: false },
              { icon: '📅', label: 'פגישות', badge: null, active: false },
              { icon: '🔔', label: 'התראות', badge: null, active: false },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer text-sm transition-all"
                style={{
                  background: item.active ? 'var(--accent)' : 'transparent',
                  color: item.active ? '#fff' : 'var(--text2)'
                }}>
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--red)', fontSize: '10px' }}>
                    {item.badge}
                  </span>
                ) : null}
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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>בוקר טוב, בנצי</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
                {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}{projects.length} פרויקטים פעילים
              </p>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
              style={{ background: 'var(--accent)' }}>
              + משימה חדשה
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {stats.map(stat => (
              <div key={stat.label} className="rounded-xl p-4 transition-all hover:scale-105"
                style={{ background: 'var(--bg2)', border: `1px solid var(--border)`, borderTop: `2px solid ${stat.borderColor}` }}>
                <div className="text-3xl font-bold tracking-tight" style={{ color: stat.color }}>
                  {loading ? '—' : stat.num}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Task Sections */}
          <div className="space-y-5 mb-6">

            {/* Overdue */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>🔴 באיחור — לטיפול מיידי</span>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>{overdueTasks.length} משימות</span>
              </div>
              <div className="space-y-1.5">
                {loading ? (
                  <LoadingRows />
                ) : overdueTasks.length === 0 ? (
                  <EmptyState text="אין משימות באיחור 🎉" />
                ) : overdueTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:-translate-x-0.5"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRight: '3px solid var(--red)' }}>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{task.project}</span>
                    <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{task.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>{task.assignee}</span>
                    <span className="text-xs" style={{ color: 'var(--red)' }}>לפני {task.daysLate} ימים</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>🟡 לטיפול היום</span>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>{todayTasks.length} משימות</span>
              </div>
              <div className="space-y-1.5">
                {loading ? (
                  <LoadingRows />
                ) : todayTasks.length === 0 ? (
                  <EmptyState text="אין משימות להיום" />
                ) : todayTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:-translate-x-0.5"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRight: '3px solid var(--amber)' }}>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{task.project}</span>
                    <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{task.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>{task.assignee}</span>
                    <span className="text-xs" style={{ color: 'var(--amber)' }}>היום</span>
                  </div>
                ))}
              </div>
            </div>

            {/* External */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>⏳ ממתין לגורם חיצוני</span>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>{externalTasks.length} משימות</span>
              </div>
              <div className="space-y-1.5">
                {loading ? (
                  <LoadingRows />
                ) : externalTasks.length === 0 ? (
                  <EmptyState text="אין משימות ממתינות לגורם חיצוני" />
                ) : externalTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRight: '3px solid var(--text3)' }}>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{task.project}</span>
                    <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{task.name}</span>
                    {task.externalParty && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)' }}>{task.externalParty}</span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>מזה {task.daysWaiting} יום</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr style={{ borderColor: 'var(--border)', marginBottom: '20px' }} />

          {/* Projects */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>פרויקטים פעילים</span>
              <span className="text-xs cursor-pointer" style={{ color: 'var(--accent)' }}>כל הפרויקטים</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', height: 100 }} />
                ))
              ) : projects.map(proj => {
                const isTeal = proj.type === 'PINUI_BINUI'
                return (
                  <div key={proj.id} className="rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{proj.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: isTeal ? 'rgba(62,207,170,0.15)' : 'rgba(91,110,245,0.15)',
                          color: isTeal ? 'var(--accent2)' : 'var(--accent)'
                        }}>{TYPE_LABELS[proj.type] ?? proj.type}</span>
                    </div>
                    <div className="text-xs mb-3" style={{ color: 'var(--text3)' }}>{proj.phase}</div>
                    <div className="flex justify-between">
                      {proj.urgentCount > 0 ? (
                        <span className="text-xs" style={{ color: 'var(--red)' }}>⚠ {proj.urgentCount} באיחור</span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--green)' }}>✓ תקין</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {[1, 2].map(i => (
        <div key={i} className="h-11 rounded-xl animate-pulse" style={{ background: 'var(--bg2)' }} />
      ))}
    </>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
      {text}
    </div>
  )
}
