
import React, { useMemo, useState, useRef } from 'react';
import { CloseIcon, CheckCircleIcon } from './icons/Icons';
import { HARDCODED_RACM_NAME, AMZ_RACM_ID } from '../utils/importRacm';
import { detailedControlData } from '../constants';
import type { Engagement, EngagementControl, ControlFullDetail } from '../types';

interface ControlDetailPanelProps {
    control: EngagementControl;
    engagement: Engagement;
    onClose: () => void;
    onPerformTesting: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-5">
        <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-3">{title}</h3>
        {children}
    </div>
);

const ControlDetailPanel: React.FC<ControlDetailPanelProps> = ({ control, engagement, onClose, onPerformTesting }) => {
    const data: ControlFullDetail | undefined = detailedControlData[control.controlId];
    const [isUploaded, setIsUploaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    if (!data) return null; // Or some fallback UI

    const isTestable = (data.samples.length > 0 && data.snapshot?.status === 'Frozen') || isUploaded;
    let disabledReason = '';
    if (!isUploaded) {
        if (data.samples.length === 0) disabledReason = "No sample generated yet. Upload population and generate sample first.";
        else if (data.snapshot?.status !== 'Frozen') disabledReason = "Population must be frozen before testing.";
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploaded(true);
        }
    };

    return (
        <div className="fixed inset-0 z-40">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-600 bg-opacity-50" onClick={onClose}></div>
            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl flex flex-col">
                <header className="px-6 py-4 flex items-start justify-between border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{data.overview.controlId}</h2>
                        <p className="text-sm text-gray-500">{data.overview.controlName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto p-6 divide-y divide-gray-200">
                    <Section title="Control Overview">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Control Description</p>
                                <p className="text-sm text-gray-800">{data.overview.description}</p>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Classification</p>
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{data.overview.classification}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Assertions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.overview.assertions.map(a => <span key={a} className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-700 border border-gray-200">{a}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Test Script Attributes">
                        {data.testScript ? (
                             <p className="text-sm text-gray-500">This control uses a dynamic Test Script with {data.testScript.rules.length} rules. Testing is performed in the dedicated testing workspace.</p>
                        ) : data.attributes ? (
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 w-2/3">Attribute</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Mandatory</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* OVERRIDE for C-DR-01 + AMZ RACM */}
                                    {control.controlId === 'C-DR-01' && (engagement.linkedRacmName?.toUpperCase().includes('AMZ')) ? (
                                        <>
                                            {['Name Match', 'DL Verification Status', 'Criminal Record Check'].map((name, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-800">{name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 font-semibold">Y</td>
                                                </tr>
                                            ))}
                                        </>
                                    ) : (
                                        data.attributes.map((attr: any) => (
                                            <tr key={attr.attributeId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-800">{attr.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-800 font-semibold">{attr.mandatory ? 'Y' : 'N'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-gray-500">No test attributes defined for this control.</p>
                        )}
                    </Section>


                </main>
                
                <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {!isTestable && <p className="text-center text-sm text-orange-700 bg-orange-100 border border-orange-200 rounded-md p-3 mb-3">{disabledReason}</p>}
                    <div className="flex justify-end items-center gap-3">
                        <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Back</button>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept=".csv,.xlsx,.xls"
                        />
                        <button
                            type="button"
                            onClick={handleUploadClick}
                            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50">
                            Upload Sample
                        </button>

                        <button
                            type="button"
                            onClick={onPerformTesting}
                            disabled={!isTestable}
                            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                            Perform Testing
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ControlDetailPanel;