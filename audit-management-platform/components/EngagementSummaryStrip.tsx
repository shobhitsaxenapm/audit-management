
import React, { useMemo } from 'react';
import type { Engagement, EngagementSummaryFilter } from '../types';

interface EngagementSummaryStripProps {
  engagements: Engagement[];
  activeFilter: EngagementSummaryFilter | null;
  onFilterClick: (filter: EngagementSummaryFilter) => void;
}

const EngagementSummaryStrip: React.FC<EngagementSummaryStripProps> = ({ engagements, activeFilter, onFilterClick }) => {
  const stats = useMemo(() => ({
    'Total Active': engagements.filter(e => e.status !== 'CLOSED').length,
    'In Progress': engagements.filter(e => e.status === 'IN PROGRESS').length,
    'Under Review': engagements.filter(e => e.status === 'UNDER REVIEW').length,
    'Completed (YTD)': engagements.filter(e => e.status === 'CLOSED').length,
  }), [engagements]);
  
  const StatItem: React.FC<{ label: EngagementSummaryFilter; value: number }> = ({ label, value }) => {
    const isActive = activeFilter === label;
    const baseClasses = "bg-white p-4 rounded-lg border";
    const clickableClasses = "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-indigo-300";
    const activeClasses = isActive ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200";

    return (
        <div 
            className={`${baseClasses} ${clickableClasses} ${activeClasses}`}
            onClick={() => onFilterClick(label)}
        >
            <div className="flex items-center space-x-3">
              <p className={`text-3xl font-bold ${isActive ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</p>
              <p className="text-sm font-medium text-gray-600">{label}</p>
            </div>
        </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Total Active" value={stats['Total Active']} />
        <StatItem label="In Progress" value={stats['In Progress']} />
        <StatItem label="Under Review" value={stats['Under Review']} />
        <StatItem label="Completed (YTD)" value={stats['Completed (YTD)']} />
    </div>
  );
};

export default EngagementSummaryStrip;