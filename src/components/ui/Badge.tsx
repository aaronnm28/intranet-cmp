import React from 'react'

interface BadgeProps {
  variant: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'teal' | 'amber'
  children: React.ReactNode
  small?: boolean
}

const variantClasses: Record<BadgeProps['variant'], string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-600',
  teal: 'bg-teal-100 text-teal-800',
  amber: 'bg-amber-50 text-amber-800 border border-amber-300',
}

export function Badge({ variant, children, small }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${variantClasses[variant]} ${small ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}>
      {children}
    </span>
  )
}
