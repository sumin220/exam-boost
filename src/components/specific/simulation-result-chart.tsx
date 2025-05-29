"use client"

import type { SimulationResultData } from "@/types/simulation" // 실제 타입 경로 확인
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle, AlertCircle, BarChart3 } from "lucide-react" // BarChart3 추가
import { cn } from "@/lib/utils" // cn 유틸리티 사용

interface SimulationResultChartProps {
  data: SimulationResultData[]
}

export default function SimulationResultChart({ data }: SimulationResultChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground p-8">시뮬레이션 데이터가 없습니다.</div>;
  }

  // maxRounds는 이제 사용되지 않으므로 주석 처리 또는 삭제
  // const maxRounds = Math.max(0, ...data.map((item) => item.rounds)); // 0을 추가하여 빈 배열일 때 -Infinity 방지

  const getAchievementIcon = (rate: number) => {
    if (rate >= 100) return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
    if (rate >= 80) return <CheckCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" /> // 80 이상도 긍정적으로 CheckCircle 사용
    return <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
  }

  // Badge 스타일 (variant 활용 또는 직접 클래스 조합)
  const getAchievementBadgeVariant = (rate: number): "default" | "secondary" | "destructive" | "outline" => {
    if (rate >= 100) return "default" // Primary (성공)
    if (rate >= 80) return "secondary" // Secondary (거의 달성)
    return "destructive" // Destructive (미흡)
  }

  // Progress 바 색상 (Tailwind CSS 클래스 문자열 반환)
  // shadcn/ui Progress는 value prop으로 진행률을 받고, 기본 색상은 primary입니다.
  // Progress 컴포넌트 자체의 색상을 동적으로 변경하려면, Progress 내부를 커스텀하거나
  // 여러 개의 Progress 컴포넌트를 조건부로 렌더링해야 할 수 있습니다.
  // 여기서는 Progress 바 위에 덧씌우는 div의 배경색을 제어합니다.
  // 또는 Progress 컴포넌트에 직접 className을 동적으로 전달할 수 있습니다.
  const getProgressOverlayColorClass = (rate: number): string => {
    if (rate >= 100) return "bg-green-500 dark:bg-green-400"
    if (rate >= 80) return "bg-yellow-500 dark:bg-yellow-400"
    if (rate >= 60) return "bg-orange-500 dark:bg-orange-400"
    return "bg-red-500 dark:bg-red-400"
  }

  const averageAchievement = data.length > 0 ? data.reduce((sum, item) => sum + (item.achievementRate ?? 0), 0) / data.length : 0;
  const achievedSubjects = data.filter((item) => (item.achievementRate ?? 0) >= 100).length;
  const partiallyAchievedSubjects = data.filter(
      (item) => (item.achievementRate ?? 0) >= 80 && (item.achievementRate ?? 0) < 100,
  ).length;

  return (
      <div className="space-y-6">
        {/* 전체 시뮬레이션 결과 요약 */}
        <div className="p-6 bg-secondary dark:bg-secondary rounded-lg border border-border dark:border-border">
          <h3 className="text-lg font-semibold mb-4 text-center text-foreground flex items-center justify-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary"/>
            이 학습 계획으로 공부할 시 예상 결과
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-card dark:bg-card rounded-lg border border-border shadow-sm">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{achievedSubjects}</div>
              <div className="text-sm text-muted-foreground">목표 완전 달성 과목</div>
              <div className="text-xs text-muted-foreground">(100% 이상)</div>
            </div>
            <div className="text-center p-4 bg-card dark:bg-card rounded-lg border border-border shadow-sm">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{partiallyAchievedSubjects}</div>
              <div className="text-sm text-muted-foreground">거의 달성 과목</div>
              <div className="text-xs text-muted-foreground">(80% 이상)</div>
            </div>
            <div className="text-center p-4 bg-card dark:bg-card rounded-lg border border-border shadow-sm">
              <div className="text-3xl font-bold text-primary dark:text-primary">{averageAchievement.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">전체 평균 달성률</div>
              <div className="text-xs text-muted-foreground">(목표 대비)</div>
            </div>
          </div>
        </div>

        {/* 과목별 상세 결과 */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">📚 과목별 상세 예상 결과</h4>
          {data.map((item) => (
              <div key={item.subjectName || item.subjectName} className="p-4 border border-border rounded-lg bg-card dark:bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-foreground">{item.subjectName}</h3>
                    {getAchievementIcon(item.achievementRate ?? 0)}
                    <Badge variant={getAchievementBadgeVariant(item.achievementRate ?? 0)} > {/* CSS 변수 기반 variant 사용 */}
                      목표의 {(item.achievementRate ?? 0).toFixed(1)}% 달성 예상
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="text-center p-3 bg-muted dark:bg-muted rounded-md">
                    <div className="text-muted-foreground">목표 회독수</div>
                    <div className="font-bold text-lg flex items-center justify-center gap-1 text-foreground">
                      <Target className="w-4 h-4 text-primary" />
                      {item.targetRounds}회
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted dark:bg-muted rounded-md">
                    <div className="text-muted-foreground">예상 달성</div>
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">{item.rounds.toFixed(1)}회</div>
                  </div>
                  <div className="text-center p-3 bg-muted dark:bg-muted rounded-md">
                    <div className="text-muted-foreground">차이</div>
                    <div
                        className={cn(
                            "font-bold text-lg",
                            (item.rounds ?? 0) >= (item.targetRounds ?? 0) ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}
                    >
                      {(item.rounds ?? 0) >= (item.targetRounds ?? 0) ? "+" : ""}
                      {((item.rounds ?? 0) - (item.targetRounds ?? 0)).toFixed(1)}회
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted dark:bg-muted rounded-md">
                    <div className="text-muted-foreground">달성률</div>
                    <div className="font-bold text-lg text-foreground">{(item.achievementRate ?? 0).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">목표 달성 예상도</span>
                    <span className="text-muted-foreground">
                  {item.rounds.toFixed(1)} / {item.targetRounds} 회독
                </span>
                  </div>
                  {/* shadcn/ui Progress 사용 시, value만 전달하고 색상은 CSS 변수로 제어되거나,
                  커스텀 색상을 적용하려면 Progress 컴포넌트 내부 또는 외부에서 스타일링 필요 */}
                  <div className="relative h-4 bg-muted dark:bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500 ease-out",
                            getProgressOverlayColorClass(item.achievementRate ?? 0)
                        )}
                        style={{ width: `${Math.min(((item.rounds ?? 0) / (item.targetRounds || 1)) * 100, 100)}%` }} // targetRounds가 0일 경우 대비
                    />
                  </div>

                  {(item.achievementRate ?? 0) >= 100 && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium pt-1">✅ 목표를 초과 달성할 수 있습니다!</div>
                  )}
                  {(item.achievementRate ?? 0) < 80 && (item.achievementRate ?? 0) !== 0 && ( // 0%일때는 굳이 경고 안띄워도됨
                      <div className="text-sm text-red-600 dark:text-red-400 pt-1">
                        ⚠️ 목표 달성이 어려울 수 있습니다. 학습 시간을 늘리거나 목표를 조정해보세요.
                      </div>
                  )}
                </div>

                {/* 전체 대비 학습량 (이 부분은 색상 변수 사용이 중요) */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>해당 과목의 예상 학습 비중</span> {/* 문구 변경 */}
                    {/* 이 %는 maxRounds 대신, 전체 과목의 총 예상 학습 시간 대비 해당 과목의 예상 학습 시간으로 계산하는 것이 더 의미있을 수 있음 */}
                    <span>{/* {((item.rounds / (maxRounds || 1)) * 100).toFixed(1)}% */} 계산 방식 재고 필요</span>
                  </div>
                  <div className="h-2 w-full bg-muted dark:bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          // width: `${(item.rounds / (maxRounds || 1)) * 100}%`,
                          width: `50%`, // 임시 값, 위 계산 방식 재고 후 반영
                          backgroundColor: item.color || "var(--primary)", // item.color에 CSS 변수 문자열이 있다고 가정
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
