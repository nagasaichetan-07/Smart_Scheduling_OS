import { getTaskColor } from '../lib/scheduler'

export default function OrderList({ result, taskColorMap }) {
  if (!result.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 13 }}>
        Add tasks to see execution order
      </div>
    )
  }

  // Deduplicate for segmented algos (RR, Preemptive)
  const seen = new Set()
  const ordered = []
  result.forEach((r) => {
    if (!seen.has(r.id)) {
      seen.add(r.id)
      ordered.push(r)
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header-like row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        background: '#1e293b',
        borderBottom: '1px solid var(--border)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        <span style={{ width: 40 }}>#</span>
        <span style={{ flex: 1 }}>Task Name</span>
        <span style={{ width: 100 }}>Time Span</span>
        <span style={{ width: 80, textAlign: 'right' }}>Wait</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ordered.map((r, i) => {
          const ci = taskColorMap[r.id] ?? i
          const color = getTaskColor(ci)
          return (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: i % 2 === 0 ? '#111827' : '#0f172a',
                borderBottom: i === ordered.length - 1 ? 'none' : '1px solid var(--border)',
                transition: 'background 0.15s',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#111827' : '#0f172a')}
            >
              <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 40 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color.bg, flexShrink: 0 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
              </div>
              <div style={{ width: 100, fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>
                {r.start}—{r.end}m
              </div>
              <div style={{ width: 80, textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                {r.wait} min
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
