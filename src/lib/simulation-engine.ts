import type { Subject } from "@/types/study-plan"
import type { SimulationResultData } from "@/types/study-plan"

// 시뮬레이션 전략 타입 정의 (균등 분배, 우선순위 기반, 목표 회독수 기반)
export type SimulationStrategy = "equal" | "priority" | "target-rounds"

// 학습 계획 정보를 담는 인터페이스
export interface StudyPlan {
  examName: string          // 시험명
  studyStartDate: Date      // 학습 시작일
  studyEndDate: Date        // 학습 종료일 (시험일)
  dailyStudyHours: number   // 일일 학습 가능 시간
}

// 학습 기간을 일 단위로 계산하는 함수
export function calculateStudyDays(startDate: Date, endDate: Date): number {
  // 시작일과 종료일의 시간 차이를 밀리초로 계산
  const diffTime = endDate.getTime() - startDate.getTime()
  // 밀리초를 일 단위로 변환 (1일 = 1000ms * 60초 * 60분 * 24시간)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  // 최소 1일은 보장하여 반환 (음수 방지)
  return Math.max(1, diffDays)
}

// 총 가용 학습 시간을 시간 단위로 계산하는 함수
export function calculateTotalStudyTime(studyDays: number, dailyStudyHours: number): number {
  // 학습 일수 × 일일 학습 시간 = 총 가용 학습 시간
  return studyDays * dailyStudyHours
}

// 특정 과목의 1회독에 필요한 시간을 계산하는 함수 (시간 단위)
export function calculateSubjectRoundTime(subject: Subject): number {
  // 총 학습량(페이지) × 페이지당 학습 속도(분) ÷ 60 = 시간 단위 변환
  // 예: 300페이지 × 20분/페이지 ÷ 60 = 100시간
  return (subject.totalLoad * subject.studySpeedPerPage) / 60
}

// 균등 분배 전략 기반 시뮬레이션 함수 - 모든 과목에 동일한 시간 배분
export function simulateEqualDistribution(subjects: Subject[], totalStudyTime: number): SimulationResultData[] {
  // 모든 과목의 1회독에 필요한 총 시간 계산 (배열 자료구조의 reduce 메서드 활용)
  const totalTimeForOneRound = subjects.reduce((total, subject) => total + calculateSubjectRoundTime(subject), 0)

  // 가용 시간으로 몇 회독이 가능한지 계산 (전체 시간 ÷ 1회독 소요 시간)
  const possibleRounds = totalTimeForOneRound > 0 ? totalStudyTime / totalTimeForOneRound : 0

  // 모든 과목에 동일한 회독수 할당 및 결과 데이터 생성 (배열 자료구조의 map 메서드 활용)
  return subjects.map((subject, index) => ({
    subjectName: subject.name,
    rounds: possibleRounds,                    // 실제 달성 가능 회독수
    targetRounds: subject.targetRounds,        // 목표 회독수
    achievementRate: subject.targetRounds > 0 ? (possibleRounds / subject.targetRounds) * 100 : 0, // 목표 달성률
    color: `hsl(var(--chart-${(index % 9) + 1}))`, // 차트 색상 지정
  }))
}

// 우선순위 기반 분배 전략 시뮬레이션 함수 - 과목별 우선순위에 따른 가중치 적용
export function simulatePriorityDistribution(subjects: Subject[], totalStudyTime: number): SimulationResultData[] {
  // 모든 과목의 우선순위 점수 합계 계산 (가중치 계산을 위한 분모)
  const totalPriority = subjects.reduce((sum, subject) => sum + subject.priority, 0)

  // 각 과목별로 우선순위 비율에 따른 시간 분배 및 회독수 계산
  return subjects.map((subject, index) => {
    // 해당 과목의 우선순위 가중치 계산 (개별 우선순위 ÷ 전체 우선순위 합)
    const priorityWeight = subject.priority / totalPriority
    // 가중치에 따른 할당 시간 계산
    const allocatedTime = totalStudyTime * priorityWeight
    // 해당 과목의 1회독 소요 시간
    const roundTime = calculateSubjectRoundTime(subject)
    // 할당된 시간으로 가능한 회독수 계산
    const possibleRounds = roundTime > 0 ? allocatedTime / roundTime : 0

    return {
      subjectName: subject.name,
      rounds: possibleRounds,
      targetRounds: subject.targetRounds,
      achievementRate: subject.targetRounds > 0 ? (possibleRounds / subject.targetRounds) * 100 : 0,
      color: `hsl(var(--chart-${(index % 9) + 1}))`,
    }
  })
}

