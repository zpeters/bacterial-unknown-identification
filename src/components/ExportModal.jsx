import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import FlowChart from './FlowChart';
import './ExportModal.css';

export default function ExportModal({ onClose }) {
  const chartRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!chartRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: '#f8fafc',
        pixelRatio: 2,
        // exclude the React Flow controls/minimap from the export
        filter: (node) => {
          if (node.classList) {
            if (node.classList.contains('react-flow__controls')) return false;
            if (node.classList.contains('react-flow__minimap')) return false;
            if (node.classList.contains('detail-panel')) return false;
          }
          return true;
        },
      });
      const link = document.createElement('a');
      link.download = 'gram-positive-identification-chart.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-panel">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Gram Positive Identification Chart</h2>
            <p className="modal-subtitle">Pan and zoom to explore — download saves full resolution</p>
          </div>
          <div className="modal-actions">
            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Generating…' : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PNG
                </>
              )}
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>
        <div className="modal-chart" ref={chartRef}>
          <FlowChart />
        </div>
      </div>
    </div>
  );
}
