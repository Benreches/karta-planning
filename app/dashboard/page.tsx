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
  dueDate: string
  done?: boolean
}

type SortKey = 'name' | 'project' | 'assignee' | 'dueDate'
type SortDir = 'asc' | 'desc'

const initialTasks = {
  urgent: [
    { id: 1, project: 'בוכרים', name: 'העברת מסמכים לבנק דיסקונט', assignee: 'רותם', daysLate: 5, dueDate: '29/05/2026' },
    { id: 2, project: 'גילה', name: 'קבלת תשובה ממהנדס העיר', assignee: 'אלישבע', daysLate: 2, dueDate: '01/06/2026' },
    { id: 3, project: 'הפעמון', name: 'שיבוץ לוועדה מחוזית', assignee: 'אני', daysLate: 1, dueDate: '02/06/2026' },
    { id: 4, project: 'שחר 18', name: 'חתימת יפויי כוח — חסרים 3 דיירים', assignee: 'רותם', daysLate: 3, dueDate: '31/05/2026' },
  ] as Task[],
  today: [
    { id: 5, project: 'סן מרטין', name: 'אישור הצעת מחיר אדריכל', assignee: 'אני', dueDate: '04/06/2026' },
    { id: 6, project: 'בן גמלא', name: 'העברת יפויי כוח תכנוניים', assignee: 'רותם', dueDate: '04/06/2026' },
    { id: 7, project: 'נג׳ארה', name: 'אישור סקיצה ראשונה לקונספט', assignee: 'אלישבע', dueDate: '04/06/2026' },
  ] as Task[],
  external: [
    { id: 8, project: 'אגריפס', name: 'תשובה על התנגדויות', party: 'מחוזית', daysWaiting: 18, assignee: '—', dueDate: '15/05/2026' },
    { id: 9, project: 'ל"ה', name: 'אישור שימור', party: 'עתיקות', daysWaiting: 11, assignee: '—', dueDate: '22/05/2026' },
    { id: 10, project: 'יהודה הנשיא', name: 'חוות דעת תנועה', party: 'יועץ', daysWaiting: 6, assignee: '—', dueDate: '28/05/2026' },
  ] as Task[],
}

const mockProjects = [
  { id: 1, name: 'בוכרים', type: 'תב"ע יזמית', phase: 'רשות מקומית — דיון', progress: 45, urgent: 2 },
  { id: 2, name: 'גילה', type: 'פינוי בינוי', phase: 'הכרזה + פתיחת תיק', progress: 20, urgent: 1 },
  { id: 3, name: 'הפעמון', type: 'תב"ע יזמית', phase: 'מחוזית — התנגדויות', progress: 68, urgent: 1 },
  { id: 4, name: 'ל"ה', type: 'תב"ע יזמית', phase: 'רישוי — היתר דיפון', progress: 82, urgent: 0 },
  { id: 5, name: 'סן מרטין', type: 'פינוי בינוי', phase: 'פתיחת תיק מחוזית', progress: 30, urgent: 0 },
  { id: 6, name: 'בן גמלא', type: 'פינוי בינוי', phase: 'הכרזת מנהלת', progress: 12, urgent: 0 },
]

type Section = 'urgent' | 'today' | 'external'

const SECTION_META: Record<Section, { label: string; icon: string; color: string; iconBg: string }> = {
  urgent:   { label: 'באיחור — לטיפול מיידי', icon: '⚠', color: '#C00000', iconBg: '#FFE0E0' },
  today:    { label: 'לטיפול היום',            icon: '📋', color: '#7B5800', iconBg: '#FFF8DC' },
  external: { label: 'ממתין לגורם חיצוני',    icon: '⏳', color: '#1A5276', iconBg: '#D6EAF8' },
}

function SortIcon({ dir }: { dir: SortDir | null }) {
  if (!dir) return <span style={{ color: '#999', fontSize: 10 }}>⇅</span>
  return <span style={{ fontSize: 10 }}>{dir === 'asc' ? '▲' : '▼'}</span>
}

