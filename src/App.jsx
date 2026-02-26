import { useState } from 'react';
import NavBar from './components/NavBar';
import Wizard from './components/Wizard';
import ExportModal from './components/ExportModal';
import Footer from './components/Footer';
import gramPosNodes from './data/gramPositive.json';
import gramNegNodes from './data/gramNegative.json';
import { createStepsRemainingFn, createEdgesFn } from './data/treeUtils';
import './App.css';

const WIZARD_DATA = {
  'gram-positive': {
    key: 'gram-positive',
    title: 'Gram Positive',
    nodes: gramPosNodes,
    getStepsRemaining: createStepsRemainingFn(gramPosNodes),
    // FlowChart needs these two
    dataNodes: gramPosNodes,
    getEdgesFn: createEdgesFn(gramPosNodes),
  },
  'gram-negative': {
    key: 'gram-negative',
    title: 'Gram Negative',
    nodes: gramNegNodes,
    getStepsRemaining: createStepsRemainingFn(gramNegNodes),
    dataNodes: gramNegNodes,
    getEdgesFn: createEdgesFn(gramNegNodes),
  },
};

export default function App() {
  const [activeWizard, setActiveWizard] = useState(() => {
    // Restore active tree from URL hash on first load
    const hash = window.location.hash.slice(1);
    const key = hash.split(':')[0];
    return WIZARD_DATA[key] ? key : 'gram-positive';
  });
  const [exportOpen, setExportOpen] = useState(false);

  function handleWizardChange(key) {
    window.location.hash = '';
    setActiveWizard(key);
  }

  const wizardData = WIZARD_DATA[activeWizard];

  return (
    <div className="app">
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      <NavBar
        activeWizard={activeWizard}
        onWizardChange={handleWizardChange}
        onExport={() => setExportOpen(true)}
      />

      <main id="main-content" className="app-main">
        {/* key forces full remount (and state reset) when wizard type changes */}
        <Wizard key={activeWizard} wizardData={wizardData} treeKey={activeWizard} />
      </main>

      {exportOpen && (
        <ExportModal wizardData={wizardData} onClose={() => setExportOpen(false)} />
      )}

      <Footer />
    </div>
  );
}
