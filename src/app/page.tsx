// src/app/page.tsx
"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Clock, Play, Target, ArrowRight, BarChart3, Calendar as CalendarIconLucide } from "lucide-react" // CalendarIconLucide로 이름 변경

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker" // 사용자 정의 DatePicker
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ui/theme-toggle" // ThemeToggle 컴포넌트 경로 확인
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage" // 사용자 정의 훅
import type { StudyPlan, SimulationResultData } from "@/types/study-plan" // 타입 임포트

// localStorage에서 날짜 문자열을 Date 객체로 안전하게 변환하는 헬퍼 함수
const ensureDate = (dateStringOrDate: string | Date | undefined): Date => {
  if (dateStringOrDate instanceof Date) {
    // 이미 Date 객체이면 그대로 반환 (Invalid Date 포함)
    if (isNaN(dateStringOrDate.getTime())) return new Date(); // Invalid Date면 오늘 날짜로
    return dateStringOrDate;
  }
  if (typeof dateStringOrDate === 'string') {
    const parsedDate = new Date(dateStringOrDate);
    if (isNaN(parsedDate.getTime())) return new Date(); // 파싱 실패 시 오늘 날짜로
    return parsedDate;
  }
  return new Date(); // undefined거나 다른 타입이면 오늘 날짜로
};

// 최근 시뮬레이션 결과 타입 (임시, 실제 타입에 맞게 조정 필요)
interface SavedSimulationResult {
  timestamp: string | Date;
  totalAchievementRate?: number;
  bestSubject?: string;
  worstSubject?: string;
  results?: SimulationResultData[]; // SimulationResultItem은 subjectName, achievementRate, color 등을 포함
}

