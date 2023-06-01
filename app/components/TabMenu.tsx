'use client'

import React, { useState } from 'react';

import './TabMenu.css'

interface Tab {
  title: string;
  content: React.ReactNode;
}

interface TabMenuProps {
  tabs: Tab[];
}

const TabMenu: React.FC<TabMenuProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="tab-menu">
      <ul role="tablist">
        {tabs.map((tab, index) => (
          <li
            key={index}
            role="presentation"
            className={activeTab === index ? 'active' : ''}
          >
            <button
              role="tab"
              aria-selected={activeTab === index ? 'true' : 'false'}
              onClick={() => handleTabClick(index)}
            >
              {tab.title}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TabMenu;
