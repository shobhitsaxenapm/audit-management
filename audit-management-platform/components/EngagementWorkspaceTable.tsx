import React, { useRef, useEffect } from 'react';
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
    'Evidence Collection': 'bg-yellow-100 text-yellow-800',
    'Testing In Progress': 'bg-blue-100 text-blue-800',
    'Pending Review': 'bg-purple-100 text-purple-800',
    'Concluded': 'bg-green-100 text-green-800',
  };
  return <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const KeyBadge: React.FC<{ isKey: boolean }> = ({ isKey }) => {
  if (!isKey) return <span className="text-gray-400 font-medium">—</span>;
  return <span className="px-2 py-0.5 inline-flex flex-shrink-0 items-center justify-center text-[10px] leading-4 font-bold rounded bg-amber-100 text-amber-800 tracking-wider">KEY</span>;
};

const ExceptionBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return <span className="text-gray-400 font-medium">—</span>;
  return <span className="px-2 py-0.5 inline-flex text-xs font-bold rounded-full bg-red-100 text-red-700">{count}</span>;
}

const ResultBadge: React.FC<{ conclusion: ControlConclusion | null; status: ControlStatus }> = ({ conclusion, status }) => {
    if (conclusion) {
      const classes = conclusion === 'Effective' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      return <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${classes}`}>{conclusion}</span>;
    }
    if (status === 'Pending Review') {
      return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-purple-100 text-purple-800">Pending Review</span>;
    }
    return <span className="text-gray-400 font-medium">—</span>;
};

const SamplesProgress: React.FC<{ tested: number; total: number }> = ({ tested, total }) => {
  const pct = total > 0 ? Math.round((tested / total) * 100) : 0;
  const barColor = pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300';
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{tested} / {total}</span>
      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden shrink-0">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
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
    { key: 'controlId', label: 'Control' },
    { key: 'domain', label: 'Domain' },
    { key: 'key', label: 'Key' },
    { key: 'status', label: 'Status' },
    { key: 'testedSamples', label: 'Samples' },
    { key: 'exceptions', label: 'Exceptions' },
    { key: 'conclusion', label: 'Result' },
    { key: 'lastUpdated', label: 'Last Updated' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3.5 w-10">
              <input type="checkbox" ref={selectAllCheckboxRef} onChange={handleSelectAll} checked={controls.length > 0 && selectedIds.size === controls.length} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
            </th>
            {headers.map(({ key, label }) => (
              <th key={label} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={key ? () => onSort(key) : undefined}>
                <div className="group inline-flex items-center tracking-wide">
                  {label}
                  {key && <SortIcon className={`ml-2 h-4 w-4 ${sortConfig.key === key ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'}`} direction={sortConfig.key === key ? sortConfig.direction : 'none'}/>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {controls.length > 0 ? (
            controls.map(control => (
              <tr 
                key={control.id} 
                className={!isEngagementClosed ? 'hover:bg-gray-50 transition-colors cursor-pointer' : ''}
                onClick={!isEngagementClosed ? () => onControlClick(control) : undefined}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(control.id)} onChange={() => handleSelectOne(control.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /></td>
                <td className="px-3 py-4 max-w-[240px]">
                  <div className={`${isEngagementClosed ? 'text-gray-600' : 'text-indigo-700'} font-semibold text-sm mb-0.5`}>
                    {control.controlId}
                  </div>
                  <div className="text-xs text-gray-500 font-medium truncate" title={control.controlName}>
                    {control.controlName}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 font-medium">{control.domain}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><KeyBadge isKey={control.key} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><StatusBadge status={control.status} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><SamplesProgress tested={control.testedSamples} total={control.totalSamples} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><ExceptionBadge count={control.exceptions} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm"><ResultBadge conclusion={control.conclusion} status={control.status} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-500 font-medium tracking-wider">{control.lastUpdated}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-10 text-gray-500">No controls match the selected filters.</td>
            </tr>
          )}
           {Array.from({ length: Math.max(0, 10 - controls.length) }).map((_, i) => (
             <tr key={`empty-${i}`} className="h-[68px]">
                <td colSpan={9}></td>
            </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
};

export default EngagementWorkspaceTable;