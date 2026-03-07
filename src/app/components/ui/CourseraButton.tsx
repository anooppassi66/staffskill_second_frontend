'use client'
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = (_s: NonNullable<Props['size']>) => ''
const variantClass = (_v: NonNullable<Props['variant']>) => ''

export default function CourseraButton({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  const cls = ['custom-btn', className, variantClass(variant), sizeClass(size)].filter(Boolean).join(' ')
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
