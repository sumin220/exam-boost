"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import SubjectCard from "@/components/specific/subject-card"
import type { Subject, StudyPlan } from "@/types/study-plan"
import { PlusCircle, Calendar, Clock, Target, Home } from "lucide-react"
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

  useEffect(() => {
    setStudyDays(calculateStudyDays(studyPlan.studyStartDate, studyPlan.studyEndDate))
  }, [studyPlan.studyStartDate, studyPlan.studyEndDate])

  const addNewSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: "",
      totalLoad: 0,
      loadUnit: "페이지",
      priority: 3,
      studySpeedPerPage: 2,
    }
    setSubjects([...subjects, newSubject])
  }

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects(subjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)))
  }

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((subject) => subject.id !== id))
  }

  const totalStudyHours = studyDays * studyPlan.dailyStudyHours

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
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6" />
                {studyPlan.examName || "학습 계획"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">공부 기간:</span>
                  <span className="font-medium">{studyDays}일</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">총 시간:</span>
                  <span className="font-medium">{totalStudyHours}시간</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">과목 수:</span>
                  <span className="font-medium">{subjects.length}개</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {studyPlan.studyStartDate.toLocaleDateString("ko-KR")} ~{" "}
                {studyPlan.studyEndDate.toLocaleDateString("ko-KR")}
              </p>
            </div>
            <Button variant="outline" onClick={addNewSubject}>
              <PlusCircle className="mr-2 h-4 w-4" />새 과목 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-8">
        {subjects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">아직 추가된 과목이 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">
                위의 "새 과목 추가" 버튼을 클릭해서 과목을 추가해보세요.
              </p>
            </CardContent>
          </Card>
        ) : (
          subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onUpdate={updateSubject} onDelete={deleteSubject} />
          ))
        )}
      </div>

      <div className="flex justify-between">
        <Link href="/">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            계획 수정하기
          </Button>
        </Link>
        <Link href="/simulation">
          <Button size="lg" disabled={subjects.length === 0}>
            <Target className="mr-2 h-4 w-4" />
            시뮬레이션 실행
          </Button>
        </Link>
      </div>
    </div>
  )
}
