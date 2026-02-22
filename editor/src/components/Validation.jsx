import { useMemo } from 'react'
import './Validation.css'

function validate(nodes) {
  const errors = []
  const warnings = []

  if (!nodes.root) {
    errors.push('No root node. The tree must have a node with id "root".')
    return { errors, warnings }
  }

  // BFS reachability from root
  const reachable = new Set()
  const queue = ['root']
  while (queue.length > 0) {
    const id = queue.shift()
    if (reachable.has(id)) continue
    reachable.add(id)
    const node = nodes[id]
    if (!node) continue
    for (const opt of (node.options || [])) {
      if (opt.nextId) queue.push(opt.nextId)
    }
  }

  for (const [id, node] of Object.entries(nodes)) {
    // Broken nextId references
    if (node.options) {
      for (const opt of node.options) {
        if (!opt.nextId) {
          errors.push(`Node "${id}" has an option with no nextId set.`)
        } else if (!nodes[opt.nextId]) {
          errors.push(`Node "${id}" references missing node "${opt.nextId}".`)
        }
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
