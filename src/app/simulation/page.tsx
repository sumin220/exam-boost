"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import SimulationResultChart from "@/components/specific/simulation-result-chart"
import type { SimulationResultData, Subject, StudyPlan } from "@/types/study-plan"
import type { SimulationStrategy } from "@/lib/simulation-engine"
import { ArrowLeft, Save, Target, Calendar, Clock, Home } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { runSimulation, calculateStudyDays, calculateTotalStudyTime } from "@/lib/simulation-engine"
import { useRouter } from "next/navigation"

export default function SimulationPage() {
  const [strategy, setStrategy] = useState<SimulationStrategy>("equal")
  const [simulationResults, setSimulationResults] = useState<SimulationResultData[]>([])

  const [studyPlan] = useLocalStorage<StudyPlan>("studyPlan", {
    examName: "",
    studyStartDate: new Date(),
    studyEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    dailyStudyHours: 4,
  })

  const [subjects] = useLocalStorage<Subject[]>("subjects", [])

  // Ensure dates are Date objects
  const ensureDate = (date: any): Date => {
    if (date instanceof Date) return date
    return new Date(date)
  }

  const safeStudyPlan = {
    ...studyPlan,
    studyStartDate: ensureDate(studyPlan.studyStartDate),
    studyEndDate: ensureDate(studyPlan.studyEndDate),
  }

  const studyDays = calculateStudyDays(safeStudyPlan.studyStartDate, safeStudyPlan.studyEndDate)
  const totalStudyTime = calculateTotalStudyTime(studyDays, safeStudyPlan.dailyStudyHours)

  useEffect(() => {
    if (subjects.length > 0) {
      const results = runSimulation(safeStudyPlan, subjects, strategy)
      setSimulationResults(results)
    }
  }, [subjects, strategy]) // Removed safeStudyPlan from dependencies

  const router = useRouter()

  const saveResults = () => {
    const totalAchievementRate =
        simulationResults.reduce((sum, item) => sum + item.achievementRate, 0) / simulationResults.length
    const bestSubject = simulationResults.reduce((best, current) =>
        current.achievementRate > best.achievementRate ? current : best,
    ).subjectName
    const worstSubject = simulationResults.reduce((worst, current) =>
        current.achievementRate < worst.achievementRate ? current : worst,
    ).subjectName

    const savedData = {
      strategy,
      results: simulationResults,
      studyPlan: safeStudyPlan,
      subjects,
      timestamp: new Date().toISOString(),
      totalAchievementRate,
      bestSubject,
      worstSubject,
    }
    localStorage.setItem("savedSimulation", JSON.stringify(savedData))
    alert("시뮬레이션 결과가 저장되었습니다!")
    router.push("/") // 홈으로 리다이렉트
  }

  return (
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Target className="w-6 h-6" />
              {safeStudyPlan.examName} 시뮬레이션 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground">총 공부 기간</h3>
                </div>
                <p className="text-3xl font-bold">{studyDays}일</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {safeStudyPlan.studyStartDate.toLocaleDateString("ko-KR")} ~{" "}
                  {safeStudyPlan.studyEndDate.toLocaleDateString("ko-KR")}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground">총 가용 학습 시간</h3>
                </div>
                <p className="text-3xl font-bold">{totalStudyTime}시간</p>
                <p className="text-sm text-muted-foreground mt-1">하루 {safeStudyPlan.dailyStudyHours}시간</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground">총 과목 수</h3>
                </div>
                <p className="text-3xl font-bold">{subjects.length}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>학습 전략 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={strategy} onValueChange={(value: SimulationStrategy) => setStrategy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="학습 전략을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">모든 과목 균등 분배</SelectItem>
                <SelectItem value="priority">과목 우선순위 기반 분배</SelectItem>
                <SelectItem value="target-rounds">목표 회독수 최적화 분배</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-3 text-sm text-muted-foreground">
              {strategy === "equal" && "모든 과목에 동일한 시간을 할당합니다."}
              {strategy === "priority" && "과목의 우선순위에 따라 시간을 차등 분배합니다."}
              {strategy === "target-rounds" && "각 과목의 목표 회독수 달성을 우선으로 최적화된 시간 분배를 합니다."}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>시뮬레이션 결과 상세</CardTitle>
          </CardHeader>
          <CardContent>
            {simulationResults.length > 0 ? (
                <SimulationResultChart data={simulationResults} />
            ) : (
                <p className="text-center text-muted-foreground">시뮬레이션 결과가 없습니다. 과목을 추가해주세요.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link href="/subjects">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              과목 설정으로
            </Button>
          </Link>
          <Button onClick={saveResults} disabled={simulationResults.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            결과 저장하기
          </Button>
        </div>
      </div>
  )
}
