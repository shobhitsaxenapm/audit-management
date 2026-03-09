import React, { useState, useRef, useEffect } from 'react';
import type { Engagement } from '../types';
import { ChevronRightIcon, CopyIcon } from './icons/Icons';

interface EngagementWorkspaceHeaderProps {
  engagement: Engagement;
  onBack: () => void;
  isClosed: boolean;
  canClose: boolean;
  onCloseEngagement: () => void;
  closeDisabledReason?: string;
  onExportReport?: () => void;
}

const EngagementStatusBadge: React.FC<{ status: Engagement['status'], type: string }> = ({ status, type }) => {
    const typeColor = "bg-gray-800 text-white";
    
    const statusClasses: Record<Engagement['status'], string> = {
        "IN PROGRESS": "bg-blue-100 text-blue-800",
        "UNDER REVIEW": "bg-gray-200 text-gray-800",
        "NOT STARTED": "bg-gray-100 text-gray-600",
        "CLOSED": "bg-gray-700 text-gray-100",
        "PLANNING": "bg-sky-100 text-sky-800",
    };
    
    const statusColor = statusClasses[status] || "bg-gray-100 text-gray-800";

    return (
        <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${typeColor}`}>{type}</span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${statusColor}`}>{status}</span>
        </div>
    );
}

const EngagementWorkspaceHeader: React.FC<EngagementWorkspaceHeaderProps> = ({ engagement, onBack, isClosed, canClose, onCloseEngagement, closeDisabledReason, onExportReport }) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex items-center text-sm sm:text-base text-gray-500 mb-4">
        <button onClick={onBack} className="hover:text-gray-900">Audit Management</button>
        <ChevronRightIcon className="h-5 w-5 mx-1" />
        <button onClick={onBack} className="hover:text-gray-900">Engagement</button>
        <ChevronRightIcon className="h-5 w-5 mx-1" />
        <span className="font-medium text-gray-800 truncate">{engagement.name}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{engagement.name}</h2>
            <EngagementStatusBadge status={engagement.status} type={engagement.type} />
          </div>
      </div>
       <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
              <div>
                  <span className="text-gray-500">Linked RACM: </span>
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-800">{engagement.linkedRacmName || 'FY26 SOX v1.0'}</a>
              </div>
              <div>
                  <span className="text-gray-500">Period: </span>
                  <span className="font-medium text-gray-800">1 Apr 2025 - 31 Mar 2026</span>
              </div>
          </div>
          <div className="flex items-center gap-3">
               <div className="relative">
                  <select
                    defaultValue="FY 2026"
                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 sm:text-sm"
                  >
                    <option>FY 2026</option>
                    <option>FY 2025</option>
                  </select>
               </div>
               
               <div className="relative" ref={dropdownRef}>
                 <button 
                   onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                   className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                 >
                   Export Reports
                   <svg className={`w-4 h-4 text-gray-500 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </button>
                 {isExportMenuOpen && (
                   <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                     <div className="py-1" role="menu">
                       <button
                         onClick={() => { setIsExportMenuOpen(false); onExportReport?.(); }}
                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                         role="menuitem"
                       >
                         Engagement Report
                       </button>
                       <button
                         disabled
                         className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center justify-between"
                         role="menuitem"
                       >
                         Exception Summary
                         <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
                       </button>
                     </div>
                   </div>
                 )}
               </div>

               <div className="relative group">
                 <button 
                  onClick={onCloseEngagement}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isClosed || !canClose}
                 >
                    {isClosed ? 'Engagement Closed' : 'Close Engagement'}
                 </button>
                 {!isClosed && !canClose && closeDisabledReason && (
                   <div className="absolute right-0 top-full mt-1 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     {closeDisabledReason}
                   </div>
                 )}
               </div>
          </div>
      </div>
    </>
  );
};

export default EngagementWorkspaceHeader;