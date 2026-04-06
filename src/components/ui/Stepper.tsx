interface Step {
  label: string
  status: 'done' | 'current' | 'pending'
}
export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center flex-wrap gap-y-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0
              ${step.status === 'done' ? 'bg-[#6B21A8] text-white' :
                step.status === 'current' ? 'bg-white border-2 border-[#6B21A8] text-[#6B21A8]' :
                'bg-gray-100 border-2 border-gray-300 text-gray-400'}`}>
              {step.status === 'done' ? '✔' : step.status === 'current' ? '⏳' : '○'}
            </div>
            <span className={`text-[11px] font-medium whitespace-nowrap
              ${step.status === 'done' ? 'text-[#6B21A8]' :
                step.status === 'current' ? 'text-[#6B21A8] font-bold' :
                'text-gray-400'}`}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 min-w-[20px] ${step.status === 'done' ? 'bg-[#6B21A8]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
