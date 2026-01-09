'use client'

import { useState, useMemo } from 'react'

interface ProbabilityTreeProps {
  /** Titre */
  title?: string
  /** Configuration initiale */
  preset?: 'urne' | 'maladie' | 'qcm' | 'custom'
}

interface TreeNode {
  id: string
  label: string
  probability: number
  children?: TreeNode[]
  depth: number
}

// Format probability as fraction or decimal
const fmt = (p: number, asFrac = true): string => {
  if (asFrac) {
    const fracs: [number, string][] = [
      [1, '1'],
      [0, '0'],
      [0.5, '1/2'],
      [1 / 3, '1/3'],
      [2 / 3, '2/3'],
      [0.25, '1/4'],
      [0.75, '3/4'],
      [0.2, '1/5'],
      [0.4, '2/5'],
      [0.6, '3/5'],
      [0.8, '4/5'],
      [1 / 6, '1/6'],
      [5 / 6, '5/6'],
      [0.1, '1/10'],
      [0.3, '3/10'],
      [0.7, '7/10'],
      [0.9, '9/10'],
    ]
    for (const [val, str] of fracs) {
      if (Math.abs(p - val) < 0.001) return str
    }
  }
  return p.toFixed(3).replace(/\.?0+$/, '')
}

const PRESETS = {
  urne: {
    name: 'Urne (tirage avec remise)',
    tree: {
      id: 'root',
      label: 'Départ',
      probability: 1,
      depth: 0,
      children: [
        {
          id: 'R1',
          label: 'Rouge',
          probability: 0.6,
          depth: 1,
          children: [
            { id: 'R1R2', label: 'Rouge', probability: 0.6, depth: 2 },
            { id: 'R1B2', label: 'Bleu', probability: 0.4, depth: 2 },
          ],
        },
        {
          id: 'B1',
          label: 'Bleu',
          probability: 0.4,
          depth: 1,
          children: [
            { id: 'B1R2', label: 'Rouge', probability: 0.6, depth: 2 },
            { id: 'B1B2', label: 'Bleu', probability: 0.4, depth: 2 },
          ],
        },
      ],
    },
    labels: ['1er tirage', '2ème tirage'],
  },
  maladie: {
    name: 'Test médical',
    tree: {
      id: 'root',
      label: 'Départ',
      probability: 1,
      depth: 0,
      children: [
        {
          id: 'M',
          label: 'Malade',
          probability: 0.01,
          depth: 1,
          children: [
            { id: 'M+', label: 'Test +', probability: 0.95, depth: 2 },
            { id: 'M-', label: 'Test -', probability: 0.05, depth: 2 },
          ],
        },
        {
          id: 'S',
          label: 'Sain',
          probability: 0.99,
          depth: 1,
          children: [
            { id: 'S+', label: 'Test +', probability: 0.02, depth: 2 },
            { id: 'S-', label: 'Test -', probability: 0.98, depth: 2 },
          ],
        },
      ],
    },
    labels: ['État', 'Résultat test'],
  },
  qcm: {
    name: 'QCM (2 questions)',
    tree: {
      id: 'root',
      label: 'Départ',
      probability: 1,
      depth: 0,
      children: [
        {
          id: 'Q1V',
          label: 'Q1 Vrai',
          probability: 0.25,
          depth: 1,
          children: [
            { id: 'Q1VQ2V', label: 'Q2 Vrai', probability: 0.25, depth: 2 },
            { id: 'Q1VQ2F', label: 'Q2 Faux', probability: 0.75, depth: 2 },
          ],
        },
        {
          id: 'Q1F',
          label: 'Q1 Faux',
          probability: 0.75,
          depth: 1,
          children: [
            { id: 'Q1FQ2V', label: 'Q2 Vrai', probability: 0.25, depth: 2 },
            { id: 'Q1FQ2F', label: 'Q2 Faux', probability: 0.75, depth: 2 },
          ],
        },
      ],
    },
    labels: ['Question 1', 'Question 2'],
  },
  custom: {
    name: 'Personnalisé',
    tree: {
      id: 'root',
      label: 'Départ',
      probability: 1,
      depth: 0,
      children: [
        {
          id: 'A',
          label: 'A',
          probability: 0.5,
          depth: 1,
          children: [
            { id: 'A1', label: 'A₁', probability: 0.5, depth: 2 },
            { id: 'A2', label: 'A₂', probability: 0.5, depth: 2 },
          ],
        },
        {
          id: 'B',
          label: 'B',
          probability: 0.5,
          depth: 1,
          children: [
            { id: 'B1', label: 'B₁', probability: 0.5, depth: 2 },
            { id: 'B2', label: 'B₂', probability: 0.5, depth: 2 },
          ],
        },
      ],
    },
    labels: ['Niveau 1', 'Niveau 2'],
  },
}

