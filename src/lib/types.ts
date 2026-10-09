export type Role = 'student' | 'lecturer' | 'administrator'
export type StudyMode = 'mcqs' | 'spotters' | 'viva' | 'notes' | 'ai-tutor'
export const topics = ['Gross Anatomy', 'Osteology', 'Histology', 'Embryology', 'Neuroanatomy'] as const
export const courses = ['MBBS', 'Nursing', 'Physiotherapy', 'Anatomy', 'Other'] as const
export const levels = ['100L', '200L', '300L', '400L', '500L', '600L', 'Postgraduate'] as const
export const modeLabels: Record<StudyMode, string> = { mcqs: 'MCQs', spotters: 'Spotters', viva: 'Viva', notes: 'Notes', 'ai-tutor': 'AI Tutor' }

export interface Profile {
  userId: string
  fullName: string
  email: string
  university: string
  faculty: string
  department: string
  level: string
  role: Role
  requestedRole: Role
  course: string
  interests: string[]
  preferredMode: StudyMode
  avatarKey: string | null
  onboardingComplete: boolean
  dailyGoal: number
  theme: 'light' | 'dark'
}

export interface Attempt {
  id: string
  mode: StudyMode
  topic: string
  total: number
  correct: number
  completedAt: string
  feedback?: string | null
}

export interface LearningProgress { topic: string; sessions: number; total: number; correct: number; lastStudiedAt: string }
export interface Achievement { code: string; name: string; description: string; earnedAt: string }
export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; createdAt?: string }
export interface DashboardData {
  streak: number
  totalAnswered: number
  accuracy: number
  weakestTopic: string | null
  recommendedTopic: string
  todayAnswered: number
  week: { date: string; day: string; total: number; correct: number }[]
  attempts: Attempt[]
  progress: LearningProgress[]
  achievements: Achievement[]
}