function TaskIcon({ done, color }: { done?: boolean; color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="16" height="14" rx="1" fill={done ? '#ccc' : '#fff'} stroke={done ? '#aaa' : color} strokeWidth="1.2"/>
      <line x1="5" y1="7" x2="15" y2="7" stroke={done ? '#aaa' : color} strokeWidth="1"/>
      <line x1="5" y1="10" x2="12" y2="10" stroke={done ? '#aaa' : color} strokeWidth="1"/>
      <line x1="5" y1="13" x2="10" y2="13" stroke={done ? '#aaa' : color} strokeWidth="1"/>
      {done && <line x1="3" y1="4" x2="17" y2="16" stroke="#888" strokeWidth="1.5"/>}
    </svg>
  )
}

function FolderIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 3C1 2.45 1.45 2 2 2H6.5L8 4H16C16.55 4 17 4.45 17 5V13C17 13.55 16.55 14 16 14H2C1.45 14 1 13.55 1 13V3Z"
        fill={open ? color : '#E8C84A'} stroke="#B8960A" strokeWidth="0.8"/>
      {open && <path d="M1 6H17L15 14H3L1 6Z" fill="#F5D76E" stroke="#B8960A" strokeWidth="0.8"/>}
    </svg>
  )
}

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [completing, setCompleting] = useState<Set<number>>(new Set())
  const [openSections, setOpenSections] = useState<Record<Section, boolean>>({
    urgent: true, today: true, external: true,
  })
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [activeNav, setActiveNav] = useState('dashboard')

  const toggleSection = (s: Section) =>
    setOpenSections(prev => ({ ...prev, [s]: !prev[s] }))

  const markDone = useCallback(async (section: Section, taskId: number) => {
    if (completing.has(taskId)) return
    setCompleting(prev => new Set(prev).add(taskId))
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
    } catch { /* optimistic */ } finally {
      setCompleting(prev => { const n = new Set(prev); n.delete(taskId); return n })
    }
  }, [completing])

  const sortedTasks = (section: Section) => {
    const list = tasks[section]
    const active = list.filter(t => !t.done)
    const done = list.filter(t => t.done)
    if (sort) {
      const cmp = (a: Task, b: Task) => {
        const va = a[sort.key] ?? ''
        const vb = b[sort.key] ?? ''
        return sort.dir === 'asc'
          ? String(va).localeCompare(String(vb), 'he')
          : String(vb).localeCompare(String(va), 'he')
      }
      return [...active.sort(cmp), ...done.sort(cmp)]
    }
    return [...active, ...done]
  }

  const handleSort = (key: SortKey) => {
    setSort(prev =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  const allTaskCount = Object.values(tasks).flat().filter(t => !t.done).length
  const urgentCount = tasks.urgent.filter(t => !t.done).length

  const navItems = [
    { id: 'dashboard', label: 'לוח יומי', icon: '🗓', badge: allTaskCount },
    { id: 'projects',  label: 'פרויקטים', icon: '📁', badge: null },
    { id: 'tasks',     label: 'כל המשימות', icon: '📋', badge: null },
    { id: 'meetings',  label: 'פגישות', icon: '👥', badge: null },
    { id: 'alerts',    label: 'התראות', icon: '🔔', badge: urgentCount > 0 ? urgentCount : null },
  ]

  // Windows-style button
  const WinBtn = ({
    onClick, disabled, children, variant = 'default'
  }: {
    onClick?: () => void
    disabled?: boolean
    children: React.ReactNode
    variant?: 'default' | 'primary' | 'done'
  }) => {
    const [hover, setHover] = useState(false)
    const [active, setActive] = useState(false)
    const base: React.CSSProperties = {
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: 11,
      padding: '2px 10px',
      minWidth: 64,
      height: 22,
      border: '1px solid',
      borderRadius: 3,
      cursor: disabled ? 'default' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      userSelect: 'none',
      transition: 'all 0.05s',
      outline: 'none',
    }
    const styles: Record<string, React.CSSProperties> = {
      default: {
        ...base,
        background: active ? '#C0D8F0' : hover ? '#E8F4FF' : 'linear-gradient(to bottom, #F8F8F8, #E8E8E8)',
        borderColor: '#999',
        color: disabled ? '#888' : '#111',
        boxShadow: active ? 'inset 1px 1px 2px rgba(0,0,0,0.2)' : '1px 1px 2px rgba(255,255,255,0.8) inset, 1px 1px 1px rgba(0,0,0,0.1)',
      },
      primary: {
        ...base,
        background: active ? '#0050AA' : hover ? '#0070D8' : 'linear-gradient(to bottom, #1E88E5, #1565C0)',
        borderColor: '#0D47A1',
        color: '#fff',
        boxShadow: active ? 'inset 1px 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.3)',
        fontWeight: 600,
      },
      done: {
        ...base,
        background: active ? '#B8DDB8' : hover ? '#D4EDD4' : 'linear-gradient(to bottom, #E8F5E8, #D4EDD4)',
        borderColor: '#4CAF50',
        color: disabled ? '#888' : '#2E7D32',
        boxShadow: active ? 'inset 1px 1px 2px rgba(0,0,0,0.2)' : '1px 1px 1px rgba(0,0,0,0.1)',
      },
    }
    return (
      <button
        style={styles[variant]}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={() => !disabled && setHover(true)}
        onMouseLeave={() => { setHover(false); setActive(false) }}
        onMouseDown={() => !disabled && setActive(true)}
        onMouseUp={() => setActive(false)}>
        {children}
      </button>
    )
  }

  const ColHeader = ({ label, sortKey, width }: { label: string; sortKey?: SortKey; width: string | number }) => (
    <th
      onClick={sortKey ? () => handleSort(sortKey) : undefined}
      style={{
        width,
        padding: '3px 8px',
        textAlign: 'right',
        fontWeight: 600,
        fontSize: 12,
        color: '#111',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        borderLeft: '1px solid #ccc',
        background: 'linear-gradient(to bottom, #F0F0F0, #E0E0E0)',
        cursor: sortKey ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
        {label}
        {sortKey && <SortIcon dir={sort?.key === sortKey ? sort.dir : null} />}
      </div>
    </th>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECE9D8',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      direction: 'rtl',
    }}>

      {/* Title Bar */}
      <div style={{
        background: 'linear-gradient(to bottom, #2D6BB5, #1A4A8A)',
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
      }}>
        <span style={{ fontSize: 14, color: '#fff', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>📁</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 13, letterSpacing: 0.3 }}>
          לוח יומי
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginRight: 4 }}>
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        {/* Window controls */}
        <div style={{ marginRight: 'auto', display: 'flex', gap: 4 }}>
          {['─', '□', '✕'].map((c, i) => (
            <div key={i} style={{
              width: 20, height: 18, background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 10, cursor: 'pointer',
            }}>{c}</div>
          ))}
        </div>
      </div>

      {/* Menu Bar */}
      <div style={{
        background: '#F0F0F0',
        borderBottom: '1px solid #ccc',
        padding: '2px 12px',
        display: 'flex',
        gap: 2,
      }}>
        {['קובץ', 'עריכה', 'תצוגה', 'פרויקטים', 'עזרה'].map(m => (
          <div key={m} style={{
            padding: '2px 8px', fontSize: 12, color: '#111',
            cursor: 'pointer', borderRadius: 2,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#CCE4FF'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
            {m}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        background: 'linear-gradient(to bottom, #F8F8F8, #EBEBEB)',
        borderBottom: '1px solid #bbb',
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <WinBtn>◀ אחורה</WinBtn>
        <WinBtn>▶ קדימה</WinBtn>
        <div style={{ width: 1, height: 20, background: '#ccc', margin: '0 4px' }} />
        <WinBtn>↑ למעלה</WinBtn>
        <div style={{ width: 1, height: 20, background: '#ccc', margin: '0 4px' }} />
        <div style={{
          flex: 1, height: 22, background: '#fff',
          border: '1px solid #999', borderRadius: 2,
          display: 'flex', alignItems: 'center', padding: '0 8px',
          fontSize: 12, color: '#444',
        }}>
          📍 קרתא &rsaquo; לוח יומי
        </div>
        <div style={{ width: 1, height: 20, background: '#ccc', margin: '0 4px' }} />
        <WinBtn variant="primary" onClick={() => {}}>+ משימה חדשה</WinBtn>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', height: 'calc(100vh - 112px)' }}>

        {/* Left Panel (Navigation Tree) */}
        <div style={{
          width: 200,
          background: '#FFFFFF',
          borderLeft: '1px solid #bbb',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{
            padding: '12px 10px 8px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            background: '#FFFFFF',
          }}>
            <img
              src="/logo.png"
              alt="Karta Group"
              style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>
          {/* Nav header */}
          <div style={{
            background: 'linear-gradient(to bottom, #A6C8E8, #7BAFD4)',
            padding: '4px 8px', fontSize: 11, fontWeight: 700, color: '#fff',
            borderBottom: '1px solid #5A8FB8',
          }}>
            ניווט מהיר
          </div>

          <div style={{ padding: '6px 0' }}>
            {navItems.map(item => (
              <div key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', cursor: 'pointer', fontSize: 12,
                  background: activeNav === item.id ? '#CCE4FF' : 'transparent',
                  color: '#111',
                  borderRight: activeNav === item.id ? '2px solid #1A6CC8' : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (activeNav !== item.id)
                    (e.currentTarget as HTMLDivElement).style.background = '#E8F0F8'
                }}
                onMouseLeave={e => {
                  if (activeNav !== item.id)
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge != null && (
                  <span style={{
                    background: '#CC0000', color: '#fff', fontSize: 10,
                    borderRadius: 8, padding: '0 5px', fontWeight: 700,
                  }}>{item.badge}</span>
                )}
              </div>
            ))}

            <div style={{ margin: '8px 0', borderTop: '1px solid #ddd' }} />
            <div style={{ padding: '4px 10px', fontSize: 11, color: '#666', fontWeight: 600 }}>פרויקטים</div>
            {mockProjects.map(p => (
              <div key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px 3px 16px', cursor: 'pointer', fontSize: 11, color: '#333',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#E8F0F8'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                <FolderIcon open={false} color="#E8C84A" />
                <span style={{ flex: 1 }}>{p.name}</span>
                {p.urgent > 0 && <span style={{ color: '#CC0000', fontSize: 10 }}>⚠{p.urgent}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel (File List) */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>

          {/* Status bar at top */}
          <div style={{
            background: 'linear-gradient(to bottom, #E8F0FB, #D8E8F8)',
            borderBottom: '1px solid #bbb',
            padding: '3px 12px',
            fontSize: 11, color: '#333',
            display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <span>📊 סה"כ משימות פעילות: <strong>{allTaskCount}</strong></span>
            <span style={{ color: '#CC0000' }}>⚠ באיחור: <strong>{tasks.urgent.filter(t => !t.done).length}</strong></span>
            <span style={{ color: '#7B5800' }}>📋 היום: <strong>{tasks.today.filter(t => !t.done).length}</strong></span>
            <span style={{ color: '#1A5276' }}>⏳ ממתין: <strong>{tasks.external.filter(t => !t.done).length}</strong></span>
          </div>

          {/* Column Headers */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 28 }} />
              <col style={{ width: 34 }} />
              <col />
              <col style={{ width: 120 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: '2px solid #bbb', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{
                  background: 'linear-gradient(to bottom, #F0F0F0, #E0E0E0)',
                  borderLeft: '1px solid #ccc', padding: '3px 4px',
                }} />
                <th style={{
                  background: 'linear-gradient(to bottom, #F0F0F0, #E0E0E0)',
                  borderLeft: '1px solid #ccc', padding: '3px 4px',
                }} />
                <ColHeader label="שם המשימה" sortKey="name" width="" />
                <ColHeader label="פרויקט" sortKey="project" width={120} />
                <ColHeader label="אחראי" sortKey="assignee" width={90} />
                <ColHeader label="תאריך יעד" sortKey="dueDate" width={100} />
                <ColHeader label="פעולה" width={100} />
              </tr>
            </thead>
            <tbody>
              {(Object.keys(SECTION_META) as Section[]).map(section => {
                const meta = SECTION_META[section]
                const isOpen = openSections[section]
                const list = sortedTasks(section)
                const activeCount = list.filter(t => !t.done).length

                return (
                  <>
                    {/* Folder Row */}
                    <tr key={`folder-${section}`}
                      onClick={() => toggleSection(section)}
                      style={{
                        background: 'linear-gradient(to bottom, #EEF4FB, #E0ECF8)',
                        cursor: 'pointer',
                        borderTop: '1px solid #bbb',
                        borderBottom: '1px solid #bbb',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#CCE4FF'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'linear-gradient(to bottom, #EEF4FB, #E0ECF8)'}>
                      <td style={{ padding: '4px 4px 4px 0', textAlign: 'center', fontSize: 11, color: '#666' }}>
                        {isOpen ? '▾' : '▸'}
                      </td>
                      <td style={{ padding: '4px 2px', textAlign: 'center' }}>
                        <FolderIcon open={isOpen} color={meta.color} />
                      </td>
                      <td colSpan={4} style={{ padding: '4px 8px', fontSize: 12, fontWeight: 700, color: meta.color }}>
                        {meta.label}
                        <span style={{
                          marginRight: 8, fontSize: 11, fontWeight: 400,
                          color: '#666',
                        }}>
                          ({activeCount} משימות{list.some(t => t.done) ? `, ${list.filter(t => t.done).length} בוצעו` : ''})
                        </span>
                      </td>
                      <td />
                    </tr>

                    {/* Task Rows */}
                    {isOpen && list.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        section={section}
                        meta={meta}
                        selected={selected === task.id}
                        onSelect={() => setSelected(task.id)}
                        onDone={() => markDone(section, task.id)}
                        completing={completing.has(task.id)}
                      />
                    ))}
                  </>
                )
              })}

              {/* Projects Section */}
              <tr style={{
                background: 'linear-gradient(to bottom, #EEF4FB, #E0ECF8)',
                borderTop: '2px solid #bbb',
                borderBottom: '1px solid #bbb',
              }}>
                <td style={{ padding: '4px', textAlign: 'center', fontSize: 11, color: '#666' }}>▸</td>
                <td style={{ padding: '4px 2px', textAlign: 'center' }}>
                  <FolderIcon open={false} color="#1A5276" />
                </td>
                <td colSpan={5} style={{ padding: '4px 8px', fontSize: 12, fontWeight: 700, color: '#1A5276' }}>
                  פרויקטים פעילים
                  <span style={{ marginRight: 8, fontSize: 11, fontWeight: 400, color: '#666' }}>
                    ({mockProjects.length} פרויקטים)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to bottom, #E8E8E8, #D8D8D8)',
        borderTop: '1px solid #bbb',
        padding: '2px 12px',
        display: 'flex', gap: 20, alignItems: 'center',
        fontSize: 11, color: '#333',
      }}>
        <span>
          {selected
            ? `נבחר: ${[...Object.values(tasks)].flat().find(t => t.id === selected)?.name ?? ''}`
            : `${allTaskCount} פריטים`}
        </span>
        <span style={{ marginRight: 'auto', color: '#666' }}>מערכת תכנון ורישוי</span>
        <span>בנצי רצ'ס</span>
        <div style={{
          width: 16, height: 16, background: '#1E88E5', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 10, fontWeight: 700,
        }}>!</div>
      </div>
    </div>
  )
}

/* ── Task Row ── */
function TaskRow({
  task, section, meta, selected, onSelect, onDone, completing,
}: {
  task: Task
  section: Section
  meta: { label: string; icon: string; color: string; iconBg: string }
  selected: boolean
  onSelect: () => void
  onDone: () => void
  completing: boolean
}) {
  const [hover, setHover] = useState(false)

  const bg = selected
    ? '#CCE4FF'
    : hover
    ? '#E8F0F8'
    : task.done
    ? '#F8F8F8'
    : '#fff'

  return (
    <tr
      onClick={onSelect}
      onDoubleClick={() => !task.done && onDone()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: bg,
        borderBottom: '1px solid #E8E8E8',
        cursor: 'default',
        transition: 'background 0.05s',
      }}>

      {/* Expand placeholder */}
      <td style={{ width: 28, padding: '2px 4px' }} />

      {/* File icon */}
      <td style={{ width: 34, padding: '3px 4px', textAlign: 'center' }}>
        <TaskIcon done={task.done} color={meta.color} />
      </td>

      {/* Name */}
      <td style={{
        padding: '4px 8px',
        fontSize: 12,
        color: task.done ? '#888' : '#111',
        textDecoration: task.done ? 'line-through' : 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {task.name}
        {task.done && <span style={{ marginRight: 6, fontSize: 10, color: '#4CAF50' }}>✓ בוצע</span>}
        {task.party && (
          <span style={{
            marginRight: 6, fontSize: 10,
            background: meta.iconBg, color: meta.color,
            border: `1px solid ${meta.color}40`,
            borderRadius: 2, padding: '0 4px',
          }}>
            {task.party} · מזה {task.daysWaiting} יום
          </span>
        )}
        {task.daysLate && !task.done && (
          <span style={{
            marginRight: 6, fontSize: 10,
            background: '#FFEEEE', color: '#CC0000',
            border: '1px solid #CC000040',
            borderRadius: 2, padding: '0 4px',
          }}>
            איחור {task.daysLate} ימים
          </span>
        )}
      </td>

      {/* Project */}
      <td style={{ width: 120, padding: '4px 8px', fontSize: 12, color: '#333', whiteSpace: 'nowrap' }}>
        {task.project}
      </td>

      {/* Assignee */}
      <td style={{ width: 90, padding: '4px 8px', fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>
        {task.assignee}
      </td>

      {/* Due Date */}
      <td style={{
        width: 100, padding: '4px 8px', fontSize: 12, whiteSpace: 'nowrap',
        color: task.daysLate && !task.done ? '#CC0000' : '#555',
        fontWeight: task.daysLate && !task.done ? 600 : 400,
      }}>
        {task.dueDate}
      </td>

      {/* Action */}
      <td style={{ width: 100, padding: '3px 8px' }} onClick={e => e.stopPropagation()}>
        {!task.done ? (
          <button
            onClick={onDone}
            disabled={completing}
            style={{
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontSize: 11,
              padding: '2px 8px',
              height: 22,
              border: '1px solid #4CAF50',
              borderRadius: 3,
              cursor: completing ? 'wait' : 'pointer',
              background: completing
                ? '#E8F5E8'
                : 'linear-gradient(to bottom, #E8F5E8, #D4EDD4)',
              color: '#2E7D32',
              boxShadow: '1px 1px 1px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!completing)
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(to bottom, #C8E6C8, #B8DDB8)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(to bottom, #E8F5E8, #D4EDD4)'
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 1px 1px 2px rgba(0,0,0,0.2)'
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 1px rgba(0,0,0,0.1)'
            }}>
            {completing ? '⌛ שומר...' : '✓ בוצע'}
          </button>
        ) : (
          <span style={{ fontSize: 11, color: '#888' }}>—</span>
        )}
      </td>
    </tr>
  )
}