// Calculate path probabilities for all leaves
function calculateLeafProbabilities(node: TreeNode, pathProb = 1): { path: string[]; prob: number }[] {
  if (!node.children || node.children.length === 0) {
    return [{ path: [node.label], prob: pathProb * node.probability }]
  }

  const results: { path: string[]; prob: number }[] = []
  for (const child of node.children) {
    const childResults = calculateLeafProbabilities(child, pathProb * node.probability)
    for (const result of childResults) {
      results.push({
        path: node.depth > 0 ? [node.label, ...result.path] : result.path,
        prob: result.prob,
      })
    }
  }
  return results
}

export function ProbabilityTree({
  title,
  preset = 'urne',
}: ProbabilityTreeProps) {
  const [currentPreset, setCurrentPreset] = useState<keyof typeof PRESETS>(preset)
  const [tree, setTree] = useState<TreeNode>(PRESETS[preset].tree)
  const [labels, setLabels] = useState(PRESETS[preset].labels)
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null)

  // SVG dimensions
  const W = 700
  const H = 400
  const levelWidth = W / 3
  const nodeRadius = 25

  // Calculate all leaf probabilities
  const leafProbs = useMemo(() => calculateLeafProbabilities(tree), [tree])

  // Update probability for a node
  const updateProbability = (nodeId: string, newProb: number) => {
    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, probability: newProb }
      }
      if (node.children) {
        // If updating a child, also update sibling to maintain sum = 1
        const updatedChildren = node.children.map((child) => {
          if (child.id === nodeId) {
            return { ...child, probability: newProb }
          }
          return child
        })

        // Check if this node contains the target
        const hasTarget = node.children.some((c) => c.id === nodeId)
        if (hasTarget && node.children.length === 2) {
          const targetIdx = node.children.findIndex((c) => c.id === nodeId)
          const otherIdx = 1 - targetIdx
          updatedChildren[otherIdx] = {
            ...updatedChildren[otherIdx],
            probability: Math.max(0, 1 - newProb),
          }
        }

        return {
          ...node,
          children: updatedChildren.map((c) => updateNode(c)),
        }
      }
      return node
    }

    setTree(updateNode(tree))
  }

  // Handle preset change
  const handlePresetChange = (p: keyof typeof PRESETS) => {
    setCurrentPreset(p)
    setTree(PRESETS[p].tree)
    setLabels(PRESETS[p].labels)
    setHighlightedPath(null)
  }

  // Get positions for nodes
  const getNodePositions = (node: TreeNode, depth: number, yStart: number, yEnd: number): {
    node: TreeNode
    x: number
    y: number
    parentX?: number
    parentY?: number
  }[] => {
    const x = 50 + depth * levelWidth
    const y = (yStart + yEnd) / 2
    const positions: ReturnType<typeof getNodePositions> = [{ node, x, y }]

    if (node.children && node.children.length > 0) {
      const childHeight = (yEnd - yStart) / node.children.length
      node.children.forEach((child, i) => {
        const childPositions = getNodePositions(
          child,
          depth + 1,
          yStart + i * childHeight,
          yStart + (i + 1) * childHeight
        )
        childPositions.forEach((cp) => {
          if (cp.node.id === child.id) {
            cp.parentX = x
            cp.parentY = y
          }
          positions.push(cp)
        })
      })
    }

    return positions
  }

  const nodePositions = useMemo(() => getNodePositions(tree, 0, 30, H - 30), [tree])

  // Check if a node is on the highlighted path
  const isOnHighlightedPath = (nodeId: string): boolean => {
    if (!highlightedPath) return false
    return highlightedPath.includes(nodeId)
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {title && (
        <h4 className="border-b border-gray-700 px-4 py-3 text-center text-sm font-medium text-gray-200">
          {title}
        </h4>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Tree visualization */}
        <div className="flex-1 overflow-x-auto p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: 350 }}>
            {/* Level labels */}
            <text x={50} y={20} fill="rgba(255,255,255,0.5)" fontSize={11} textAnchor="middle">
              Départ
            </text>
            {labels.map((label, i) => (
              <text
                key={i}
                x={50 + (i + 1) * levelWidth}
                y={20}
                fill="rgba(255,255,255,0.5)"
                fontSize={11}
                textAnchor="middle"
              >
                {label}
              </text>
            ))}

            {/* Edges */}
            {nodePositions
              .filter((np) => np.parentX !== undefined)
              .map((np) => {
                const highlighted = isOnHighlightedPath(np.node.id)
                return (
                  <g key={`edge-${np.node.id}`}>
                    <line
                      x1={np.parentX! + nodeRadius}
                      y1={np.parentY}
                      x2={np.x - nodeRadius}
                      y2={np.y}
                      stroke={highlighted ? 'rgba(59, 130, 246, 0.9)' : 'rgba(255,255,255,0.3)'}
                      strokeWidth={highlighted ? 3 : 2}
                    />
                    {/* Probability label on edge */}
                    <text
                      x={(np.parentX! + np.x) / 2}
                      y={(np.parentY! + np.y) / 2 - 8}
                      fill={highlighted ? 'rgba(147, 197, 253, 1)' : 'rgba(255,255,255,0.7)'}
                      fontSize={12}
                      textAnchor="middle"
                      fontWeight={highlighted ? 'bold' : 'normal'}
                    >
                      {fmt(np.node.probability)}
                    </text>
                  </g>
                )
              })}

            {/* Nodes */}
            {nodePositions.map((np) => {
              const highlighted = isOnHighlightedPath(np.node.id) || np.node.depth === 0
              const isRoot = np.node.depth === 0
              const isLeaf = !np.node.children || np.node.children.length === 0

              // Calculate path probability for leaves
              let pathProb: number | null = null
              if (isLeaf) {
                const leaf = leafProbs.find((lp) => lp.path[lp.path.length - 1] === np.node.label)
                // Find exact match
                for (const lp of leafProbs) {
                  if (lp.path.join('→') === getPathTo(np.node.id).join('→')) {
                    pathProb = lp.prob
                    break
                  }
                }
              }

              return (
                <g
                  key={`node-${np.node.id}`}
                  onClick={() => {
                    if (!isRoot) {
                      const path = getPathTo(np.node.id)
                      setHighlightedPath(path.join('→'))
                    }
                  }}
                  style={{ cursor: isRoot ? 'default' : 'pointer' }}
                >
                  <circle
                    cx={np.x}
                    cy={np.y}
                    r={nodeRadius}
                    fill={
                      isRoot
                        ? 'rgba(107, 114, 128, 0.5)'
                        : highlighted
                          ? 'rgba(59, 130, 246, 0.7)'
                          : 'rgba(55, 65, 81, 0.9)'
                    }
                    stroke={highlighted ? 'rgb(59, 130, 246)' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={highlighted ? 2 : 1}
                  />
                  <text
                    x={np.x}
                    y={np.y + 4}
                    fill="white"
                    fontSize={11}
                    textAnchor="middle"
                    fontWeight={highlighted ? 'bold' : 'normal'}
                  >
                    {np.node.label}
                  </text>

                  {/* Path probability for leaves */}
                  {isLeaf && pathProb !== null && (
                    <text
                      x={np.x + nodeRadius + 10}
                      y={np.y + 4}
                      fill={highlighted ? 'rgba(147, 197, 253, 1)' : 'rgba(255,255,255,0.6)'}
                      fontSize={10}
                      textAnchor="start"
                    >
                      P = {fmt(pathProb)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Highlighted path info */}
          {highlightedPath && (
            <div className="mt-4 rounded-lg border border-blue-800 bg-blue-900/30 p-3">
              <p className="text-sm text-blue-300">
                <b>Chemin sélectionné :</b> {highlightedPath.replace(/→/g, ' → ')}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                P(chemin) = produit des probabilités sur les branches
              </p>
            </div>
          )}

          {/* Probabilities summary */}
          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <p className="mb-2 text-sm font-medium text-gray-300">Probabilités des issues :</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {leafProbs.map((lp, i) => (
                <div
                  key={i}
                  className="flex justify-between rounded bg-gray-700/50 px-2 py-1"
                >
                  <span className="text-gray-300">{lp.path.join(' → ')}</span>
                  <span className="font-mono text-green-400">{fmt(lp.prob)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Somme = {fmt(leafProbs.reduce((s, lp) => s + lp.prob, 0))} (vérification)
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full border-t border-gray-700 bg-gray-800/50 p-4 lg:w-60 lg:border-l lg:border-t-0">
          <h5 className="mb-3 text-sm font-medium text-gray-300">Paramètres</h5>

          <div className="space-y-4">
            {/* Presets */}
            <div>
              <label className="mb-2 block text-xs text-gray-400">Exemples</label>
              <div className="space-y-1">
                {Object.entries(PRESETS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key as keyof typeof PRESETS)}
                    className={`w-full rounded px-2 py-1 text-left text-xs ${
                      currentPreset === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {val.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-700" />

            {/* Probability sliders */}
            <div>
              <label className="mb-2 block text-xs text-gray-400">Ajuster les probabilités</label>
              {tree.children?.map((child) => (
                <div key={child.id} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>P({child.label})</span>
                    <span className="font-mono">{fmt(child.probability)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={child.probability}
                    onChange={(e) => updateProbability(child.id, parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <hr className="border-gray-700" />

            <button
              onClick={() => setHighlightedPath(null)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-gray-600"
            >
              Effacer la sélection
            </button>

            {/* Info */}
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 text-xs text-gray-400">
              <b className="text-gray-300">Règles :</b>
              <br />• P(chemin) = produit des P sur les branches
              <br />• Somme des P des branches = 1
              <br />• Cliquez sur un nœud pour voir le chemin
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Helper to get path to a node
  function getPathTo(nodeId: string): string[] {
    const findPath = (node: TreeNode, path: string[]): string[] | null => {
      if (node.id === nodeId) {
        return [...path, node.label]
      }
      if (node.children) {
        for (const child of node.children) {
          const result = findPath(child, node.depth > 0 ? [...path, node.label] : path)
          if (result) return result
        }
      }
      return null
    }
    return findPath(tree, []) || []
  }
}
