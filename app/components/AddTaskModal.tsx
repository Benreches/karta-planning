'use client'
import { useState, useEffect } from 'react'

interface SubPhase {
  id: string
  name: string
  project: string
}

interface User {
  id: string
  name: string
}

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function AddTaskModal({ onClose, onSaved }: Props) {
  const [subPhases, setSubPhases] = useState<SubPhase[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    subPhaseId: '',
    assigneeId: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'OPEN',
    externalParty: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/subphases').then(r => r.json()).then(setSubPhases).catch(() => {})
    fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'שגיאה')
        return
      }
      onSaved()
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'OPEN', label: 'פתוח' },
    { value: 'IN_PROGRESS', label: 'בטיפול' },
    { value: 'WAITING_EXTERNAL', label: 'ממתין לגורם חיצוני' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>משימה חדשה</h2>
          <button onClick={onClose} className="text-lg leading-none" style={{ color: 'var(--text3)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>שם המשימה *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="תאר את המשימה..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>שלב *</label>
            <select
              required
              value={form.subPhaseId}
              onChange={e => setForm(f => ({ ...f, subPhaseId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="">בחר שלב...</option>
              {subPhases.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.project} — {sp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>אחראי *</label>
            <select
              required
              value={form.assigneeId}
              onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="">בחר אחראי...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>תאריך יעד *</label>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>סטטוס</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                {statusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.status === 'WAITING_EXTERNAL' && (
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>גורם חיצוני</label>
              <input
                value={form.externalParty}
                onChange={e => setForm(f => ({ ...f, externalParty: e.target.value }))}
                placeholder="לדוגמה: ועדה מחוזית, עתיקות..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
          )}

          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text3)' }}>הערות</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
              ביטול
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--accent)' }}>
              {loading ? 'שומר...' : 'שמור משימה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
