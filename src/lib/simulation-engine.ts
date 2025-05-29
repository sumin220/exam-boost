import type { Subject } from "@/types/study-plan"
import type { SimulationResultData } from "@/types/study-plan"

// Define the strategy types
export type SimulationStrategy = "equal" | "priority" | "rounds"

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
      color: `hsl(var(--chart-${(index % 9) + 1}))`,
    }
  })
}

// Simulate study rounds based on target rounds achievement strategy
export function simulateTargetRounds(subjects: Subject[], totalStudyTime: number): SimulationResultData[] {
  // Sort subjects by priority (highest first)
  const sortedSubjects = [...subjects].sort((a, b) => b.priority - a.priority)

  // Calculate time needed for one round of each subject
  const subjectRoundTimes = sortedSubjects.map((subject) => ({
    subject,
    roundTime: calculateSubjectRoundTime(subject),
  }))

  // Allocate time greedily based on priority
  let remainingTime = totalStudyTime
  const results: SimulationResultData[] = []

  for (let i = 0; i < subjectRoundTimes.length; i++) {
    const { subject, roundTime } = subjectRoundTimes[i]

    // Target rounds based on priority (higher priority = more rounds)
    const targetRounds = Math.min(5, subject.priority)

    // Calculate time needed for target rounds
    const neededTime = roundTime * targetRounds

    // Allocate time (limited by remaining time)
    const allocatedTime = Math.min(neededTime, remainingTime)
    const achievedRounds = roundTime > 0 ? allocatedTime / roundTime : 0

    results.push({
      subjectName: subject.name,
      rounds: achievedRounds,
      color: `hsl(var(--chart-${(i % 9) + 1}))`,
    })

    remainingTime -= allocatedTime
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
    case "rounds":
      return simulateTargetRounds(subjects, totalStudyTime)
    default:
      return simulateEqualDistribution(subjects, totalStudyTime)
  }
}
