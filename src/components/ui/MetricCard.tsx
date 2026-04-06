interface MetricCardProps {
  icon: string
  value: string
  label: string
}
export function MetricCard({ icon, value, label }: MetricCardProps) {
  return (
    <div className="flex-1 bg-white rounded-lg p-3.5 border border-gray-200 shadow-sm">
      <div className="text-xl mb-1.5">{icon}</div>
      <div className="text-[20px] font-bold text-[#1E1B4B]">{value}</div>
      <div className="text-[12px] text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
