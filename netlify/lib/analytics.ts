import type { DashboardData, Attempt, LearningProgress, Achievement } from '../../src/lib/types'

export function summarize(attempts: Attempt[], progress: LearningProgress[], achievements: Achievement[], interests: string[]): DashboardData {
  const today = new Date().toISOString().slice(0, 10)
  const studiedDates = new Set(attempts.map(attempt => attempt.completedAt.slice(0, 10)))
  const cursor = new Date(`${today}T00:00:00Z`)
  let streak = 0
  if (!studiedDates.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1)
  while (studiedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  const totalAnswered = attempts.reduce((total, attempt) => total + (attempt.mode === 'viva' ? 0 : attempt.total), 0)
  const totalCorrect = attempts.reduce((total, attempt) => total + (attempt.mode === 'viva' ? 0 : attempt.correct), 0)
  const weakest = progress.filter(topic => topic.total > 0).sort((first, second) => first.correct / first.total - second.correct / second.total)[0]
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() - (6 - index))
    const dateKey = date.toISOString().slice(0, 10)
    const daily = attempts.filter(attempt => attempt.completedAt.slice(0, 10) === dateKey && attempt.mode !== 'viva')
    return { date: dateKey, day: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }), total: daily.reduce((total, attempt) => total + attempt.total, 0), correct: daily.reduce((total, attempt) => total + attempt.correct, 0) }
  })
  return { streak, totalAnswered, accuracy: totalAnswered ? Math.round(totalCorrect / totalAnswered * 100) : 0, weakestTopic: weakest?.topic ?? null, recommendedTopic: weakest?.topic ?? interests[0] ?? 'Gross Anatomy', todayAnswered: week[6].total, week, attempts: attempts.slice(0, 30), progress, achievements }
}
