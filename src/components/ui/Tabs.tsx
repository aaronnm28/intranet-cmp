interface Tab {
  id: string
  label: string
}
interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer border-b-2 -mb-px transition-all
            ${active === tab.id ? 'text-[#6B21A8] border-[#6B21A8]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
