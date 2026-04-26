export const ALGO_LABELS = {
  fcfs: 'FCFS',
  sjf: 'SJF',
  priority: 'Priority',
  preemptive: 'Preemptive',
  rr: 'Round Robin',
  hybrid: 'Hybrid',
}

export const ALGO_DESC = {
  fcfs: 'First Come First Serve — tasks execute in the order they were added.',
  sjf: 'Shortest Job First — shorter tasks run first, minimizing average wait time.',
  priority: 'Non-Preemptive Priority — high-priority tasks run first without interruption.',
  preemptive: 'Preemptive Priority — a higher-priority task can interrupt the running task.',
  rr: 'Round Robin — tasks rotate in fixed time slices (Pomodoro-style).',
  hybrid: 'Hybrid — priority-ordered first, then SJF within the same priority group.',
}

export const ALL_ALGOS = ['fcfs', 'sjf', 'priority', 'preemptive', 'rr', 'hybrid']

export const TASK_COLORS = [
  { bg: '#3b82f6', text: '#fff' },
  { bg: '#06b6d4', text: '#fff' },
  { bg: '#8b5cf6', text: '#fff' },
  { bg: '#f59e0b', text: '#fff' },
  { bg: '#10b981', text: '#fff' },
  { bg: '#ef4444', text: '#fff' },
]

export function getTaskColor(index) {
  return TASK_COLORS[index % TASK_COLORS.length]
}

export function schedule(tasks, algo, quantum = 25) {
  if (!tasks.length) return []

  if (algo === 'fcfs') {
    let time = 0
    return tasks.map((t) => {
      const start = time
      time += t.duration
      return { ...t, start, end: time, wait: start }
    })
  }

  if (algo === 'sjf') {
    const sorted = [...tasks].sort((a, b) => a.duration - b.duration)
    let time = 0
    return sorted.map((t) => {
      const start = time
      time += t.duration
      return { ...t, start, end: time, wait: start }
    })
  }

  if (algo === 'priority') {
    const sorted = [...tasks].sort(
      (a, b) => b.priority - a.priority || a.arrivalOrder - b.arrivalOrder
    )
    let time = 0
    return sorted.map((t) => {
      const start = time
      time += t.duration
      return { ...t, start, end: time, wait: start }
    })
  }

  if (algo === 'preemptive') {
    const rem = tasks.map((t) => ({ ...t, remaining: t.duration }))
    const maxTime = tasks.reduce((s, t) => s + t.duration, 0)
    const rawSegments = []
    let prev = null
    for (let time = 0; time < maxTime; time++) {
      const avail = rem.filter((t) => t.remaining > 0)
      if (!avail.length) break
      const cur = avail.reduce((best, t) => (t.priority > best.priority ? t : best), avail[0])
      if (prev === cur.id && rawSegments.length) {
        rawSegments[rawSegments.length - 1].end++
      } else {
        rawSegments.push({ id: cur.id, start: time, end: time + 1 })
      }
      cur.remaining--
      prev = cur.id
    }
    const finishMap = {}
    rawSegments.forEach((s) => (finishMap[s.id] = s.end))
    return tasks.map((t) => {
      const segs = rawSegments.filter((s) => s.id === t.id)
      const firstStart = segs[0]?.start ?? 0
      return { ...t, start: firstStart, end: finishMap[t.id] ?? t.duration, wait: firstStart, segments: segs }
    })
  }

  if (algo === 'rr') {
    const queue = tasks.map((t) => ({ ...t, remaining: t.duration }))
    let time = 0
    const rawSegments = []
    const finishMap = {}
    let hasWork = true
    while (hasWork) {
      hasWork = false
      queue.forEach((t) => {
        if (t.remaining <= 0) return
        hasWork = true
        const slice = Math.min(quantum, t.remaining)
        rawSegments.push({ id: t.id, start: time, end: time + slice })
        t.remaining -= slice
        if (t.remaining <= 0) finishMap[t.id] = time + slice
        time += slice
      })
    }
    return tasks.map((t) => {
      const segs = rawSegments.filter((s) => s.id === t.id)
      const firstStart = segs[0]?.start ?? 0
      return { ...t, start: firstStart, end: finishMap[t.id] ?? t.duration, wait: firstStart, segments: segs }
    })
  }

  if (algo === 'hybrid') {
    const groups = {}
    tasks.forEach((t) => {
      if (!groups[t.priority]) groups[t.priority] = []
      groups[t.priority].push(t)
    })
    const sorted = []
    ;[3, 2, 1].forEach((p) => {
      if (groups[p]) sorted.push(...groups[p].sort((a, b) => a.duration - b.duration))
    })
    let time = 0
    return sorted.map((t) => {
      const start = time
      time += t.duration
      return { ...t, start, end: time, wait: start }
    })
  }

  return []
}

export function computeStats(result) {
  if (!result.length) return { avgWait: 0, avgTurnaround: 0, total: 0 }
  const total = Math.max(...result.map((r) => r.end))
  const avgWait = Math.round(result.reduce((s, r) => s + r.wait, 0) / result.length)
  const avgTurnaround = Math.round(result.reduce((s, r) => s + r.end, 0) / result.length)
  return { avgWait, avgTurnaround, total }
}

export function getRecommendation(tasks, algo) {
  if (!tasks.length) return null
  const hasDiffPriority = new Set(tasks.map((t) => t.priority)).size > 1
  const hasLong = tasks.some((t) => t.duration > 60)
  if (algo === 'fcfs' && hasDiffPriority)
    return 'Tasks have mixed priorities — Priority or Hybrid scheduling may serve you better.'
  if (algo === 'sjf' && hasLong)
    return 'SJF may starve longer tasks. Try Hybrid or Round Robin for better balance.'
  if (algo === 'rr' && !hasLong)
    return 'All tasks are short — FCFS or SJF may be simpler and equally efficient.'
  if (algo === 'priority' && !hasDiffPriority)
    return 'All tasks share the same priority — FCFS gives the same result with less overhead.'
  if (algo === 'hybrid')
    return 'Hybrid balances urgency and efficiency: high-priority tasks run first, shorter ones within the same priority run sooner.'
  if (algo === 'preemptive')
    return 'Preemptive priority ensures urgent tasks can interrupt lower-priority ones — ideal when priorities vary greatly.'
  return null
}
