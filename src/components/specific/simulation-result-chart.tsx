"use client"

import type { SimulationResultData } from "@/types/simulation"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle, AlertCircle } from "lucide-react"

interface SimulationResultChartProps {
  data: SimulationResultData[]
}

export default function SimulationResultChart({ data }: SimulationResultChartProps) {
  // Find the maximum rounds value for scaling
  const maxRounds = Math.max(...data.map((item) => item.rounds))

  const getAchievementIcon = (rate: number) => {
    if (rate >= 100) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (rate >= 80) return <AlertCircle className="w-4 h-4 text-yellow-500" />
    return <AlertCircle className="w-4 h-4 text-red-500" />
  }

  const getAchievementColor = (rate: number) => {
    if (rate >= 100) return "text-green-700 bg-green-100 border-green-300"
    if (rate >= 80) return "text-yellow-700 bg-yellow-100 border-yellow-300"
    if (rate >= 60) return "text-orange-700 bg-orange-100 border-orange-300"
    return "text-red-700 bg-red-100 border-red-300"
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 100) return "bg-green-500"
    if (rate >= 80) return "bg-yellow-500"
    if (rate >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  const averageAchievement = data.reduce((sum, item) => sum + item.achievementRate, 0) / data.length
  const achievedSubjects = data.filter((item) => item.achievementRate >= 100).length
  const partiallyAchievedSubjects = data.filter(
      (item) => item.achievementRate >= 80 && item.achievementRate < 100,
  ).length

  return (
      <div className="space-y-6">
        {/* 전체 시뮬레이션 결과 요약 */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-center">📊 이 학습 계획으로 공부할 시 예상 결과</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">{achievedSubjects}</div>
              <div className="text-sm text-gray-600">목표 완전 달성 과목</div>
              <div className="text-xs text-gray-500">100% 이상</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-yellow-600">{partiallyAchievedSubjects}</div>
              <div className="text-sm text-gray-600">거의 달성 과목</div>
              <div className="text-xs text-gray-500">80% 이상</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{averageAchievement.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">전체 평균 달성률</div>
              <div className="text-xs text-gray-500">목표 대비</div>
            </div>
          </div>
        </div>

        {/* 과목별 상세 결과 */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">📚 과목별 상세 예상 결과</h4>
          {data.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{item.subjectName}</h3>
                    {getAchievementIcon(item.achievementRate)}
                    <Badge variant="outline" className={getAchievementColor(item.achievementRate)}>
                      목표의 {item.achievementRate.toFixed(1)}% 달성 예상
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">목표 회독수</div>
                    <div className="font-bold text-lg flex items-center justify-center gap-1">
                      <Target className="w-4 h-4 text-blue-500" />
                      {item.targetRounds}회
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">예상 달성</div>
                    <div className="font-bold text-lg text-green-600">{item.rounds.toFixed(1)}회</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">차이</div>
                    <div
                        className={`font-bold text-lg ${item.rounds >= item.targetRounds ? "text-green-600" : "text-red-600"}`}
                    >
                      {item.rounds >= item.targetRounds ? "+" : ""}
                      {(item.rounds - item.targetRounds).toFixed(1)}회
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-gray-600">달성률</div>
                    <div className="font-bold text-lg">{item.achievementRate.toFixed(1)}%</div>
                  </div>
                </div>

                {/* 목표 달성 진행률 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">목표 달성 예상도</span>
                    <span className="text-gray-600">
                  {item.rounds.toFixed(1)} / {item.targetRounds} 회독
                </span>
                  </div>
                  <div className="relative">
                    <Progress value={Math.min((item.rounds / item.targetRounds) * 100, 100)} className="h-4" />
                    <div
                        className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-500 ${getProgressColor(item.achievementRate)}`}
                        style={{ width: `${Math.min((item.rounds / item.targetRounds) * 100, 100)}%` }}
                    />
                  </div>
                  {item.achievementRate >= 100 && (
                      <div className="text-sm text-green-600 font-medium">✅ 목표를 초과 달성할 수 있습니다!</div>
                  )}
                  {item.achievementRate < 80 && (
                      <div className="text-sm text-red-600">
                        ⚠️ 목표 달성이 어려울 수 있습니다. 학습 시간을 늘리거나 목표를 조정해보세요.
                      </div>
                  )}
                </div>

                {/* 전체 대비 학습량 */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>전체 과목 대비 학습량</span>
                    <span>{((item.rounds / maxRounds) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${(item.rounds / maxRounds) * 100}%`,
                          backgroundColor: item.color,
                        }}
                    />
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
  )
}
