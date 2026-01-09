'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import katex from 'katex'
import {
  FunctionPlot,
  LimitVisualization,
  IntegralVisualization,
  SequencePlot,
  ComplexPlane,
  GraphVisualization,
  ComplexMultiplication,
  TrigonometricCircle,
  MatrixTransformation,
  RiemannSum,
  EpsilonDelta,
  MovingTangent,
  SequenceConvergence,
  NormalDistribution,
  BinomialDistribution,
  SlopeField,
  MarkovChain,
  SieveOfEratosthenes,
} from './InteractiveGraphs'

interface LessonContentProps {
  content: string
}

interface GraphConfig {
  id: string
  type: string
  props: Record<string, unknown>
}

// Extract graph configurations from content
function extractGraphs(content: string): { processed: string; graphs: GraphConfig[] } {
  const graphs: GraphConfig[] = []
  let graphIndex = 0

  const processed = content.replace(
    /:::graph\[(\w+)\]\s*\n([\s\S]*?):::/g,
    (_, type, propsStr) => {
      const id = `graph-${graphIndex++}`
      try {
        // Parse props as JSON-like format
        const props: Record<string, unknown> = {}
        const lines = propsStr.trim().split('\n')
        for (const line of lines) {
          const match = line.match(/^(\w+)\s*[:=]\s*(.+)$/)
          if (match) {
            const [, key, value] = match
            // Try to parse as JSON, otherwise keep as string
            try {
              props[key] = JSON.parse(value)
            } catch {
              props[key] = value.trim().replace(/^["']|["']$/g, '')
            }
          }
        }
        graphs.push({ id, type, props })
      } catch (e) {
        console.error('Error parsing graph props:', e)
      }
      return `<div id="${id}" class="interactive-graph-container"></div>`
    }
  )

  return { processed, graphs }
}

// Process markdown with KaTeX math rendering
function processContent(content: string): { html: string; graphs: GraphConfig[] } {
  // First extract graphs
  const { processed: withoutGraphs, graphs } = extractGraphs(content)
  let processed = withoutGraphs

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
    '<div class="definition-box"><strong class="text-primary-700 dark:text-primary-400">Définition</strong><div class="mt-2">$1</div></div>'
  )

  // :::theorem
  processed = processed.replace(
    /:::theorem(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-amber-700 dark:text-amber-400">${title}</strong>` : '<strong class="text-amber-700 dark:text-amber-400">Théorème</strong>'
      return `<div class="theorem-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::property
  processed = processed.replace(
    /:::property(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-emerald-700 dark:text-emerald-400">${title}</strong>` : '<strong class="text-emerald-700 dark:text-emerald-400">Propriété</strong>'
      return `<div class="property-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::method
  processed = processed.replace(
    /:::method(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-purple-700 dark:text-purple-400">${title}</strong>` : '<strong class="text-purple-700 dark:text-purple-400">Méthode</strong>'
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

  // :::exercise (with collapsible solution)
  processed = processed.replace(
    /:::exercise(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-orange-700 dark:text-orange-400">${title}</strong>` : '<strong class="text-orange-700 dark:text-orange-400">Exercice</strong>'

      // Split content at **Solution** marker (various formats)
      const solutionMatch = content.match(/\*\*Solution\s*:?\*\*\s*([\s\S]*)$/)

      if (solutionMatch) {
        const problemPart = content.slice(0, solutionMatch.index).trim()
        const solutionPart = solutionMatch[1].trim()

        return `<div class="exercise-box">${titleHtml}<div class="mt-2">${problemPart}</div><details class="exercise-solution"><summary class="exercise-solution-toggle">Voir la solution</summary><div class="exercise-solution-content">${solutionPart}</div></details></div>`
      }

      // No solution marker found, render as before
      return `<div class="exercise-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::warning
  processed = processed.replace(
    /:::warning\s*\n([\s\S]*?):::/g,
    '<div class="warning-box"><strong class="text-danger-700 dark:text-danger-400">Attention</strong><div class="mt-2">$1</div></div>'
  )

  // :::erreur (common mistakes / pitfalls)
  processed = processed.replace(
    /:::erreur(?:\[([^\]]*)\])?\s*\n([\s\S]*?):::/g,
    (_, title, content) => {
      const titleHtml = title ? `<strong class="text-rose-700 dark:text-rose-400">${title}</strong>` : '<strong class="text-rose-700 dark:text-rose-400">Erreur fréquente</strong>'
      return `<div class="erreur-box">${titleHtml}<div class="mt-2">${content}</div></div>`
    }
  )

  // :::tip
  processed = processed.replace(
    /:::tip\s*\n([\s\S]*?):::/g,
    '<div class="tip-box"><strong class="text-success-700 dark:text-success-400">Astuce</strong><div class="mt-2">$1</div></div>'
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

  return { html: processed, graphs }
}

// Graph renderer component
function GraphRenderer({ config }: { config: GraphConfig }) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const el = document.getElementById(config.id)
    if (el) setContainer(el)
  }, [config.id])

  if (!container) return null

  const GraphComponent = (() => {
    // Cast through unknown to satisfy TypeScript
    const props = config.props as unknown
    switch (config.type) {
      case 'FunctionPlot':
        return <FunctionPlot {...(props as React.ComponentProps<typeof FunctionPlot>)} />
      case 'LimitVisualization':
        return <LimitVisualization {...(props as React.ComponentProps<typeof LimitVisualization>)} />
      case 'IntegralVisualization':
        return <IntegralVisualization {...(props as React.ComponentProps<typeof IntegralVisualization>)} />
      case 'SequencePlot':
        return <SequencePlot {...(props as React.ComponentProps<typeof SequencePlot>)} />
      case 'ComplexPlane':
        return <ComplexPlane {...(props as React.ComponentProps<typeof ComplexPlane>)} />
      case 'GraphVisualization':
        return <GraphVisualization {...(props as React.ComponentProps<typeof GraphVisualization>)} />
      case 'ComplexMultiplication':
        return <ComplexMultiplication {...(props as React.ComponentProps<typeof ComplexMultiplication>)} />
      case 'TrigonometricCircle':
        return <TrigonometricCircle {...(props as React.ComponentProps<typeof TrigonometricCircle>)} />
      case 'MatrixTransformation':
        return <MatrixTransformation {...(props as React.ComponentProps<typeof MatrixTransformation>)} />
      case 'RiemannSum':
        return <RiemannSum {...(props as React.ComponentProps<typeof RiemannSum>)} />
      case 'EpsilonDelta':
        return <EpsilonDelta {...(props as React.ComponentProps<typeof EpsilonDelta>)} />
      case 'MovingTangent':
        return <MovingTangent {...(props as React.ComponentProps<typeof MovingTangent>)} />
      case 'SequenceConvergence':
        return <SequenceConvergence {...(props as React.ComponentProps<typeof SequenceConvergence>)} />
      case 'NormalDistribution':
        return <NormalDistribution {...(props as React.ComponentProps<typeof NormalDistribution>)} />
      case 'BinomialDistribution':
        return <BinomialDistribution {...(props as React.ComponentProps<typeof BinomialDistribution>)} />
      case 'SlopeField':
        return <SlopeField {...(props as React.ComponentProps<typeof SlopeField>)} />
      case 'MarkovChain':
        return <MarkovChain {...(props as React.ComponentProps<typeof MarkovChain>)} />
      case 'SieveOfEratosthenes':
        return <SieveOfEratosthenes {...(props as React.ComponentProps<typeof SieveOfEratosthenes>)} />
      default:
        return <div className="text-danger-600">Type de graphe inconnu: {config.type}</div>
    }
  })()

  return createPortal(GraphComponent, container)
}

export function LessonContent({ content }: LessonContentProps) {
  const { html, graphs } = useMemo(() => processContent(content), [content])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <div
        className="lesson-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {mounted && graphs.map((config) => (
        <GraphRenderer key={config.id} config={config} />
      ))}
    </>
  )
}
