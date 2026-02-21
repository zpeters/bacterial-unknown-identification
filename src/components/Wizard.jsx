import { useState } from 'react';
import { nodes, getStepsRemaining, MAX_STEPS } from '../data/gramPositive';
import './Wizard.css';

function StepsRemaining({ current, stepsDone }) {
  if (current.type === 'result') {
    return (
      <div className="progress-bar-wrapper">
        <div className="progress-meta">
          <span className="progress-label">Complete</span>
          <span className="progress-detail identified">Organism identified</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  const { min, max } = getStepsRemaining(current.id);
  const optimisticTotal = stepsDone + min;
  const pct = Math.min(100, Math.round((stepsDone / (optimisticTotal || 1)) * 100));

  const remainingText =
    min === max
      ? `${min} test${min === 1 ? '' : 's'} remaining`
      : `${min}–${max} tests remaining`;

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-meta">
        <span className="progress-label">Progress</span>
        <span className="progress-detail">{remainingText}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Wizard() {
  const [history, setHistory] = useState([nodes['root']]);

  const current = history[history.length - 1];
  const stepsDone = history.length - 1;

  function handleOption(opt) {
    const next = nodes[opt.nextId];
    if (!next) return;
    setHistory([...history, next]);
  }

  function handleBack() {
    if (history.length <= 1) return;
    setHistory(history.slice(0, -1));
  }

  function handleReset() {
    setHistory([nodes['root']]);
  }

  return (
    <div className="wizard">
      {/* Steps remaining indicator */}
      <StepsRemaining current={current} stepsDone={stepsDone} />

      {/* Breadcrumb trail */}
      <div className="wizard-breadcrumb">
        {history.map((node, i) => (
          <span key={node.id + i}>
            <button
              className="breadcrumb-btn"
              onClick={() => {
                setHistory(history.slice(0, i + 1));
              }}
            >
              {node.label}
            </button>
            {i < history.length - 1 && <span className="breadcrumb-sep">›</span>}
          </span>
        ))}
      </div>

      {/* Current node card */}
      <div className={`wizard-card ${current.type === 'result' ? 'result-card' : ''}`}>
        <div className="card-header">
          {current.type === 'result' ? (
            <span className="badge badge-result">Organism Identified</span>
          ) : (
            <span className="badge badge-test">Test</span>
          )}
          <h2 className="card-title">{current.label}</h2>
        </div>

        <p className="card-description">{current.description}</p>

        {current.type === 'decision' && (
          <div className="wizard-question">
            <p className="question-text">{current.question}</p>
            <div className="option-grid">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  className="option-btn"
                  onClick={() => handleOption(opt)}
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

      {/* Navigation */}
      <div className="wizard-nav">
        <button
          className="nav-btn secondary"
          onClick={handleBack}
          disabled={history.length <= 1}
        >
          ← Back
        </button>
        <button className="nav-btn secondary" onClick={handleReset}>
          Start Over
        </button>
      </div>
    </div>
  );
}
