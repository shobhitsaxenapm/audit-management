import React from 'react';
import type { EngagementControl } from '../types';
import { CloseIcon } from './icons/Icons';

interface TestingReportModalProps {
  control: EngagementControl;
  onClose: () => void;
}

const TestingReportModal: React.FC<TestingReportModalProps> = ({
  control,
  onClose,
}) => {
  const fileUrl = "/Financial_close_RCM_with_Test_scripts_FC_1K.pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Working Paper Preview</h2>
            <p className="text-sm text-gray-500">{control.controlId} — {control.controlName}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={fileUrl}
              download
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF
            </a>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-grow bg-gray-100 relative overflow-hidden rounded-b-xl">
          <iframe
            src={fileUrl}
            title="Working Paper PDF"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default TestingReportModal;
