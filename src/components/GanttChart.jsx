import { getTaskColor } from '../lib/scheduler'

export default function GanttChart({ result, total, isSegmented, taskColorMap }) {
  if (!result.length) {
    return <Empty />
  }

  const tickCount = 5
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((total / tickCount) * i))

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 400 }}>
        {result.map((r) => {
          const ci = taskColorMap[r.id] ?? 0
          const color = getTaskColor(ci)
          const segs = isSegmented && r.segments ? r.segments : [{ start: r.start, end: r.end }]

          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                title={r.name}
                style={{
                  width: 100,
                  flexShrink: 0,
                  textAlign: 'right',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  textOverflow: 'ellipsis',
                }}
              >
                {r.name}
              </div>
              <div style={{ flex: 1, position: 'relative', height: 30 }}>
                {segs.map((s, si) => {
                  const left = (s.start / total) * 100
                  const width = ((s.end - s.start) / total) * 100
                  return (
                    <div
                      key={si}
                      title={`${r.name}: ${s.start}–${s.end} min`}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${Math.max(width, 0.5)}%`,
                        height: 26,
                        top: 2,
                        background: color.bg,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#fff',
                        fontFamily: "'JetBrains Mono', monospace",
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        paddingInline: 4,
                      }}
                    >
                      {s.end - s.start > 15 ? `P${r.id}` : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Ticks */}
        <div style={{ display: 'flex', marginLeft: 110 }}>
          {ticks.map((t, i) => (
            <div
              key={i}
              style={{
                flex: i === ticks.length - 1 ? 0 : 1,
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                marginTop: 8,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
      Add tasks to visualize the timeline
    </div>
  )
}
