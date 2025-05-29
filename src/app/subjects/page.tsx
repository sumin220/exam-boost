"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import SubjectCard from "@/components/specific/subject-card"
import type { Subject, StudyPlan } from "@/types/study-plan"
import { PlusCircle, Calendar, Target, Home, ArrowRight, BookOpen } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { calculateStudyDays } from "@/lib/simulation-engine"

export default function SubjectsPage() {
  const [studyPlan] = useLocalStorage<StudyPlan>("studyPlan", {
    examName: "",
    studyStartDate: new Date(),
    studyEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    dailyStudyHours: 4,
  })

  const [subjects, setSubjects] = useLocalStorage<Subject[]>("subjects", [])
  const [studyDays, setStudyDays] = useState(0)

  const ensureDate = (date: any): Date => {
    if (date instanceof Date) return date
    return new Date(date)
  }

  const safeStudyPlan = {
    ...studyPlan,
    studyStartDate: ensureDate(studyPlan.studyStartDate),
    studyEndDate: ensureDate(studyPlan.studyEndDate),
  }

  useEffect(() => {
    setStudyDays(calculateStudyDays(safeStudyPlan.studyStartDate, safeStudyPlan.studyEndDate))
  }, [safeStudyPlan.studyStartDate, safeStudyPlan.studyEndDate])

  const addNewSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: "",
      totalLoad: 0,
      loadUnit: "페이지",
      priority: 3,
      studySpeedPerPage: 2,
      targetRounds: 3,
    }
    setSubjects([...subjects, newSubject])
  }

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects(subjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)))
  }

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((subject) => subject.id !== id))
  }

  const totalStudyHours = studyDays * safeStudyPlan.dailyStudyHours
  const hasValidSubjects = subjects.length > 0 && subjects.every((s) => s.name.trim() && s.totalLoad > 0)

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

        {/* 학습 계획 요약 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {safeStudyPlan.examName || "학습 계획"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{studyDays}일</div>
                <div className="text-sm text-gray-600">공부 기간</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{totalStudyHours}시간</div>
                <div className="text-sm text-gray-600">총 공부 시간</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{subjects.length}개</div>
                <div className="text-sm text-gray-600">설정된 과목</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{safeStudyPlan.dailyStudyHours}시간</div>
                <div className="text-sm text-gray-600">하루 공부 시간</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {safeStudyPlan.studyStartDate.toLocaleDateString("ko-KR")} ~{" "}
              {safeStudyPlan.studyEndDate.toLocaleDateString("ko-KR")}
            </div>
          </CardContent>
        </Card>

        {/* 과목 설정 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="w-5 h-5" />
                과목별 상세 설정
              </CardTitle>
              <Button onClick={addNewSubject} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />새 과목 추가
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              각 과목의 학습량, 목표 회독수, 우선순위를 설정하세요. 클릭해서 수정할 수 있습니다.
            </p>
          </CardHeader>
        </Card>

        <div className="space-y-4 mb-8">
          {subjects.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">과목을 추가해주세요</h3>
                  <p className="text-muted-foreground mb-4">시뮬레이션을 위해 최소 1개 이상의 과목이 필요합니다.</p>
                  {/*<Button onClick={addNewSubject} className="flex items-center gap-2">*/}
                  {/*  <PlusCircle className="h-4 w-4" />첫 번째 과목 추가하기*/}
                  {/*</Button>*/}
                </CardContent>
              </Card>
          ) : (
              subjects.map((subject) => (
                  <SubjectCard key={subject.id} subject={subject} onUpdate={updateSubject} onDelete={deleteSubject} />
              ))
          )}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              계획 다시 설정하기
            </Button>
          </Link>
          <Link href="/simulation" className="flex-1">
            <Button size="lg" className="w-full" disabled={!hasValidSubjects}>
              <Target className="mr-2 h-4 w-4" />
              시뮬레이션 실행하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {!hasValidSubjects && subjects.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ 모든 과목의 이름과 학습량을 입력해야 시뮬레이션을 실행할 수 있습니다.
              </p>
            </div>
        )}
      </div>
  )
}
