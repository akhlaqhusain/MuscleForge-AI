import React from 'react'
import Card from './ui/Card'

const SECTION_THEMES = [
  { bg: '#fffbeb', border: '#fde68a', icon: '🔥', label_color: '#92400e' },
  { bg: '#fffbeb', border: '#fde68a', icon: <img src="assets/warmup.png" alt="Warm-Up" />, label_color: '#92400e' },
  { bg: '#ecfdf5', border: '#6ee7b7', icon: <img src="assets/main_workout.png" alt="Main Workout" />, label_color: '#065f46' },
  { bg: '#eff6ff', border: '#bfdbfe', icon: <img src="assets/flexibility.png" alt="Flexibility" />, label_color: '#1e40af' },
  { bg: '#fdf4ff', border: '#e9d5ff', icon: <img src="assets/protip.png" alt="Pro Tip" />, label_color: '#6b21a8' },
]

function parseWorkout(text) {
  const lines  = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const result = []
  let current  = null

  for (const line of lines) {
    const isH = /^#{1,3}\s/.test(line) || /^\*\*[^*]+\*\*\s*:?\s*$/.test(line) || (line.endsWith(':') && line.length < 60 && !line.startsWith('-'))

    if (isH) {
      if (current) result.push(current)
      current = {
        title: line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/:$/, '').trim(),
        items: [],
      }
    } else if (current) {
      const c = line.replace(/^[-•*\d.]+\s*/, '').replace(/\*\*/g, '').trim()
      if (c) current.items.push(c)
    } else {
      if (!current) current = { title: '', items: [] }
      const c = line.replace(/^[-•*\d.]+\s*/, '').replace(/\*\*/g, '').trim()
      if (c) current.items.push(c)
    }
  }
  if (current) result.push(current)
  return result.filter((s) => s.items.length > 0)
}

function Skeleton() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#6b7280', fontSize: '14px' }}>
        <span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
        Building your workout plan…
      </div>
      {[90, 75, 85, 65, 80].map((w, i) => (
        <div key={i} style={{ height: 13, borderRadius: 6, background: '#f3f4f6', marginBottom: 10, width: `${w}%`, animation: 'shimmer 1.3s ease infinite', animationDelay: `${i * 0.1}s` }} />
      ))}
    </Card>
  )
}

export default function WorkoutDisplay({ muscleGroup, workout, loading }) {
  if (loading) return <Skeleton />
  if (!workout) return null

  const sections = parseWorkout(workout)

  return (
    <Card className="anim-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ width: 9, height: 9, background: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#047857' }}>{muscleGroup} Workout Plan</span>
        </div>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
        {sections.map((sec, i) => {
          const theme = SECTION_THEMES[i % SECTION_THEMES.length]
          return (
            <div key={i} style={{ background: theme.bg, border: `0.5px solid ${theme.border}`, borderRadius: '13px', padding: '13px 15px' }}>
              {sec.title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{theme.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: theme.label_color }}>{sec.title}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sec.items.map((item, j) => {
                  const dash  = item.indexOf(' — ')
                  const name  = dash > -1 ? item.slice(0, dash) : item
                  const detail = dash > -1 ? item.slice(dash + 3) : null
                  return (
                    <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '13px', lineHeight: 1.6 }}>
                      <span style={{ color: '#9ca3af', flexShrink: 0, marginTop: '2px' }}>▸</span>
                      <span>
                        <strong style={{ fontWeight: 600, color: '#1f2937' }}>{name}</strong>
                        {detail && <span style={{ color: '#6b7280' }}> — {detail}</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
