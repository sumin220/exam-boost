"use client"

import React, {useMemo} from "react" // React 임포트 (선택적, Next.js는 자동 주입)
import { useState, useCallback, useEffect } from "react" // useCallback은 현재 사용되지 않음
import Link from "next/link"
import { PlusCircle, Calendar as CalendarIconLucide, Target, Home, ArrowRight, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle" // 경로 확인
import SubjectCard from "@/components/specific/subject-card" // 경로 확인
import type { Subject, StudyPlan } from "@/types/study-plan" // 경로 확인
import { useLocalStorage } from "@/hooks/use-local-storage" // 경로 확인
import { calculateStudyDays } from "@/lib/simulation-engine" // 경로 확인

// localStorage에서 날짜 문자열을 Date 객체로 안전하게 변환하는 헬퍼 함수 (page.tsx와 동일)
const ensureDate = (dateStringOrDate: string | Date | undefined): Date => {
  if (dateStringOrDate instanceof Date) {
    if (isNaN(dateStringOrDate.getTime())) return new Date();
    return dateStringOrDate;
  }
  if (typeof dateStringOrDate === 'string') {
    const parsedDate = new Date(dateStringOrDate);
    if (isNaN(parsedDate.getTime())) return new Date();
    return parsedDate;
  }
  return new Date();
};

export default function SubjectsPage() {
  const [studyPlan] = useLocalStorage<StudyPlan>("studyPlan", {
    examName: "",
    studyStartDate: new Date(),
    studyEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    dailyStudyHours: 4,
  })

  const [subjects, setSubjects] = useLocalStorage<Subject[]>("subjects", [])
  const [studyDays, setStudyDays] = useState(0)

  // studyPlan의 날짜를 안전하게 Date 객체로 변환
  const safeStudyPlan = useMemo(() => ({ // useMemo로 감싸서 불필요한 객체 재생성 방지
    ...studyPlan,
    studyStartDate: ensureDate(studyPlan.studyStartDate),
    studyEndDate: ensureDate(studyPlan.studyEndDate),
  }), [studyPlan]);

  useEffect(() => {
    if (safeStudyPlan.studyStartDate && safeStudyPlan.studyEndDate) {
      setStudyDays(calculateStudyDays(safeStudyPlan.studyStartDate, safeStudyPlan.studyEndDate))
    } else {
      setStudyDays(0);
    }
  }, [safeStudyPlan.studyStartDate, safeStudyPlan.studyEndDate])

  const addNewSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(), // 고유 ID 생성 방식 개선 고려 (예: uuid)
      name: "",
      totalLoad: 0,
      loadUnit: "페이지",
      priority: 3, // 기본 우선순위 (보통)
      studySpeedPerPage: 10, // 기본 페이지당 학습 속도 (분)
      targetRounds: 3, // 기본 목표 회독수
    }
    setSubjects((prevSubjects) => [...prevSubjects, newSubject])
  }

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects((prevSubjects) =>
        prevSubjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)),
    )
  }

  const deleteSubject = (id: string) => {
    setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== id))
  }

  const totalStudyHours = studyDays * safeStudyPlan.dailyStudyHours
  const hasValidSubjects = subjects.length > 0 && subjects.every((s) => s.name.trim() && (s.totalLoad ?? 0) > 0) // totalLoad가 undefined일 수 있으므로 ?? 0 추가

  return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* 헤더 영역 */}
        <header className="flex justify-between items-center mb-6 sm:mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Button>
          </Link>
          <div className="text-center"> {/* 중앙 제목 (선택적) */}
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">과목 설정</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* 학습 계획 요약 */}
        <Card className="mb-6 sm:mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-foreground">
              <BookOpen className="w-5 h-5 text-primary" />
              {safeStudyPlan.examName || "나의 학습 계획"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              {/* 각 요약 정보 아이템 */}
              {[
                { label: "공부 기간", value: `${studyDays}일`, colorClass: "text-primary" },
                { label: "총 공부 시간", value: `${totalStudyHours}시간`, colorClass: "text-primary" },
                { label: "설정된 과목", value: `${subjects.length}개`, colorClass: "text-primary" },
                { label: "하루 공부 시간", value: `${safeStudyPlan.dailyStudyHours}시간`, colorClass: "text-primary" },
              ].map((item, index) => (
                  <div key={index} className="p-3 bg-card dark:bg-card rounded-lg border border-border">
                    <div className={`text-lg font-bold ${item.colorClass}`}>{item.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{item.label}</div>
                  </div>
              ))}
            </div>
            <div className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
              {safeStudyPlan.studyStartDate.toLocaleDateString("ko-KR")} ~{" "}
              {safeStudyPlan.studyEndDate.toLocaleDateString("ko-KR")}
            </div>
          </CardContent>
        </Card>

        {/* 과목 설정 섹션 */}
        <Card className="mb-6 sm:mb-8 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-foreground">
                <Target className="w-5 h-5 text-primary" />
                과목별 상세 설정
              </CardTitle>
              <Button onClick={addNewSubject} size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />새 과목 추가
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              각 과목의 학습량, 목표 회독수, 우선순위를 설정하세요. 카드 내용을 클릭하여 수정할 수 있습니다.
            </p>
          </CardHeader>
          {/* CardContent는 SubjectCard가 여러 개 있을 때 불필요할 수 있으므로 제거 또는 SubjectCard를 감싸는 용도로 변경 */}
        </Card>

        <div className="space-y-4 mb-8">
          {subjects.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="pt-6 text-center py-12">
                  <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">과목을 추가해주세요</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    시뮬레이션을 위해 최소 1개 이상의 과목이 필요합니다.
                  </p>
                  <Button onClick={addNewSubject} className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />첫 과목 추가하기
                  </Button>
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
            <Button variant="outline" className="w-full py-6 text-base sm:text-lg">
              <CalendarIconLucide className="mr-2 h-4 w-4" />
              계획 다시 설정하기
            </Button>
          </Link>
          <Link href="/simulation" className="flex-1">
            <Button size="lg" className="w-full py-6 text-base sm:text-lg" disabled={!hasValidSubjects}>
              <Target className="mr-2 h-4 w-4" />
              시뮬레이션 실행하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {!hasValidSubjects && subjects.length > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg">
              <p className="text-sm text-destructive dark:text-destructive-foreground/80 flex items-center gap-2">
                <Target className="h-4 w-4" /> {/* Lucide 아이콘 Target으로 변경, 또는 AlertTriangle 등 */}
                모든 과목의 이름과 학습량을 0보다 크게 입력해야 시뮬레이션을 실행할 수 있습니다.
              </p>
            </div>
        )}
      </div>
  )
}
