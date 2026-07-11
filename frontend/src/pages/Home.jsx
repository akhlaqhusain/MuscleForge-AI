import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import MuscleSelector from '../components/MuscleSelector'
import WorkoutDisplay from '../components/WorkoutDisplay'
import ChatBox from '../components/ChatBox'
import Button from '../components/ui/Button'
import { generateWorkout } from '../api'

export default function Home() {
  const [selected, setSelected]   = useState(null)
  const [workout, setWorkout]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [showChat, setShowChat]   = useState(false)

  const handleSelect = (group) => {
    setSelected(group)
    if (group !== selected) { setWorkout(null); setShowChat(false) }
  }

  const handleGenerate = async () => {
    if (!selected) { toast.error('Please select a muscle group first.'); return }
    setLoading(true); setWorkout(null); setShowChat(false)
    try {
      const data = await generateWorkout(selected)
      setWorkout(data.workout)
      setShowChat(true)
      toast.success('Workout plan ready!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '21px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>
          <img src="/assets/homePageLogo.png" style={{ width: '40px', height: '40px'}} />
          MuscleForge <span className="hero-title-green" style={{ color: '#10b981' }}>AI Fitness Trainer</span>
          <span className="hero-title-green-mobile" style={{ color: '#10b981' }}>AI</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', maxWidth: '520px' }}>
          Select a muscle group, generate a personalised workout powered by Gemini AI,
          then ask your AI trainer anything about exercise or nutrition.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <MuscleSelector selected={selected} onSelect={handleSelect} />

        <Button
          fullWidth
          size="lg"
          onClick={handleGenerate}
          loading={loading}
          disabled={!selected}
          style={{ boxShadow: selected ? '0 4px 14px rgba(16,185,129,0.30)' : 'none' }}
        >
          {selected ? `Generate ${selected} Workout` : 'Select a muscle group to continue'}
        </Button>

        {(loading || workout) && (
          <WorkoutDisplay muscleGroup={selected} workout={workout} loading={loading} />
        )}

        {showChat && workout && (
          <ChatBox muscleGroup={selected} />
        )}
      </div>
    </div>
  )
}
