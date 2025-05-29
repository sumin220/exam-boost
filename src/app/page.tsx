"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { StudyPlan } from "@/types/study-plan"
import { BookOpen, Calendar, Clock, Play, Target } from "lucide-react"

export default function Home() {
  const [studyPlan, setStudyPlan] = useLocalStorage<StudyPlan>("studyPlan", {
    examName: "",
    studyStartDate: new Date(),
    studyEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
    dailyStudyHours: 4,
  })

  const [formData, setFormData] = useState({
    examName: studyPlan.examName,
    studyStartDate: studyPlan.studyStartDate,
    studyEndDate: studyPlan.studyEndDate,
    dailyStudyHours: studyPlan.dailyStudyHours,
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.examName.trim()) {
        alert("시험 이름을 입력해주세요.")
        return
      }
      if (!formData.studyStartDate) {
        alert("공부 시작일을 선택해주세요.")
        return
      }
      if (!formData.studyEndDate) {
        alert("공부 종료일을 선택해주세요.")
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
    },
    [formData, setStudyPlan],
  )

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setFormData((prev) => {
        const newFormData = { ...prev, studyStartDate: date }
        // 시작일이 종료일보다 늦으면 종료일을 시작일 + 7일로 설정
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
    // formData.studyStartDate와 formData.studyEndDate가 유효한 Date 객체인지,
    // 그리고 getTime() 호출 시 NaN을 반환하지 않는지 (즉, "Invalid Date"가 아닌지) 확인
    if (
        !formData.studyStartDate || // null 또는 undefined 체크
        !(formData.studyStartDate instanceof Date) ||
        isNaN(formData.studyStartDate.getTime()) ||
        !formData.studyEndDate || // null 또는 undefined 체크
        !(formData.studyEndDate instanceof Date) ||
        isNaN(formData.studyEndDate.getTime())
    ) {
      console.warn("Invalid date(s) in formData for calculation:", formData.studyStartDate, formData.studyEndDate);
      return { studyDays: 0, totalStudyHours: 0 }; // 기본값 또는 오류 상태 반환
    }

    // 두 날짜가 모두 유효할 때만 시간 차이 계산
    if (formData.studyEndDate.getTime() < formData.studyStartDate.getTime()) {
      // 종료일이 시작일보다 빠르면 0일로 처리 (또는 다른 적절한 처리)
      console.warn("Study end date is earlier than start date.");
      return { studyDays: 0, totalStudyHours: 0 };
    }

    const diffTime = formData.studyEndDate.getTime() - formData.studyStartDate.getTime();
    const studyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalStudyHours = studyDays * formData.dailyStudyHours;
    return { studyDays, totalStudyHours };
  }, [formData.studyStartDate, formData.studyEndDate, formData.dailyStudyHours]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-8">
        <div></div> {/* 왼쪽 공간 */}
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary">ExamBoost</h1>
          <p className="text-muted-foreground">시험공부 최적화 시뮬레이터</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Target className="w-6 h-6" />
              학습 계획 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examName" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  시험 이름
                </Label>
                <Input
                  id="examName"
                  value={formData.examName}
                  onChange={handleExamNameChange}
                  placeholder="예: 기말고사"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studyStartDate" className="flex items-center gap-2">
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
                  <Label htmlFor="studyEndDate" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    공부 종료일
                  </Label>
                  <DatePicker
                    date={formData.studyEndDate}
                    onDateChange={handleEndDateChange}
                    placeholder="공부 종료일을 선택하세요"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyHours" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  하루 평균 공부 시간 (시간)
                </Label>
                <Input
                  id="studyHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.dailyStudyHours}
                  onChange={handleStudyHoursChange}
                  placeholder="예: 4.5"
                  required
                />
              </div>

              {/* 계산된 정보 표시 */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium text-sm">📊 계획 요약</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">총 공부 기간:</span>
                    <div className="font-medium">{calculatedData.studyDays}일</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">총 공부 시간:</span>
                    <div className="font-medium">{calculatedData.totalStudyHours}시간</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  계획 저장
                </Button>
                <Link href="/subjects" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    과목 설정하기
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 현재 설정된 정보 표시 */}
        {studyPlan.examName && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                현재 설정된 학습 계획
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">시험명:</span>
                  <span className="font-medium">{studyPlan.examName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">공부 기간:</span>
                  <span className="font-medium">
                    {studyPlan.studyStartDate.toLocaleDateString("ko-KR")} ~{" "}
                    {studyPlan.studyEndDate.toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">하루 공부시간:</span>
                  <span className="font-medium">{studyPlan.dailyStudyHours}시간</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
