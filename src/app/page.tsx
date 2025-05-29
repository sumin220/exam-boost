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
import { BookOpen, Calendar, Clock, Play, Target, Edit, Check, X } from "lucide-react"

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

  const [isEditing, setIsEditing] = useState({
    examName: false,
    studyStartDate: false,
    studyEndDate: false,
    dailyStudyHours: false,
  })

  const [editData, setEditData] = useState(studyPlan)

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

  // 인라인 편집 관련 함수들
  const startEdit = (field: keyof typeof isEditing) => {
    setIsEditing({ ...isEditing, [field]: true })
    setEditData(studyPlan)
  }

  const cancelEdit = (field: keyof typeof isEditing) => {
    setIsEditing({ ...isEditing, [field]: false })
    setEditData(studyPlan)
  }

  const saveEdit = (field: keyof typeof isEditing) => {
    if (field === "studyEndDate" && editData.studyEndDate <= editData.studyStartDate) {
      alert("공부 종료일은 시작일보다 늦어야 합니다.")
      return
    }
    if (field === "studyStartDate" && editData.studyStartDate >= editData.studyEndDate) {
      alert("공부 시작일은 종료일보다 빨라야 합니다.")
      return
    }
    if (field === "dailyStudyHours" && editData.dailyStudyHours <= 0) {
      alert("하루 공부 시간은 0보다 커야 합니다.")
      return
    }
    if (field === "examName" && !editData.examName.trim()) {
      alert("시험 이름을 입력해주세요.")
      return
    }

    setStudyPlan(editData)
    setIsEditing({ ...isEditing, [field]: false })
  }

  const handleEditDateChange = (field: "studyStartDate" | "studyEndDate", date: Date | undefined) => {
    if (date) {
      setEditData({ ...editData, [field]: date })
    }
  }

  const calculatedData = useMemo(() => {
    const diffTime = formData.studyEndDate.getTime() - formData.studyStartDate.getTime()
    const studyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const totalStudyHours = studyDays * formData.dailyStudyHours
    return { studyDays, totalStudyHours }
  }, [formData.studyStartDate, formData.studyEndDate, formData.dailyStudyHours])

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
                      placeholder="예: 정보처리기사 필기"
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

          {/* 현재 설정된 정보 표시 - 인라인 편집 가능 */}
          {studyPlan.examName && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    현재 설정된 학습 계획
                    <span className="text-xs text-muted-foreground">(클릭해서 수정)</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    {/* 시험명 편집 */}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">시험명:</span>
                      <div className="flex items-center gap-2">
                        {isEditing.examName ? (
                            <>
                              <Input
                                  value={editData.examName}
                                  onChange={(e) => setEditData({ ...editData, examName: e.target.value })}
                                  className="h-8 text-sm"
                                  autoFocus
                              />
                              <Button size="sm" variant="ghost" onClick={() => saveEdit("examName")}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => cancelEdit("examName")}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                        ) : (
                            <>
                              <span className="font-medium">{studyPlan.examName}</span>
                              <Button size="sm" variant="ghost" onClick={() => startEdit("examName")}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </>
                        )}
                      </div>
                    </div>

                    {/* 시작일 편집 */}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">시작일:</span>
                      <div className="flex items-center gap-2">
                        {isEditing.studyStartDate ? (
                            <>
                              <DatePicker
                                  date={editData.studyStartDate}
                                  onDateChange={(date) => handleEditDateChange("studyStartDate", date)}
                                  className="h-8 text-sm"
                              />
                              <Button size="sm" variant="ghost" onClick={() => saveEdit("studyStartDate")}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => cancelEdit("studyStartDate")}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                        ) : (
                            <>
                              <span className="font-medium">{studyPlan.studyStartDate.toLocaleDateString("ko-KR")}</span>
                              <Button size="sm" variant="ghost" onClick={() => startEdit("studyStartDate")}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </>
                        )}
                      </div>
                    </div>

                    {/* 종료일 편집 */}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">종료일:</span>
                      <div className="flex items-center gap-2">
                        {isEditing.studyEndDate ? (
                            <>
                              <DatePicker
                                  date={editData.studyEndDate}
                                  onDateChange={(date) => handleEditDateChange("studyEndDate", date)}
                                  className="h-8 text-sm"
                              />
                              <Button size="sm" variant="ghost" onClick={() => saveEdit("studyEndDate")}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => cancelEdit("studyEndDate")}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                        ) : (
                            <>
                              <span className="font-medium">{studyPlan.studyEndDate.toLocaleDateString("ko-KR")}</span>
                              <Button size="sm" variant="ghost" onClick={() => startEdit("studyEndDate")}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </>
                        )}
                      </div>
                    </div>

                    {/* 하루 공부시간 편집 */}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">하루 공부시간:</span>
                      <div className="flex items-center gap-2">
                        {isEditing.dailyStudyHours ? (
                            <>
                              <Input
                                  type="number"
                                  min="0.5"
                                  step="0.5"
                                  value={editData.dailyStudyHours}
                                  onChange={(e) => setEditData({ ...editData, dailyStudyHours: Number(e.target.value) })}
                                  className="h-8 text-sm w-20"
                                  autoFocus
                              />
                              <span className="text-xs">시간</span>
                              <Button size="sm" variant="ghost" onClick={() => saveEdit("dailyStudyHours")}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => cancelEdit("dailyStudyHours")}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                        ) : (
                            <>
                              <span className="font-medium">{studyPlan.dailyStudyHours}시간</span>
                              <Button size="sm" variant="ghost" onClick={() => startEdit("dailyStudyHours")}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
        </div>
      </div>
  )
}
