'use client'

import { useMemo } from 'react'
import katex from 'katex'

interface LessonContentProps {
  content: string
}

// Process markdown with KaTeX math rendering
function processContent(content: string): string {
  let processed = content

  // Markdown tables (must be processed BEFORE KaTeX to avoid splitting issues)
  processed = processed.replace(
    /^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm,
    (_, headerRow, bodyRows) => {
      const headers = headerRow.split('|').map((h: string) => h.trim()).filter(Boolean)
      const headerHtml = headers.map((h: string) => `<th>${h}</th>`).join('')

      const rows = bodyRows.trim().split('\n')
      const bodyHtml = rows.map((row: string) => {
        const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean)
        return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`
      }).join('')

      return `<div class="table-wrapper"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`
    }
  )

  // Process display math blocks ($$...$$)
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      })
      return `<div class="math-block">${html}</div>`
    } catch (e) {
      return `<div class="math-block text-danger-600">[Erreur LaTeX: ${math}]</div>`
    }
  })

  // Process inline math ($...$)
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      })
      return `<span class="math-inline">${html}</span>`
    } catch (e) {
      return `<span class="text-danger-600">[Erreur: ${math}]</span>`
    }
  })

  // Process custom blocks
  // :::definition
  processed = processed.replace(
    /:::definition\s*\n([\s\S]*?):::/g,
    '<div class="definition-box"><strong class="text-primary-700">Définition</strong><div class="mt-2">$1</div></div>'
  )

  // :::theorem
  processed = processed.replace(
    /:::theorem(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-amber-700">${title}</strong>` : '<strong class="text-amber-700">Théorème</strong>'
      return `<div class="theorem-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::property
  processed = processed.replace(
    /:::property(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-emerald-700">${title}</strong>` : '<strong class="text-emerald-700">Propriété</strong>'
      return `<div class="property-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::method
  processed = processed.replace(
    /:::method(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-purple-700">${title}</strong>` : '<strong class="text-purple-700">Méthode</strong>'
      return `<div class="method-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::example
  processed = processed.replace(
    /:::example(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-cyan-700 dark:text-cyan-400">${title}</strong>` : '<strong class="text-cyan-700 dark:text-cyan-400">Exemple</strong>'
      return `<div class="example-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::remark
  processed = processed.replace(
    /:::remark(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-indigo-700 dark:text-indigo-400">${title}</strong>` : '<strong class="text-indigo-700 dark:text-indigo-400">Remarque</strong>'
      return `<div class="remark-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::proof
  processed = processed.replace(
    /:::proof(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-slate-700 dark:text-slate-300">${title}</strong>` : '<strong class="text-slate-700 dark:text-slate-300">Démonstration</strong>'
      return `<div class="proof-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::exercise
  processed = processed.replace(
    /:::exercise(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-orange-700 dark:text-orange-400">${title}</strong>` : '<strong class="text-orange-700 dark:text-orange-400">Exercice</strong>'
      return `<div class="exercise-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::warning
  processed = processed.replace(
    /:::warning\s*\n([\s\S]*?):::/g,
    '<div class="warning-box"><strong class="text-danger-700">Attention</strong><div class="mt-2">$1</div></div>'
  )

  // :::tip
  processed = processed.replace(
    /:::tip\s*\n([\s\S]*?):::/g,
    '<div class="tip-box"><strong class="text-success-700">Astuce</strong><div class="mt-2">$1</div></div>'
  )

  // Process basic markdown
  // Headers
  processed = processed.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  processed = processed.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  processed = processed.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // Bold and italic
  processed = processed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Lists
  processed = processed.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
  processed = processed.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Numbered lists
  processed = processed.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')

  // Paragraphs (simple approach)
  processed = processed.replace(/\n\n+/g, '</p><p>')
  processed = `<p>${processed}</p>`

  // Clean up empty paragraphs and fix block elements inside paragraphs
  processed = processed.replace(/<p>\s*<\/p>/g, '')
  processed = processed.replace(/<p>(\s*<(?:h[1-6]|div|ul|ol|table))/g, '$1')
  processed = processed.replace(/(<\/(?:h[1-6]|div|ul|ol|table)>\s*)<\/p>/g, '$1')

  return processed
}

export function LessonContent({ content }: LessonContentProps) {
  const processedContent = useMemo(() => processContent(content), [content])

  return (
    <div
      className="lesson-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
