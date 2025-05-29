"use client"

import type { SimulationResultData } from "@/types/simulation"

interface SimulationResultChartProps {
  data: SimulationResultData[]
}

export default function SimulationResultChart({ data }: SimulationResultChartProps) {
  // Find the maximum rounds value for scaling
  const maxRounds = Math.max(...data.map((item) => item.rounds))

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">{item.subjectName}</span>
            <span className="text-sm font-bold">{item.rounds.toFixed(1)} 회독</span>
          </div>
          <div className="h-8 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(item.rounds / maxRounds) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
