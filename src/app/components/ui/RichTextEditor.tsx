'use client'
import React, { useEffect, useRef } from 'react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  height?: number
}

export default function RichTextEditor({ value, onChange, placeholder, className = '', height = 240 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    let destroyed = false
    const init = async () => {
      try {
        if (!hostRef.current || !containerRef.current || editorRef.current) return
        const ed = await (ClassicEditor as any).create(hostRef.current, {
          placeholder: placeholder || 'Enter text...',
        })
        if (destroyed) {
          try { ed.destroy() } catch {}
          return
        }
        editorRef.current = ed
        try { ed.setData(value || '') } catch {}
        try {
          const toolbarEl = ed.ui.view.toolbar.element as HTMLElement
          if (toolbarEl && containerRef.current) {
            containerRef.current.insertBefore(toolbarEl, containerRef.current.firstChild)
          }
        } catch {}
        try {
          if (hostRef.current) {
            hostRef.current.style.minHeight = `${height}px`
          }
        } catch {}
        try {
          const editableEl = ed?.ui?.view?.editable?.element as HTMLElement
          if (editableEl) {
            editableEl.style.minHeight = `${height}px`
          }
        } catch {}
        ed.model.document.on('change:data', () => {
          try {
            const data = ed.getData() || ''
            onChange(data)
          } catch {}
        })
      } catch {}
    }
    init()
    return () => {
      destroyed = true
      try {
        if (editorRef.current) {
          editorRef.current.destroy()
          editorRef.current = null
        }
      } catch {}
    }
  }, [placeholder, height])

  useEffect(() => {
    try {
      const ed = editorRef.current
      if (ed) {
        const current = ed.getData() || ''
        if (current !== value) {
          ed.setData(value || '')
        }
      }
    } catch {}
  }, [value])

  useEffect(() => {
    try {
      const ed = editorRef.current
      const editableEl = ed?.ui?.view?.editable?.element as HTMLElement
      if (editableEl) {
        editableEl.style.minHeight = `${height}px`
      }
    } catch {}
  }, [height])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        border: '1px solid #dee2e6',
        borderRadius: 8,
        background: 'transparent',
      }}
    >
      <div ref={hostRef} />
    </div>
  )
}
