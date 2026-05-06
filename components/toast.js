'use client'

import { useEffect, useState } from 'react'

let showToastFn = null

export function showToast(msg) {
  showToastFn?.(msg)
}

export default function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    showToastFn = (m) => {
      setMsg(m)
      setVisible(true)
      setTimeout(() => setVisible(false), 2800)
    }
    return () => { showToastFn = null }
  }, [])

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      <span className="toast-check">✓</span>
      <span>{msg}</span>
    </div>
  )
}