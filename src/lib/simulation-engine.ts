import type { Subject } from "@/types/study-plan"
import type { SimulationResultData } from "@/types/study-plan"

// Define the strategy types
export type SimulationStrategy = "equal" | "priority" | "target-rounds"

// Interface for study plan information
export interface StudyPlan {
  examName: string
  studyStartDate: Date
  studyEndDate: Date
  dailyStudyHours: number
}

// Calculate study period in days
export function calculateStudyDays(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays) // Ensure at least 1 day
}

// Calculate total available study time in hours
export function calculateTotalStudyTime(studyDays: number, dailyStudyHours: number): number {
  return studyDays * dailyStudyHours
}

// Calculate time needed for one complete round of a subject (in hours)
export function calculateSubjectRoundTime(subject: Subject): number {
  // Convert minutes to hours
  return (subject.totalLoad * subject.studySpeedPerPage) / 60
}

// Simulate study rounds based on equal distribution strategy
export function simulateEqualDistribution(subjects: Subject[], totalStudyTime: number): SimulationResultData[] {
  // Calculate total time needed for one round of all subjects
  const totalTimeForOneRound = subjects.reduce((total, subject) => total + calculateSubjectRoundTime(subject), 0)

  // Calculate how many complete rounds we can do with the available time
  const possibleRounds = totalTimeForOneRound > 0 ? totalStudyTime / totalTimeForOneRound : 0

  // Assign equal rounds to all subjects
  return subjects.map((subject, index) => ({
    subjectName: subject.name,
    rounds: possibleRounds,
    targetRounds: subject.targetRounds,
    achievementRate: subject.targetRounds > 0 ? (possibleRounds / subject.targetRounds) * 100 : 0,
    color: `hsl(var(--chart-${(index % 9) + 1}))`,
  }))
}

// Simulate study rounds based on priority distribution strategy
export function simulatePriorityDistribution(subjects: Subject[], totalStudyTime: number): SimulationResultData[] {
  // Calculate total priority points
  const totalPriority = subjects.reduce((sum, subject) => sum + subject.priority, 0)

  // Distribute time based on priority weights
  return subjects.map((subject, index) => {
    const priorityWeight = subject.priority / totalPriority
    const allocatedTime = totalStudyTime * priorityWeight
    const roundTime = calculateSubjectRoundTime(subject)
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

// Simulate study rounds based on target rounds achievement strategy (목표 회독수 기반)
export function simulateTargetRoundsOptimized(subjects: Subject[], totalStudyTime: number): SimulationResultData[] {
  // 목표 회독수와 우선순위를 고려한 최적화된 알고리즘
  const subjectsWithData = subjects.map((subject, index) => ({
    subject,
    roundTime: calculateSubjectRoundTime(subject),
    targetTime: calculateSubjectRoundTime(subject) * subject.targetRounds,
    index,
  }))

  // 우선순위와 목표 회독수를 고려한 정렬 (우선순위 높고, 목표 회독수 적은 순)
  const sortedSubjects = subjectsWithData.sort((a, b) => {
    // 우선순위가 높을수록 먼저
    if (a.subject.priority !== b.subject.priority) {
      return b.subject.priority - a.subject.priority
    }
    // 우선순위가 같으면 목표 회독수가 적은 것부터
    return a.subject.targetRounds - b.subject.targetRounds
  })

  let remainingTime = totalStudyTime
  const results: SimulationResultData[] = []

  // 1단계: 모든 과목의 최소 1회독 보장
  for (const item of sortedSubjects) {
    const { subject, roundTime, index } = item
    const minTime = Math.min(roundTime, remainingTime)
    const achievedRounds = roundTime > 0 ? minTime / roundTime : 0

    results.push({
      subjectName: subject.name,
      rounds: achievedRounds,
      targetRounds: subject.targetRounds,
      achievementRate: subject.targetRounds > 0 ? (achievedRounds / subject.targetRounds) * 100 : 0,
      color: `hsl(var(--chart-${(index % 9) + 1}))`,
    })

    remainingTime -= minTime
    if (remainingTime <= 0) break
  }

  // 2단계: 남은 시간으로 목표 회독수 달성 시도 (우선순위 순)
  while (remainingTime > 0) {
    let timeAllocated = false

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const subject = subjects.find((s) => s.name === result.subjectName)
      if (!subject) continue

      // 목표 회독수에 도달하지 않은 과목에 추가 시간 할당
      if (result.rounds < result.targetRounds) {
        const roundTime = calculateSubjectRoundTime(subject)
        const additionalTime = Math.min(roundTime * 0.1, remainingTime) // 0.1회독씩 추가
        const additionalRounds = roundTime > 0 ? additionalTime / roundTime : 0

        result.rounds += additionalRounds
        result.achievementRate = result.targetRounds > 0 ? (result.rounds / result.targetRounds) * 100 : 0

        remainingTime -= additionalTime
        timeAllocated = true

        if (remainingTime <= 0) break
      }
    }

    // 더 이상 할당할 시간이 없으면 종료
    if (!timeAllocated) break
  }

  return results
}

// Main simulation function
export function runSimulation(
    studyPlan: StudyPlan,
    subjects: Subject[],
    strategy: SimulationStrategy,
): SimulationResultData[] {
  const studyDays = calculateStudyDays(studyPlan.studyStartDate, studyPlan.studyEndDate)
  const totalStudyTime = calculateTotalStudyTime(studyDays, studyPlan.dailyStudyHours)

  switch (strategy) {
    case "equal":
      return simulateEqualDistribution(subjects, totalStudyTime)
    case "priority":
      return simulatePriorityDistribution(subjects, totalStudyTime)
    case "target-rounds":
      return simulateTargetRoundsOptimized(subjects, totalStudyTime)
    default:
      return simulateEqualDistribution(subjects, totalStudyTime)
  }
}
