import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  selected: string;
  onSelect: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, selected, onSelect }) => (
  <div className="tabs">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={tab.id === selected ? 'tab active' : 'tab'}
        onClick={() => onSelect(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default Tabs;
