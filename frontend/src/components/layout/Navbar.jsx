import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const S = {
  nav: {
    position: 'sticky', top: 0, zIndex: 200,
    background: 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(16px)',
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
    boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '9px' },
  logoText: { fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em', color: '#111827' },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const navLink = (to, label) => {
    const active = pathname === to
    return (
      <Link
        key={to}
        to={to}
        className="navbar-link"
        style={{
          padding: '6px 14px', borderRadius: '8px',
          fontSize: '14px', fontWeight: 500,
          color: active ? '#047857' : '#6b7280',
          background: active ? '#d1fae5' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav style={S.nav}>
      <div className="navbar-inner">
        <Link to="/" style={S.logo}>
          <img src="/assets/nav_logo.png" style={{ width: '40px', height: '40px' }} className="navbar-logo-img" />
          <span style={S.logoText} className="navbar-logo-text">
            MuscleForge <span style={{ color: '#10b981' }}>AI</span>
          </span>
        </Link>

        <div className="navbar-links">
          {navLink('/', 'Workout')}
          {navLink('/history', 'History')}

          {user ? (
            <>
              <span className="navbar-greeting" style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>
                Hi, {user.name}
              </span>
              <button
                className="navbar-link"
                onClick={logout}
                style={{ marginLeft: '8px', padding: '6px 14px', background: '#fee2e2',
                  color: '#b91c1c', border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {navLink('/login', 'Login')}
              <Link to="/signup" className="navbar-link" style={{ marginLeft: '4px', padding: '6px 16px',
                background: '#10b981', color: '#fff', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600 }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}