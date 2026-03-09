
import React, { useMemo, useState } from 'react';
import type { EngagementControl, EngagementControlSummaryFilter } from '../types';

interface EngagementWorkspaceSummaryProps {
  controls: EngagementControl[];
  activeFilter: EngagementControlSummaryFilter | null;
  onFilterClick: (filter: EngagementControlSummaryFilter) => void;
}

const EngagementWorkspaceSummary: React.FC<EngagementWorkspaceSummaryProps> = ({ controls, activeFilter, onFilterClick }) => {

  const stats = useMemo(() => {
    const evidenceCollection = controls.filter(c => c.status === 'Evidence Collection').length;
    const testingInProgress = controls.filter(c => c.status === 'Testing In Progress').length;
    return {
      'Total Controls': controls.length,
      'Key Controls': controls.filter(c => c.key).length,
      'Work In Progress': evidenceCollection + testingInProgress,
      'Pending Review': controls.filter(c => c.status === 'Pending Review').length,
      'Concluded': controls.filter(c => c.status === 'Concluded').length,
      'Deficient': controls.filter(c => c.status === 'Concluded' && c.conclusion === 'Ineffective').length,
      // Sub-breakdown for tooltip
      _evidenceCollection: evidenceCollection,
      _testingInProgress: testingInProgress,
    };
  }, [controls]);

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const StatItem: React.FC<{ label: string, value: number, isFilterable: boolean, isDeficient?: boolean, tooltip?: React.ReactNode }> = ({ label, value, isFilterable, isDeficient = false, tooltip }) => {
    const isActive = activeFilter === label;
    const baseClasses = `relative px-4 py-2 flex items-center gap-3 rounded-md border transition-all`;
    const themeClasses = isDeficient 
        ? `bg-red-50 border-red-200 text-red-800` 
        : `bg-white border-gray-200`;
    const activeClasses = isActive ? (isDeficient ? 'ring-2 ring-red-400' : 'ring-2 ring-indigo-400') : '';
    const clickableClasses = isFilterable ? 'cursor-pointer hover:shadow-sm' : '';

    return (
        <div 
            className={`${baseClasses} ${themeClasses} ${activeClasses} ${clickableClasses}`}
            onClick={isFilterable ? () => onFilterClick(label as EngagementControlSummaryFilter) : undefined}
            onMouseEnter={() => setHoveredCard(label)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <span className={`text-2xl font-bold ${isDeficient ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
            <span className={`text-sm font-medium ${isDeficient ? 'text-red-700' : 'text-gray-600'}`}>{label}</span>
            {tooltip && hoveredCard === label && (
              <div className="absolute left-0 top-full mt-1 z-20 bg-gray-800 text-white text-xs rounded-md shadow-lg p-2.5 min-w-[180px] pointer-events-none">
                {tooltip}
              </div>
            )}
        </div>
    );
  };

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatItem label="Total Controls" value={stats['Total Controls']} isFilterable={false} />
        <StatItem label="Key Controls" value={stats['Key Controls']} isFilterable={true} />
        <StatItem 
          label="Work In Progress" 
          value={stats['Work In Progress']} 
          isFilterable={true} 
          tooltip={
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-gray-300">Evidence Collection:</span>
                <span className="font-semibold">{stats._evidenceCollection}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-300">Testing In Progress:</span>
                <span className="font-semibold">{stats._testingInProgress}</span>
              </div>
            </div>
          }
        />
        <StatItem label="Pending Review" value={stats['Pending Review']} isFilterable={true} />
        <StatItem label="Concluded" value={stats['Concluded']} isFilterable={true} />
        <StatItem label="Deficient" value={stats['Deficient']} isFilterable={true} isDeficient={true} />
    </div>
  );
};

export default EngagementWorkspaceSummary;