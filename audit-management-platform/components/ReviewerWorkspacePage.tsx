
import React, { useState, useMemo } from 'react';
import type { Engagement, EngagementControl, ControlFullDetail, AuditTrailEntry, SampleRecord } from '../types';
import { detailedControlData } from '../constants';
import { ChevronRightIcon, CheckCircleIcon, CloseIcon, InfoCircleIcon, UploadIcon } from './icons/Icons';
import Toast from './Toast';

// --- PROPS INTERFACE ---
interface ReviewerWorkspacePageProps {
  control: EngagementControl;
  engagement: Engagement;
  onExit: (updatedControl: EngagementControl, deficiencyCreated: boolean) => void;
}

// --- SUB-COMPONENTS ---

const RejectModal: React.FC<{ onClose: () => void; onConfirm: (reason: string) => void; }> = ({ onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError('Rejection reason is mandatory.');
            return;
        }
        onConfirm(reason);
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <header className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Reject Control Testing</h2>
                </header>
                <main className="p-6">
                    <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                    <textarea
                        id="rejectReason"
                        rows={4}
                        value={reason}
                        onChange={(e) => { setReason(e.target.value); setError(''); }}
                        className={`block w-full rounded-md border-gray-300 shadow-sm ${error ? 'border-red-500' : ''}`}
                    />
                    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                </main>
                <footer className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300">Cancel</button>
                    <button onClick={handleConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">Confirm Rejection</button>
                </footer>
            </div>
        </div>
    );
};

