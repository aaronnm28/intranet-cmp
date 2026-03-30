import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface ToastProps {
  message: string
  show: boolean
  onHide: () => void
}

export function Toast({ message, show, onHide }: ToastProps) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onHide, 3000)
      return () => clearTimeout(t)
    }
  }, [show, onHide])

  if (!show) return null
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-[#1E1B4B] text-white px-5 py-3 rounded-lg text-[13px] shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
      {message}
    </div>
  )
}

export function useToast() {
  const [state, setState] = useState({ show: false, message: '' })
  const toast = useCallback((message: string) => setState({ show: true, message }), [])
  const hide = useCallback(() => setState(s => ({ ...s, show: false })), [])
  return { toast, toastState: state, hideToast: hide }
}
