import { useState } from 'react';
import NavBar from './components/NavBar';
import Wizard from './components/Wizard';
import ExportModal from './components/ExportModal';
import './App.css';

export default function App() {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="app">
      <NavBar onExport={() => setExportOpen(true)} />

      <main className="app-main">
        <Wizard />
      </main>

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}