// 목표 회독수 달성 최적화 전략 시뮬레이션 함수 - 배낭 문제 알고리즘 응용
export function simulateTargetRoundsOptimized(subjects: Subject[], totalStudyTime: number): SimulationResultData[] {
  // 각 과목의 상세 데이터를 포함한 객체 배열 생성 (해시맵 자료구조 개념 적용)
  const subjectsWithData = subjects.map((subject, index) => ({
    subject,                                                           // 과목 정보
    roundTime: calculateSubjectRoundTime(subject),                    // 1회독 소요 시간
    targetTime: calculateSubjectRoundTime(subject) * subject.targetRounds, // 목표 달성 필요 시간
    index,                                                            // 원본 인덱스 보존
  }))

  // 우선순위 큐 알고리즘 적용: 우선순위 높고 목표 회독수 적은 순으로 정렬
  const sortedSubjects = subjectsWithData.sort((a, b) => {
    // 1차 정렬 기준: 우선순위가 높을수록 먼저 처리 (내림차순)
    if (a.subject.priority !== b.subject.priority) {
      return b.subject.priority - a.subject.priority
    }
    // 2차 정렬 기준: 우선순위가 같으면 목표 회독수가 적은 것부터 처리 (오름차순)
    return a.subject.targetRounds - b.subject.targetRounds
  })

  let remainingTime = totalStudyTime  // 남은 가용 시간 추적
  const results: SimulationResultData[] = []

  // 1단계: 그리디 알고리즘 적용 - 모든 과목의 최소 1회독 보장
  for (const item of sortedSubjects) {
    const { subject, roundTime, index } = item
    // 1회독 시간과 남은 시간 중 작은 값을 할당 (실현 가능한 최대 시간)
    const minTime = Math.min(roundTime, remainingTime)
    // 할당된 시간으로 달성 가능한 회독수 계산
    const achievedRounds = roundTime > 0 ? minTime / roundTime : 0

    // 결과 배열에 과목별 시뮬레이션 결과 추가
    results.push({
      subjectName: subject.name,
      rounds: achievedRounds,
      targetRounds: subject.targetRounds,
      achievementRate: subject.targetRounds > 0 ? (achievedRounds / subject.targetRounds) * 100 : 0,
      color: `hsl(var(--chart-${(index % 9) + 1}))`,
    })

    // 사용한 시간만큼 남은 시간에서 차감
    remainingTime -= minTime
    if (remainingTime <= 0) break // 시간이 모두 소진되면 종료
  }

  // 2단계: 동적 계획법 개념 적용 - 남은 시간으로 목표 회독수 달성 최적화
  while (remainingTime > 0) {
    let timeAllocated = false // 시간 할당 여부 플래그

    // 모든 과목을 순회하며 추가 시간 할당 검토
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const subject = subjects.find((s) => s.name === result.subjectName)
      if (!subject) continue

      // 목표 회독수에 도달하지 않은 과목에만 추가 시간 할당
      if (result.rounds < result.targetRounds) {
        const roundTime = calculateSubjectRoundTime(subject)
        // 0.1회독 단위로 점진적 할당 (세밀한 최적화)
        const additionalTime = Math.min(roundTime * 0.1, remainingTime)
        const additionalRounds = roundTime > 0 ? additionalTime / roundTime : 0

        // 회독수 및 달성률 업데이트
        result.rounds += additionalRounds
        result.achievementRate = result.targetRounds > 0 ? (result.rounds / result.targetRounds) * 100 : 0

        remainingTime -= additionalTime
        timeAllocated = true

        if (remainingTime <= 0) break
      }
    }

    // 더 이상 할당할 시간이 없거나 모든 목표가 달성되면 종료
    if (!timeAllocated) break
  }

  return results
}

// 메인 시뮬레이션 실행 함수 - 전략 패턴 적용
export function runSimulation(
    studyPlan: StudyPlan,
    subjects: Subject[],
    strategy: SimulationStrategy,
): SimulationResultData[] {
  // 학습 기간 및 총 가용 시간 계산
  const studyDays = calculateStudyDays(studyPlan.studyStartDate, studyPlan.studyEndDate)
  const totalStudyTime = calculateTotalStudyTime(studyDays, studyPlan.dailyStudyHours)

  // 선택된 전략에 따른 시뮬레이션 실행 (Switch-Case 패턴)
  switch (strategy) {
    case "equal":
      return simulateEqualDistribution(subjects, totalStudyTime)
    case "priority":
      return simulatePriorityDistribution(subjects, totalStudyTime)
    case "target-rounds":
      return simulateTargetRoundsOptimized(subjects, totalStudyTime)
    default:
      return simulateEqualDistribution(subjects, totalStudyTime) // 기본값: 균등 분배
  }
}
