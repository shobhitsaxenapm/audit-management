
import React, { useState } from 'react';
import type { SampleRecord, TestScriptAttribute, TestingResult, AuditorResult } from '../types';
import { UploadIcon } from './icons/Icons';

interface TestingPanelProps {
  sample: SampleRecord;
  attributes: TestScriptAttribute[];
  results: Record<number, TestingResult>;
  onUpdate: (sampleId: string, attributeId: number, newResultData: Partial<TestingResult>) => void;
  isLocked: boolean;
}

const TestingPanel: React.FC<TestingPanelProps> = ({ sample, attributes, results, onUpdate, isLocked }) => {

  const handleAuditorResultChange = (attributeId: number, value: AuditorResult) => {
    onUpdate(sample.sampleId, attributeId, { auditorResult: value });
  };
  
  const handleCommentChange = (attributeId: number, value: string) => {
    onUpdate(sample.sampleId, attributeId, { comment: value });
  };

  const handleEvidenceUpload = (attributeId: number, file: File | null) => {
    if (file) {
      onUpdate(sample.sampleId, attributeId, { evidence: file.name });
    }
  };
  
  return (
    <main className="flex-grow p-6 overflow-y-auto">
      {/* Sample Metadata */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Sample Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm p-4 border border-gray-200 rounded-lg bg-gray-50">
          {Object.entries(sample.sourceRowReference || {}).map(([key, value]) => (
            <div key={key}>
              <dt className="font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
              <dd className="text-gray-900 font-semibold">{typeof value === 'object' ? '-' : String(value ?? '—')}</dd>
            </div>
          ))}
        </div>
      </div>
      
      {/* Attributes Table */}
      <div>
         <h3 className="text-base font-semibold text-gray-800 mb-3">Attribute Testing</h3>
         <div className="border border-gray-200 rounded-lg overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/3">Attribute</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">System Result</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Auditor Result</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/4">Comments</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Evidence</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {attributes.map(attr => {
                        const systemResult = attr.ruleLogic(sample);
                        const auditorResult = results[attr.attributeId]?.auditorResult;
                        const isOverridden = auditorResult !== null && (auditorResult === 'Pass') !== systemResult;

                        return (
                            <tr key={attr.attributeId} className={isOverridden ? 'bg-yellow-50' : ''}>
                                <td className="px-4 py-3 text-sm text-gray-800">{attr.name}</td>
                                <td className="px-4 py-3 text-sm font-semibold">
                                    <span className={systemResult ? 'text-green-600' : 'text-red-600'}>
                                        {systemResult ? 'Pass' : 'Fail'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={auditorResult ?? (systemResult ? 'Pass' : 'Fail')}
                                        onChange={e => handleAuditorResultChange(attr.attributeId, e.target.value as AuditorResult)}
                                        disabled={isLocked}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                                    >
                                        <option>Pass</option>
                                        <option>Fail</option>
                                        <option value="Not Applicable">N/A</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <textarea 
                                        rows={1}
                                        value={results[attr.attributeId]?.comment}
                                        onChange={(e) => handleCommentChange(attr.attributeId, e.target.value)}
                                        disabled={isLocked}
                                        className="block w-full text-sm text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {results[attr.attributeId]?.evidence ? (
                                        <span className="text-indigo-600 text-xs font-semibold truncate">{results[attr.attributeId]?.evidence}</span>
                                    ) : (
                                        <label className={`inline-block ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <input type="file" className="hidden" disabled={isLocked} onChange={e => handleEvidenceUpload(attr.attributeId, e.target.files ? e.target.files[0] : null)} />
                                            <UploadIcon className={`h-5 w-5 ${isLocked ? 'text-gray-300' : 'text-gray-500 hover:text-indigo-600'}`} />
                                        </label>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
         </div>
      </div>
    </main>
  );
};

export default TestingPanel;
