import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { DataViewerDataset } from '../types';
import { CloseIcon, SearchIcon, SortIcon } from './icons/Icons';

interface DataViewerPanelProps {
  dataset: DataViewerDataset;
  onClose: () => void;
  highlightRowId?: string; // e.g., a sample ID or primary identifier to highlight
}

type SortDir = 'asc' | 'desc' | null;

const DataViewerPanel: React.FC<DataViewerPanelProps> = ({ dataset, onClose, highlightRowId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<{ col: string; startX: number; startWidth: number } | null>(null);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Calculate default column widths on mount
  useEffect(() => {
    const defaults: Record<string, number> = {};
    dataset.columns.forEach(col => {
      const len = Math.max(col.length * 9, 80);
      defaults[col] = Math.min(len, 200);
    });
    setColWidths(defaults);
  }, [dataset.columns]);

  // Auto-scroll to highlighted row
  useEffect(() => {
    if (highlightRef.current && tableContainerRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightRowId]);

  // Column resize handlers
  const handleMouseDown = useCallback((col: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ col, startX: e.clientX, startWidth: colWidths[col] || 120 });
  }, [colWidths]);

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      setColWidths(prev => ({
        ...prev,
        [resizing.col]: Math.max(60, resizing.startWidth + diff),
      }));
    };
    const handleMouseUp = () => setResizing(null);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // Sort handler
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortColumn(null); setSortDir(null); }
      else setSortDir('asc');
    } else {
      setSortColumn(col);
      setSortDir('asc');
    }
  };

  // Filter + sort rows
  const processedRows = useMemo(() => {
    let rows = [...dataset.rows];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter(row =>
        Object.values(row).some(val =>
          String(val ?? '').toLowerCase().includes(term)
        )
      );
    }

    // Sort
    if (sortColumn && sortDir) {
      rows.sort((a, b) => {
        const aVal = a[sortColumn] ?? '';
        const bVal = b[sortColumn] ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return rows;
  }, [dataset.rows, searchTerm, sortColumn, sortDir]);

  // Find the highlight row
  const highlightIndex = useMemo(() => {
    if (!highlightRowId || !dataset.idColumn) return -1;
    return processedRows.findIndex(row => String(row[dataset.idColumn!]) === highlightRowId);
  }, [processedRows, highlightRowId, dataset.idColumn]);

  const isDocument = dataset.fileType === 'pdf' || dataset.fileType === 'png' || dataset.fileType === 'jpg';

  const sourceTypeBadge = (type: string) => {
    const classes: Record<string, string> = {
      'Uploaded Dataset': 'bg-blue-100 text-blue-800',
      'System Dataset': 'bg-purple-100 text-purple-800',
      'Population File': 'bg-amber-100 text-amber-800',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded ${classes[type] || 'bg-gray-100 text-gray-800'}`}>{type}</span>;
  };

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-40 transition-opacity" onClick={onClose} />

      {/* Panel — slides from right, 45% width */}
      <div
        className="absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col"
        style={{ width: '48%', minWidth: '600px', maxWidth: '900px' }}
      >
        {/* ── Header ── */}
        <header className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">{dataset.name}</h2>
                {sourceTypeBadge(dataset.sourceType)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                  <strong className="text-gray-700">{dataset.totalRows.toLocaleString()}</strong> rows
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                  <strong className="text-gray-700">{dataset.totalColumns}</strong> columns
                </span>
                <span className="text-gray-400">|</span>
                <span className="uppercase text-xs font-medium text-gray-400">{dataset.fileType}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search bar */}
          {!isDocument && (
            <div className="mt-3 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search within dataset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
              />
              {searchTerm && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {processedRows.length} results
                </span>
              )}
            </div>
          )}
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-hidden flex flex-col" ref={tableContainerRef}>
          {isDocument ? (
            /* Document Preview */
            <div className="flex-1 p-4 overflow-auto bg-gray-100">
              <div className="h-full w-full flex items-center justify-center">
                {dataset.fileType === 'pdf' ? (
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-700 font-medium text-lg">PDF Document Preview</p>
                    <p className="text-sm text-gray-500 mt-1">{dataset.name}</p>
                    <p className="text-xs text-gray-400 mt-2">In production, the PDF would be rendered here using a PDF viewer.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25c0 .828.672 1.5 1.5 1.5z" />
                    </svg>
                    <p className="text-gray-700 font-medium text-lg">Image Preview</p>
                    <p className="text-sm text-gray-500 mt-1">{dataset.name}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Excel-like Grid */
            <div className="flex-1 overflow-auto">
              <table className="border-collapse" style={{ minWidth: '100%' }}>
                <thead className="sticky top-0 z-10">
                  <tr>
                    {dataset.columns.map((col) => (
                      <th
                        key={col}
                        className="relative bg-gray-100 border-b-2 border-r border-gray-300 px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider select-none cursor-pointer hover:bg-gray-200 transition-colors"
                        style={{ width: colWidths[col] || 120, minWidth: 60 }}
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1.5 pr-3">
                          <span className="truncate">{col}</span>
                          {sortColumn === col && (
                            <SortIcon
                              className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0"
                              direction={sortDir === 'asc' ? 'ascending' : 'descending'}
                            />
                          )}
                        </div>
                        {/* Resize handle */}
                        <div
                          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-indigo-400 active:bg-indigo-500 transition-colors"
                          onMouseDown={(e) => handleMouseDown(col, e)}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedRows.map((row, rowIdx) => {
                    const isHighlighted = rowIdx === highlightIndex;
                    return (
                      <tr
                        key={rowIdx}
                        ref={isHighlighted ? highlightRef : undefined}
                        className={`
                          ${isHighlighted
                            ? 'bg-yellow-100 ring-2 ring-inset ring-yellow-400'
                            : rowIdx % 2 === 0
                              ? 'bg-white'
                              : 'bg-gray-50/60'
                          }
                          hover:bg-blue-50 transition-colors
                        `}
                      >
                        {dataset.columns.map((col) => (
                          <td
                            key={col}
                            className="border-r border-b border-gray-200 px-3 py-2 text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ maxWidth: colWidths[col] || 120 }}
                            title={String(row[col] ?? '')}
                          >
                            {row[col] === null || row[col] === undefined
                              ? <span className="text-gray-300 italic">null</span>
                              : typeof row[col] === 'number'
                                ? <span className="font-mono tabular-nums">{row[col].toLocaleString()}</span>
                                : String(row[col])
                            }
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {processedRows.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <svg className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>No rows match "<strong>{searchTerm}</strong>"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <span>
            Showing <strong className="text-gray-700">{processedRows.length}</strong> of <strong className="text-gray-700">{dataset.rows.length}</strong> loaded rows
            {dataset.totalRows > dataset.rows.length && (
              <span className="ml-1">(total dataset: {dataset.totalRows.toLocaleString()} rows)</span>
            )}
          </span>
          <span className="text-gray-400 italic">Read-only view</span>
        </footer>
      </div>
    </div>
  );
};

export default DataViewerPanel;
