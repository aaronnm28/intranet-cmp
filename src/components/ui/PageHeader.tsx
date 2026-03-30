import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
}
export function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div>
      {breadcrumb && <div className="text-[12px] text-gray-400 mb-3.5">{breadcrumb}</div>}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h1 className="text-[21px] font-bold text-[#1E1B4B]">{title}</h1>
          {subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2 items-center flex-shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
