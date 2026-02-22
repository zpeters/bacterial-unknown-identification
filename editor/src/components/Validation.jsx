import { useMemo } from 'react'
import './Validation.css'

function validate(nodes) {
  const errors = []
  const warnings = []

  if (!nodes.root) {
    errors.push('No root node. The tree must have a node with id "root".')
    return { errors, warnings }
  }

  // ─── BFS reachability from root ─────────────────────────────────────────
  const reachable = new Set()
  const bfsQueue = ['root']
  while (bfsQueue.length > 0) {
    const id = bfsQueue.shift()
    if (reachable.has(id)) continue
    reachable.add(id)
    const node = nodes[id]
    if (!node) continue
    for (const opt of (node.options || [])) {
      if (opt.nextId) bfsQueue.push(opt.nextId)
    }
  }

  // ─── DFS cycle detection ─────────────────────────────────────────────────
  // Track the current recursion path to detect back-edges (cycles)
  const cycleNodes = new Set()
  const dfsVisited = new Set()

  function dfs(id, onPath) {
    if (onPath.has(id)) { cycleNodes.add(id); return }
    if (dfsVisited.has(id)) return
    dfsVisited.add(id)
    onPath.add(id)
    const node = nodes[id]
    for (const opt of (node?.options || [])) {
      if (opt.nextId) dfs(opt.nextId, onPath)
    }
    onPath.delete(id)
  }
  dfs('root', new Set())

  if (cycleNodes.size > 0) {
    errors.push(`Cycle detected involving node(s): ${[...cycleNodes].join(', ')}. The wizard would loop infinitely.`)
  }

  // ─── Per-node checks ─────────────────────────────────────────────────────
  for (const [id, node] of Object.entries(nodes)) {
    // Broken / missing nextId references
    if (node.options) {
      for (const opt of node.options) {
        if (!opt.nextId) {
          errors.push(`Node "${id}" has an option with no nextId set.`)
        } else if (!nodes[opt.nextId]) {
          errors.push(`Node "${id}" references missing node "${opt.nextId}".`)
        }
      }

      // Duplicate nextId within the same node (likely a copy-paste mistake)
      const seen = new Set()
      for (const opt of node.options) {
        if (opt.nextId && seen.has(opt.nextId)) {
          warnings.push(`Node "${id}" has two options pointing to "${opt.nextId}" — possible duplicate.`)
          break
        }
        seen.add(opt.nextId)
      }
    }

    // Decision nodes with no options
    if (node.type === 'decision' && (!node.options || node.options.length === 0)) {
      warnings.push(`Decision node "${id}" has no options.`)
    }

    // Unreachable nodes
    if (!reachable.has(id)) {
      warnings.push(`Node "${id}" is unreachable from root.`)
    }
  }

  return { errors, warnings }
}

export default function Validation({ nodes }) {
  const { errors, warnings } = useMemo(() => validate(nodes), [nodes])

  if (errors.length === 0 && warnings.length === 0) {
    return <div className="validation-bar ok">Tree is valid</div>
  }

  return (
    <div className="validation-bar issues">
      {errors.map((e, i) => (
        <div key={i} className="v-item error">✖ {e}</div>
      ))}
      {warnings.map((w, i) => (
        <div key={i} className="v-item warning">⚠ {w}</div>
      ))}
    </div>
  )
}
