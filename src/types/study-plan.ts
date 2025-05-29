export interface StudyPlan {
  examName: string
  studyStartDate: Date
  studyEndDate: Date
  dailyStudyHours: number
}

export interface Subject {
  id: string
  name: string
  totalLoad: number
  loadUnit: string
  priority: number
  studySpeedPerPage: number
  targetRounds: number
}

export interface SimulationResultData {
  subjectName: string
  rounds: number
  targetRounds: number
  color: string
  achievementRate: number
}

export interface SavedSimulationResult {
  strategy: string
  results: SimulationResultData[]
  studyPlan: StudyPlan
  subjects: Subject[]
  timestamp: string
  totalAchievementRate: number
  bestSubject: string
  worstSubject: string
}
