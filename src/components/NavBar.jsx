import { useTheme } from "../context/ThemeContext";
import "./NavBar.css";

const WIZARD_TABS = [
  { key: "gram-positive", label: "Gram Positive", available: true },
  { key: "gram-negative", label: "Gram Negative", available: true },
];

export default function NavBar({ activeWizard, onWizardChange, onExport }) {
  const { isDark, toggle } = useTheme();

  return (
    <header className="navbar">
      {/* Row 1: brand + actions */}
      <div className="navbar-top">
        <div className="navbar-brand">
          <svg
            className="navbar-logo"
            viewBox="0 0 32 32"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="16" cy="16" r="15" fill="#eff6ff" />
            <circle
              cx="16"
              cy="16"
              r="15"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            <circle cx="11" cy="12" r="2.8" fill="#22c55e" />
            <circle cx="20" cy="10" r="2" fill="#22c55e" />
            <circle cx="12" cy="21" r="2.2" fill="#22c55e" />
            <circle cx="21" cy="20" r="2.8" fill="#22c55e" />
            <circle cx="17" cy="15" r="1.6" fill="#22c55e" />
            <circle cx="8" cy="18" r="1.6" fill="#22c55e" />
            <circle cx="23" cy="13" r="1.4" fill="#22c55e" />
          </svg>
          <div className="navbar-brand-text">
            <span className="navbar-title">
              Bacterial Unknown Identification
            </span>
            <span className="navbar-subtitle">Microbiology Lab</span>
          </div>
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            className="export-btn"
            onClick={onExport}
            aria-label="Export chart as PNG"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="export-btn-label">Export Chart</span>
          </button>
        </div>
      </div>

      {/* Row 2: wizard type tabs (always scrollable, never overlaps) */}
      <nav className="navbar-tabs-bar" aria-label="Identification flowcharts">
        <div className="navbar-tabs">
          {WIZARD_TABS.map((w) => (
            <button
              key={w.key}
              className={`tab-btn ${activeWizard === w.key ? "active" : ""} ${!w.available ? "tab-disabled" : ""}`}
              disabled={!w.available}
              onClick={w.available ? () => onWizardChange(w.key) : undefined}
              title={!w.available ? "Coming soon" : undefined}
              aria-current={activeWizard === w.key ? "page" : undefined}
            >
              {w.label}
              {!w.available && (
                <span className="tab-soon" aria-hidden="true">
                  soon
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
