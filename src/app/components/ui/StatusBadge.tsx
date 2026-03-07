'use client'
import React from 'react'

type Props = {
  status: string
  className?: string
}

const map = (s: string) => {
  const t = s.toLowerCase()
  if (t.includes('active')) return 'text-bg-success'
  if (t.includes('complete')) return 'text-bg-primary'
  if (t.includes('enroll')) return 'text-bg-info'
  if (t.includes('inactive')) return 'text-bg-secondary'
  return 'text-bg-light text-dark'
}

export default function StatusBadge({ status, className = '' }: Props) {
  return (
    <span className={`badge rounded-pill ${map(status)} ${className}`}>{status}</span>
  )
}
