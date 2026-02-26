import { useState, useCallback, useRef, useEffect } from 'react'
import gpNodes from '@data/gramPositive.json'
import gnNodes from '@data/gramNegative.json'
import { VERSION } from '@version'
import NodeList from './components/NodeList.jsx'
import NodeForm from './components/NodeForm.jsx'
import TreePreview from './components/TreePreview.jsx'
import Validation from './components/Validation.jsx'
import { exportBoth } from './exporter.js'
import './App.css'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const MAX_HISTORY = 50

export default function App() {
  const [gramPosNodes, setGramPosNodes] = useState(() => deepClone(gpNodes))
  const [gramNegNodes, setGramNegNodes] = useState(() => deepClone(gnNodes))
  const [activeTree, setActiveTree] = useState('pos') // 'pos' | 'neg'
  const [selectedId, setSelectedId] = useState('root')
  const [previewWidth, setPreviewWidth] = useState(340)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const dragRef = useRef(null)

  // Undo/redo stacks — arrays of { gramPosNodes, gramNegNodes } snapshots
  const undoStack = useRef([])
  const redoStack = useRef([])
  // Always-current snapshot for reading before mutation
  const currentStateRef = useRef({ gramPosNodes, gramNegNodes })
  currentStateRef.current = { gramPosNodes, gramNegNodes }

  const nodes = activeTree === 'pos' ? gramPosNodes : gramNegNodes
  const setNodes = activeTree === 'pos' ? setGramPosNodes : setGramNegNodes

  // ─── Undo/redo ──────────────────────────────────────────────────────────────

  const beforeMutation = useCallback(() => {
    undoStack.current.push(currentStateRef.current)
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift()
    redoStack.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [])

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return
    const prev = undoStack.current.pop()
    redoStack.current.unshift(currentStateRef.current)
    setGramPosNodes(prev.gramPosNodes)
    setGramNegNodes(prev.gramNegNodes)
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(true)
  }, [])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return
    const next = redoStack.current.shift()
    undoStack.current.push(currentStateRef.current)
    setGramPosNodes(next.gramPosNodes)
    setGramNegNodes(next.gramNegNodes)
    setCanUndo(true)
    setCanRedo(redoStack.current.length > 0)
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const updateNode = useCallback((id, partial) => {
    beforeMutation()
    setNodes(prev => ({
      ...prev,
      [id]: { ...prev[id], ...partial },
    }))
  }, [setNodes, beforeMutation])

  const addNode = useCallback(() => {
    const id = `node_${Date.now()}`
    const newNode = {
      id,
      type: 'result',
      label: 'New Node',
      description: '',
      organism: '',
    }
    beforeMutation()
    setNodes(prev => ({ ...prev, [id]: newNode }))
    setSelectedId(id)
  }, [setNodes, beforeMutation])

  const deleteNode = useCallback((id) => {
    beforeMutation()
    setNodes(prev => {
      const next = { ...prev }
      delete next[id]
      for (const node of Object.values(next)) {
        if (node.options) {
          node.options = node.options.map(opt =>
            opt.nextId === id ? { ...opt, nextId: '' } : opt
          )
        }
      }
      return next
    })
    setSelectedId(prev => prev === id ? 'root' : prev)
  }, [setNodes, beforeMutation])

  const renameNodeId = useCallback((oldId, newId) => {
    beforeMutation()
    setNodes(prev => {
      if (prev[newId]) return prev
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
  }, [setNodes, beforeMutation])

  // ─── Resizable divider ────────────────────────────────────────────────────

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

  // ─── Export ───────────────────────────────────────────────────────────────

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
        <div className="header-left">
          <h1>Bacterial ID Tree Editor</h1>
          <span className="app-version">v{VERSION}</span>
        </div>
        <div className="header-controls">
          <div className="undo-redo">
            <button
              className="btn btn-ghost btn-sm"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              ↩ Undo
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              Redo ↪
            </button>
          </div>
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
            Export JSON Files
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
