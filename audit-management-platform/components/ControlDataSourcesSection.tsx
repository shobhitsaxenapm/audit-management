import React, { useRef, useState } from 'react';
import { UploadIcon, TrashIcon, InfoCircleIcon, TableIcon } from './icons/Icons';
import { ControlDataSource } from '../types';
import type { DataViewerDataset } from '../types';
import DatasetPreviewModal from './DatasetPreviewModal';
import DataViewerPanel from './DataViewerPanel';
import { dataViewerDatasets, datasetNameToId } from '../dataViewerData';

// Mock list of previously uploaded files within the engagement
const MOCK_EXISTING_DATASETS: { name: string; type: ControlDataSource['type']; size: number }[] = [
  { name: 'User_Access_Export_Q4.xlsx', type: 'excel', size: 245760 },
  { name: 'Transaction_Ledger_2025.csv', type: 'csv', size: 132096 },
  { name: 'PO_Dump_March_2025.xlsx', type: 'excel', size: 389120 },
  { name: 'GRN_Report_FY25.xlsx', type: 'excel', size: 204800 },
  { name: 'Vendor_Master_List.csv', type: 'csv', size: 98304 },
];

interface ControlDataSourcesSectionProps {
  dataSources: ControlDataSource[];
  onAddDataSource: (ds: ControlDataSource) => void;
  onRemoveDataSource: (id: string) => void;
  onUpdateMatchingKey: (id: string, key: string) => void;
  availableKeys: string[];
}

