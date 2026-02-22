import { useState, useCallback, useRef } from 'react'
import { nodes as gpNodes } from '@data/gramPositive.js'
import { nodes as gnNodes } from '@data/gramNegative.js'
import NodeList from './components/NodeList.jsx'
import NodeForm from './components/NodeForm.jsx'
import TreePreview from './components/TreePreview.jsx'
import Validation from './components/Validation.jsx'
import { exportBoth } from './exporter.js'
import './App.css'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default function App() {
  const [gramPosNodes, setGramPosNodes] = useState(() => deepClone(gpNodes))
  const [gramNegNodes, setGramNegNodes] = useState(() => deepClone(gnNodes))
  const [activeTree, setActiveTree] = useState('pos') // 'pos' | 'neg'
  const [selectedId, setSelectedId] = useState('root')
  const [previewWidth, setPreviewWidth] = useState(340)
  const dragRef = useRef(null)

  function onDividerMouseDown(e) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = previewWidth

    function onMouseMove(e) {
      const delta = startX - e.clientX
      setPreviewWidth(Math.max(180, Math.min(window.innerWidth - 400, startWidth + delta)))
    }
    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const nodes = activeTree === 'pos' ? gramPosNodes : gramNegNodes
  const setNodes = activeTree === 'pos' ? setGramPosNodes : setGramNegNodes

  // Update a single node by id (merges partial fields)
  const updateNode = useCallback((id, partial) => {
    setNodes(prev => ({
      ...prev,
      [id]: { ...prev[id], ...partial },
    }))
  }, [setNodes])

  // Add a new blank result node
  const addNode = useCallback(() => {
    const id = `node_${Date.now()}`
    const newNode = {
      id,
      type: 'result',
      label: 'New Node',
      description: '',
      organism: '',
    }
    setNodes(prev => ({ ...prev, [id]: newNode }))
    setSelectedId(id)
  }, [setNodes])

  // Delete a node and strip all references to it from option nextId fields
  const deleteNode = useCallback((id) => {
    setNodes(prev => {
      const next = { ...prev }
      delete next[id]
      // Strip references
      for (const node of Object.values(next)) {
        if (node.options) {
          node.options = node.options
            .map(opt => opt.nextId === id ? { ...opt, nextId: '' } : opt)
        }
      }
      return next
    })
    setSelectedId(prev => prev === id ? 'root' : prev)
  }, [setNodes])

  // Rename a node's id and cascade to all nextId references
  const renameNodeId = useCallback((oldId, newId) => {
    setNodes(prev => {
      if (prev[newId]) return prev // duplicate — skip
      const next = {}
      for (const [k, node] of Object.entries(prev)) {
        const key = k === oldId ? newId : k
        const updated = { ...node, id: node.id === oldId ? newId : node.id }
        if (updated.options) {
          updated.options = updated.options.map(opt =>
            opt.nextId === oldId ? { ...opt, nextId: newId } : opt
          )
        }
        next[key] = updated
      }
      return next
    })
    setSelectedId(prev => prev === oldId ? newId : prev)
  }, [setNodes])

  function handleExport() {
    try {
      exportBoth(gramPosNodes, gramNegNodes)
    } catch (e) {
      alert('Export error: ' + e.message)
    }
  }

  const selectedNode = nodes[selectedId] || null

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bacterial ID Tree Editor</h1>
        <div className="header-controls">
          <div className="tree-toggle">
            <button
              className={activeTree === 'pos' ? 'active' : ''}
              onClick={() => { setActiveTree('pos'); setSelectedId('root') }}
            >
              Gram Positive
            </button>
            <button
              className={activeTree === 'neg' ? 'active' : ''}
              onClick={() => { setActiveTree('neg'); setSelectedId('root') }}
            >
              Gram Negative
            </button>
          </div>
          <button className="export-btn" onClick={handleExport}>
            Export JS Files
          </button>
        </div>
      </header>

      <Validation nodes={nodes} />

      <div className="editor-body">
        <aside className="col-list">
          <NodeList
            nodes={nodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={addNode}
          />
        </aside>

        <main className="col-form">
          {selectedNode ? (
            <NodeForm
              key={selectedId}
              node={selectedNode}
              allNodes={nodes}
              onUpdate={(partial) => updateNode(selectedId, partial)}
              onDelete={() => deleteNode(selectedId)}
              onRename={(newId) => renameNodeId(selectedId, newId)}
            />
          ) : (
            <div className="no-selection">Select a node to edit</div>
          )}
        </main>

        <div className="resize-divider" ref={dragRef} onMouseDown={onDividerMouseDown} />

        <aside className="col-preview" style={{ width: previewWidth }}>
          <TreePreview
            nodes={nodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>
      </div>
    </div>
  )
}
