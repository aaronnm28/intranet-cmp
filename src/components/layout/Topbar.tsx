import { Bell, KeyRound } from 'lucide-react'

export function Topbar() {
  return (
    <header className="bg-[#6B21A8] h-14 flex items-center px-5 gap-3 flex-shrink-0">
      <span className="text-white font-bold text-[15px] tracking-[1.5px] flex-1">INTRANET</span>
      <Bell size={18} className="text-white/80 cursor-pointer" />
      <KeyRound size={18} className="text-white/80 cursor-pointer" />
      <div className="w-px h-6 bg-white/20" />
      <div className="text-right">
        <div className="text-white/90 text-[12px] font-semibold leading-tight">AARON SAMUEL</div>
        <div className="text-white/60 text-[11px]">Usuario</div>
      </div>
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-[12px] font-semibold">AS</div>
    </header>
  )
}
