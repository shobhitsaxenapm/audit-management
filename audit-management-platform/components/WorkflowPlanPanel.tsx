import React from 'react';
import type { WorkflowPlanSection } from '../types';
import { CloseIcon } from './icons/Icons';

interface WorkflowPlanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: WorkflowPlanSection[];
}

const WorkflowPlanPanel: React.FC<WorkflowPlanPanelProps> = ({ isOpen, onClose, plan }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-screen max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
             <h2 className="text-lg font-bold text-gray-900">Workflow Plan</h2>
             <p className="text-sm text-gray-500 mt-1">Automated testing validation logic</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm border border-gray-200 p-1"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          {!plan || plan.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No workflow plan available for this control.
            </div>
          ) : (
            plan.map((section, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Visual Timeline Connector */}
                {idx !== plan.length - 1 && (
                  <div className="absolute left-[3px] top-6 bottom-[-32px] w-0.5 bg-gray-200"></div>
                )}
                {/* Node Bullet */}
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></div>
                
                <h3 className="text-base font-bold text-gray-900 mb-2">{section.title}</h3>
                
                {section.description && (
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                )}

                {(section.listItems && section.listItems.length > 0) && (
                  <div className="mb-4">
                    {section.listTitle && <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.listTitle}</h4>}
                    <ul className="space-y-1.5">
                      {section.listItems.map((item, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-600">
                          <span className="mr-2 text-indigo-400 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(section.codeItems && section.codeItems.length > 0) && (
                  <div>
                    {section.codeTitle && <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.codeTitle}</h4>}
                    <div className="bg-gray-50 rounded-md border border-gray-200 p-3 flex flex-col gap-1.5">
                      {section.codeItems.map((code, i) => (
                        <code key={i} className="text-xs font-mono text-indigo-700 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm w-fit">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WorkflowPlanPanel;
