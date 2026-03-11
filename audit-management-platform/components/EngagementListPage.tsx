
import React, { useState, useMemo, useCallback } from 'react';
import type { Engagement, EngagementControl, EngagementSortConfig, EngagementSortKey, EngagementSummaryFilter, EngagementFilters, NewEngagementData, RACM } from '../types';
import EngagementSummaryStrip from './EngagementSummaryStrip';
import EngagementToolbar from './EngagementToolbar';
import EngagementTable from './EngagementTable';
import EngagementFilterModal from './EngagementFilterModal';
import CreateEngagementModal from './CreateEngagementModal';
import Toast from './Toast';
import { AMZ_RACM_ID, amzTransportEngagementControls } from '../utils/importRacm';

interface EngagementListPageProps {
    engagements: Engagement[];
    setEngagements: React.Dispatch<React.SetStateAction<Engagement[]>>;
    controls: EngagementControl[];
    setControls: React.Dispatch<React.SetStateAction<EngagementControl[]>>;
    racms: RACM[];
    onSelectEngagement: (engagement: Engagement) => void;
}

const EngagementListPage: React.FC<EngagementListPageProps> = ({ engagements, setEngagements, controls, setControls, racms, onSelectEngagement }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSummaryFilter, setActiveSummaryFilter] = useState<EngagementSummaryFilter | null>(null);
    const [sortConfig, setSortConfig] = useState<EngagementSortConfig>({ key: 'name', direction: 'ascending' });
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isNewEngagementModalOpen, setIsNewEngagementModalOpen] = useState(false);
    
    const [filters, setFilters] = useState<EngagementFilters>({ types: [], statuses: [], periods: [] });
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredAndSortedEngagements = useMemo(() => {
        let filtered = [...engagements];

        // 1. Summary Strip Filter
        if (activeSummaryFilter) {
            filtered = filtered.filter(eng => {
                switch (activeSummaryFilter) {
                    case 'Total Active': return eng.status !== 'CLOSED';
                    case 'Completed (YTD)': return eng.status === 'CLOSED';
                    case 'In Progress': return eng.status === 'IN PROGRESS';
                    // FIX: Changed 'Pending Reviews' to 'Under Review' to match EngagementSummaryFilter type.
                    // FIX: Changed status check from 'REVIEW PENDING' to 'UNDER REVIEW' to match EngagementStatus type.
                    case 'Under Review': return eng.status === 'UNDER REVIEW';
                    default: return true;
                }
            });
        }
        
        // 2. Advanced Filters
        if (filters.types.length > 0) {
            filtered = filtered.filter(e => filters.types.includes(e.type));
        }
        if (filters.statuses.length > 0) {
            filtered = filtered.filter(e => filters.statuses.includes(e.status));
        }
        if (filters.periods.length > 0) {
            filtered = filtered.filter(e => filters.periods.includes(e.period));
        }

        // 3. Search Term Filter
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(eng =>
                Object.values(eng).some(value =>
                    String(value).toLowerCase().includes(lowercasedTerm)
                )
            );
        }

        // 4. Sorting
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
    }, [engagements, searchTerm, activeSummaryFilter, sortConfig, filters]);

    const handleSort = (key: EngagementSortKey) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
    };

    const handleSummaryFilter = (filter: EngagementSummaryFilter) => {
        setActiveSummaryFilter(prev => (prev === filter ? null : filter));
    };

    const handleMarkAsClosed = useCallback((id: number) => {
        // Validate: all controls must be Concluded before closing
        const engagementControls = controls; // In production, filter by engagement ID
        const unconcluded = engagementControls.filter(c => c.status !== 'Concluded');
        if (unconcluded.length > 0) {
            alert(`Cannot close engagement: ${unconcluded.length} control(s) are not yet Concluded.\n\nAll controls must complete testing and review before the engagement can be closed.`);
            return;
        }
        if (window.confirm('Are you sure you want to close this engagement? This action will lock all controls.')) {
            setEngagements(prev => prev.map(e => e.id === id ? { ...e, status: 'CLOSED' as const } : e));
        }
    }, [setEngagements, controls]);

    const handleCreateEngagement = (data: NewEngagementData) => {
        const getPeriod = (startDate: string) => {
            const date = new Date(startDate);
            const year = date.getFullYear();
            const month = date.getMonth();
            if (month < 3) return `Q1 ${year}`;
            if (month < 6) return `Q2 ${year}`;
            if (month < 9) return `Q3 ${year}`;
            return `Q4 ${year}`;
        }

        const linkedRacmIdNum = data.linkedRacmId ? Number(data.linkedRacmId) : undefined;
        const newEngagement: Engagement = {
            id: Date.now(),
            name: data.name,
            type: data.type,
            period: getPeriod(data.periodStart),
            totalDeficiencies: 0,
            status: 'PLANNING',
            linkedRacmName: linkedRacmIdNum ? (linkedRacmIdNum === AMZ_RACM_ID ? 'RACM AMZ TRANSPORT' : racms.find(r => r.id === linkedRacmIdNum)?.name) : undefined,
            leadPartner: data.leadPartner,
            description: data.description,
        };

        if (linkedRacmIdNum === AMZ_RACM_ID) {
            setControls(prev => {
                const alreadyAdded = prev.some(c => c.controlId.startsWith('C-'));
                if (alreadyAdded) return prev;
                return [...amzTransportEngagementControls, ...prev];
            });
        }

        setEngagements(prev => [newEngagement, ...prev]);
        setIsNewEngagementModalOpen(false);
        showToast("Engagement created successfully.");
    };

    return (
        <>
            <EngagementSummaryStrip engagements={engagements} activeFilter={activeSummaryFilter} onFilterClick={handleSummaryFilter} />
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
                <EngagementToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onNewEngagement={() => setIsNewEngagementModalOpen(true)}
                    onFilter={() => setIsFilterModalOpen(true)}
                />
                <EngagementTable
                    engagements={filteredAndSortedEngagements}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onRowClick={onSelectEngagement}
                    onMarkAsClosed={handleMarkAsClosed}
                />
            </div>
            
            <EngagementFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                engagements={engagements}
                activeFilters={filters}
                onApplyFilters={setFilters}
            />

            <CreateEngagementModal
                isOpen={isNewEngagementModalOpen}
                onClose={() => setIsNewEngagementModalOpen(false)}
                onSubmit={handleCreateEngagement}
                existingEngagements={engagements}
                racmList={racms}
            />
            
            <Toast message={toastMessage} />
        </>
    );
}

export default EngagementListPage;