'use client'
import React from 'react'

type Props = {
  html?: string
  className?: string
  truncate?: number
}

function sanitize(input: string) {
  if (!input) return ''
  let out = String(input)
  out = out.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  out = out.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
  out = out.replace(/javascript\s*:/gi, '')
  return out
}

export default function HtmlContent({ html = '', className = '', truncate }: Props) {
  const safe = sanitize(html)
  if (truncate && truncate > 0) {
    const text = safe.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const out = text.length > truncate ? text.slice(0, truncate) + '...' : text
    return <div className={className}>{out}</div>
  }
  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />
}
