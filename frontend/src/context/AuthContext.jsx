import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authLogin, authSignup } from '../api'
import client from '../api/client'

const AuthContext = createContext(null)

const TOKEN_KEY = 'MuscleForge_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  /* ── Hydrate user from stored token on mount ── */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setAuthLoading(false)
      return
    }
    client
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setAuthLoading(false))
  }, [])

  /* ── Login ── */
  const login = useCallback(async (email, password) => {
    const data = await authLogin(email, password)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data
  }, [])

  /* ── Signup ── */
  const signup = useCallback(async (name, email, password) => {
    const data = await authSignup(name, email, password)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data
  }, [])

  /* ── Logout ── */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const isAuthenticated = Boolean(user)

  return (
    <AuthContext.Provider value={{ user, authLoading, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}