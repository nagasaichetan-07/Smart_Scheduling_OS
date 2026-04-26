import { ALL_ALGOS, ALGO_LABELS, schedule, computeStats } from '../lib/scheduler'

export default function ComparePanel({ tasks, activeAlgo, quantum, onSelect }) {
  if (!tasks.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 13 }}>
        Add tasks to compare algorithms
      </div>
    )
  }

  const results = ALL_ALGOS.map((a) => {
    const r = schedule(tasks, a, quantum)
    const s = computeStats(r)
    return { algo: a, label: ALGO_LABELS[a], ...s }
  })

  const bestAlgo = results.reduce((b, r) => (r.avgWait < b.avgWait ? r : b), results[0])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {results.map((r) => {
        const isBest = r.algo === bestAlgo.algo
        const isActive = r.algo === activeAlgo
        return (
          <div
            key={r.algo}
            onClick={() => onSelect(r.algo)}
            style={{
              padding: '16px',
              border: `1px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12,
              background: '#1e293b',
              cursor: 'pointer',
              transition: 'all 0.15s',
              position: 'relative',
            }}
          >
            {isBest && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.05em',
              }}>
                BEST
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 12, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {r.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
              {r.avgWait}
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>min</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
              avg wait · {r.total}m total
            </div>
          </div>
        )
      })}
    </div>
  )
}
