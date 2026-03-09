
import React, { useState, useMemo } from 'react';
// FIX: Imported `ControlConclusion` to resolve a type error when mapping over controls.
import type { Engagement, EngagementControl, EngagementControlSortConfig, EngagementControlSortKey, EngagementControlSummaryFilter, ControlConclusion } from '../types';
import EngagementWorkspaceHeader from './EngagementWorkspaceHeader';
import EngagementWorkspaceSummary from './EngagementWorkspaceSummary';
import EngagementWorkspaceToolbar from './EngagementWorkspaceToolbar';
import EngagementWorkspaceTable from './EngagementWorkspaceTable';
import ControlDetailPanel from './ControlDetailPanel';
import Toast from './Toast';
import EngagementReportModal from './EngagementReportModal';

interface EngagementWorkspacePageProps {
  engagement: Engagement;
  controls: EngagementControl[];
  onBack: () => void;
  onPerformTesting: (control: EngagementControl) => void;
  onReviewControl: (control: EngagementControl) => void;
  onCloseEngagement: () => void;
}

const EngagementWorkspacePage: React.FC<EngagementWorkspacePageProps> = ({ engagement, controls, onBack, onPerformTesting, onReviewControl, onCloseEngagement }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<EngagementControlSortConfig>({ key: 'controlId', direction: 'ascending' });
  const [activeSummaryFilter, setActiveSummaryFilter] = useState<EngagementControlSummaryFilter | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedControl, setSelectedControl] = useState<EngagementControl | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEngagementReport, setShowEngagementReport] = useState(false);
  
  const isEngagementClosed = engagement.status === 'CLOSED';

  // Close-engagement validation
  const unconcludedCount = useMemo(() => controls.filter(c => c.status !== 'Concluded').length, [controls]);
  const canCloseEngagement = !isEngagementClosed && controls.length > 0 && unconcludedCount === 0;
  const closeDisabledReason = isEngagementClosed
    ? undefined
    : controls.length === 0
      ? 'No controls linked to this engagement.'
      : unconcludedCount > 0
        ? `${unconcludedCount} control(s) are not yet Concluded. All controls must complete testing and review.`
        : undefined;

  const handleCloseEngagement = () => {
    if (!canCloseEngagement) return;
    if (window.confirm('Are you sure you want to close this engagement? This will lock all controls and make the engagement read-only.')) {
      onCloseEngagement();
    }
  };

  // If engagement is closed, treat all controls as concluded for display purposes.
  const displayedControls = useMemo(() => {
    if (isEngagementClosed) {
      return controls.map(c => ({
        ...c,
        status: 'Concluded' as 'Concluded',
        // Preserve ineffective conclusions, otherwise mark as effective.
        // FIX: Cast the result to `ControlConclusion` to satisfy the `EngagementControl` type.
        conclusion: (c.conclusion === 'Ineffective' ? 'Ineffective' : 'Effective') as ControlConclusion,
      }));
    }
    return controls;
  }, [controls, isEngagementClosed]);


  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredAndSortedControls = useMemo(() => {
    let filtered = [...displayedControls];

    // 1. Summary Strip Filter
    if (activeSummaryFilter) {
      filtered = filtered.filter(control => {
        switch (activeSummaryFilter) {
          case 'Key Controls': return control.key;
          case 'Work In Progress': return ['Evidence Collection', 'Testing In Progress'].includes(control.status);
          case 'Pending Review': return control.status === 'Pending Review';
          case 'Concluded': return control.status === 'Concluded';
          case 'Deficient': return control.status === 'Concluded' && control.conclusion === 'Ineffective';
          default: return true;
        }
      });
    }

    // 2. Search Term Filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(control =>
        Object.values(control).some(value =>
          String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
    }

    // 3. Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [displayedControls, searchTerm, activeSummaryFilter, sortConfig]);
  
  const handleSort = (key: EngagementControlSortKey) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
  };

  const handleSummaryFilter = (filter: EngagementControlSummaryFilter) => {
    setActiveSummaryFilter(prev => (prev === filter ? null : filter));
  };
  
  const handleNavigateToTesting = (control: EngagementControl) => {
    setSelectedControl(null); // Close the panel
    onPerformTesting(control);
  }

  const handleControlClick = (control: EngagementControl) => {
    if (isEngagementClosed) return;
    
    if (control.status === 'Concluded') {
      showToast(`Control ${control.controlId} is Concluded and locked. No further editing is allowed.`);
      return;
    }
    
    if (control.status === 'Pending Review') {
      onReviewControl(control);
    } else {
      setSelectedControl(control);
    }
  };


  return (
    <div>
      <EngagementWorkspaceHeader 
        engagement={engagement} 
        onBack={onBack} 
        isClosed={isEngagementClosed} 
        canClose={canCloseEngagement} 
        onCloseEngagement={handleCloseEngagement} 
        closeDisabledReason={closeDisabledReason} 
        onExportReport={() => setShowEngagementReport(true)}
      />
      <EngagementWorkspaceSummary controls={displayedControls} activeFilter={activeSummaryFilter} onFilterClick={handleSummaryFilter} />
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
        <EngagementWorkspaceToolbar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalCount={displayedControls.length}
          filteredCount={filteredAndSortedControls.length}
        />
        <EngagementWorkspaceTable 
          controls={filteredAndSortedControls}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onControlClick={handleControlClick}
          isEngagementClosed={isEngagementClosed}
        />
      </div>
      
      {selectedControl && (
        <ControlDetailPanel 
          control={selectedControl} 
          onClose={() => setSelectedControl(null)}
          onPerformTesting={() => handleNavigateToTesting(selectedControl)}
        />
      )}
      <Toast message={toastMessage} />
      {showEngagementReport && (
        <EngagementReportModal
          engagement={engagement}
          controls={displayedControls}
          onClose={() => setShowEngagementReport(false)}
        />
      )}
    </div>
  );
};

export default EngagementWorkspacePage;
