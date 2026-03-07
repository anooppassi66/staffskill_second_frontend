'use client'
import React from 'react'
import { FileText } from 'lucide-react'

type Props = {
  title: string
  subtitle?: string
}

export default function EmptyState({ title, subtitle }: Props) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 px-4">
      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3" style={{ width: 56, height: 56 }}>
        <FileText size={22} className="text-muted" />
      </div>
      <h6 className="fw-semibold text-dark mb-1">{title}</h6>
      {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
    </div>
  )
}
