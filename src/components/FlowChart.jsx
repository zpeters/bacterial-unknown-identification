import { useCallback, useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import './FlowChart.css';

// ─── Dagre layout ────────────────────────────────────────────────────────────

const NODE_WIDTH = 180;
const NODE_HEIGHT = 70;

function getLayoutedElements(rfNodes, rfEdges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 60 });

  rfNodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  rfEdges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const layoutedNodes = rfNodes.map((n) => {
    const { x, y } = g.node(n.id);
    return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } };
  });

  return { nodes: layoutedNodes, edges: rfEdges };
}

// ─── Custom node types ────────────────────────────────────────────────────────

function DecisionNode({ data }) {
  return (
    <div className={`rf-node rf-decision ${data.highlighted ? 'highlighted' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="rf-node-label">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function ResultNode({ data }) {
  return (
    <div className={`rf-node rf-result ${data.highlighted ? 'highlighted' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="rf-node-label">{data.label}</div>
    </div>
  );
}

const nodeTypes = { decision: DecisionNode, result: ResultNode };

// ─── Build RF nodes/edges from data ──────────────────────────────────────────

function buildInitialElements(dataNodes, getEdgesFn) {
  const rfNodes = Object.values(dataNodes).map((n) => ({
    id: n.id,
    type: n.type,
    data: { label: n.label, highlighted: false },
    position: { x: 0, y: 0 },
  }));

  const rfEdges = getEdgesFn().map((e) => ({
    ...e,
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: '#94a3b8' },
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    labelStyle: { fontSize: 11, fill: '#64748b' },
    labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.85 },
  }));

  return getLayoutedElements(rfNodes, rfEdges);
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ node, dataNodes, onClose }) {
  if (!node) return null;
  const data = dataNodes[node.id];
  if (!data) return null;
  return (
    <div className="detail-panel">
      <button className="detail-close" onClick={onClose} aria-label="Close panel">✕</button>
      <span className={`detail-badge ${data.type === 'result' ? 'badge-result' : 'badge-test'}`}>
        {data.type === 'result' ? 'Organism Identified' : 'Test'}
      </span>
      <h3 className="detail-title">{data.label}</h3>
      {data.organism && <p className="detail-organism">{data.organism}</p>}
      <p className="detail-description">{data.description}</p>
      {data.question && (
        <div className="detail-question">
          <p className="detail-q-label">Question asked:</p>
          <p>{data.question}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FlowChart({ wizardData }) {
  const { dataNodes, getEdgesFn } = wizardData;
  const { isDark } = useTheme();

  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildInitialElements(dataNodes, getEdgesFn),
    [dataNodes, getEdgesFn]
  );

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initNodes);
  const [rfEdges, , onEdgesChange] = useEdgesState(initEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
      setRfNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, highlighted: n.id === node.id },
        }))
      );
    },
    [setRfNodes]
  );

  function closePanel() {
    setSelectedNode(null);
    setRfNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, highlighted: false } }))
    );
  }

  return (
    <div className="flowchart-wrapper">
      <div className="flowchart-hint">Click any node to view test details</div>
      <div className="flowchart-container">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
        >
          <Background color={isDark ? '#334155' : '#e2e8f0'} gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(n) => (n.type === 'result' ? '#22c55e' : '#3b82f6')}
            maskColor="rgba(248,250,252,0.7)"
          />
        </ReactFlow>
        {selectedNode && (
          <DetailPanel node={selectedNode} dataNodes={dataNodes} onClose={closePanel} />
        )}
      </div>
    </div>
  );
}
