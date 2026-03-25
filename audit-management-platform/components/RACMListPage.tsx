
import React, { useState, useMemo, useCallback } from 'react';
import type { RACM, SortConfig, SortKey, SummaryFilter } from '../types';
import { racmData } from '../constants';
// TEMP_DEMO_AMAZON_TRANSPORT: Import demo RACM data
import { documentDataAmazonRacm } from '../demoAmazonTransport';
import SummaryStrip from './SummaryStrip';
import Toolbar from './Toolbar';
import RACMTable from './RACMTable';
import CreateRACMModal from './CreateRACMModal';
import Toast from './Toast';
import { exportToCsv } from '../utils/csvHelper';

interface RACMListPageProps {
    onSelectRACM: (racm: RACM) => void;
}

const RACMListPage: React.FC<RACMListPageProps> = ({ onSelectRACM }) => {
    // TEMP_DEMO_AMAZON_TRANSPORT: show only one active AMZ RACM as requested
    const [racms, setRacms] = useState<RACM[]>([documentDataAmazonRacm]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFramework, setSelectedFramework] = useState('All Frameworks');
    const [activeSummaryFilter, setActiveSummaryFilter] = useState<SummaryFilter | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [highlightedRowId, setHighlightedRowId] = useState<number | null>(null);

    const filteredAndSortedRacms = useMemo(() => {
        let filtered = [...racms];

        if (activeSummaryFilter) {
            filtered = filtered.filter(racm => {
                switch (activeSummaryFilter) {
                    case 'Active': return racm.status === 'Active';
                    case 'Draft': return racm.status === 'Draft';
                    case 'Locked': return racm.locked;
                    case 'Linked to Engagement': return racm.linkedEngagements > 0;
                    default: return true;
                }
            });
        }

        if (selectedFramework !== 'All Frameworks') {
            filtered = filtered.filter(racm => racm.framework === selectedFramework);
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(racm =>
                Object.values(racm).some(value =>
                    String(value).toLowerCase().includes(lowercasedTerm)
                )
            );
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [racms, searchTerm, selectedFramework, activeSummaryFilter, sortConfig]);

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
    };

    const handleSummaryFilter = (filter: SummaryFilter) => {
        setActiveSummaryFilter(prev => (prev === filter ? null : filter));
    };

    const handleDuplicate = useCallback((id: number) => {
        const racmToDuplicate = racms.find(r => r.id === id);
        if (!racmToDuplicate) return;

        const versionParts = racmToDuplicate.version.split('.');
        const newMinorVersion = parseInt(versionParts[1] || '0', 10) + 1;
        const newVersion = `${versionParts[0]}.${newMinorVersion}`;
        const newRACM: RACM = {
            ...racmToDuplicate,
            id: Date.now(),
            version: newVersion,
            status: 'Draft',
            locked: false,
            linkedEngagements: 0,
            lastUpdated: new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/ /g, ' ').replace(',', ''),
            name: `${racmToDuplicate.name} (Copy)`
        };
        setRacms(prev => [newRACM, ...prev]);
    }, [racms]);

    const handleCreateRACM = (newRACMData: Omit<RACM, 'id' | 'version' | 'status' | 'locked' | 'linkedEngagements' | 'lastUpdated'>) => {
        const newRACM: RACM = {
            ...newRACMData,
            id: Date.now(),
            version: 'v1.0',
            status: 'Draft',
            locked: false,
            linkedEngagements: 0,
            lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, ' '),
        };
        setRacms(prev => [newRACM, ...prev]);
        setIsCreateModalOpen(false);
        setToastMessage("RACM Created Successfully.");
        setTimeout(() => setToastMessage(null), 3000);
        setHighlightedRowId(newRACM.id);
        setTimeout(() => setHighlightedRowId(null), 1000);
    };

    const handleExport = () => {
        if (filteredAndSortedRacms.length > 0) {
            exportToCsv('racm_export.csv', filteredAndSortedRacms);
        } else {
            alert("No data to export.");
        }
    };

    const uniqueFrameworks = useMemo(() => ['All Frameworks', ...Array.from(new Set(racms.map(r => r.framework)))], [racms]);

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">RACM Library</h1>
                <p className="text-sm text-gray-500 mt-1">Manage all Risk & Control Matrices for your organization.</p>
            </div>
            <SummaryStrip racms={racms} activeFilter={activeSummaryFilter} onFilterClick={handleSummaryFilter} />

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
                <Toolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedFramework={selectedFramework}
                    onFrameworkChange={setSelectedFramework}
                    frameworkOptions={uniqueFrameworks}
                    onExport={handleExport}
                    onCreate={() => setIsCreateModalOpen(true)}
                />
                <RACMTable
                    racms={filteredAndSortedRacms}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onDuplicate={handleDuplicate}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    highlightedRowId={highlightedRowId}
                    onRowClick={onSelectRACM}
                />
            </div>
            <CreateRACMModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateRACM}
                existingRacms={racms}
            />
            <Toast message={toastMessage} />
        </>
    );
}

// FIX: Added a default export to make the component importable in App.tsx.
export default RACMListPage;
