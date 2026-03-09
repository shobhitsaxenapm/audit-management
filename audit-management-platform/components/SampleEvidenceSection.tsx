import React, { useRef } from 'react';
import { EvidenceModel } from '../types';
import { UploadIcon, EyeIcon, TrashIcon } from './icons/Icons';

interface EvidenceModelSectionProps {
  evidence: EvidenceModel[];
  onUpload: (evidenceId: string, file: File) => void;
  onReplace: (evidenceId: string, file: File) => void;
  onView: (evidence: EvidenceModel) => void;
  isLocked: boolean;
}

const EvidenceModelSection: React.FC<EvidenceModelSectionProps> = ({
  evidence,
  onUpload,
  onReplace,
  onView,
  isLocked,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeEvidenceIdRef = useRef<string | null>(null);
  const isReplacingRef = useRef(false);

  const handleFileSelect = (evidenceId: string, replacing: boolean) => {
    activeEvidenceIdRef.current = evidenceId;
    isReplacingRef.current = replacing;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeEvidenceIdRef.current) {
      if (isReplacingRef.current) {
        onReplace(activeEvidenceIdRef.current, file);
      } else {
        onUpload(activeEvidenceIdRef.current, file);
      }
    }
    // reset
    if (fileInputRef.current) fileInputRef.current.value = '';
    activeEvidenceIdRef.current = null;
    isReplacingRef.current = false;
  };

  const handleDownload = (ev: EvidenceModel) => {
    if (!ev.storageReference) return;
    const a = document.createElement('a');
    a.href = ev.storageReference;
    a.download = ev.fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-800 mb-3">Sample Evidence</h3>
      {/* Hidden file input shared across all rows */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.xls"
      />
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Evidence Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evidence.map((ev) => {
              const isUploaded = !!ev.fileName;
              return (
                <tr key={ev.evidenceId}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {ev.evidenceType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                    {ev.evidenceName}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {isUploaded ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Not Uploaded
                      </span>
                    )}
                    {isUploaded && (
                      <span className="block text-xs text-gray-400 mt-0.5 truncate max-w-[180px]" title={ev.fileName || ''}>
                        {ev.fileName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                    {isUploaded ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => !isLocked && handleFileSelect(ev.evidenceId, true)}
                          disabled={isLocked}
                          className="text-gray-600 hover:text-gray-900 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => onView(ev)}
                          className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(ev)}
                          className="text-gray-600 hover:text-gray-900 text-xs font-medium"
                        >
                          Download
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => !isLocked && handleFileSelect(ev.evidenceId, false)}
                        disabled={isLocked}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <UploadIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                        Upload
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvidenceModelSection;
