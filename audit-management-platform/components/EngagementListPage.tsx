
import React, { useState, useMemo, useCallback } from 'react';
import type { Engagement, EngagementControl, EngagementSortConfig, EngagementSortKey, EngagementSummaryFilter, EngagementFilters, NewEngagementData, RACM } from '../types';
import EngagementSummaryStrip from './EngagementSummaryStrip';
import EngagementToolbar from './EngagementToolbar';
import EngagementTable from './EngagementTable';
import EngagementFilterModal from './EngagementFilterModal';
import CreateEngagementModal from './CreateEngagementModal';
import Toast from './Toast';
import { AMZ_RACM_ID, amzTransportEngagementControls } from '../utils/importRacm';
// TEMP_DEMO_AMAZON_TRANSPORT: import hardcoded Amazon engagement for direct CTA routing
import { documentDataAmazonEngagement } from '../demoAmazonTransport';

// TEMP_DEMO_AMAZON_TRANSPORT: hiding existing engagements for CEO demo
// Set to false to restore the full engagement list
// To revert: delete this line (or set to false)
const TEMP_DEMO_SHOW_EMPTY_STATE = true;

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

    // TEMP_DEMO_AMAZON_TRANSPORT: store user-created engagement in demo state
    // Tracks IDs of engagements the user actually created in this demo session.
    // Empty → empty state shown. Non-empty → table shows only these.
    // To revert: delete this state and the logic below that references it.
    const [demoCreatedIds, setDemoCreatedIds] = useState<Set<number>>(new Set());

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

    // TEMP_DEMO_AMAZON_TRANSPORT: allow real engagement creation instead of predefined
    // Handles form submission in demo mode.
    //   • Creates a brand-new engagement from the user's input (no pre-filled data).
    //   • TEMP_DEMO_AMAZON_TRANSPORT: redirect to list after creation instead of detail
    //     — does NOT auto-navigate; user returns to list and clicks the row themselves.
    //   • TEMP_DEMO_AMAZON_TRANSPORT: load 18 controls only when RACM = AMZ TRANSPORT
    //     — ATC controls are injected via the same RACM-name check already in App.tsx.
    // To revert: delete this function; the demo render path below falls back to handleCreateEngagement.
    const handleDemoCreateEngagement = useCallback((data: NewEngagementData) => {
        const getPeriod = (startDate: string) => {
            const date = new Date(startDate);
            const year = date.getFullYear();
            const month = date.getMonth();
            if (month < 3) return `Q1 ${year}`;
            if (month < 6) return `Q2 ${year}`;
            if (month < 9) return `Q3 ${year}`;
            return `Q4 ${year}`;
        };

        const linkedRacmIdNum = data.linkedRacmId ? Number(data.linkedRacmId) : undefined;
        const newId = Date.now();

        // TEMP_DEMO_AMAZON_TRANSPORT: store user-created engagement in demo state
        // Build the engagement from user-entered form data — no hardcoded name or type.
        const newEngagement: Engagement = {
            id: newId,
            name: data.name,
            type: data.type,
            period: getPeriod(data.periodStart),
            totalDeficiencies: 0,
            status: 'NOT STARTED',
            linkedRacmName: linkedRacmIdNum === AMZ_RACM_ID
                ? 'RACM AMZ TRANSPORT'
                : (linkedRacmIdNum ? racms.find(r => r.id === linkedRacmIdNum)?.name : undefined),
            leadPartner: data.leadPartner,
            description: data.description,
        };

        // TEMP_DEMO_AMAZON_TRANSPORT: load 18 controls only when RACM = AMZ TRANSPORT
        // Reset ATC controls to fresh / NOT STARTED so they are clean for this engagement.
        // App.tsx filters controls by linkedRacmName containing 'TRANSPORT' — no extra wiring needed.
        if (linkedRacmIdNum === AMZ_RACM_ID) {
            setControls(prev => prev.map(c => {
                if (!c.controlId.startsWith('ATC-')) return c;
                return {
                    ...c,
                    status: 'Not Started' as const,
                    samplesTested: '0 / 0',
                    testedSamples: 0,
                    totalSamples: 0,
                    exceptions: 0,
                    systemResult: null,
                    conclusion: null,
                    lastUpdated: '--',
                    submittedBy: undefined,
                    submittedOn: undefined,
                };
            }));
        }

        setEngagements(prev => [newEngagement, ...prev]);

        // Track this ID so the demo list shows it (and only it)
        setDemoCreatedIds(prev => new Set([...prev, newId]));

        setIsNewEngagementModalOpen(false);
        showToast('Engagement created successfully.');
        // TEMP_DEMO_AMAZON_TRANSPORT: redirect to list after creation instead of detail
        // No onSelectEngagement call — user sees the list, then clicks the row to open detail.
    }, [racms, setControls, setEngagements]);

    // TEMP_DEMO_AMAZON_TRANSPORT: rendering empty state instead of real data
    // Original engagements are preserved in state — only the render is suppressed
    if (TEMP_DEMO_SHOW_EMPTY_STATE) {
        // TEMP_DEMO_AMAZON_TRANSPORT: show only engagements the user created in this demo session
        const demoFilteredEngagements = filteredAndSortedEngagements.filter(e => demoCreatedIds.has(e.id));
        const showEmpty = demoFilteredEngagements.length === 0;

        return (
            <>
                {/* TEMP_DEMO_AMAZON_TRANSPORT: empty state or user-created list for CEO demo */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
                    <EngagementToolbar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onNewEngagement={() => setIsNewEngagementModalOpen(true)}
                        onFilter={() => setIsFilterModalOpen(true)}
                    />
                    {showEmpty ? (
                        /* Empty state body */
                        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No engagements created yet</h3>
                            <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                Create your first engagement to begin audit execution
                            </p>
                            <button
                                onClick={() => setIsNewEngagementModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                New Engagement
                            </button>
                        </div>
                    ) : (
                        /* TEMP_DEMO_AMAZON_TRANSPORT: show only user-created demo engagements */
                        <EngagementTable
                            engagements={demoFilteredEngagements}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onRowClick={onSelectEngagement}
                            onMarkAsClosed={handleMarkAsClosed}
                        />
                    )}
                </div>

                {/* TEMP_DEMO_AMAZON_TRANSPORT: blank form — user fills freely, no prefill */}
                <CreateEngagementModal
                    isOpen={isNewEngagementModalOpen}
                    onClose={() => setIsNewEngagementModalOpen(false)}
                    onSubmit={handleDemoCreateEngagement}
                    existingEngagements={engagements.filter(e => e.id !== documentDataAmazonEngagement.id)}
                    racmList={racms}
                />

                <Toast message={toastMessage} />
            </>
        );
    }

    // TEMP_DEMO_AMAZON_TRANSPORT: preserving original engagement list
    // This block is unreachable while TEMP_DEMO_SHOW_EMPTY_STATE = true
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