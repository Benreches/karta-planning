'use client'
import { useState } from 'react'

const mockTasks = {
  urgent: [
    { id: 1, project: 'בוכרים', name: 'העברת מסמכים לבנק דיסקונט', assignee: 'רותם', daysLate: 5 },
    { id: 2, project: 'גילה', name: 'קבלת תשובה ממהנדס העיר', assignee: 'אלישבע', daysLate: 2 },
    { id: 3, project: 'הפעמון', name: 'שיבוץ לוועדה מחוזית', assignee: 'אני', daysLate: 1 },
    { id: 4, project: 'שחר 18', name: 'חתימת יפויי כוח — חסרים 3 דיירים', assignee: 'רותם', daysLate: 3 },
  ],
  today: [
    { id: 5, project: 'סן מרטין', name: 'אישור הצעת מחיר אדריכל', assignee: 'אני' },
    { id: 6, project: 'בן גמלא', name: 'העברת יפויי כוח תכנוניים', assignee: 'רותם' },
    { id: 7, project: 'נג׳ארה', name: 'אישור סקיצה ראשונה לקונספט', assignee: 'אלישבע' },
  ],
  external: [
    { id: 8, project: 'אגריפס', name: 'תשובה על התנגדויות', party: 'מחוזית', daysWaiting: 18 },
    { id: 9, project: 'ל"ה', name: 'אישור שימור', party: 'עתיקות', daysWaiting: 11 },
    { id: 10, project: 'יהודה הנשיא', name: 'חוות דעת תנועה', party: 'יועץ', daysWaiting: 6 },
  ],
}

const mockProjects = [
  { id: 1, name: 'בוכרים', type: 'תב"ע יזמית', phase: 'רשות מקומית — דיון', progress: 45, urgent: 2, typeColor: 'blue' },
  { id: 2, name: 'גילה', type: 'פינוי בינוי', phase: 'הכרזה + פתיחת תיק', progress: 20, urgent: 1, typeColor: 'teal' },
  { id: 3, name: 'הפעמון', type: 'תב"ע יזמית', phase: 'מחוזית — התנגדויות', progress: 68, urgent: 1, typeColor: 'blue' },
  { id: 4, name: 'ל"ה', type: 'תב"ע יזמית', phase: 'רישוי — היתר דיפון', progress: 82, urgent: 0, typeColor: 'amber' },
  { id: 5, name: 'סן מרטין', type: 'פינוי בינוי', phase: 'פתיחת תיק מחוזית', progress: 30, urgent: 0, typeColor: 'teal' },
  { id: 6, name: 'בן גמלא', type: 'פינוי בינוי', phase: 'הכרזת מנהלת', progress: 12, urgent: 0, typeColor: 'teal' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'urgent' | 'today' | 'external'>('urgent')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="flex">

        {/* Sidebar */}
        <div className="w-56 min-h-screen flex flex-col flex-shrink-0" style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="font-bold text-base" style={{ color: 'var(--text)' }}>קרתא נדל"ן</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>מערכת תכנון ורישוי</div>
          </div>
          <nav className="p-3 flex-1">
            {[
              { icon: '⌂', label: 'לוח יומי', badge: 4, active: true },
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
                {item.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--red)', fontSize: '10px' }}>
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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>בוקר טוב, בנצי</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
                {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · 15 פרויקטים פעילים
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
              style={{ background: 'var(--accent)' }}>
              + משימה חדשה
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { num: 4, label: 'משימות באיחור', color: 'var(--red)', borderColor: 'var(--red)', tab: 'urgent' },
              { num: 7, label: 'לטיפול היום', color: 'var(--amber)', borderColor: 'var(--amber)', tab: 'today' },
              { num: 12, label: 'ממתין החלטה שלי', color: 'var(--accent)', borderColor: 'var(--accent)', tab: 'mine' },
              { num: 9, label: 'ממתין גורם חיצוני', color: 'var(--text2)', borderColor: 'var(--text3)', tab: 'external' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-4 cursor-pointer transition-all hover:scale-105"
                style={{ background: 'var(--bg2)', border: `1px solid var(--border)`, borderTop: `2px solid ${stat.borderColor}` }}
                onClick={() => setActiveTab(stat.tab as any)}>
                <div className="text-3xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.num}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Task Sections */}
          <div className="space-y-5 mb-6">

            {/* Urgent */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>🔴 באיחור — לטיפול מיידי</span>
                <span className="text-xs cursor-pointer" style={{ color: 'var(--accent)' }}>הכל</span>
              </div>
              <div className="space-y-1.5">
                {mockTasks.urgent.map(task => (
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
                <span className="text-xs cursor-pointer" style={{ color: 'var(--accent)' }}>הכל</span>
              </div>
              <div className="space-y-1.5">
                {mockTasks.today.map(task => (
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
                <span className="text-xs cursor-pointer" style={{ color: 'var(--accent)' }}>הכל</span>
              </div>
              <div className="space-y-1.5">
                {mockTasks.external.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRight: '3px solid var(--text3)' }}>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{task.project}</span>
                    <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{task.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)' }}>{task.party}</span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>מזה {task.daysWaiting} יום</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr style={{ borderColor: 'var(--border)', marginBottom: '20px' }}/>

          {/* Projects */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>פרויקטים פעילים</span>
              <span className="text-xs cursor-pointer" style={{ color: 'var(--accent)' }}>כל הפרויקטים</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {mockProjects.map(proj => (
                <div key={proj.id} className="rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-white/20"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{proj.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: proj.typeColor === 'teal' ? 'rgba(62,207,170,0.15)' : 'rgba(91,110,245,0.15)',
                        color: proj.typeColor === 'teal' ? 'var(--accent2)' : 'var(--accent)'
                      }}>{proj.type}</span>
                  </div>
                  <div className="text-xs mb-3" style={{ color: 'var(--text3)' }}>{proj.phase}</div>
                  <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: 'var(--bg3)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${proj.progress}%`,
                        background: proj.typeColor === 'teal' ? 'var(--accent2)' : proj.typeColor === 'amber' ? 'var(--amber)' : 'var(--accent)'
                      }}/>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>{proj.progress}%</span>
                    {proj.urgent > 0 && (
                      <span className="text-xs" style={{ color: 'var(--red)' }}>⚠ {proj.urgent} באיחור</span>
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
