import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET() {
  try {
    const lessons: { id: string; title: string; track: string }[] = []
    const lessonsDir = path.join(process.cwd(), 'content', 'lessons')

    const tracks = ['rappels', 'spe', 'expertes']

    for (const track of tracks) {
      const trackDir = path.join(lessonsDir, track)
      if (!fs.existsSync(trackDir)) continue

      const files = fs.readdirSync(trackDir).filter((f) => f.endsWith('.mdx'))
      for (const file of files) {
        const content = fs.readFileSync(path.join(trackDir, file), 'utf-8')
        const { data } = matter(content)
        lessons.push({
          id: data.id || file.replace('.mdx', ''),
          title: data.title || file.replace('.mdx', ''),
          track,
        })
      }
    }

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error loading lessons:', error)
    return NextResponse.json([], { status: 500 })
  }
}
