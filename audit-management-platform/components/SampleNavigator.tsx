
import React from 'react';
import type { SampleRecord, SampleFinalStatus } from '../types';

export type SampleNavigatorMode = 'evidence' | 'results';

interface SampleNavigatorProps {
  samples: SampleRecord[];
  statuses: Record<string, SampleFinalStatus>;
  currentIndex: number;
  onSelect: (index: number) => void;
  mode?: SampleNavigatorMode;
  evidenceStatuses?: Record<string, 'pending' | 'ready'>;
}

const ResultsBadge: React.FC<{ status: SampleFinalStatus }> = ({ status }) => {
  const statusClasses: Record<SampleFinalStatus, string> = {
    'NOT TESTED': 'bg-gray-200 text-gray-800',
    'PASS': 'bg-green-100 text-green-800',
    'FAIL': 'bg-red-100 text-red-800',
    'OVERRIDDEN': 'bg-yellow-100 text-yellow-800',
    'NOT_APPLICABLE': 'bg-gray-300 text-gray-800',
  };
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status === 'NOT_APPLICABLE' ? 'N/A' : status}</span>;
};

const EvidenceBadge: React.FC<{ status: 'pending' | 'ready' }> = ({ status }) => {
  if (status === 'ready') {
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ready</span>;
  }
  return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Evidence Pending</span>;
};

const SampleNavigator: React.FC<SampleNavigatorProps> = ({ samples, statuses, currentIndex, onSelect, mode = 'results', evidenceStatuses }) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800">Samples</h3>
      </div>
      <nav>
        <ul>
          {samples.map((sample, index) => (
            <li key={sample.sampleId}>
              <button
                onClick={() => onSelect(index)}
                className={`w-full text-left p-3 border-l-4 text-sm
                  ${currentIndex === index 
                    ? 'bg-indigo-50 border-indigo-500' 
                    : 'border-transparent hover:bg-gray-100'}`
                }
              >
                <div className="font-semibold text-gray-900">Sample {index + 1}</div>
                <div className="text-gray-600 truncate">ID: {sample.recordData ? sample.recordData[Object.keys(sample.recordData)[0]] : 'N/A'}</div>
                <div className="mt-1">
                  {mode === 'evidence' ? (
                    <EvidenceBadge status={evidenceStatuses?.[sample.sampleId] || 'pending'} />
                  ) : (
                    <ResultsBadge status={statuses[sample.sampleId] || 'NOT TESTED'} />
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SampleNavigator;