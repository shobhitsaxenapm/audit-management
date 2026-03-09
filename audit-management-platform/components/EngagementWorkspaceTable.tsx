
import React, { useRef, useEffect, useMemo } from 'react';
import type { EngagementControl, EngagementControlSortConfig, EngagementControlSortKey, ControlStatus, ControlConclusion } from '../types';
import { SortIcon } from './icons/Icons';

interface EngagementWorkspaceTableProps {
  controls: EngagementControl[];
  sortConfig: EngagementControlSortConfig;
  onSort: (key: EngagementControlSortKey) => void;
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  onControlClick: (control: EngagementControl) => void;
  isEngagementClosed: boolean;
}

const StatusBadge: React.FC<{ status: ControlStatus }> = ({ status }) => {
  const statusClasses: Record<ControlStatus, string> = {
    'Not Started': 'bg-gray-100 text-gray-600',
    'Evidence Collection': 'bg-amber-100 text-amber-800',
    'Testing In Progress': 'bg-blue-100 text-blue-800',
    'Pending Review': 'bg-pink-100 text-pink-800',
    'Concluded': 'bg-gray-200 text-gray-800',
  };
  return <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
};

// Unified Result column: shows final business-facing outcome
const ResultBadge: React.FC<{ conclusion: ControlConclusion | null; status: ControlStatus }> = ({ conclusion, status }) => {
    if (conclusion) {
      const classes = conclusion === 'Effective' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      return <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${classes}`}>{conclusion}</span>;
    }
    if (status === 'Pending Review') {
      return <span className="text-xs text-pink-600 font-medium">Pending Review</span>;
    }
    return <span className="text-gray-400">—</span>;
};

const SamplesProgress: React.FC<{ tested: number; total: number }> = ({ tested, total }) => {
  const pct = total > 0 ? Math.round((tested / total) * 100) : 0;
  const barColor = pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300';
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{tested} / {total}</span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// Weighted progress: Evidence 30%, Testing 50%, Review 20%
const calculateProgress = (control: EngagementControl): number => {
  switch (control.status) {
    case 'Not Started':
      return 0;
    case 'Evidence Collection':
      // Evidence partially done → ~15% average
      return 15;
    case 'Testing In Progress': {
      // Evidence done (30%) + partial testing
      const evidencePct = 30;
      const testingPct = control.totalSamples > 0
        ? Math.round((control.testedSamples / control.totalSamples) * 50)
        : 0;
      return evidencePct + testingPct;
    }
    case 'Pending Review':
      // Evidence (30%) + Testing (50%) done, review pending
      return 80;
    case 'Concluded':
      return 100;
    default:
      return 0;
  }
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const barColor = value === 100 ? 'bg-green-500' : value >= 80 ? 'bg-indigo-500' : value > 0 ? 'bg-blue-500' : 'bg-gray-300';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{value}%</span>
    </div>
  );
};

const EngagementWorkspaceTable: React.FC<EngagementWorkspaceTableProps> = ({ controls, sortConfig, onSort, selectedIds, setSelectedIds, onControlClick, isEngagementClosed }) => {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
        selectAllCheckboxRef.current.indeterminate = selectedIds.size > 0 && selectedIds.size < controls.length;
    }
  }, [selectedIds, controls.length]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? new Set(controls.map(c => c.id)) : new Set());
  };

  const handleSelectOne = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    newSelectedIds.has(id) ? newSelectedIds.delete(id) : newSelectedIds.add(id);
    setSelectedIds(newSelectedIds);
  };
  
  const headers: { key: EngagementControlSortKey; label: string }[] = [
    { key: 'controlId', label: 'Control ID' },
    { key: 'controlName', label: 'Control Name' },
    { key: 'domain', label: 'Domain' },
    { key: 'key', label: 'Key Control' },
    { key: 'status', label: 'Status' },
    { key: '', label: 'Progress' },
    { key: 'testedSamples', label: 'Samples' },
    { key: 'exceptions', label: 'Exceptions' },
    { key: 'conclusion', label: 'Result' },
    { key: 'lastUpdated', label: 'Last Updated' },
  ];

  // Pre-compute progress for each control
  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    controls.forEach(c => map.set(c.id, calculateProgress(c)));
    return map;
  }, [controls]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3.5">
              <input type="checkbox" ref={selectAllCheckboxRef} onChange={handleSelectAll} checked={controls.length > 0 && selectedIds.size === controls.length} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
            </th>
            {headers.map(({ key, label }) => (
              <th key={label} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={key ? () => onSort(key) : undefined}>
                <div className="group inline-flex items-center">
                  {label}
                  {key && <SortIcon className={`ml-2 h-4 w-4 ${sortConfig.key === key ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'}`} direction={sortConfig.key === key ? sortConfig.direction : 'none'}/>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {controls.length > 0 ? (
            controls.map(control => (
              <tr 
                key={control.id} 
                className={!isEngagementClosed ? 'hover:bg-gray-50' : ''}
                onClick={!isEngagementClosed ? () => onControlClick(control) : undefined}
              >
                <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.has(control.id)} onChange={() => handleSelectOne(control.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /></td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${isEngagementClosed ? 'text-gray-600' : 'cursor-pointer text-indigo-600 hover:text-indigo-800'}`}>{control.controlId}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{control.controlName}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{control.domain}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-800">{control.key ? 'Y' : 'N'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600"><StatusBadge status={control.status} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><ProgressBar value={progressMap.get(control.id) ?? 0} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><SamplesProgress tested={control.testedSamples} total={control.totalSamples} /></td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${control.exceptions > 0 ? 'text-red-600' : 'text-gray-800'}`}>{control.exceptions > 0 ? control.exceptions : '—'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><ResultBadge conclusion={control.conclusion} status={control.status} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{control.lastUpdated}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11} className="text-center py-10 text-gray-500">No controls match the selected filters.</td>
            </tr>
          )}
           {Array.from({ length: Math.max(0, 10 - controls.length) }).map((_, i) => (
             <tr key={`empty-${i}`} className="h-14">
                <td colSpan={11}></td>
            </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
};

export default EngagementWorkspaceTable;