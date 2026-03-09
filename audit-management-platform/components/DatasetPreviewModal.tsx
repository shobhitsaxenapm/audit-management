import React from 'react';
import { ControlDataSource } from '../types';
import { CloseIcon } from './icons/Icons';

interface DatasetPreviewModalProps {
  dataset: ControlDataSource | null;
  onClose: () => void;
}

const DatasetPreviewModal: React.FC<DatasetPreviewModalProps> = ({ dataset, onClose }) => {
  if (!dataset) return null;

  const isTableData = dataset.type === 'excel' || dataset.type === 'csv';
  const isPDF = dataset.type === 'pdf';

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 flex flex-col max-h-[90vh]">
          
          <div className="flex items-center justify-between mb-4 border-b pb-4">
             <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Preview: {dataset.filename}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                   Type: {dataset.type.toUpperCase()} | Size: {(dataset.size / 1024).toFixed(2)} KB
                </p>
             </div>
             <button type="button" onClick={onClose} className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none">
                 <span className="sr-only">Close</span>
                 <CloseIcon className="h-6 w-6" />
             </button>
          </div>

          <div className="flex-grow overflow-auto">
            {isTableData && dataset.records && dataset.records.length > 0 ? (
                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                {Object.keys(dataset.records[0] || {}).map(key => (
                                    <th key={key} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {dataset.records.slice(0, 50).map((row, idx) => (
                                <tr key={idx}>
                                    {Object.values(row).map((val, cellIdx) => (
                                        <td key={cellIdx} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {String(val)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {dataset.records.length > 50 && (
                        <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                            Showing first 50 rows.
                        </div>
                    )}
                </div>
            ) : isTableData ? (
                <div className="text-center py-10 text-gray-500">No data records found in this dataset.</div>
            ) : isPDF ? (
                 <div className="h-[60vh] w-full bg-gray-100 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                     {dataset.fileUrl ? (
                         <iframe src={dataset.fileUrl} className="w-full h-full" title="PDF Preview" />
                     ) : (
                         <div className="text-center">
                            <div className="text-red-500 mb-2">
                                {/* Simple PDF Icon placeholder */}
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 font-medium">PDF Document Viewer</p>
                            <p className="text-sm text-gray-500 mt-1">Preview of {dataset.filename}</p>
                         </div>
                     )}
                 </div>
            ) : (
                 <div className="text-center py-10 text-gray-500">Preview not available for this file type.</div>
            )}
          </div>

          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t pt-4">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close Preview
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DatasetPreviewModal;
