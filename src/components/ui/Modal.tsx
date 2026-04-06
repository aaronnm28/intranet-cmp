import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-xl' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
          <div>
            <div className="text-[15px] font-bold text-[#1E1B4B]">{title}</div>
            {subtitle && <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  )
}
