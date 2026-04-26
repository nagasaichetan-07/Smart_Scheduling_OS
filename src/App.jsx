import { useState, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import GanttChart from './components/GanttChart'
import OrderList from './components/OrderList'
import ComparePanel from './components/ComparePanel'
import {
  ALL_ALGOS,
  ALGO_LABELS,
  ALGO_DESC,
  schedule,
  computeStats,
  getRecommendation,
} from './lib/scheduler'

const SAMPLE_TASKS = [
  { id: 1, name: 'Math revision', duration: 45, priority: 3, arrivalOrder: 0 },
  { id: 2, name: 'Physics notes', duration: 30, priority: 2, arrivalOrder: 1 },
  { id: 3, name: 'Quick email', duration: 10, priority: 3, arrivalOrder: 2 },
  { id: 4, name: 'Reading', duration: 60, priority: 1, arrivalOrder: 3 },
]

let taskIdSeq = 10

export default function App() {
  const [tasks, setTasks] = useState(SAMPLE_TASKS)
  const [algo, setAlgo] = useState('fcfs')
  const [quantum, setQuantum] = useState(25)
  const [tab, setTab] = useState('gantt')

  const taskColorMap = useMemo(() => {
    const m = {}
    tasks.forEach((t, i) => (m[t.id] = i))
    return m
  }, [tasks])

  const result = useMemo(() => schedule(tasks, algo, quantum), [tasks, algo, quantum])
  const stats = useMemo(() => computeStats(result), [result])
  const recommendation = useMemo(() => getRecommendation(tasks, algo), [tasks, algo])

  const isSegmented = algo === 'rr' || algo === 'preemptive'

  function addTask(t) {
    setTasks((prev) => [...prev, { ...t, id: ++taskIdSeq, arrivalOrder: prev.length }])
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar tasks={tasks} onAdd={addTask} onDelete={deleteTask} onClear={() => setTasks([])} />

      {/* Main panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Algorithm selector */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 500 }}>
            Algorithm
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {ALL_ALGOS.map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                title={ALGO_DESC[a]}
                style={{
                  padding: '6px 14px',
                  border: '1px solid',
                  borderColor: algo === a ? 'var(--accent)' : 'var(--border)',
                  borderRadius: 8,
                  background: algo === a ? 'var(--accent)' : 'transparent',
                  color: algo === a ? '#fff' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: algo === a ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (algo !== a) {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (algo !== a) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }
                }}
              >
                {ALGO_LABELS[a]}
              </button>
            ))}

            {algo === 'rr' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>QUANTUM</span>
                <input
                  type="number"
                  value={quantum}
                  min={5}
                  max={120}
                  onChange={(e) => setQuantum(Math.max(5, parseInt(e.target.value) || 25))}
                  style={{ width: 64, padding: '5px 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'var(--surface2)', color: 'var(--text-data)', fontSize: 12, outline: 'none', fontFamily: "'JetBrains Mono'" }}
                />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>MIN</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {[
            { label: 'Avg waiting time', val: tasks.length ? `${stats.avgWait} min` : '—' },
            { label: 'Avg turnaround', val: tasks.length ? `${stats.avgTurnaround} min` : '—' },
            { label: 'Total time', val: tasks.length ? `${stats.total} min` : '—' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '1.25rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: 'var(--accent)' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {[
            { key: 'gantt', label: 'Gantt Chart' },
            { key: 'order', label: 'Execution Order' },
            { key: 'compare', label: 'Compare All' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderBottom: `2px solid ${tab === t.key ? 'var(--accent)' : 'transparent'}`,
                background: 'transparent',
                color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: tab === t.key ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Algo description */}
          <div style={{ marginBottom: 24, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-muted)', padding: '12px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', lineHeight: 1.5 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)', fontWeight: 600, marginRight: 8, fontSize: 11, textTransform: 'uppercase' }}>Desc</span>
            {ALGO_DESC[algo]}
          </div>

          {tab === 'gantt' && (
            <GanttChart result={result} total={stats.total} isSegmented={isSegmented} taskColorMap={taskColorMap} />
          )}
          {tab === 'order' && (
            <OrderList result={result} taskColorMap={taskColorMap} />
          )}
          {tab === 'compare' && (
            <ComparePanel tasks={tasks} activeAlgo={algo} quantum={quantum} onSelect={setAlgo} />
          )}

          {/* Recommendation */}
          {recommendation && (
            <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, fontSize: 13, color: 'var(--accent)' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginRight: 12, textTransform: 'uppercase' }}>
                Insight
              </span>
              {recommendation}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
