import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'

const NODE_WIDTH = 160
const NODE_HEIGHT = 60

function getLayoutedElements(rfNodes, rfEdges) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 30, ranksep: 50 })

  rfNodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  rfEdges.forEach(e => g.setEdge(e.source, e.target))
  dagre.layout(g)

  return rfNodes.map(n => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } }
  })
}

function DecisionNode({ data }) {
  return (
    <div className={`tp-node tp-decision ${data.selected ? 'tp-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="tp-label">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function ResultNode({ data }) {
  return (
    <div className={`tp-node tp-result ${data.selected ? 'tp-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="tp-label">{data.label}</div>
    </div>
  )
}

const nodeTypes = { decision: DecisionNode, result: ResultNode }

const previewStyle = `
.tp-node {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  border: 2px solid transparent;
  min-width: 120px;
  text-align: center;
  cursor: pointer;
}
.tp-decision { background: #dbeafe; border-color: #93c5fd; color: #1e40af; }
.tp-result { background: #dcfce7; border-color: #86efac; color: #166534; }
.tp-selected { border-color: #f59e0b !important; box-shadow: 0 0 0 2px #fde68a; }
.tp-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
`

export default function TreePreview({ nodes, selectedId, onSelect }) {
  const rfNodes = useMemo(() => {
    const raw = Object.values(nodes).map(n => ({
      id: n.id,
      type: n.type,
      data: { label: n.label || n.id, selected: n.id === selectedId },
      position: { x: 0, y: 0 },
    }))

    const rfEdges = []
    Object.values(nodes).forEach(node => {
      if (node.options) {
        node.options.forEach((opt, i) => {
          if (opt.nextId && nodes[opt.nextId]) {
            rfEdges.push({ id: `${node.id}-${opt.nextId}-${i}`, source: node.id, target: opt.nextId })
          }
        })
      }
    })

    return getLayoutedElements(raw, rfEdges)
  }, [nodes, selectedId])

  const rfEdges = useMemo(() => {
    const edges = []
    Object.values(nodes).forEach(node => {
      if (node.options) {
        node.options.forEach((opt, i) => {
          if (opt.nextId && nodes[opt.nextId]) {
            edges.push({
              id: `${node.id}-${opt.nextId}-${i}`,
              source: node.id,
              target: opt.nextId,
              markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#94a3b8' },
              style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            })
          }
        })
      }
    })
    return edges
  }, [nodes])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>{previewStyle}</style>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodeClick={(_, node) => onSelect(node.id)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={n => n.type === 'result' ? '#22c55e' : '#3b82f6'}
          maskColor="rgba(248,250,252,0.7)"
        />
      </ReactFlow>
    </div>
  )
}
