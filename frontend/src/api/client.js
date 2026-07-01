import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 5 * 60 * 1000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Request interceptor (JWT attach — ready for auth) ── */
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('MuscleForge_token') // set this on login
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (err) => Promise.reject(err)
)

/* ── Response interceptor ──────────────────────────────── */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status
    const message = err.response?.data?.message || 'Something went wrong. Please try again.'

    // When auth is live: redirect to login on 401
    if (status === 401) {
      localStorage.removeItem('MuscleForge_token')
      window.location.href = '/login'
    }

    return Promise.reject(new Error(message))
  }
)

export default client