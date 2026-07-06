import React from 'react'

export default function Card({ children, style = {}, className = '' }) {
  return (
    <div
      className={`ui-card ${className}`}
      style={{
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: '18px',
        padding: '1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
