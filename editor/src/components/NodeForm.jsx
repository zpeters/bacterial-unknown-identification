import { useState } from 'react'
import './NodeForm.css'

export default function NodeForm({ node, allNodes, onUpdate, onDelete, onRename }) {
  const [pendingId, setPendingId] = useState(node.id)
  const [idError, setIdError] = useState('')

  function handleIdBlur() {
    const newId = pendingId.trim()
    if (newId === node.id) return
    if (!newId) { setIdError('ID cannot be empty'); return }
    if (allNodes[newId]) { setIdError('ID already exists'); return }
    setIdError('')
    onRename(newId)
  }

  function handleTypeChange(newType) {
    if (newType === node.type) return
    const msg = newType === 'result'
      ? 'Change to Result? This will clear question and options.'
      : 'Change to Decision? This will clear the organism field.'
    if (!window.confirm(msg)) return
    if (newType === 'result') {
      onUpdate({ type: 'result', question: '', options: [], organism: '' })
    } else {
      onUpdate({ type: 'decision', organism: '', question: '', options: [] })
    }
  }

  function handleDeleteClick() {
    // Find nodes that reference this node
    const refs = Object.values(allNodes)
      .filter(n => n.options?.some(o => o.nextId === node.id))
      .map(n => n.id)

    let msg = `Delete node "${node.id}"?`
    if (refs.length > 0) {
      msg += `\n\nWarning: the following nodes reference this node and will have their nextId cleared:\n${refs.join(', ')}`
    }
    if (window.confirm(msg)) onDelete()
  }

  // Options helpers
  const options = node.options || []

  function setOption(idx, partial) {
    const next = options.map((o, i) => i === idx ? { ...o, ...partial } : o)
    onUpdate({ options: next })
  }

  function addOption() {
    onUpdate({ options: [...options, { label: '', nextId: '' }] })
  }

  function removeOption(idx) {
    onUpdate({ options: options.filter((_, i) => i !== idx) })
  }

  function moveOption(idx, dir) {
    const next = [...options]
    const target = idx + dir
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]]
    onUpdate({ options: next })
  }

  const allIds = Object.keys(allNodes).filter(id => id !== node.id)

  return (
    <div className="node-form">
      <div className="form-topbar">
        <span className={`type-badge ${node.type}`}>{node.type === 'decision' ? 'Decision' : 'Result'}</span>
        <button className="btn btn-danger btn-sm" onClick={handleDeleteClick} disabled={node.id === 'root'} title={node.id === 'root' ? 'Cannot delete root' : ''}>
          Delete
        </button>
      </div>

      {/* ID */}
      <div className="field-group">
        <label>Node ID</label>
        <input
          value={pendingId}
          className={idError ? 'error' : ''}
          onChange={e => { setPendingId(e.target.value.replace(/[^a-zA-Z0-9_]/g, '_')); setIdError('') }}
          onBlur={handleIdBlur}
          disabled={node.id === 'root'}
        />
        {idError && <span className="field-error">{idError}</span>}
      </div>

      {/* Type */}
      <div className="field-group">
        <label>Type</label>
        <select value={node.type} onChange={e => handleTypeChange(e.target.value)}>
          <option value="decision">Decision (test)</option>
          <option value="result">Result (organism)</option>
        </select>
      </div>

      {/* Label */}
      <div className="field-group">
        <label>Label</label>
        <input
          value={node.label || ''}
          onChange={e => onUpdate({ label: e.target.value })}
          placeholder="Short display name"
        />
      </div>

      {/* Description */}
      <div className="field-group">
        <label>Description</label>
        <textarea
          value={node.description || ''}
          onChange={e => onUpdate({ description: e.target.value })}
          placeholder="Procedure / context shown to student"
          rows={4}
        />
      </div>

      {node.type === 'decision' && (
        <>
          {/* Question */}
          <div className="field-group">
            <label>Question</label>
            <textarea
              value={node.question || ''}
              onChange={e => onUpdate({ question: e.target.value })}
              placeholder="Question the student answers"
              rows={2}
            />
          </div>

          {/* Options */}
          <div className="options-section">
            <div className="options-header">
              <span className="options-title">Options</span>
              <button className="btn btn-ghost btn-sm" onClick={addOption}>+ Add option</button>
            </div>
            {options.length === 0 && (
              <p className="options-empty">No options yet. Add at least one.</p>
            )}
            {options.map((opt, idx) => {
              const broken = opt.nextId && !allNodes[opt.nextId]
              return (
                <div key={idx} className="option-row">
                  <div className="option-fields">
                    <div className="field-group">
                      <label>Option label</label>
                      <input
                        value={opt.label || ''}
                        onChange={e => setOption(idx, { label: e.target.value })}
                        placeholder="Button text"
                      />
                    </div>
                    <div className="field-group">
                      <label>Next node</label>
                      <select
                        value={opt.nextId || ''}
                        className={broken ? 'error' : ''}
                        onChange={e => setOption(idx, { nextId: e.target.value })}
                      >
                        <option value="">— select node —</option>
                        {allIds.map(id => (
                          <option key={id} value={id}>{id}</option>
                        ))}
                      </select>
                      {broken && <span className="field-error">Node "{opt.nextId}" not found</span>}
                    </div>
                  </div>
                  <div className="option-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => moveOption(idx, -1)} disabled={idx === 0} title="Move up">↑</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => moveOption(idx, 1)} disabled={idx === options.length - 1} title="Move down">↓</button>
                    <button className="btn btn-danger btn-sm" onClick={() => removeOption(idx)} title="Remove">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {node.type === 'result' && (
        <div className="field-group">
          <label>Organism name</label>
          <input
            value={node.organism || ''}
            onChange={e => onUpdate({ organism: e.target.value })}
            placeholder="e.g. Staphylococcus aureus"
          />
        </div>
      )}
    </div>
  )
}