const ControlDataSourcesSection: React.FC<ControlDataSourcesSectionProps> = ({ 
  dataSources, 
  onAddDataSource, 
  onRemoveDataSource,
  onUpdateMatchingKey,
  availableKeys
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [previewDataset, setPreviewDataset] = useState<ControlDataSource | null>(null);
  const [showChooseExisting, setShowChooseExisting] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [viewerDataset, setViewerDataset] = useState<DataViewerDataset | null>(null);

  const openDataViewer = (ds: ControlDataSource) => {
    // Try to map this data source to a mock dataset
    const datasetId = datasetNameToId[ds.filename];
    if (datasetId && dataViewerDatasets[datasetId]) {
      setViewerDataset(dataViewerDatasets[datasetId]);
    } else {
      // Fallback to modal preview for unmapped datasets
      setPreviewDataset(ds);
    }
  };

  const parseMockData = (file: { name: string }): Record<string, any>[] => {
    if (file.name.includes('PO')) {
      return [
        { 'PO Number': 'PO-1001', 'PO Amount': 5000, 'Vendor': 'Tech Corp', 'PO Quantity': 50 },
        { 'PO Number': 'PO-1002', 'PO Amount': 2500, 'Vendor': 'Supply Co', 'PO Quantity': 100 },
      ];
    }
    if (file.name.includes('GRN')) {
      return [
        { 'GRN Number': 'GRN-5001', 'PO Number': 'PO-1001', 'GRN Quantity': 50, 'Date': '2024-03-01' },
        { 'GRN Number': 'GRN-5002', 'PO Number': 'PO-1002', 'GRN Quantity': 90, 'Date': '2024-03-05' },
      ];
    }
    if (file.name.includes('User_Access') || file.name.includes('Access')) {
      return [
        { 'User ID': 'USR-001', 'Access Level': 'Admin', 'Last Review': '2025-01-15', 'Department': 'IT' },
        { 'User ID': 'USR-002', 'Access Level': 'Read Only', 'Last Review': '2025-02-20', 'Department': 'Finance' },
      ];
    }
    if (file.name.includes('Transaction')) {
      return [
        { 'Txn ID': 'TXN-8801', 'Amount': 12500, 'Date': '2025-03-01', 'Approved By': 'J. Smith' },
        { 'Txn ID': 'TXN-8802', 'Amount': 4300, 'Date': '2025-03-03', 'Approved By': 'M. Jones' },
      ];
    }
    return [
      { 'ID': 1, 'RefNumber': `REF-${Math.floor(Math.random()*1000)}`, 'Value': 100 },
      { 'ID': 2, 'RefNumber': `REF-${Math.floor(Math.random()*1000)}`, 'Value': 200 },
    ];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        let type: ControlDataSource['type'] = 'other';
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) type = 'excel';
        if (file.name.endsWith('.csv')) type = 'csv';
        if (file.name.endsWith('.pdf')) type = 'pdf';

        const newDs: ControlDataSource = {
          id: Math.random().toString(36).substring(7),
          filename: file.name,
          type,
          uploadDate: new Date().toLocaleDateString(),
          size: file.size,
        };

        if (type === 'excel' || type === 'csv') {
          newDs.records = parseMockData(file);
        }
        if (type === 'pdf') {
          newDs.fileUrl = URL.createObjectURL(file);
        }

        onAddDataSource(newDs);
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && replacingId) {
      const file: File = e.target.files[0];
      // Remove old, add new
      onRemoveDataSource(replacingId);

      let type: ControlDataSource['type'] = 'other';
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) type = 'excel';
      if (file.name.endsWith('.csv')) type = 'csv';
      if (file.name.endsWith('.pdf')) type = 'pdf';

      const newDs: ControlDataSource = {
        id: Math.random().toString(36).substring(7),
        filename: file.name,
        type,
        uploadDate: new Date().toLocaleDateString(),
        size: file.size,
      };
      if (type === 'excel' || type === 'csv') newDs.records = parseMockData(file);
      if (type === 'pdf') newDs.fileUrl = URL.createObjectURL(file);
      onAddDataSource(newDs);
    }
    setReplacingId(null);
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

  const handleChooseExisting = (item: typeof MOCK_EXISTING_DATASETS[0]) => {
    const newDs: ControlDataSource = {
      id: Math.random().toString(36).substring(7),
      filename: item.name,
      type: item.type,
      uploadDate: new Date().toLocaleDateString(),
      size: item.size,
      records: parseMockData(item),
    };
    onAddDataSource(newDs);
    setShowChooseExisting(false);
  };

  const handleReplace = (dsId: string) => {
    setReplacingId(dsId);
    replaceInputRef.current?.click();
  };

  return (
    <div className="mb-6 px-6 py-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Control Data Sources</h3>
          <p className="text-sm text-gray-500">
            Upload system datasets (e.g. access review dumps or transaction exports) that will be used to automatically evaluate testing rules across all samples.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChooseExisting(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" /></svg>
            Choose Existing
          </button>
          <label className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              multiple
              accept=".csv,.xlsx,.xls,.pdf"
            />
            <UploadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Upload Dataset
          </label>
        </div>
      </div>

      {/* Hidden replace input */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceChange}
        className="hidden"
        accept=".csv,.xlsx,.xls,.pdf"
      />

      {dataSources.length > 0 ? (
        <div className="mt-4">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matching Key</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataSources.map((ds) => (
                  <tr key={ds.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {ds.type === 'excel' || ds.type === 'csv' ? (
                          <span className="text-green-600 mr-2 bg-green-100 px-2 py-0.5 rounded text-xs font-bold">XLS/CSV</span>
                        ) : ds.type === 'pdf' ? (
                          <span className="text-red-600 mr-2 bg-red-100 px-2 py-0.5 rounded text-xs font-bold">PDF</span>
                        ) : null}
                        <span className="truncate max-w-[200px]">{ds.filename}</span>
                      </div>
                      <span className="block text-xs text-gray-400 mt-0.5">Applies to all samples</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(ds.size / 1024).toFixed(0)} KB<br/>
                      <span className="text-xs text-gray-400">Uploaded {ds.uploadDate}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        value={ds.matchingKey || ""}
                        onChange={(e) => onUpdateMatchingKey(ds.id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">-- Select Matching Key --</option>
                        {(ds.records && ds.records.length > 0) ? (
                          Object.keys(ds.records[0]).map(col => (
                            <option key={col} value={col}>Match on: {col}</option>
                          ))
                        ) : (
                          availableKeys.map(key => <option key={key} value={key}>Match on: {key}</option>)
                        )}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openDataViewer(ds)} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-semibold">
                          <TableIcon className="h-3.5 w-3.5" />
                          View Data
                        </button>
                        <button onClick={() => handleReplace(ds.id)} className="text-gray-600 hover:text-gray-900">Replace</button>
                        <button onClick={() => {
                          const a = document.createElement("a");
                          a.href = ds.fileUrl || "/#";
                          a.download = ds.filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }} className="text-gray-600 hover:text-gray-900">Download</button>
                        <button onClick={() => onRemoveDataSource(ds.id)} className="text-red-500 hover:text-red-700">
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg mt-4">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No datasets uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">Upload system datasets or choose from existing engagement files to evaluate testing rules across all samples.</p>
        </div>
      )}

      {/* Choose Existing Modal */}
      {showChooseExisting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Choose Existing Dataset</h3>
              <button onClick={() => setShowChooseExisting(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">Select a previously uploaded dataset from this engagement.</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {MOCK_EXISTING_DATASETS.filter(
                  item => !dataSources.some(ds => ds.filename === item.name)
                ).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChooseExisting(item)}
                    className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className={`mr-3 px-2 py-0.5 rounded text-xs font-bold ${item.type === 'excel' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.type === 'excel' ? 'XLS' : 'CSV'}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{(item.size / 1024).toFixed(0)} KB</span>
                  </button>
                ))}
                {MOCK_EXISTING_DATASETS.filter(
                  item => !dataSources.some(ds => ds.filename === item.name)
                ).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">All available datasets have already been added.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button onClick={() => setShowChooseExisting(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {previewDataset && (
        <DatasetPreviewModal dataset={previewDataset} onClose={() => setPreviewDataset(null)} />
      )}

      {viewerDataset && (
        <DataViewerPanel dataset={viewerDataset} onClose={() => setViewerDataset(null)} />
      )}
    </div>
  );
};

export default ControlDataSourcesSection;
