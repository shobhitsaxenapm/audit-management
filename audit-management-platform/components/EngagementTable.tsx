

import React from 'react';
import type { Engagement, EngagementSortConfig, EngagementSortKey } from '../types';
import { SortIcon } from './icons/Icons';

interface EngagementTableProps {
  engagements: Engagement[];
  sortConfig: EngagementSortConfig;
  onSort: (key: EngagementSortKey) => void;
  onRowClick: (engagement: Engagement) => void;
  onMarkAsClosed: (id: number) => void;
}

const StatusBadge: React.FC<{ status: Engagement['status'] }> = ({ status }) => {
  // FIX: Added 'PLANNING' status to support its use for new engagements.
  const statusClasses: Record<Engagement['status'], string> = {
    "IN PROGRESS": "bg-blue-100 text-blue-800",
    "UNDER REVIEW": "bg-gray-200 text-gray-800",
    "NOT STARTED": "bg-gray-100 text-gray-600",
    "CLOSED": "bg-gray-800 text-gray-100",
    "PLANNING": "bg-sky-100 text-sky-800",
  };
  return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg ${statusClasses[status]}`}>{status}</span>;
};

const EngagementTable: React.FC<EngagementTableProps> = ({ engagements, sortConfig, onSort, onRowClick, onMarkAsClosed }) => {

  const headers: { key: EngagementSortKey; label: string }[] = [
    { key: 'name', label: 'Engagement' },
    { key: 'type', label: 'Type' },
    { key: 'period', label: 'Period' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 w-12">S/N</th>
            {headers.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => onSort(key)}
              >
                <div className="group inline-flex items-center">
                  {label}
                  <SortIcon
                    className={`ml-2 h-4 w-4 ${sortConfig.key === key ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'}`}
                    direction={sortConfig.key === key ? sortConfig.direction : 'none'}
                  />
                </div>
              </th>
            ))}
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {engagements.length > 0 ? (
            engagements.map((eng, index) => (
              <tr key={eng.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(eng)}>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{index + 1}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{eng.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{eng.type}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{eng.period}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusBadge status={eng.status} /></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent row click
                      onMarkAsClosed(eng.id);
                    }}
                    disabled={eng.status === 'CLOSED' || eng.status === 'NOT STARTED' || eng.status === 'PLANNING'}
                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    Mark as Closed
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-500">
                No engagements match the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EngagementTable;