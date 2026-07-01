import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('welcome back!')
      navigate('/')
    } catch (err) {
      toast.error('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="assets/login_logo.png" style={{ width: '40px', height: '40px', marginBottom: '10px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '10px', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Sign in to your MuscleForgeAI account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '1.25rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#059669', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}