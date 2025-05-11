import React, { useState } from 'react';
import Tabs from './components/Tabs';
import CreateImage from './components/CreateImage';
import EditImage from './components/EditImage';
import './App.css';

const tabItems = [
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
];

function App() {
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  return (
    <div className="container">
      <header className="header">
        <h1>Image Studio</h1>
        <Tabs tabs={tabItems} selected={mode} onSelect={(id) => setMode(id as 'create' | 'edit')} />
      </header>
      <main>
        {mode === 'create' ? <CreateImage /> : <EditImage />}
      </main>
    </div>
  );
}

export default App;
