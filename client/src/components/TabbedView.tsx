    // client/src/components/TabbedView.tsx
    import { useState } from 'react';
    import './TabbedView.css';

    interface Tab {
      label: string;
      content: React.ReactNode;
    }

    interface TabbedViewProps {
      tabs: Tab[];
    }

    export function TabbedView({ tabs }: TabbedViewProps) {
      const [activeTab, setActiveTab] = useState(0);

      return (
        <div className="tabbed-view">
          <div className="tab-header">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                className={`tab-button ${index === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {tabs[activeTab].content}
          </div>
        </div>
      );
    }
    