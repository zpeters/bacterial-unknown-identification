import { useState, useRef, useEffect } from 'react';
import './Wizard.css';

// ─── URL hash + localStorage helpers ─────────────────────────────────────────

function buildHistoryFromChoices(nodes, choices) {
  const history = [nodes.root]
  for (const choiceIdx of choices) {
    const current = history[history.length - 1]
    if (!current.options || current.type !== 'decision') break
    const opt = current.options[choiceIdx]
    if (!opt || !nodes[opt.nextId]) break
    history.push(nodes[opt.nextId])
  }
  return history
}

function getInitialState(nodes, treeKey) {
  // URL hash takes priority (shareable links)
  const hash = window.location.hash.slice(1)
  if (hash) {
    const colonIdx = hash.indexOf(':')
    if (colonIdx !== -1 && hash.slice(0, colonIdx) === treeKey) {
      const raw = hash.slice(colonIdx + 1)
      if (raw) {
        const choices = raw.split(',').map(Number).filter(n => !isNaN(n))
        const history = buildHistoryFromChoices(nodes, choices)
        if (history.length > 1) {
          return { history, choices: choices.slice(0, history.length - 1) }
        }
      }
    }
  }
  // Fall back to localStorage
  try {
    const saved = localStorage.getItem(`bacterial-id-${treeKey}-path`)
    if (saved) {
      const choices = JSON.parse(saved)
      if (Array.isArray(choices) && choices.length > 0) {
        const history = buildHistoryFromChoices(nodes, choices)
        if (history.length > 1) {
          return { history, choices: choices.slice(0, history.length - 1) }
        }
      }
    }
  } catch {}
  return { history: [nodes.root], choices: [] }
}

function saveState(treeKey, newChoices) {
  window.location.hash = newChoices.length > 0 ? `${treeKey}:${newChoices.join(',')}` : ''
  try {
    if (newChoices.length > 0) {
      localStorage.setItem(`bacterial-id-${treeKey}-path`, JSON.stringify(newChoices))
    } else {
      localStorage.removeItem(`bacterial-id-${treeKey}-path`)
    }
  } catch {}
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function StepsRemaining({ current, stepsDone, getStepsRemaining }) {
  if (current.type === 'result') {
    return (
      <div className="progress-bar-wrapper" role="status" aria-live="polite">
        <div className="progress-meta">
          <span className="progress-label" aria-hidden="true">Complete</span>
          <span className="progress-detail identified">Organism identified</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} aria-label="Identification progress: complete">
          <div className="progress-fill progress-fill--done" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  const { min, max } = getStepsRemaining(current.id);
  const optimisticTotal = stepsDone + min;
  const pct = Math.min(99, Math.round((stepsDone / (optimisticTotal || 1)) * 100));

  const remainingText =
    min === max
      ? `${min} test${min === 1 ? '' : 's'} remaining`
      : `${min}–${max} tests remaining`;

  return (
    <div className="progress-bar-wrapper" role="status" aria-live="polite">
      <div className="progress-meta">
        <span className="progress-label" aria-hidden="true">Progress</span>
        <span className="progress-detail">{remainingText}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Identification progress: ${remainingText}`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Main Wizard component ────────────────────────────────────────────────────

export default function Wizard({ wizardData, treeKey }) {
  const { nodes, getStepsRemaining } = wizardData;
  const cardTitleRef = useRef(null);

  const [{ history, choices }, setState] = useState(
    () => getInitialState(nodes, treeKey)
  );

  const current = history[history.length - 1];
  const stepsDone = history.length - 1;

  useEffect(() => {
    cardTitleRef.current?.focus();
  }, [current.id]);

  function handleOption(opt, optIdx) {
    const next = nodes[opt.nextId];
    if (!next) return;
    const newHistory = [...history, next];
    const newChoices = [...choices, optIdx];
    setState({ history: newHistory, choices: newChoices });
    saveState(treeKey, newChoices);
  }

  function handleBack() {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const newChoices = choices.slice(0, -1);
    setState({ history: newHistory, choices: newChoices });
    saveState(treeKey, newChoices);
  }

  function handleBreadcrumb(stepIdx) {
    const newHistory = history.slice(0, stepIdx + 1);
    const newChoices = choices.slice(0, stepIdx);
    setState({ history: newHistory, choices: newChoices });
    saveState(treeKey, newChoices);
  }

  function handleReset() {
    setState({ history: [nodes.root], choices: [] });
    window.location.hash = '';
    try { localStorage.removeItem(`bacterial-id-${treeKey}-path`); } catch {}
  }

  // Share: copy current URL (with hash) to clipboard
  function handleShare() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      prompt('Copy this link to share your current position:', window.location.href);
    });
  }

  return (
    <div className="wizard">
      <StepsRemaining current={current} stepsDone={stepsDone} getStepsRemaining={getStepsRemaining} />

      <nav className="wizard-breadcrumb" aria-label="Identification path">
        <ol className="breadcrumb-list">
          {history.map((node, i) => (
            <li key={node.id + i} className="breadcrumb-item">
              {i < history.length - 1 ? (
                <>
                  <button
                    className="breadcrumb-btn"
                    onClick={() => handleBreadcrumb(i)}
                    aria-label={`Go back to ${node.label}`}
                  >
                    {node.label}
                  </button>
                  <span className="breadcrumb-sep" aria-hidden="true">›</span>
                </>
              ) : (
                <span className="breadcrumb-current" aria-current="step">{node.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div
        className={`wizard-card ${current.type === 'result' ? 'result-card' : ''}`}
        aria-labelledby="card-title"
      >
        <div className="card-header">
          {current.type === 'result' ? (
            <span className="badge badge-result" aria-label="Organism identified">
              <span aria-hidden="true">✓</span> Organism Identified
            </span>
          ) : (
            <span className="badge badge-test" aria-label="Laboratory test">
              <span aria-hidden="true">⬡</span> Test
            </span>
          )}
          <h2
            id="card-title"
            className="card-title"
            ref={cardTitleRef}
            tabIndex={-1}
          >
            {current.label}
          </h2>
        </div>

        <p className="card-description">{current.description}</p>

        {current.type === 'decision' && (
          <div className="wizard-question">
            <p className="question-text" id="question-label">{current.question}</p>
            <div
              className="option-grid"
              role="group"
              aria-labelledby="question-label"
            >
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  className="option-btn"
                  onClick={() => handleOption(opt, i)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {current.type === 'result' && (
          <div className="result-organism">
            <p className="organism-name">{current.organism}</p>
          </div>
        )}
      </div>

      <div className="wizard-nav">
        <button
          className="nav-btn secondary"
          onClick={handleBack}
          disabled={history.length <= 1}
          aria-label="Go back one step"
        >
          ← Back
        </button>
        <button
          className="nav-btn secondary"
          onClick={handleReset}
          aria-label="Start identification over from the beginning"
        >
          Start Over
        </button>
        {stepsDone > 0 && (
          <button
            className="nav-btn secondary share-btn"
            onClick={handleShare}
            aria-label="Copy shareable link to this position"
          >
            Share Link
          </button>
        )}
        {current.type === 'result' && (
          <button
            className="nav-btn secondary print-btn"
            onClick={() => window.print()}
            aria-label="Print or save result as PDF"
          >
            Print / Save PDF
          </button>
        )}
      </div>
    </div>
  );
}
