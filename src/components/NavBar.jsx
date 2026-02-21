import './NavBar.css';

const WIZARDS = [
  { key: 'gram-positive', label: 'Gram Positive', active: true },
  { key: 'gram-negative', label: 'Gram Negative', active: false },
  { key: 'acid-fast', label: 'Acid-Fast (AFB)', active: false },
  { key: 'anaerobes', label: 'Anaerobes', active: false },
];

export default function NavBar({ onExport }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* App identity */}
        <div className="navbar-brand">
          <span className="navbar-title">Unknown ID</span>
          <span className="navbar-subtitle">Microbiology Lab</span>
        </div>

        {/* Wizard type tabs */}
        <nav className="navbar-tabs" aria-label="Identification flowcharts">
          {WIZARDS.map((w) => (
            <button
              key={w.key}
              className={`tab-btn ${w.active ? 'active' : 'disabled'}`}
              disabled={!w.active}
              title={w.active ? undefined : 'Coming soon'}
              aria-current={w.active ? 'page' : undefined}
            >
              {w.label}
              {!w.active && <span className="tab-soon">soon</span>}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="export-btn" onClick={onExport}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Chart
          </button>
        </div>
      </div>
    </header>
  );
}
