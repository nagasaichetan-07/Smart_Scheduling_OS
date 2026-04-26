import { useState } from 'react'
import { getTaskColor } from '../lib/scheduler'

const MODES = ['Study', 'Work', 'Daily']

const PLACEHOLDERS = {
  Study: 'e.g. Math revision, Physics notes…',
  Work: 'e.g. Client report, Code review…',
  Daily: 'e.g. Morning workout, Groceries…',
}

export default function Sidebar({ tasks, onAdd, onDelete, onClear }) {
  const [mode, setMode] = useState('Study')
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [priority, setPriority] = useState(2)

  const totalMin = tasks.reduce((s, t) => s + t.duration, 0)
  const overloaded = totalMin > 480

  function handleAdd() {
    const dur = parseInt(duration)
    if (!name.trim() || !dur || dur < 1) return
    onAdd({ name: name.trim(), duration: dur, priority: parseInt(priority) })
    setName('')
    setDuration('')
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <aside style={{
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      width: 300,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      gap: '1.5rem',
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          OS / SCHEDULER
        </div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Task Planner</div>
      </div>

      {/* Mode */}
      <div>
        <Label>Mode</Label>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '6px 0',
                border: '1px solid',
                borderColor: mode === m ? 'var(--accent)' : 'var(--border)',
                borderRadius: 8,
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (mode !== m) {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent)'
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== m) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task */}
      <div>
        <Label>Add task</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKey}
            placeholder={PLACEHOLDERS[mode]}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Duration (min)"
              min={1}
            />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value={3}>High</option>
              <option value={2}>Medium</option>
              <option value={1}>Low</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            style={{
              width: '100%',
              padding: '10px',
              border: 'none',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#4f8ff7')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
          >
            + Add task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Label>Tasks <span style={{ color: 'var(--text3)', fontSize: 11 }}>({tasks.length})</span></Label>
          {tasks.length > 0 && (
            <button
              onClick={onClear}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 11, cursor: 'pointer', padding: 0 }}
            >
              clear all
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>
              No tasks yet
            </div>
          ) : (
            tasks.map((t, i) => {
              const c = getTaskColor(i)
              const priLabel = t.priority === 3 ? 'High' : t.priority === 2 ? 'Med' : 'Low'
              return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.bg, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: "'JetBrains Mono'" }}>
                      {t.duration} min · {priLabel} priority
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(t.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, padding: '2px 4px', lineHeight: 1, borderRadius: 4, transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
                  >
                    ✕
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Overload warning */}
      {overloaded && (
        <div style={{ padding: '10px 12px', background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 8, fontSize: 12, color: 'var(--warn-text)' }}>
          ⚠ Total: {totalMin} min ({Math.round((totalMin / 60) * 10) / 10}h) — consider spreading across days.
        </div>
      )}
    </aside>
  )
}

function Label({ children }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
      {children}
    </div>
  )
}