const CreateDeficiencyModal: React.FC<{ onClose: () => void; onConfirm: (details: any) => void; control: EngagementControl; }> = ({ onClose, onConfirm, control }) => {
    const nextId = 'DEF-24-00' + Math.ceil(Math.random() * 10);
    const [severity, setSeverity] = useState('Medium');
    const [description, setDescription] = useState(`Exceptions noted in control ${control.controlId} during testing. ${control.exceptions} sample(s) failed mandatory attributes.`);

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <header className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Create New Deficiency</h2>
                     <button onClick={onClose}><CloseIcon className="h-6 w-6 text-gray-400"/></button>
                </header>
                <main className="p-6 grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Deficiency ID</label>
                        <p className="font-semibold text-gray-800">{nextId}</p>
                    </div>
                     <div>
                        <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                        <select id="severity" value={severity} onChange={e => setSeverity(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                         <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                         <textarea id="description" rows={5} value={description} onChange={e => setDescription(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                     <div className="col-span-2">
                         <label htmlFor="root-cause" className="block text-sm font-medium text-gray-700 mb-1">Root Cause (Optional)</label>
                         <input id="root-cause" type="text" className="block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                </main>
                 <footer className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300">Cancel</button>
                    <button onClick={() => onConfirm({})} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Create Deficiency</button>
                </footer>
            </div>
        </div>
    );
};


const SampleDetailDrawer: React.FC<{ sample: SampleRecord, controlDetails: ControlFullDetail, onClose: () => void }> = ({ sample, controlDetails, onClose }) => {
    return (
        <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-gray-600 bg-opacity-50" onClick={onClose}></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl flex flex-col">
                <header className="px-6 py-4 flex items-start justify-between border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Sample Detail: {sample.sampleId}</h2>
                        <p className="text-sm text-gray-500">{sample.primaryIdentifierLabel || 'Record ID'}: {sample.primaryIdentifier}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6">
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Attribute</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Result</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Auditor Comment</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Evidence</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y">
                        {controlDetails.attributes ? controlDetails.attributes.map(attr => {
                            const isFail = !attr.ruleLogic(sample);
                            return (
                                <tr key={attr.attributeId} className={isFail ? 'bg-red-50' : ''}>
                                    <td className="px-4 py-3 text-sm text-gray-800">{attr.name}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">
                                        <span className={isFail ? 'text-red-600' : 'text-green-600'}>{isFail ? 'Fail' : 'Pass'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{sample.auditorComment || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{sample.evidence || 'N/A'}</td>
                                </tr>
                            );
                        }) : ((controlDetails.testScript?.rules || []).map(rule => {
                             // Match sample attribute result if available
                             const attrResult = sample.attributeResults?.find((ar: any) => ar.attributeId === rule.id);
                             const systemPass = attrResult?.systemResult === 'PASS';
                             const auditorResult = attrResult?.auditorResult;
                             const effectivePass = auditorResult !== null ? auditorResult === 'PASS' : systemPass;
                             
                             return (
                                <tr key={rule.id} className={!effectivePass ? 'bg-red-50' : ''}>
                                    <td className="px-4 py-3 text-sm text-gray-800">{rule.description}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">
                                        <span className={!effectivePass ? 'text-red-600' : 'text-green-600'}>{!effectivePass ? 'Fail' : 'Pass'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{attrResult?.comments || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{attrResult?.evidenceReferences?.join(', ') || 'N/A'}</td>
                                </tr>
                             );
                        }))}
                        </tbody>
                    </table>
                </main>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const ReviewerWorkspacePage: React.FC<ReviewerWorkspacePageProps> = ({ control, engagement, onExit }) => {
    const controlDetails = useMemo(() => detailedControlData[control.controlId], [control.controlId]);
    
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [isDeficiencyModalOpen, setDeficiencyModalOpen] = useState(false);
    const [selectedSample, setSelectedSample] = useState<SampleRecord | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([
        { date: '16 Oct 2025 10:05 AM', user: 'Riya Sharma (Reviewer)', action: 'Opened for Review' },
        { date: control.submittedOn || '15 Oct 2025 04:30 PM', user: control.submittedBy || 'Aarav Mehta', action: 'Submitted for Review' }
    ]);

    const primaryIdentifierLabel = useMemo(() => {
        if (controlDetails && controlDetails.samples.length > 0 && controlDetails.samples[0].primaryIdentifierLabel) {
            return controlDetails.samples[0].primaryIdentifierLabel;
        }
        return "Record ID";
    }, [controlDetails]);

    if (!controlDetails) return <div>Error loading control details.</div>;

    const summary = {
        totalSamples: controlDetails.samples.length,
        failed: control.exceptions,
        passed: controlDetails.samples.length - control.exceptions,
    };
    const passRate = summary.totalSamples > 0 ? (summary.passed / summary.totalSamples) * 100 : 100;

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleApprove = () => {
        if (window.confirm("Are you sure you want to approve this control testing and finalize its conclusion? This action cannot be undone.")) {
            const updatedControl: EngagementControl = {
                ...control,
                status: 'Concluded',
                conclusion: control.exceptions > 0 ? 'Ineffective' : 'Effective',
                lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, ' '),
            };
            showToast("Control has been approved and concluded.");
            onExit(updatedControl, false);
        }
    };

    const handleReject = (reason: string) => {
        const updatedControl: EngagementControl = {
            ...control,
            status: 'Testing In Progress',
            conclusion: null, // Reset conclusion
            systemResult: null, // Reset system result — testing must be redone
        };
        setAuditTrail(prev => [{ date: new Date().toLocaleString('en-GB'), user: 'Riya Sharma (Reviewer)', action: 'Rejected', details: reason }, ...prev]);
        setRejectModalOpen(false);
        showToast("Control has been returned for rework.");
        onExit(updatedControl, false);
    };
    
    const handleCreateDeficiency = () => {
        const updatedControl: EngagementControl = { ...control };
        showToast("Deficiency DEF-24-003 has been created.");
        setDeficiencyModalOpen(false);
        onExit(updatedControl, true); // Signal that a deficiency was created
    };

    return (
        <div className="p-6 bg-gray-50">
            {/* Header */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <button onClick={() => onExit(control, false)} className="hover:text-gray-900">Engagement</button>
                <ChevronRightIcon className="h-4 w-4 mx-1" />
                <span className="font-medium text-gray-800">Review Control</span>
            </div>
            <header className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{control.controlId} – {control.controlName}</h1>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">REVIEW PENDING</span>
                        {control.exceptions > 0 && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">{control.exceptions} Deficiency</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Submitted by <span className="font-semibold">{control.submittedBy}</span> on <span className="font-semibold">{control.submittedOn}</span></p>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    {/* Control Overview */}
                    <div className="bg-white p-6 rounded-lg border">
                        <h3 className="text-base font-semibold mb-3">Control Overview</h3>
                        <p className="text-sm text-gray-600 mb-4">{controlDetails.overview.description}</p>
                         <div className="flex gap-8">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Classification</p>
                                <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 border">{controlDetails.overview.classification}</span>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Assertions</p>
                                <div className="flex flex-wrap gap-2">
                                    {controlDetails.overview.assertions.map(a => <span key={a} className="px-2 py-0.5 text-xs rounded-md bg-gray-100 border">{a}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Exception Panel & Sample Table */}
                     <div className="bg-white p-6 rounded-lg border">
                        {summary.failed > 0 ? (
                             <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm font-medium flex items-center gap-2">
                                <InfoCircleIcon className="h-5 w-5"/> {summary.failed} sample(s) failed mandatory attributes.
                            </div>
                        ) : (
                             <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm font-medium flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5"/> No exceptions were identified.
                            </div>
                        )}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Sample ID</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">{primaryIdentifierLabel}</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Termination Date</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Revocation Hours</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Final Result</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y">
                                {controlDetails.samples.map((sample, i) => {
                                    const isFail = sample.status === 'FAIL';
                                    return (
                                    <tr key={i}>
                                        <td className="px-4 py-3 text-sm">{sample.sampleId || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm">{sample.sourceRowReference?.employeeId || sample.sourceRowReference?.jobId || sample.primaryIdentifier || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-sm">{sample.sourceRowReference?.terminationDate || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm">{sample.sourceRowReference?.revocationTimeHours || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm font-semibold">
                                            <span className={isFail ? 'text-red-600' : 'text-green-600'}>{sample.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <button onClick={() => setSelectedSample(sample)} className="text-indigo-600 hover:underline">View Details</button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="col-span-1 space-y-6">
                     {/* Summary */}
                    <div className="bg-white p-6 rounded-lg border">
                         <h3 className="text-base font-semibold mb-4">Testing Summary</h3>
                         <div className="space-y-3">
                             <div className="flex justify-between text-sm"><span className="text-gray-600">Total Samples</span><span className="font-semibold">{summary.totalSamples}</span></div>
                             <div className="flex justify-between text-sm"><span className="text-gray-600">Passed</span><span className="font-semibold text-green-600">{summary.passed}</span></div>
                             <div className="flex justify-between text-sm"><span className="text-gray-600">Failed</span><span className="font-semibold text-red-600">{summary.failed}</span></div>
                             <hr className="my-2"/>
                              <div className="flex justify-between text-sm"><span className="text-gray-600">Pass Rate</span><span className="font-semibold">{passRate.toFixed(0)}%</span></div>
                         </div>
                    </div>
                     {/* Audit Trail */}
                    <div className="bg-white p-6 rounded-lg border">
                         <h3 className="text-base font-semibold mb-4">Audit Trail</h3>
                         <ul className="space-y-3">
                            {auditTrail.map((entry, i) => (
                                <li key={i} className="text-sm">
                                    <p className="font-semibold text-gray-800">{entry.action} by {entry.user}</p>
                                    <p className="text-xs text-gray-500">{entry.date}</p>
                                    {entry.details && <p className="mt-1 text-xs p-2 bg-gray-100 rounded">{entry.details}</p>}
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            </div>

            {/* Decision Panel */}
            <div className="mt-8 p-4 bg-white border-t-4 border-indigo-500 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">Reviewer Decision</h3>
                    <p className="text-sm text-gray-600">Please approve or return the work after your review.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setRejectModalOpen(true)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Reject Control
                    </button>
                    <button onClick={handleApprove} className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">
                        Approve Control
                    </button>
                </div>
            </div>

            {isRejectModalOpen && <RejectModal onClose={() => setRejectModalOpen(false)} onConfirm={handleReject} />}
            {isDeficiencyModalOpen && <CreateDeficiencyModal onClose={() => setDeficiencyModalOpen(false)} onConfirm={handleCreateDeficiency} control={control} />}
            {selectedSample && <SampleDetailDrawer sample={selectedSample} controlDetails={controlDetails} onClose={() => setSelectedSample(null)} />}
            <Toast message={toastMessage} />
        </div>
    );
};

export default ReviewerWorkspacePage;