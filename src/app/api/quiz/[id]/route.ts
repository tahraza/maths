import { NextRequest, NextResponse } from 'next/server'
import { getLessonById, getQuizById } from '@/lib/content'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const quiz = getQuizById(params.id)

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const lesson = getLessonById(quiz.lessonId)

  return NextResponse.json({
    ...quiz,
    lessonSlug: lesson?.slug,
    lessonTrack: lesson?.track,
  })
}
