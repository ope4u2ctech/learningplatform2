import type { DashboardData } from './types'

export const demoDashboard: DashboardData = {
  streak: 7,
  totalAnswered: 248,
  accuracy: 84,
  weakestTopic: 'Neuroanatomy',
  recommendedTopic: 'Neuroanatomy',
  todayAnswered: 14,
  week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({ date: `preview-${index}`, day, total: [15, 26, 21, 36, 29, 47, 39][index], correct: [12, 22, 17, 30, 25, 41, 33][index] })),
  attempts: [],
  progress: [
    { topic: 'Osteology', sessions: 6, total: 40, correct: 28, lastStudiedAt: '' },
    { topic: 'Neuroanatomy', sessions: 3, total: 25, correct: 12, lastStudiedAt: '' },
  ],
  achievements: [{ code: 'first-session', name: 'First steps', description: 'Completed your first anatomy study session.', earnedAt: '' }],
}
