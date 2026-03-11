
import React, { useState, useMemo } from 'react';
import { RACM, RACMDetail, RACMDetailSortKey, SortDirection, ValidationErrors, RACMStatus } from '../types';
import { racmBuilderData } from '../constants';
import { ChevronRightIcon, LockIcon } from './icons/Icons';
import RACMBuilderToolbar from './RACMBuilderToolbar';
import RACMBuilderTable from './RACMBuilderTable';
import RACMBuilderFooter from './RACMBuilderFooter';
import RACMBuilderFilterModal from './RACMBuilderFilterModal';
import Toast from './Toast';
import { exportToCsv } from '../utils/csvHelper';

interface RACMBuilderPageProps {
  racm: RACM;
  onBack: () => void;
}

interface RACMFilters {
    keyStatus: 'All' | 'Key' | 'Not Key';
    riskIds: string[];
}

const StatusBadge: React.FC<{ status: RACMStatus }> = ({ status }) => {
    const statusClasses: Record<RACMStatus, string> = {
      Draft: "bg-yellow-100 text-yellow-800",
      Validated: "bg-blue-100 text-blue-800",
      Locked: "bg-gray-700 text-gray-100",
    };
    return <span className={`ml-3 px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
}

const RACMBuilderPage: React.FC<RACMBuilderPageProps> = ({ racm, onBack }) => {
  const [rows, setRows] = useState<RACMDetail[]>(racm.importedDetails || racmBuilderData);
  const [racmStatus, setRACMStatus] = useState<RACMStatus>(racm.locked ? 'Locked' : 'Draft');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: RACMDetailSortKey, direction: SortDirection }>({ key: 'riskId', direction: 'ascending' });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<RACMFilters>({ keyStatus: 'All', riskIds: [] });
  
  const isLocked = racmStatus === 'Locked';

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const handleSetRows = (action: React.SetStateAction<RACMDetail[]>) => {
      if (racmStatus === 'Validated') {
          setRACMStatus('Draft');
          showToast("RACM was modified and must be re-validated.");
      }
      setRows(action);
  };

  const handleAddRow = () => {
    const newId = Math.max(0, ...rows.map(r => r.id)) + 1;
    const newRow: RACMDetail = { id: newId, riskId: '', riskDescription: '', assertion: '', controlName: '', controlDescription: '', key: false };
    handleSetRows([...rows, newRow]);
  };

  const handleDelete = () => {
    if (selectedRowIds.size === 0) {
      alert('Select at least one row to delete.');
      return;
    }
    handleSetRows(rows.filter(row => !selectedRowIds.has(row.id)));
    setSelectedRowIds(new Set());
  };

  const handleCopy = () => {
    if (selectedRowIds.size !== 1) {
      alert('Please select exactly one row to copy.');
      return;
    }
    const rowToCopy = rows.find(r => selectedRowIds.has(r.id));
    if (!rowToCopy) return;

    const newId = Math.max(0, ...rows.map(r => r.id)) + 1;
    const newRow: RACMDetail = { ...rowToCopy, id: newId, key: false };
    
    const originalIndex = rows.findIndex(r => r.id === rowToCopy.id);
    const newRows = [...rows];
    newRows.splice(originalIndex + 1, 0, newRow);
    handleSetRows(newRows);
    setSelectedRowIds(new Set());
  };

  const handleValidate = (): boolean => {
    const errors: ValidationErrors = {};
    const riskGroups = new Map<string, RACMDetail[]>();

    rows.forEach(row => {
        if (row.riskId && !riskGroups.has(row.riskId)) {
            riskGroups.set(row.riskId, []);
        }
        if(row.riskId) {
          riskGroups.get(row.riskId)!.push(row);
        }

        const rowErrors: ValidationErrors[number] = {};
        if (!row.riskId) rowErrors.riskId = "Required";
        if (!row.riskDescription) rowErrors.riskDescription = "Required";
        if (!row.assertion) rowErrors.assertion = "Required";
        if (!row.controlName) rowErrors.controlName = "Required";
        if (!row.controlDescription) rowErrors.controlDescription = "Required";
        if (Object.keys(rowErrors).length > 0) {
            errors[row.id] = rowErrors;
        }
    });

    let primaryErrorShown = false;
    riskGroups.forEach((group, riskId) => {
        if (!group.some(r => r.key)) {
            group.forEach(row => {
                if (!errors[row.id]) errors[row.id] = {};
            });
            if(!primaryErrorShown){
                showToast(`Validation failed: Risk ID ${riskId} must have at least one key control.`);
                primaryErrorShown = true;
            }
        }
    });
    
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
        if(!primaryErrorShown) showToast('Validation failed. Please review highlighted rows.');
        return false;
    }
    
    setRACMStatus('Validated');
    showToast('Validation successful.');
    return true;
  };

  const handleLock = () => {
    if (racmStatus !== 'Validated') {
        showToast("RACM must be successfully validated before locking.");
        return;
    }
    if (window.confirm("Locking RACM will prevent further edits. Continue?")) {
        setRACMStatus('Locked');
        showToast("RACM has been locked.");
    }
  };
  
  const handleExport = () => {
    if (sortedRows.length === 0) {
      showToast("No data available to export.");
      return;
    }
    exportToCsv(`${racm.name.replace(/\s/g, '_')}.csv`, sortedRows);
    showToast("RACM exported successfully.");
  };

  const handleApplyFilters = (newFilters: RACMFilters) => {
    setFilters(newFilters);
    setIsFilterModalOpen(false);
  };
  
  const handleSort = (key: RACMDetailSortKey) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
        const searchMatch =
            (row.riskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             row.riskDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             row.assertion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             row.controlName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             row.controlDescription?.toLowerCase().includes(searchTerm.toLowerCase()));

        const keyStatusMatch =
            filters.keyStatus === 'All' ||
            (filters.keyStatus === 'Key' && row.key) ||
            (filters.keyStatus === 'Not Key' && !row.key);

        const riskIdMatch =
            filters.riskIds.length === 0 || filters.riskIds.includes(row.riskId);

        return searchMatch && keyStatusMatch && riskIdMatch;
    });
  }, [rows, searchTerm, filters]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    if (sortConfig.key) {
        sorted.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }
    return sorted;
  }, [filteredRows, sortConfig]);

  return (
    <div>
        <div className="flex items-center text-lg text-gray-500 mb-6">
            <button onClick={onBack} className="hover:text-gray-900">Audit Management</button>
            <ChevronRightIcon className="h-5 w-5 mx-2" />
            <span className="font-semibold text-blue-600 border-b-2 border-blue-600 pb-1">{racm.name}</span>
            <StatusBadge status={racmStatus} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <RACMBuilderToolbar 
                onAddRow={handleAddRow}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onImport={() => alert("Import not implemented")}
                onExport={handleExport}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onFilterClick={() => setIsFilterModalOpen(true)}
                onSortClick={() => handleSort('riskId')}
                disabled={isLocked}
            />
            <RACMBuilderTable
                rows={sortedRows}
                setRows={handleSetRows}
                isLocked={isLocked}
                selectedRowIds={selectedRowIds}
                setSelectedRowIds={setSelectedRowIds}
                validationErrors={validationErrors}
                sortConfig={sortConfig}
                onSort={handleSort}
            />
            <RACMBuilderFooter 
                racmStatus={racmStatus}
                onSaveDraft={() => showToast("Draft saved successfully.")}
                onValidate={handleValidate}
                onLock={handleLock}
                totalRows={rows.length}
                filteredRows={sortedRows.length}
            />
        </div>
        <RACMBuilderFilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApply={handleApplyFilters}
            currentFilters={filters}
            allRows={rows}
        />
        <Toast message={toastMessage} />
    </div>
  );
};

export default RACMBuilderPage;