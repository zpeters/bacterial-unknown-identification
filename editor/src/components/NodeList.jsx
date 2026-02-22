import './NodeList.css'

export default function NodeList({ nodes, selectedId, onSelect, onAdd }) {
  const sorted = Object.values(nodes).sort((a, b) => {
    // root first, then decisions, then results; alpha within groups
    if (a.id === 'root') return -1
    if (b.id === 'root') return 1
    if (a.type !== b.type) return a.type === 'decision' ? -1 : 1
    return a.id.localeCompare(b.id)
  })

  return (
    <div className="node-list">
      <div className="node-list-header">
        <span>Nodes ({sorted.length})</span>
        <button className="btn btn-sm btn-primary" onClick={onAdd} title="Add new node">+ Add</button>
      </div>
      <ul>
        {sorted.map(node => (
          <li
            key={node.id}
            className={`node-item ${node.type} ${selectedId === node.id ? 'selected' : ''}`}
            onClick={() => onSelect(node.id)}
          >
            <span className="node-type-dot" />
            <span className="node-item-label" title={node.id}>{node.label || node.id}</span>
            {node.id === 'root' && <span className="root-badge">root</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
