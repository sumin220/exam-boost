"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { StudyPlan } from "@/types/study-plan"
import { BookOpen, Clock, Play, Target, ArrowRight, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date
  return new Date(date)
}

export default function Home() {
  const [studyPlan, setStudyPlan] = useLocalStorage<StudyPlan>("studyPlan", {
    examName: "",
    studyStartDate: new Date(),
    studyEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    dailyStudyHours: 4,
  })

  const [formData, setFormData] = useState({
    examName: studyPlan.examName,
    studyStartDate: ensureDate(studyPlan.studyStartDate),
    studyEndDate: ensureDate(studyPlan.studyEndDate),
    dailyStudyHours: studyPlan.dailyStudyHours,
  })

  const [savedResult, setSavedResult] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem("savedSimulation")
    if (saved) {
      setSavedResult(JSON.parse(saved))
    }
  }, [])

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setFormData((prev) => {
        const newFormData = { ...prev, studyStartDate: date }
        if (date >= prev.studyEndDate) {
          const newEndDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)
          newFormData.studyEndDate = newEndDate
        }
        return newFormData
      })
    }
  }, [])

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, studyEndDate: date }))
    }
  }, [])

  const handleExamNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, examName: e.target.value }))
  }, [])

  const handleStudyHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, dailyStudyHours: Number(e.target.value) }))
  }, [])

  const calculatedData = useMemo(() => {
    const diffTime = formData.studyEndDate.getTime() - formData.studyStartDate.getTime()
    const studyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const totalStudyHours = studyDays * formData.dailyStudyHours
    return { studyDays, totalStudyHours }
  }, [formData.studyStartDate, formData.studyEndDate, formData.dailyStudyHours])

  const handleNext = () => {
    if (!formData.examName.trim()) {
      alert("시험 이름을 입력해주세요.")
      return
    }
    if (formData.studyEndDate <= formData.studyStartDate) {
      alert("공부 종료일은 시작일보다 늦어야 합니다.")
      return
    }
    if (formData.dailyStudyHours <= 0) {
      alert("하루 공부 시간을 올바르게 입력해주세요.")
      return
    }

    setStudyPlan(formData)
  }

  const isFormValid =
      formData.examName.trim() && formData.studyEndDate > formData.studyStartDate && formData.dailyStudyHours > 0

  return (
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary">ExamBoost</h1>
            <p className="text-muted-foreground">시험공부 최적화 시뮬레이터</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="max-w-lg mx-auto">
          {/* 메인 설정 카드 */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Target className="w-6 h-6" />
                학습 계획 설정
              </CardTitle>
              <p className="text-sm text-muted-foreground">시험 정보를 입력하고 최적의 학습 계획을 세워보세요</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examName" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  시험 이름
                </Label>
                <Input
                    id="examName"
                    value={formData.examName}
                    onChange={handleExamNameChange}
                    placeholder="예: 정보처리기사 필기"
                    className="text-lg"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    공부 시작일
                  </Label>
                  <DatePicker
                      date={formData.studyStartDate}
                      onDateChange={handleStartDateChange}
                      placeholder="공부 시작일을 선택하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    시험일 (공부 종료일)
                  </Label>
                  <DatePicker
                      date={formData.studyEndDate}
                      onDateChange={handleEndDateChange}
                      placeholder="시험일을 선택하세요"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  하루 평균 공부 시간 (시간)
                </Label>
                <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.dailyStudyHours}
                    onChange={handleStudyHoursChange}
                    placeholder="예: 4.5"
                    className="text-lg"
                />
              </div>

              {/* 계산된 정보 표시 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  계획 요약
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{calculatedData.studyDays}</div>
                    <div className="text-sm text-gray-600">총 공부 기간 (일)</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{calculatedData.totalStudyHours}</div>
                    <div className="text-sm text-gray-600">총 공부 시간 (시간)</div>
                  </div>
                </div>
              </div>

              {/* 다음 단계 버튼 */}
              <div className="space-y-3">
                <Link href="/subjects" onClick={handleNext}>
                  <Button size="lg" className="w-full text-lg py-6" disabled={!isFormValid}>
                    과목 설정하러 가기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground">
                  다음 단계에서 과목별 상세 정보를 입력하고 시뮬레이션을 실행할 수 있습니다
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 저장된 시뮬레이션 결과 표시 */}
          {savedResult && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    최근 시뮬레이션 결과
                    <Badge variant="outline" className="text-xs">
                      {new Date(savedResult.timestamp).toLocaleDateString("ko-KR")}
                    </Badge>
                  </h3>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {savedResult.totalAchievementRate?.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">이 계획으로 공부할 시 평균 목표 달성률</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-green-600">{savedResult.bestSubject}</div>
                      <div className="text-xs text-muted-foreground">최고 달성 예상 과목</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-red-600">{savedResult.worstSubject}</div>
                      <div className="text-xs text-muted-foreground">개선 필요 과목</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {savedResult.results?.slice(0, 3).map((result: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                          <span className="font-medium">{result.subjectName}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(result.achievementRate, 100)}%`,
                                    backgroundColor: result.color,
                                  }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12">{result.achievementRate.toFixed(0)}%</span>
                          </div>
                        </div>
                    ))}
                    {savedResult.results?.length > 3 && (
                        <div className="text-center text-xs text-muted-foreground pt-2">
                          +{savedResult.results.length - 3}개 과목 더
                        </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href="/simulation" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        상세 결과 보기
                      </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem("savedSimulation")
                          setSavedResult(null)
                        }}
                    >
                      결과 삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
  )
}