export default function Home() {
  const [studyPlan, setStudyPlan] = useLocalStorage<StudyPlan>("studyPlan", {
    examName: "",
    studyStartDate: new Date(),
    studyEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 기본 30일 후
    dailyStudyHours: 4,
  });

  const [savedResult, setSavedResult] = useState<SavedSimulationResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("savedSimulation");
    if (saved) {
      try {
        const parsedResult = JSON.parse(saved) as SavedSimulationResult;
        // localStorage에서 불러온 결과의 timestamp도 Date 객체로 변환
        if (parsedResult.timestamp) {
          parsedResult.timestamp = ensureDate(parsedResult.timestamp);
        }
        setSavedResult(parsedResult);
      } catch (error) {
        console.error("Error parsing saved simulation from localStorage:", error);
        localStorage.removeItem("savedSimulation"); // 파싱 오류 시 해당 항목 제거
      }
    }
  }, []);

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setStudyPlan((prev) => {
        const newStartDate = ensureDate(date);
        const currentEndDate = ensureDate(prev.studyEndDate);
        let newEndDate = currentEndDate;

        if (newStartDate >= currentEndDate) {
          newEndDate = new Date(newStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 시작일 + 7일
        }
        return { ...prev, studyStartDate: newStartDate, studyEndDate: newEndDate };
      });
    }
  }, [setStudyPlan]);

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setStudyPlan((prev) => ({ ...prev, studyEndDate: ensureDate(date) }));
    }
  }, [setStudyPlan]);

  const handleExamNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudyPlan((prev) => ({ ...prev, examName: e.target.value }));
  }, [setStudyPlan]);

  const handleStudyHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = Number(e.target.value);
    setStudyPlan((prev) => ({ ...prev, dailyStudyHours: hours >= 0 ? hours : 0 }));
  }, [setStudyPlan]);

  const calculatedData = useMemo(() => {
    const startDate = ensureDate(studyPlan.studyStartDate);
    const endDate = ensureDate(studyPlan.studyEndDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { studyDays: 0, totalStudyHours: 0 };
    }

    if (endDate < startDate) {
      return { studyDays: 0, totalStudyHours: 0 };
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const studyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalStudyHours = studyDays * studyPlan.dailyStudyHours;
    return { studyDays: studyDays >= 0 ? studyDays : 0, totalStudyHours: totalStudyHours >= 0 ? totalStudyHours : 0 };
  }, [studyPlan.studyStartDate, studyPlan.studyEndDate, studyPlan.dailyStudyHours]);

  const isFormValid = useMemo(() => {
    const startDate = ensureDate(studyPlan.studyStartDate);
    const endDate = ensureDate(studyPlan.studyEndDate);
    return (
        studyPlan.examName.trim() !== "" &&
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        endDate > startDate &&
        studyPlan.dailyStudyHours > 0
    );
  }, [studyPlan]);


  const handleNext = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isFormValid) {
      e.preventDefault(); // 유효하지 않으면 링크 이동 막기
      alert("입력값을 확인해주세요.\n- 시험 이름은 필수입니다.\n- 공부 종료일은 시작일보다 늦어야 합니다.\n- 하루 공부 시간은 0보다 커야 합니다.");
      return;
    }
  };


  return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <header className="flex justify-between items-center mb-8 sm:mb-12">
          <div className="w-10 h-10"></div> {/* 왼쪽 공간용 더미 div */}
          <div className="text-center">
            <div className="mx-auto mb-3 sm:mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">ExamBoost</h1>
            <p className="text-sm sm:text-base text-muted-foreground">시험공부 최적화 시뮬레이터</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="max-w-lg mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                학습 계획 설정
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                시험 정보를 입력하고 최적의 학습 계획을 세워보세요
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="examName" className="flex items-center gap-1.5 text-sm">
                  <BookOpen className="w-4 h-4" />
                  시험 이름
                </Label>
                <Input
                    id="examName"
                    value={studyPlan.examName}
                    onChange={handleExamNameChange}
                    placeholder="예: 정보처리기사 필기"
                    className="text-base sm:text-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="studyStartDate" className="flex items-center gap-1.5 text-sm">
                    <Play className="w-4 h-4" />
                    공부 시작일
                  </Label>
                  <DatePicker
                      date={ensureDate(studyPlan.studyStartDate)}
                      onDateChange={handleStartDateChange}
                      placeholder="시작일을 선택하세요"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="studyEndDate" className="flex items-center gap-1.5 text-sm">
                    <Target className="w-4 h-4" />
                    시험일 (공부 종료일)
                  </Label>
                  <DatePicker
                      date={ensureDate(studyPlan.studyEndDate)}
                      onDateChange={handleEndDateChange}
                      placeholder="시험일을 선택하세요"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studyHours" className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4" />
                  하루 평균 공부 시간 (시간)
                </Label>
                <Input
                    id="studyHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={studyPlan.dailyStudyHours}
                    onChange={handleStudyHoursChange}
                    placeholder="예: 4.5"
                    className="text-base sm:text-lg"
                />
              </div>

              <div className="p-4 bg-secondary dark:bg-secondary rounded-lg border border-border dark:border-border">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  계획 요약
                </h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-card dark:bg-card rounded-lg border border-border">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{calculatedData.studyDays}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {calculatedData.studyDays > 0 ? "총 공부 기간 (일)" : "기간 미설정"}
                    </div>
                  </div>
                  <div className="p-3 bg-card dark:bg-card rounded-lg border border-border">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{calculatedData.totalStudyHours}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {calculatedData.totalStudyHours > 0 ? "총 공부 시간 (시간)" : "시간 미설정"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/subjects" onClick={handleNext} passHref legacyBehavior>
                  <Button size="lg" className="w-full text-lg py-6" disabled={!isFormValid} asChild>
                    <a> {/* legacyBehavior 사용 시 a 태그 직접 사용 */}
                      과목 설정하러 가기
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </Link>
                { !isFormValid && (
                    <p className="text-xs text-center text-destructive mt-2">
                      모든 필수 정보를 올바르게 입력해주세요.
                    </p>
                )}
                <p className="text-xs text-center text-muted-foreground mt-3">
                  다음 단계에서 과목별 상세 정보를 입력하고 시뮬레이션을 실행할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {savedResult && (
              <Card className="mt-8 shadow-xl">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    최근 시뮬레이션 결과
                    <Badge variant="secondary" className="text-xs">
                      {savedResult.timestamp instanceof Date ? savedResult.timestamp.toLocaleDateString("ko-KR") : '날짜 정보 없음'}
                    </Badge>
                  </h3>

                  <div className="p-4 bg-secondary dark:bg-secondary rounded-lg border border-border mb-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                        {savedResult.totalAchievementRate?.toFixed(1) ?? 'N/A'}%
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">평균 목표 달성률</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-card dark:bg-card rounded-lg border border-border">
                      <div className="text-sm font-medium text-primary">{savedResult.bestSubject || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">최고 달성 예상 과목</div>
                    </div>
                    <div className="text-center p-3 bg-card dark:bg-card rounded-lg border border-border">
                      <div className="text-sm font-medium text-destructive">{savedResult.worstSubject || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">개선 필요 과목</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {savedResult.results?.slice(0, 3).map((result: SimulationResultData, index: number) => (
                        <div key={result.subjectName || index} className="flex justify-between items-center text-sm p-2.5 bg-accent dark:bg-accent rounded-md">
                          <span className="font-medium text-accent-foreground">{result.subjectName}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2.5 bg-muted dark:bg-muted rounded-full overflow-hidden">
                              <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${Math.min(result.achievementRate ?? 0, 100)}%`,
                                    // result.color에 "var(--chart-1)"과 같은 CSS 변수 문자열이 있다고 가정
                                    backgroundColor: result.color || "var(--primary)",
                                  }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">{result.achievementRate?.toFixed(0) ?? 0}%</span>
                          </div>
                        </div>
                    ))}
                    {savedResult.results && savedResult.results.length > 3 && (
                        <div className="text-center text-xs text-muted-foreground pt-2">
                          +{savedResult.results.length - 3}개 과목 더 보기
                        </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Link href="/simulation" passHref legacyBehavior className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a>상세 결과 보기</a>
                      </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem("savedSimulation");
                          setSavedResult(null);
                        }}
                        className="text-destructive hover:text-destructive"
                    >
                      결과 삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}
        </main>
      </div>
  );
}
