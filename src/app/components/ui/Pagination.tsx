'use client'
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <nav className="d-flex justify-content-end mt-4">
      <ul className="pagination custom-pagination gap-3">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onChange(Math.max(1, page - 1)) }} aria-label="Previous">
            <ChevronLeft size={16} />
          </a>
        </li>
        {pages.map(p => (
          <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onChange(p) }}>
              {p}
            </a>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onChange(Math.min(totalPages, page + 1)) }} aria-label="Next">
            <ChevronRight size={16} />
          </a>
        </li>
      </ul>
    </nav>
  )
}
