import { useState, useRef, useEffect } from 'react';
import { nodes, getStepsRemaining, MAX_STEPS } from '../data/gramPositive';
import './Wizard.css';

function StepsRemaining({ current, stepsDone }) {
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

export default function Wizard() {
  const [history, setHistory] = useState([nodes['root']]);
  const cardTitleRef = useRef(null);

  const current = history[history.length - 1];
  const stepsDone = history.length - 1;

  // Move focus to the card heading whenever the current node changes.
  // tabIndex={-1} lets us focus it programmatically; :focus-visible won't
  // show an outline here (not keyboard-initiated), keeping visuals clean.
  useEffect(() => {
    cardTitleRef.current?.focus();
  }, [current.id]);

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
      {/* Steps remaining */}
      <StepsRemaining current={current} stepsDone={stepsDone} />

      {/* Breadcrumb — helps screen readers & keyboard users retrace steps */}
      <nav className="wizard-breadcrumb" aria-label="Identification path">
        <ol className="breadcrumb-list">
          {history.map((node, i) => (
            <li key={node.id + i} className="breadcrumb-item">
              {i < history.length - 1 ? (
                <>
                  <button
                    className="breadcrumb-btn"
                    onClick={() => setHistory(history.slice(0, i + 1))}
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

      {/* Current node card */}
      <div
        className={`wizard-card ${current.type === 'result' ? 'result-card' : ''}`}
        aria-labelledby="card-title"
      >
        <div className="card-header">
          {current.type === 'result' ? (
            /* Shape + label — color is NOT the only differentiator (WCAG 1.4.1) */
            <span className="badge badge-result" aria-label="Organism identified">
              <span aria-hidden="true">✓</span> Organism Identified
            </span>
          ) : (
            <span className="badge badge-test" aria-label="Laboratory test">
              <span aria-hidden="true">⬡</span> Test
            </span>
          )}
          {/* tabIndex={-1}: programmatic focus target; not in tab order */}
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
      </div>
    </div>
  );
}
