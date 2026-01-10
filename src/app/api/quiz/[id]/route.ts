import { NextRequest, NextResponse } from 'next/server'
import { getComprehensionExercises, getLessonById, getQuizById } from '@/lib/content'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quiz = getQuizById(params.id)

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const lesson = getLessonById(quiz.lessonId)
  const comprehensionExercise = getComprehensionExercises(quiz.lessonId)[0]
  const prereqIds = Array.from(
    new Set(
      quiz.questions
        .map((question) => question.prereqRef)
        .filter((prereqId): prereqId is string => Boolean(prereqId))
    )
  )
  const prereqLessons = prereqIds.reduce<Record<string, { id: string; title: string; track: string; slug: string }>>(
    (acc, prereqId) => {
      const prereqLesson = getLessonById(prereqId)
      if (prereqLesson) {
        acc[prereqId] = {
          id: prereqLesson.id,
          title: prereqLesson.title,
          track: prereqLesson.track,
          slug: prereqLesson.slug,
        }
      }
      return acc
    },
    {}
  )

  return NextResponse.json({
    ...quiz,
    lessonSlug: lesson?.slug,
    lessonTrack: lesson?.track,
    prereqLessons,
    comprehensionExerciseId: comprehensionExercise?.id,
  })
}
