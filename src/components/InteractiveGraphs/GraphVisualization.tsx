'use client'

import { useState, useMemo, useCallback } from 'react'

interface Vertex {
  id: string
  label: string
  x: number
  y: number
}

interface Edge {
  from: string
  to: string
  weight?: number
}

interface GraphVisualizationProps {
  /** Liste des sommets avec positions */
  vertices: Vertex[]
  /** Liste des arêtes */
  edges: Edge[]
  /** Graphe orienté ou non */
  directed?: boolean
  /** Titre du graphe */
  title?: string
  /** Hauteur en pixels */
  height?: number
  /** Afficher les degrés des sommets */
  showDegrees?: boolean
  /** Afficher la matrice d'adjacence */
  showMatrix?: boolean
  /** Mode BFS/DFS */
  traversalMode?: 'none' | 'bfs' | 'dfs'
}

export function GraphVisualization({
  vertices,
  edges,
  directed = false,
  title,
  height = 350,
  showDegrees = false,
  showMatrix = false,
  traversalMode = 'none',
}: GraphVisualizationProps) {
  const [selectedVertex, setSelectedVertex] = useState<string | null>(null)
  const [hoveredVertex, setHoveredVertex] = useState<string | null>(null)
  const [visitedVertices, setVisitedVertices] = useState<string[]>([])
  const [visitedEdges, setVisitedEdges] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculer le degré de chaque sommet
  const degrees = useMemo(() => {
    const deg: Record<string, number> = {}
    vertices.forEach((v) => {
      deg[v.id] = 0
    })
    edges.forEach((e) => {
      deg[e.from] = (deg[e.from] || 0) + 1
      if (!directed) {
        deg[e.to] = (deg[e.to] || 0) + 1
      }
    })
    return deg
  }, [vertices, edges, directed])

  // Calculer les voisins de chaque sommet
  const neighbors = useMemo(() => {
    const adj: Record<string, string[]> = {}
    vertices.forEach((v) => {
      adj[v.id] = []
    })
    edges.forEach((e) => {
      adj[e.from].push(e.to)
      if (!directed) {
        adj[e.to].push(e.from)
      }
    })
    return adj
  }, [vertices, edges, directed])

  // Voisins du sommet sélectionné
  const highlightedNeighbors = useMemo(() => {
    if (!selectedVertex) return new Set<string>()
    return new Set(neighbors[selectedVertex] || [])
  }, [selectedVertex, neighbors])

  // Arêtes connectées au sommet sélectionné
  const highlightedEdges = useMemo(() => {
    if (!selectedVertex) return new Set<string>()
    const edgeSet = new Set<string>()
    edges.forEach((e) => {
      if (e.from === selectedVertex || (!directed && e.to === selectedVertex)) {
        edgeSet.add(`${e.from}-${e.to}`)
      }
    })
    return edgeSet
  }, [selectedVertex, edges, directed])

  // Matrice d'adjacence
  const adjacencyMatrix = useMemo(() => {
    const n = vertices.length
    const matrix: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0))
    const idToIndex: Record<string, number> = {}
    vertices.forEach((v, i) => {
      idToIndex[v.id] = i
    })
    edges.forEach((e) => {
      const i = idToIndex[e.from]
      const j = idToIndex[e.to]
      matrix[i][j] = 1
      if (!directed) {
        matrix[j][i] = 1
      }
    })
    return matrix
  }, [vertices, edges, directed])

  // Animation BFS
  const runBFS = useCallback(
    async (startId: string) => {
      if (isAnimating) return
      setIsAnimating(true)
      setVisitedVertices([])
      setVisitedEdges([])

      const visited = new Set<string>()
      const queue: string[] = [startId]
      visited.add(startId)

      const newVisited: string[] = []
      const newEdges: string[] = []

      while (queue.length > 0) {
        const current = queue.shift()!
        newVisited.push(current)
        setVisitedVertices([...newVisited])
        await new Promise((r) => setTimeout(r, 500))

        for (const neighbor of neighbors[current] || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
            newEdges.push(`${current}-${neighbor}`)
            setVisitedEdges([...newEdges])
          }
        }
      }

      setIsAnimating(false)
    },
    [neighbors, isAnimating]
  )

  // Animation DFS
  const runDFS = useCallback(
    async (startId: string) => {
      if (isAnimating) return
      setIsAnimating(true)
      setVisitedVertices([])
      setVisitedEdges([])

      const visited = new Set<string>()
      const newVisited: string[] = []
      const newEdges: string[] = []

      const dfs = async (current: string, parent: string | null) => {
        visited.add(current)
        newVisited.push(current)
        setVisitedVertices([...newVisited])
        await new Promise((r) => setTimeout(r, 500))

        if (parent) {
          newEdges.push(`${parent}-${current}`)
          setVisitedEdges([...newEdges])
        }

        for (const neighbor of neighbors[current] || []) {
          if (!visited.has(neighbor)) {
            await dfs(neighbor, current)
          }
        }
      }

      await dfs(startId, null)
      setIsAnimating(false)
    },
    [neighbors, isAnimating]
  )

  // Handler de clic sur un sommet
  const handleVertexClick = (id: string) => {
    if (traversalMode === 'bfs') {
      runBFS(id)
    } else if (traversalMode === 'dfs') {
      runDFS(id)
    } else {
      setSelectedVertex(selectedVertex === id ? null : id)
    }
  }

  // Reset
  const handleReset = () => {
    setSelectedVertex(null)
    setVisitedVertices([])
    setVisitedEdges([])
  }

  // Dimensions du SVG
  const padding = 40
  const svgWidth = 400
  const svgHeight = height - 50

  // Normaliser les positions des sommets
  const normalizedVertices = useMemo(() => {
    const xs = vertices.map((v) => v.x)
    const ys = vertices.map((v) => v.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1

    return vertices.map((v) => ({
      ...v,
      nx: padding + ((v.x - minX) / rangeX) * (svgWidth - 2 * padding),
      ny: padding + ((v.y - minY) / rangeY) * (svgHeight - 2 * padding),
    }))
  }, [vertices, svgWidth, svgHeight])

  // Map des positions
  const posMap = useMemo(() => {
    const map: Record<string, { nx: number; ny: number }> = {}
    normalizedVertices.forEach((v) => {
      map[v.id] = { nx: v.nx, ny: v.ny }
    })
    return map
  }, [normalizedVertices])

  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h4 className="mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Graphe SVG */}
        <div className="flex-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full rounded border border-gray-100 bg-gray-50 dark:border-gray-600 dark:bg-gray-900"
            style={{ height: svgHeight }}
          >
            {/* Arêtes */}
            {edges.map((e, i) => {
              const from = posMap[e.from]
              const to = posMap[e.to]
              if (!from || !to) return null

              const edgeKey = `${e.from}-${e.to}`
              const isHighlighted = highlightedEdges.has(edgeKey)
              const isVisited =
                visitedEdges.includes(edgeKey) ||
                visitedEdges.includes(`${e.to}-${e.from}`)

              return (
                <g key={i}>
                  <line
                    x1={from.nx}
                    y1={from.ny}
                    x2={to.nx}
                    y2={to.ny}
                    stroke={
                      isVisited
                        ? '#22c55e'
                        : isHighlighted
                          ? '#3b82f6'
                          : '#9ca3af'
                    }
                    strokeWidth={isHighlighted || isVisited ? 3 : 2}
                    className="transition-all duration-200"
                  />
                  {directed && (
                    <polygon
                      points={getArrowPoints(from.nx, from.ny, to.nx, to.ny)}
                      fill={
                        isVisited
                          ? '#22c55e'
                          : isHighlighted
                            ? '#3b82f6'
                            : '#9ca3af'
                      }
                    />
                  )}
                  {e.weight !== undefined && (
                    <text
                      x={(from.nx + to.nx) / 2}
                      y={(from.ny + to.ny) / 2 - 8}
                      textAnchor="middle"
                      className="fill-gray-500 text-xs dark:fill-gray-400"
                    >
                      {e.weight}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Sommets */}
            {normalizedVertices.map((v) => {
              const isSelected = selectedVertex === v.id
              const isNeighbor = highlightedNeighbors.has(v.id)
              const isHovered = hoveredVertex === v.id
              const isVisited = visitedVertices.includes(v.id)
              const visitOrder = visitedVertices.indexOf(v.id)

              return (
                <g
                  key={v.id}
                  className="cursor-pointer"
                  onClick={() => handleVertexClick(v.id)}
                  onMouseEnter={() => setHoveredVertex(v.id)}
                  onMouseLeave={() => setHoveredVertex(null)}
                >
                  <circle
                    cx={v.nx}
                    cy={v.ny}
                    r={isHovered ? 24 : 20}
                    fill={
                      isVisited
                        ? '#22c55e'
                        : isSelected
                          ? '#3b82f6'
                          : isNeighbor
                            ? '#93c5fd'
                            : '#fff'
                    }
                    stroke={
                      isVisited
                        ? '#16a34a'
                        : isSelected
                          ? '#1d4ed8'
                          : '#6b7280'
                    }
                    strokeWidth={isSelected || isVisited ? 3 : 2}
                    className="transition-all duration-200"
                  />
                  <text
                    x={v.nx}
                    y={v.ny + 5}
                    textAnchor="middle"
                    className={`text-sm font-medium ${
                      isSelected || isVisited
                        ? 'fill-white'
                        : 'fill-gray-700 dark:fill-gray-300'
                    }`}
                  >
                    {v.label}
                  </text>
                  {isVisited && visitOrder >= 0 && (
                    <text
                      x={v.nx + 18}
                      y={v.ny - 18}
                      textAnchor="middle"
                      className="fill-green-600 text-xs font-bold"
                    >
                      {visitOrder + 1}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Panneau d'information */}
        <div className="w-full space-y-3 lg:w-48">
          {/* Mode traversal */}
          {traversalMode !== 'none' && (
            <div className="rounded bg-purple-50 p-2 text-center dark:bg-purple-900/20">
              <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
                Mode {traversalMode.toUpperCase()}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Cliquez sur un sommet pour démarrer
              </div>
              <button
                onClick={handleReset}
                className="mt-2 rounded bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700"
              >
                Réinitialiser
              </button>
            </div>
          )}

          {/* Info sommet sélectionné */}
          {selectedVertex && traversalMode === 'none' && (
            <div className="rounded bg-blue-50 p-2 dark:bg-blue-900/20">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Sommet {selectedVertex}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Degré: {degrees[selectedVertex]}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Voisins: {neighbors[selectedVertex]?.join(', ') || 'aucun'}
              </div>
            </div>
          )}

          {/* Degrés */}
          {showDegrees && (
            <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
              <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                Degrés
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {vertices.map((v) => (
                  <div key={v.id} className="text-gray-600 dark:text-gray-400">
                    d({v.label}) = {degrees[v.id]}
                  </div>
                ))}
              </div>
              <div className="mt-1 border-t border-gray-200 pt-1 text-xs text-gray-500 dark:border-gray-600">
                Σ degrés = {Object.values(degrees).reduce((a, b) => a + b, 0)}
              </div>
            </div>
          )}

          {/* Matrice d'adjacence */}
          {showMatrix && (
            <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
              <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                Matrice d'adjacence
              </div>
              <div className="overflow-x-auto">
                <table className="text-xs">
                  <thead>
                    <tr>
                      <th></th>
                      {vertices.map((v) => (
                        <th key={v.id} className="px-1 text-gray-500">
                          {v.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vertices.map((v, i) => (
                      <tr key={v.id}>
                        <td className="pr-1 text-gray-500">{v.label}</td>
                        {adjacencyMatrix[i].map((val, j) => (
                          <td
                            key={j}
                            className={`px-1 text-center ${
                              val === 1
                                ? 'font-medium text-blue-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Cliquez sur un sommet pour voir ses voisins et son degré
      </p>
    </div>
  )
}

// Helper pour dessiner les flèches (graphes orientés)
function getArrowPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const arrowLength = 12
  const arrowWidth = 6
  const tipX = x2 - 22 * Math.cos(angle)
  const tipY = y2 - 22 * Math.sin(angle)

  const p1x = tipX - arrowLength * Math.cos(angle - Math.PI / 6)
  const p1y = tipY - arrowLength * Math.sin(angle - Math.PI / 6)
  const p2x = tipX - arrowLength * Math.cos(angle + Math.PI / 6)
  const p2y = tipY - arrowLength * Math.sin(angle + Math.PI / 6)

  return `${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`
}
