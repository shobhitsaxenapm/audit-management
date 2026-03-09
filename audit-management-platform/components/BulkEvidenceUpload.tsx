import React, { useRef, useState, useMemo } from 'react';
import { BulkUploadSession, BulkUploadFile, SampleModel } from '../types';
import { UploadIcon, CheckCircleIcon, CloseIcon, InfoCircleIcon } from './icons/Icons';
import { autoMapFiles } from '../utils/autoMapper';

interface BulkEvidenceUploadProps {
  controlInstanceId: string;
  session: BulkUploadSession | null;
  samples: SampleModel[];
  onSessionUpdate: (session: BulkUploadSession | null) => void;
  onApplyMapping: (session: BulkUploadSession) => void;
}

const BulkEvidenceUpload: React.FC<BulkEvidenceUploadProps> = ({
  controlInstanceId,
  session,
  samples,
  onSessionUpdate,
  onApplyMapping,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Derived counts
  const mappedCount = session?.files.filter(f => f.mappingStatus === 'MAPPED').length || 0;
  const unmatchedCount = session?.files.filter(f => f.mappingStatus === 'UNMATCHED').length || 0;
  const duplicateCount = session?.files.filter(f => f.mappingStatus === 'DUPLICATE').length || 0;
  const ambiguousCount = session?.files.filter(f => f.mappingStatus === 'AMBIGUOUS').length || 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList | File[]) => {
    const rawFiles: BulkUploadFile[] = Array.from(fileList).map((file) => ({
      fileId: `bulk-ev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'unknown',
      uploadStatus: 'completed',
      storageReference: URL.createObjectURL(file), // Mock storage ref
    }));

    if (rawFiles.length === 0) return;

    // Run auto-mapping immediately
    const mappedFiles = autoMapFiles(rawFiles, samples, session);

    if (session) {
      // Update existing session
      const combinedFiles = [...session.files, ...mappedFiles];
      onSessionUpdate({
        ...session,
        uploadedFilesCount: combinedFiles.length,
        mappedFilesCount: combinedFiles.filter(f => f.mappingStatus === 'MAPPED').length,
        unmatchedFilesCount: combinedFiles.filter(f => f.mappingStatus === 'UNMATCHED').length,
        duplicateFilesCount: combinedFiles.filter(f => f.mappingStatus === 'DUPLICATE').length,
        files: combinedFiles,
      });
    } else {
      // Create new session
      onSessionUpdate({
        bulkUploadSessionId: `buss-${Date.now()}`,
        controlInstanceId,
        uploadedFilesCount: mappedFiles.length,
        mappedFilesCount: mappedFiles.filter(f => f.mappingStatus === 'MAPPED').length,
        unmatchedFilesCount: mappedFiles.filter(f => f.mappingStatus === 'UNMATCHED').length,
        duplicateFilesCount: mappedFiles.filter(f => f.mappingStatus === 'DUPLICATE').length,
        createdAt: new Date().toISOString(),
        createdBy: 'Auditor User',
        status: 'in_progress',
        files: mappedFiles,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const updateFileStatus = (fileId: string, updates: Partial<BulkUploadFile>) => {
    if (!session) return;
    const newFiles = session.files.map(f => f.fileId === fileId ? { ...f, ...updates } : f);
    onSessionUpdate({
      ...session,
      mappedFilesCount: newFiles.filter(f => f.mappingStatus === 'MAPPED').length,
      unmatchedFilesCount: newFiles.filter(f => f.mappingStatus === 'UNMATCHED').length,
      duplicateFilesCount: newFiles.filter(f => f.mappingStatus === 'DUPLICATE').length,
      files: newFiles
    });
  };

  // Exception files
  const exceptionFiles = session?.files.filter(f => f.mappingStatus !== 'MAPPED') || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Evidence Upload</h3>
            <p className="text-sm text-gray-500">
              Upload multiple files at once. The system will automatically map them to samples based on file names.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!session ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mx-auto flex justify-center mb-4">
              <UploadIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-base font-medium text-gray-900 mb-1">Drag and drop files here</h4>
            <p className="text-sm text-gray-500 mb-6">ZIP, PDF, Excel, up to 50MB each</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileInputChange} />
              <input type="file" /* @ts-ignore */ webkitdirectory="" directory="" multiple className="hidden" ref={folderInputRef} onChange={handleFolderInputChange} />

              <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">Upload Files</button>
              <button onClick={() => folderInputRef.current?.click()} className="btn-secondary">Upload Folder</button>
              <button onClick={() => alert("ZIP extraction not yet implemented.")} className="btn-secondary">Upload ZIP</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Session Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Files</div>
                <div className="text-2xl font-bold text-gray-900">{session.uploadedFilesCount}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-xs font-medium text-green-700 uppercase tracking-wider mb-1">Mapped</div>
                <div className="text-2xl font-bold text-green-800">{mappedCount}</div>
              </div>
              <div className={`rounded-lg p-4 border ${unmatchedCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${unmatchedCount > 0 ? 'text-red-700' : 'text-gray-500'}`}>Unmatched</div>
                <div className={`text-2xl font-bold ${unmatchedCount > 0 ? 'text-red-800' : 'text-gray-900'}`}>{unmatchedCount}</div>
              </div>
              <div className={`rounded-lg p-4 border ${duplicateCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${duplicateCount > 0 ? 'text-amber-700' : 'text-gray-500'}`}>Duplicates</div>
                <div className={`text-2xl font-bold ${duplicateCount > 0 ? 'text-amber-800' : 'text-gray-900'}`}>{duplicateCount}</div>
              </div>
              <div className={`rounded-lg p-4 border ${ambiguousCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${ambiguousCount > 0 ? 'text-amber-700' : 'text-gray-500'}`}>Ambiguous</div>
                <div className={`text-2xl font-bold ${ambiguousCount > 0 ? 'text-amber-800' : 'text-gray-900'}`}>{ambiguousCount}</div>
              </div>
            </div>

            {/* Exceptions Review */}
            {exceptionFiles.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-900">Review Exceptions ({exceptionFiles.length})</h4>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {exceptionFiles.map((file) => (
                    <div key={file.fileId} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            file.mappingStatus === 'UNMATCHED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                            file.mappingStatus === 'DUPLICATE' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' :
                            'bg-amber-50 text-amber-700 ring-amber-600/10'
                          }`}>
                            {file.mappingStatus}
                          </span>
                          <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {file.mappingStatus === 'UNMATCHED' && 'Could not determine sample or evidence type.'}
                          {file.mappingStatus === 'DUPLICATE' && 'Slot already filled.'}
                          {file.mappingStatus === 'AMBIGUOUS' && 'Matched multiple possibilities.'}
                        </p>
                      </div>

                      {/* Explicit Manual Correction Dropdowns */}
                      <div className="flex items-center gap-2">
                         <select 
                            className="block w-40 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs sm:leading-6"
                            value={file.mappedSampleId || ''}
                            onChange={(e) => updateFileStatus(file.fileId, { mappedSampleId: e.target.value })}
                         >
                            <option value="">-- Select Sample --</option>
                            {samples.map(s => <option key={s.sampleId} value={s.sampleId}>{s.sampleIdentifier}</option>)}
                         </select>

                         <select 
                            className="block w-40 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs sm:leading-6"
                            value={file.mappedEvidenceType || ''}
                            onChange={(e) => updateFileStatus(file.fileId, { 
                               mappedEvidenceType: e.target.value,
                               // If both are now selected, mark MAPPED
                               mappingStatus: (file.mappedSampleId && e.target.value) ? 'MAPPED' : file.mappingStatus 
                            })}
                         >
                            <option value="">-- Select Evidence --</option>
                            {/* Derive pure unique evidence types from samples */}
                            {Array.from(new Set(samples.flatMap(s => s.evidence.map(e => e.evidenceType)))).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                         </select>

                         <button
                            onClick={() => {
                              if (window.confirm("Discard this file?")) {
                                const newFiles = session.files.filter(f => f.fileId !== file.fileId);
                                onSessionUpdate({ ...session, files: newFiles, uploadedFilesCount: newFiles.length });
                              }
                            }}
                            className="text-gray-400 hover:text-red-500"
                         >
                           <CloseIcon className="h-5 w-5" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
              <div className="flex gap-3">
                 <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileInputChange} />
                 <button onClick={() => fileInputRef.current?.click()} className="text-sm rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    Upload More
                 </button>
                 <button onClick={() => { if(confirm("Discard entire session?")) onSessionUpdate(null); }} className="text-sm rounded-md bg-white px-3 py-2 font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50">
                    Discard Session
                 </button>
              </div>
              <button 
                 onClick={() => onApplyMapping(session)}
                 disabled={exceptionFiles.length > 0}
                 className={`text-sm rounded-md px-4 py-2 font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                   exceptionFiles.length > 0 
                     ? 'bg-indigo-300 text-white cursor-not-allowed' 
                     : 'bg-indigo-600 text-white hover:bg-indigo-500'
                 }`}
              >
                 Apply Mappings
                 {exceptionFiles.length > 0 && <span className="ml-2 font-normal">({exceptionFiles.length} unresolved)</span>}
              </button>
            </div>

            {exceptionFiles.length > 0 && (
              <p className="mt-2 text-xs text-right text-gray-500">
                You must resolve all exceptions or discard unresolved files before applying mappings.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEvidenceUpload;
