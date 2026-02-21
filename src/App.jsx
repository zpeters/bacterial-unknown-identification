import { useState } from 'react';
import NavBar from './components/NavBar';
import Wizard from './components/Wizard';
import ExportModal from './components/ExportModal';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="app">
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      <NavBar onExport={() => setExportOpen(true)} />

      <main id="main-content" className="app-main">
        <Wizard />
      </main>

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}

      <Footer />
    </div>
  );
}
