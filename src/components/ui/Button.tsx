import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'gray' | 'ghost'
  size?: 'xs' | 'sm' | 'md'
}

const variantClasses = {
  primary: 'bg-[#6B21A8] text-white hover:bg-[#581C87]',
  outline: 'bg-transparent text-[#6B21A8] border border-[#6B21A8] hover:bg-purple-50',
  gray: 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
}

const sizeClasses = {
  xs: 'px-2 py-1 text-[11px]',
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[13px]',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-md font-medium cursor-pointer transition-all whitespace-nowrap font-[DM_Sans] disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
