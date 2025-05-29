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
}

export interface SimulationResultData {
  subjectName: string
  rounds: number
  color: string
}
