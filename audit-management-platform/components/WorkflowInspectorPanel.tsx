import React, { useState } from 'react';
import type { WorkflowPlanStep } from '../types';
import { CloseIcon } from './icons/Icons';

interface WorkflowInspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: WorkflowPlanStep[];
  controlId?: string; // TEMP_DEMO_AMAZON_TRANSPORT: added controlId for hardcoded content
}

const REFERENCE_FILES = [
  'Estimate.pdf',
  'Media_Invoice.pdf',
  'Publication_Invoice_and_Supporting.pdf'
];

const WORKFLOW_CODE = `function validateInvoiceWorkflow(publicationInvoice, mediaInvoice, estimate) {

  const vendorMatch =
    publicationInvoice.vendorName === mediaInvoice.vendorName;

  const amountMatch =
    publicationInvoice.grossAmount === mediaInvoice.grossAmount;

  const estimateMatch =
    mediaInvoice.publicationName === estimate.publicationName &&
    mediaInvoice.grossAmount === estimate.grossAmount;

  const rateHierarchyValid =
    estimate.R1 <= estimate.R0 &&
    estimate.R2 <= estimate.R1;

  return {
    vendorMatch,
    amountMatch,
    estimateMatch,
    rateHierarchyValid
  };
}`;

const WorkflowInspectorPanel: React.FC<WorkflowInspectorPanelProps> = ({ isOpen, onClose, plan, controlId }) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'reference' | 'coder'>('planner');

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'Extract':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        );
      case 'Match':
        return (
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        );
      case 'Validate':
      case 'Verify':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        );
      case 'Record':
        return (
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        );
      case 'Generate':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        );
    }
  };

  const displayPlan = plan && plan.length > 0 ? plan : [];

  // TEMP_DEMO_AMAZON_TRANSPORT: hardcoded workflow inspector content for ATC-03
  const renderAtc03Plan = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Workflow Objective</h3>
        <p className="text-sm text-gray-800 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
          Validate that each driver has a valid, active, and transport-appropriate driving license before assignment.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inputs</h3>
        <ul className="grid grid-cols-1 gap-2">
           {['Driver population dataset', 'Driving License front image/PDF', 'Driving License back image/PDF', 'Optional verification/reference dataset'].map(input => (
             <li key={input} className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 p-2 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                {input}
             </li>
           ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Workflow Steps</h3>
        <div className="space-y-3 relative pl-4 border-l-2 border-gray-100 ml-1">
          {[
            { id: 1, action: 'Extract', msg: 'Load driver population records' },
            { id: 2, action: 'Match', msg: 'Match uploaded license files to driver identifier' },
            { id: 3, action: 'Extract', msg: 'Extract key fields from license:\nDL Number, Driver Name, Father’s Name, DOB, Issue Date, Expiry Date, License Class, Badge, Issuing RTO / State, Address' },
            { id: 4, action: 'Validate', msg: 'Validate required fields are present' },
            { id: 5, action: 'Validate', msg: 'Check expiry date validity' },
            { id: 6, action: 'Validate', msg: 'Check license class is suitable' },
            { id: 7, action: 'Verify', msg: 'Check status is active / not suspended / not revoked' },
            { id: 8, action: 'Verify', msg: 'Flag pending challans if present' },
            { id: 9, action: 'Generate', msg: 'Generate attribute-level results' },
            { id: 10, action: 'Generate', msg: 'Produce sample/control test outcome' },
          ].map((step) => (
            <div key={step.id} className="relative flex gap-3">
              <div className="absolute -left-[23px] top-1 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-gray-100">
                {getActionIcon(step.action)}
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm text-sm text-gray-800 flex-grow">
                 <span className="font-bold text-gray-400 mr-2">{step.id}.</span>
                 <span className="whitespace-pre-line">{step.msg}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Output</h3>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg space-y-2">
           {['Attribute-level validation results', 'Exceptions list', 'Final license compliance result'].map(out => (
             <div key={out} className="flex items-center gap-2 text-sm text-emerald-800">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                {out}
             </div>
           ))}
        </div>
      </section>
    </div>
  );

  // TEMP_DEMO_AMAZON_TRANSPORT: hardcoded workflow inspector content for ATC-10
  const renderAtc10Plan = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Workflow Objective</h3>
        <p className="text-sm text-gray-800 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
          Validate that POSH policy and acknowledgement artifacts are present, complete, and compliant with required policy governance expectations.
        </p>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inputs</h3>
        <ul className="grid grid-cols-1 gap-2">
           {['Employee/partner population dataset', 'POSH policy PDF', 'Employee acknowledgement / declaration file', 'Committee details / supporting governance document'].map(input => (
             <li key={input} className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 p-2 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                {input}
             </li>
           ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Workflow Steps</h3>
        <div className="space-y-3 relative pl-4 border-l-2 border-gray-100 ml-1">
          {[
            { id: 1, action: 'Extract', msg: 'Load employee or partner population records' },
            { id: 2, action: 'Match', msg: 'Identify related POSH documents' },
            { id: 3, action: 'Validate', msg: 'Validate POSH policy file is uploaded' },
            { id: 4, action: 'Verify', msg: 'Check POSH clause is present' },
            { id: 5, action: 'Verify', msg: 'Check Internal Committee details are mentioned' },
            { id: 6, action: 'Validate', msg: 'Check employee acknowledgement / signature exists' },
            { id: 7, action: 'Validate', msg: 'Validate effective date is available' },
            { id: 8, action: 'Verify', msg: 'Validate company signatory / stamp is present' },
            { id: 9, action: 'Generate', msg: 'Generate attribute-level results' },
            { id: 10, action: 'Generate', msg: 'Produce sample/control test outcome' },
          ].map((step) => (
            <div key={step.id} className="relative flex gap-3">
              <div className="absolute -left-[23px] top-1 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-gray-100">
                {getActionIcon(step.action)}
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm text-sm text-gray-800 flex-grow">
                 <span className="font-bold text-gray-400 mr-2">{step.id}.</span>
                 <span className="whitespace-pre-line">{step.msg}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Output</h3>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg space-y-2">
           {['POSH compliance attribute results', 'Missing artifact flags', 'Final control testing result'].map(out => (
             <div key={out} className="flex items-center gap-2 text-sm text-emerald-800">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                {out}
             </div>
           ))}
        </div>
      </section>
    </div>
  );

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
        className={`fixed inset-y-0 right-0 z-50 w-screen max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 bg-white flex-shrink-0 border-b border-gray-200">
          <div>
             <h2 className="text-xl font-bold text-gray-900">Workflow Inspector</h2>
             {controlId && <p className="text-xs text-gray-500 mt-0.5">Control Reference: <span className="font-mono text-indigo-600 font-semibold">{controlId}</span></p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm border border-gray-200 p-1.5"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 flex space-x-6 bg-gray-50/50">
          <button 
            className={`pt-3 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'planner' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('planner')}
          >
            Planner
          </button>
          <button 
            className={`pt-3 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'reference' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('reference')}
          >
            Reference
          </button>
          <button 
            className={`pt-3 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'coder' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('coder')}
          >
            Coder
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {activeTab === 'planner' && (
            <div className="space-y-4">
              {controlId === 'ATC-03' ? renderAtc03Plan() : 
               controlId === 'ATC-10' ? renderAtc10Plan() :
               displayPlan.length === 0 ? (
                <div className="text-gray-500 text-sm italic pl-4">No workflow plan configured for this control.</div>
              ) : (
                <div className="space-y-4 relative pl-4 border-l-2 border-gray-100 ml-1">
                {displayPlan.map((step, idx) => (
                  <div key={idx} className="relative flex gap-3">
                    <div className="absolute -left-[23px] top-1 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-gray-100">
                      {getActionIcon(step.actionType)}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="text-sm text-gray-700 bg-white px-3 py-2.5 rounded-lg shadow-sm border border-gray-100 flex items-start gap-2">
                         <span className="font-semibold text-gray-500 flex-shrink-0">{step.id}.</span> 
                         <span className="leading-snug mt-0.5 whitespace-pre-line">{step.description}</span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reference' && (
            <div className="space-y-3">
              {REFERENCE_FILES.map((filename, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded text-indigo-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 truncate max-w-[280px]" title={filename}>
                        {filename}
                      </h4>
                      <p className="text-xs text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Preview
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'coder' && (
            <div className="bg-[#1e1e1e] rounded-xl p-4 shadow-inner overflow-hidden flex flex-col h-full border border-gray-800">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-xs font-mono text-gray-400">validation.js</span>
              </div>
              <div className="overflow-y-auto flex-1 pb-4 custom-scrollbar">
                <pre className="text-[13px] font-mono leading-relaxed text-gray-300">
                  <code dangerouslySetInnerHTML={{ __html: WORKFLOW_CODE
                    .replace(/function/g, '<span class="text-pink-500">function</span>')
                    .replace(/const/g, '<span class="text-pink-500">const</span>')
                    .replace(/return/g, '<span class="text-pink-500">return</span>')
                    .replace(/validateInvoiceWorkflow/g, '<span class="text-blue-400">validateInvoiceWorkflow</span>')
                    .replace(/vendorMatch|amountMatch|estimateMatch|rateHierarchyValid/g, '<span class="text-indigo-300">$&</span>')
                    .replace(/&amp;&amp;/g, '<span class="text-cyan-400">&amp;&amp;</span>')
                    .replace(/===|&lt;=/g, '<span class="text-cyan-400">$&</span>')
                    .replace(/\{|\}/g, '<span class="text-yellow-300">$&</span>')
                  }} />
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkflowInspectorPanel;
