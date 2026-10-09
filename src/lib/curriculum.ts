// Shared assessment taxonomy used by the question engine, its API, and the learning UI.

export const subjects = ['Gross Anatomy', 'Osteology', 'Histology', 'Embryology', 'Neuroanatomy', 'Surface Anatomy', 'Radiological Anatomy'] as const
export type Subject = typeof subjects[number]

export const regions = [
  { id: 'Upper Limb', topics: ['Clavicle', 'Scapula', 'Humerus', 'Radius', 'Ulna', 'Carpals', 'Metacarpals', 'Phalanges of the Hand'] },
  { id: 'Lower Limb', topics: ['Hip Bone', 'Femur', 'Patella', 'Tibia', 'Fibula', 'Tarsals', 'Metatarsals', 'Phalanges of the Foot'] },
  { id: 'Head and Neck', topics: ['Skull', 'Mandible', 'Maxilla', 'Cranial Fossae', 'Cranial Nerves'] },
  { id: 'Thorax', topics: ['Thorax'] },
  { id: 'Abdomen', topics: ['Abdomen'] },
  { id: 'Pelvis', topics: ['Pelvis'] },
  { id: 'Perineum', topics: ['Perineum'] },
  { id: 'Brain', topics: ['Brain'] },
  { id: 'Spinal Cord', topics: ['Spinal Cord'] },
] as const
export type Region = typeof regions[number]['id']
export const regionIds = regions.map(region => region.id) as Region[]
export const curriculumTopics = regions.flatMap(region => region.topics) as string[]
export function regionOf(topic: string): Region {
  return regions.find(region => (region.topics as readonly string[]).includes(topic))?.id ?? 'Upper Limb'
}

export const facets = ['Features', 'Side Determination', 'Surfaces', 'Borders', 'Angles', 'Processes', 'Relations', 'Muscle Attachments', 'Ligament Attachments', 'Blood Supply', 'Nerve Supply', 'Lymphatic Drainage', 'Ossification', 'Histology', 'Embryology', 'Development', 'Clinical Anatomy', 'Surface Anatomy', 'Radiological Anatomy'] as const
export type Facet = typeof facets[number]

export const questionTypes = [
  { id: 'sba', label: 'Single best answer' },
  { id: 'multiple', label: 'Multiple correct answers' },
  { id: 'true-false', label: 'True / false' },
  { id: 'clinical', label: 'Clinical scenario' },
  { id: 'spotter', label: 'Spotter' },
  { id: 'viva', label: 'Viva' },
  { id: 'recall', label: 'Recall' },
  { id: 'applied', label: 'Applied anatomy' },
  { id: 'integrated', label: 'Integrated' },
  { id: 'rapid-fire', label: 'Rapid-fire' },
  { id: 'professional', label: 'Professional examination' },
] as const
export type QuestionType = typeof questionTypes[number]['id']
export const questionTypeIds = questionTypes.map(type => type.id) as QuestionType[]
export const objectiveTypeIds = questionTypeIds.filter(type => type !== 'viva')
export const typeLabel = (type: string) => questionTypes.find(item => item.id === type)?.label ?? type

export const difficulties = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'expert', label: 'Expert' },
  { id: 'professional', label: 'Professional examination mode' },
] as const
export type Difficulty = typeof difficulties[number]['id']
export const difficultyIds = difficulties.map(level => level.id) as Difficulty[]
export const difficultyLabel = (level: string) => difficulties.find(item => item.id === level)?.label ?? level

export const spotterCategories = ['Bones', 'Cadavers', 'Histology Slides', 'Embryology Images', 'X-rays', 'CT Scans', 'MRI Images'] as const
export type SpotterCategory = typeof spotterCategories[number]

/** Spaced repetition intervals, in days, for each review stage. */
export const reviewIntervals = [1, 3, 7, 14, 30] as const

export const examLengths = [20, 50, 100] as const

/** A display-ready question. `correct` is only present once grading may be revealed. */
export interface AssessmentQuestion {
  id: string
  subject: string
  region: string
  topic: string
  subtopic: string
  type: QuestionType
  difficulty: Difficulty
  stem: string
  options: string[]
  multiSelect: boolean
  spotterCategory: string | null
  specimen: string | null
  hasImage: boolean
  source: 'starter' | 'ai'
  reveal?: QuestionReveal
}

export interface QuestionReveal {
  correct: number[]
  explanation: string
  distractorRationale: string[]
  clinicalCorrelation: string
  learningObjective: string
}

export type SessionKind = 'practice' | 'exam' | 'review' | 'reinforce' | 'spotter'

export interface AssessmentSession {
  id: string
  kind: SessionKind
  label: string
  durationSeconds: number | null
  startedAt: string
  questions: AssessmentQuestion[]
  generated: number
  notice: string | null
  vivaPrompts?: { topic: string; subtopic: string }[]
}

export interface Recommendation { subject: string; topic: string; subtopic: string; accuracy: number; reason: string }
export interface RecommendedActivity { label: string; description: string; href: string }

export interface AssessmentResult {
  sessionId: string
  kind: SessionKind
  total: number
  correct: number
  percentage: number
  timeSeconds: number
  late: boolean
  questions: (AssessmentQuestion & { reveal: QuestionReveal; selected: number[]; isCorrect: boolean; timeMs: number })[]
  breakdown: { dimension: 'subject' | 'topic' | 'type' | 'difficulty'; label: string; total: number; correct: number }[]
  recommendations: Recommendation[]
  activities: RecommendedActivity[]
  newBadges: { code: string; name: string }[]
}

export interface VivaScores { accuracy: number; completeness: number; terminology: number; understanding: number }
export interface VivaTurn { question: string; answer?: string; scores?: VivaScores; feedback?: string; corrections?: string[]; modelAnswer?: string }
export interface VivaSessionView { id: string; subject: string; topic: string; subtopic: string; difficulty: Difficulty; status: 'active' | 'completed'; turns: VivaTurn[]; averageScore: number | null; updatedAt: string }

export interface ConceptStat { subject: string; topic: string; subtopic: string; total: number; correct: number; accuracy: number; averageSeconds: number; repeatedMistakes: number }
export interface Insights {
  totalAnswered: number
  accuracy: number
  studyMinutes: number
  readiness: { score: number; label: string; parts: { label: string; value: number }[] }
  trend: { week: string; total: number; accuracy: number | null }[]
  trendDelta: number | null
  subjectMastery: { subject: string; total: number; mastery: number }[]
  topicMastery: { topic: string; region: string; total: number; mastery: number }[]
  weakAreas: ConceptStat[]
  strongAreas: ConceptStat[]
  mostMissed: { questionId: string; stem: string; topic: string; subtopic: string; misses: number }[]
  dueReviews: { conceptKey: string; subject: string; topic: string; subtopic: string; stage: number; dueAt: string; lapses: number }[]
  upcomingReviews: number
  vivaAverage: number | null
  vivaSessions: number
  examHistory: { id: string; label: string; percentage: number; submittedAt: string }[]
  bankSize: number
}

export function conceptKey(topic: string, subtopic: string) {
  return `${topic}::${subtopic}`
}

export function practiceHref(params: Record<string, string | undefined>, mode = 'mcqs') {
  const search = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])))
  return `/learn/${mode}${search.size ? `?${search.toString()}` : ''}`
}
