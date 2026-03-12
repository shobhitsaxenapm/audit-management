import React, { useState, useMemo, useCallback } from "react";
import type {
  EngagementControl,
  Engagement,
  ControlFullDetail,
  AllSamplesResultsState,
  TestScriptRule,
  AuditorOverride,
  SampleFinalStatus,
  SystemResult,
  TestingSummary,
  ControlConclusion,
  RuleExecutionResult,
  RuleLogic,
  TestingResult,
  ControlDataSource,
  EvidenceModel,
  DataViewerDataset,
  SampleModel,
  BulkUploadSession,
} from "../types";
import { DEFAULT_EVIDENCE_TYPES } from "../types";
import { HARDCODED_RACM_NAME, AMZ_RACM_ID } from "../utils/importRacm";
import { detailedControlData } from "../constants";
import SampleNavigator from "./SampleNavigator";
import TestingSummaryPanel from "./TestingSummary";
import Toast from "./Toast";
import TestingPanel from "./TestingPanel";
import { ChevronRightIcon, UploadIcon, InfoCircleIcon, CloseIcon, TableIcon } from "./icons/Icons";
import ControlDataSourcesSection from "./ControlDataSourcesSection";
import DatasetPreviewModal from "./DatasetPreviewModal";
import SampleEvidenceSection from "./SampleEvidenceSection";
import DataViewerPanel from "./DataViewerPanel";
import TestingReportModal from "./TestingReportModal";
import SampleDetailReportModal from "./SampleDetailReportModal";
import BulkEvidenceUpload from "./BulkEvidenceUpload";
import WorkflowInspectorPanel from "./WorkflowInspectorPanel";
import PopulationSamplingSetup, { SetupStage } from "./PopulationSamplingSetup";
import { dataViewerDatasets, datasetNameToId } from "../dataViewerData";
import type { WorkflowPlanStep } from "../types";

// --- HELPER & SUB-COMPONENTS (scoped to this file) ---

const RuleLogicTooltip: React.FC<{ logic: RuleLogic }> = ({ logic }) => {
  return (
    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 w-64 z-10 -mt-24 -ml-4 shadow-lg">
      <h4 className="font-bold mb-1">Rule Logic</h4>
      <div className="font-mono bg-gray-700 p-1.5 rounded text-gray-300">
        <div>
          <span className="text-cyan-400">field:</span> "{logic.fieldName}"
        </div>
        <div>
          <span className="text-cyan-400">operator:</span> "{logic.operator}"
        </div>
        <div>
          <span className="text-cyan-400">expected:</span>{" "}
          <span className="text-orange-300">{String(logic.expectedValue)}</span>
        </div>
        {logic.referenceField && (
          <div>
            <span className="text-cyan-400">reference:</span> "
            {logic.referenceField}"
          </div>
        )}
      </div>
    </div>
  );
};

const ControlTestingWorkflow: React.FC<{
  stages: { id: string; name: string; state: "completed" | "current" | "not_started" }[];
}> = ({ stages }) => (
  <div className="hidden lg:flex items-center ml-6 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 shadow-sm">
    {stages.map((stage, idx) => (
      <React.Fragment key={idx}>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center border
              ${
                stage.state === "completed"
                  ? "bg-green-500 border-green-500 text-white"
                  : stage.state === "current"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              }
            `}
          >
            {stage.state === "completed" ? (
              <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : stage.state === "current" ? (
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            ) : null}
          </div>
          <span className={`text-xs font-medium ${stage.state === "current" ? "text-gray-900" : "text-gray-500"}`}>
            {stage.name}
          </span>
        </div>
        {idx < stages.length - 1 && <div className="w-3 h-px bg-gray-300 mx-2"></div>}
      </React.Fragment>
    ))}
  </div>
);

const TestScriptHeader: React.FC<{
  control: EngagementControl;
  controlDetails: ControlFullDetail;
  isWorkflowPlanOpen?: boolean;
  onViewWorkflowPlan?: () => void;
}> = ({ control, controlDetails, isWorkflowPlanOpen, onViewWorkflowPlan }) => (
  <div className="mb-8 border border-gray-200 bg-white rounded-lg shadow-sm">
    {/* A. HEADER ROW */}
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center rounded-t-lg">
      <h3 className="text-base font-semibold text-gray-900">
        Control & Test Script Information
      </h3>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <button
            onClick={() =>
              window.open("/Sample-Test-Script-Cash-and-Bank.xlsx", "_blank")
            }
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            View Test Script
          </button>
          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = "/Sample-Test-Script-Cash-and-Bank.xlsx";
              a.download = "Sample 1 Test script - Cash and Bank.xlsx";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Download Test Script
          </button>
          <button
            onClick={onViewWorkflowPlan}
            className="rounded-md bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-100 transition-colors"
          >
            View Workflow Plan
          </button>
        </div>
    </div>

    {/* B. METADATA GRID */}
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-[150px_1fr] gap-x-4 items-start">
          <div className="text-sm font-medium text-gray-500">Control ID</div>
          <div className="text-sm font-medium text-gray-900">{control.controlId}</div>
        </div>
        {controlDetails.testScript && (
          <div className="grid grid-cols-[150px_1fr] gap-x-4 items-start">
            <div className="text-sm font-medium text-gray-500">Process</div>
            <div className="text-sm font-medium text-gray-900">{control.process || "N/A"}</div>
          </div>
        )}
        
        {/* Row 2 */}
        <div className="grid grid-cols-[150px_1fr] gap-x-4 items-start">
          <div className="text-sm font-medium text-gray-500">Control Name</div>
          <div className="text-sm font-medium text-gray-900">{control.controlName}</div>
        </div>
        {controlDetails.testScript && (
          <div className="grid grid-cols-[150px_1fr] gap-x-4 items-start">
            <div className="text-sm font-medium text-gray-500">Frequency</div>
            <div className="text-sm font-medium text-gray-900">{control.frequency || "N/A"}</div>
          </div>
        )}

        {/* Row 3 */}
        {controlDetails.testScript && (
          <>
            <div className="grid grid-cols-[150px_1fr] gap-x-4 items-start">
              <div className="text-sm font-medium text-gray-500">Test Script Version</div>
              <div className="text-sm font-medium text-gray-900">{controlDetails.testScript?.version || "N/A"}</div>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-x-4 items-start">
              <div className="text-sm font-medium text-gray-500">Generated Date</div>
              <div className="text-sm font-medium text-gray-900">{controlDetails.testScript?.generatedDate || "N/A"}</div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

const SampleData: React.FC<{ recordData: Record<string, any>; dataSources: ControlDataSource[]; setPreviewDataset: (ds: ControlDataSource) => void; onOpenDataViewer?: (ds: ControlDataSource, sampleKeyValue?: string) => void }> = ({
  recordData, dataSources, setPreviewDataset, onOpenDataViewer
}) => {
  // Guard: attribute-based controls don't have recordData
  if (!recordData || Object.keys(recordData).length === 0) {
    return null;
  }
  // Find matched data from uploaded sets
  const matchedRecords = dataSources
    .filter(ds => ds.matchingKey && ds.records && ds.records.length > 0)
    .map(ds => {
      const sampleKeyValue = ds.matchingKey ? recordData[ds.matchingKey] : undefined;
      const match = ds.records?.find(r => ds.matchingKey && r[ds.matchingKey] === sampleKeyValue);
      return { dataset: ds, match, sampleKeyValue };
    })
    .filter(m => m.match);

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-800 mb-3">Sample Data</h3>
      
      {/* Existing Sample Data Fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
        {Object.entries(recordData).map(([key, value]) => (
          <div key={key}>
            <dt className="font-medium text-gray-500 capitalize truncate">
              {key.replace(/([A-Z])/g, " $1")}
            </dt>
            <dd className="text-gray-900 font-semibold truncate">
              {String(value ?? "null")}
            </dd>
          </div>
        ))}
      </div>

      {/* Matched Data Sources */}
      {dataSources.length > 0 && (
         <div className="mt-4">
             <h4 className="text-sm font-medium text-gray-700 mb-2">Matched References (based on Sample Keys)</h4>
             <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {dataSources.map(ds => {
                         const hasKey = ds.matchingKey;
                         const sampleVal = hasKey ? recordData[ds.matchingKey!] : undefined;
                         const isMatchFound = hasKey && ds.records ? !!ds.records.find(r => r[ds.matchingKey!] === sampleVal) : false;

                         return (
                           <li key={ds.id} className="p-3 flex items-center justify-between text-sm">
                               <div className="flex items-center">
                                  <span className="font-medium text-gray-800">{ds.filename}</span>
                                  {hasKey ? (
                                     <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${isMatchFound ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                         {isMatchFound ? `Matched on: ${ds.matchingKey} (${sampleVal})` : `No match for ${ds.matchingKey}`}
                                     </span>
                                  ) : (
                                     <span className="ml-3 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                                         No matching key configured
                                     </span>
                                  )}
                               </div>
                               <div className="flex gap-2">
                                   {onOpenDataViewer && (
                                     <button 
                                       onClick={() => {
                                         const sampleVal = hasKey ? recordData[ds.matchingKey!] : undefined;
                                         onOpenDataViewer(ds, sampleVal ? String(sampleVal) : undefined);
                                       }}
                                       className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-semibold"
                                     >
                                       <TableIcon className="h-3.5 w-3.5" />
                                       View Data
                                     </button>
                                   )}
                                    <button 
                                       onClick={() => setPreviewDataset(ds)}
                                       className="text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                       Preview
                                    </button>
                                </div>
                           </li>
                         );
                    })}
                </ul>
             </div>
         </div>
      )}
    </div>
  );
};

const RuleEvaluationTable: React.FC<{
  rules: TestScriptRule[];
  executionResults: Record<number, RuleExecutionResult>;
  auditorInputs: Record<
    number,
    { override: AuditorOverride; comment: string; evidence: string }
  >;
  onUpdate: (ruleId: number, newResultData: any) => void;
  isLocked: boolean;
}> = ({ rules, executionResults, auditorInputs, onUpdate, isLocked }) => (
  <div>
    <h3 className="text-base font-semibold text-gray-800 mb-3">

      Rule Evaluation
    </h3>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/3">
              Rule Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              System Result
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Auditor Override
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/4">
              Comments
            </th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
              Evidence
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rules.map((rule) => {
            const systemResult =
              executionResults[rule.id]?.systemResult || "NOT_APPLICABLE";
            const { override, comment, evidence } = auditorInputs[rule.id] || {
              override: null,
              comment: "",
              evidence: "",
            };
            const currentOverride = override || systemResult;
            const isOverridden = override !== null && override !== systemResult;

            return (
              <tr key={rule.id} className={isOverridden ? "bg-yellow-50" : ""}>
                <td className="px-4 py-3 text-sm text-gray-800 group relative">
                  <InfoCircleIcon className="h-4 w-4 inline-block mr-2 text-gray-400" />
                  {rule.description}
                  <RuleLogicTooltip logic={rule.logic} />
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  <span
                    className={
                      systemResult === "PASS"
                        ? "text-green-600"
                        : systemResult === "FAIL"
                          ? "text-red-600"
                          : "text-gray-500"
                    }
                  >
                    {systemResult === "NOT_APPLICABLE" ? "N/A" : systemResult}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={currentOverride}
                    onChange={(e) =>
                      onUpdate(rule.id, { override: e.target.value })
                    }
                    disabled={isLocked}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="NOT_APPLICABLE">N/A</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <textarea
                    rows={1}
                    value={comment}
                    onChange={(e) =>
                      onUpdate(rule.id, { comment: e.target.value })
                    }
                    disabled={isLocked}
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </td>
                <td className="px-4 py-3 text-sm">
                  {evidence ? (
                    <span className="text-indigo-600 text-xs font-semibold truncate">
                      {evidence}
                    </span>
                  ) : (
                    <label
                      className={`inline-block ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="file"
                        className="hidden"
                        disabled={isLocked}
                        onChange={(e) =>
                          onUpdate(rule.id, {
                            evidence: e.target.files
                              ? e.target.files[0].name
                              : "",
                          })
                        }
                      />
                      <UploadIcon
                        className={`h-5 w-5 ${isLocked ? "text-gray-300" : "text-gray-500 hover:text-indigo-600"}`}
                      />
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
);

// --- MAIN COMPONENT ---

const TestingWorkspacePage: React.FC<{
  control: EngagementControl;
  engagement: Engagement;
  onExit: (c?: EngagementControl) => void;
}> = ({ control, engagement, onExit }) => {
  const controlDetails: ControlFullDetail | undefined = useMemo(
    () => detailedControlData[control.controlId],
    [control.controlId],
  );

  const isDynamicTestScript = !!controlDetails?.testScript;

  const isAmzTransport = useMemo(
    () => control.controlId === 'C-DR-01' && (engagement.linkedRacmName?.toUpperCase().includes('AMZ')),
    [control.controlId, engagement.linkedRacmName]
  );

    // Deep state representing the local working copy of all samples
  const [localSamples, setLocalSamples] = useState<SampleModel[]>(() => {
    if (!controlDetails) return [];
    
    return controlDetails.samples.map(sample => {
      // 1. Initialize Evidence if missing
      let evidence = [...(sample.evidence || [])];
      if (evidence.length === 0) {
        // OVERRIDE for C-DR-01 + AMZ RACM
        if (isAmzTransport) {
          const amzEvidenceTypes = [
            { evidenceType: 'BGV Report PDF', evidenceName: 'Background Verification Report', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
            { evidenceType: 'RC Document', evidenceName: 'Registration Certificate', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
            { evidenceType: 'Offer Letter', evidenceName: 'Employment Offer Letter', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
            { evidenceType: 'Aadhar Document', evidenceName: 'Identity Proof (Aadhar)', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
          ];
          evidence = amzEvidenceTypes.map((tmpl, idx) => ({
            ...tmpl,
            evidenceId: `${sample.sampleId}-ev-${idx}`,
            sampleId: sample.sampleId
          }));
        } else {
          evidence = DEFAULT_EVIDENCE_TYPES.map((tmpl, idx) => ({
            ...tmpl,
            evidenceId: `${sample.sampleId}-ev-${idx}`,
            sampleId: sample.sampleId
          }));
        }
      }

      // 2. Initialize AttributeResults if missing
      let attributeResults = [...(sample.attributeResults || [])];
      if (attributeResults.length === 0) {
        // OVERRIDE for C-DR-01 + AMZ RACM
        if (isAmzTransport) {
          const amzAttributes = ['Name Match', 'DL Verification Status', 'Criminal Record Check'];
          attributeResults = amzAttributes.map((attrName, idx) => ({
            attributeResultId: `${sample.sampleId}-attr-${idx}`,
            sampleId: sample.sampleId,
            controlInstanceId: sample.controlInstanceId,
            attributeId: idx + 1,
            attributeName: attrName,
            expectedValue: true, // Assuming boolean check for these
            actualValue: null,
            readinessStatus: "pending",
            systemResult: "NOT_APPLICABLE",
            auditorResult: null,
            comments: "",
            evidenceReferences: [],
            testedAt: ""
          }));
        } else if (isDynamicTestScript && controlDetails.testScript) {
          attributeResults = controlDetails.testScript.rules.map(r => ({
            attributeResultId: `${sample.sampleId}-${r.id}`,
            sampleId: sample.sampleId,
            controlInstanceId: sample.controlInstanceId,
            attributeId: r.id,
            attributeName: r.description || r.name,
            expectedValue: r.logic.expectedValue,
            actualValue: null,
            readinessStatus: "pending",
            systemResult: "NOT_APPLICABLE",
            auditorResult: null,
            comments: "",
            evidenceReferences: [],
            testedAt: ""
          }));
        } else if (controlDetails.attributes) {
          attributeResults = controlDetails.attributes.map(a => ({
            attributeResultId: `${sample.sampleId}-${a.attributeId}`,
            sampleId: sample.sampleId,
            controlInstanceId: sample.controlInstanceId,
            attributeId: a.attributeId,
            attributeName: a.name,
            expectedValue: true,
            actualValue: null,
            readinessStatus: "pending",
            systemResult: "NOT_APPLICABLE",
            auditorResult: null,
            comments: "",
            evidenceReferences: [],
            testedAt: ""
          }));
        }
      }

      return {
        ...sample,
        evidence,
        attributeResults
      };
    });
  });

  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [overallStatus, setOverallStatus] = useState<"In Progress" | "Submitted">("In Progress");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // NEW STATE: Control Data Sources
  const [dataSources, setDataSources] = useState<ControlDataSource[]>([]);
  const [previewDataset, setPreviewDataset] = useState<ControlDataSource | null>(null);
  const [viewerDataset, setViewerDataset] = useState<DataViewerDataset | null>(null);
  const [viewerHighlightId, setViewerHighlightId] = useState<string | undefined>(undefined);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isWorkflowPlanOpen, setIsWorkflowPlanOpen] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showSampleReportModal, setShowSampleReportModal] = useState(false);
  const [bulkUploadSession, setBulkUploadSession] = useState<BulkUploadSession | null>(null);

  const openDataViewer = useCallback((ds: ControlDataSource, sampleKeyValue?: string) => {
    const datasetId = datasetNameToId[ds.filename] || datasetNameToId[controlDetails?.snapshot?.datasetName || ''];
    if (datasetId && dataViewerDatasets[datasetId]) {
      setViewerDataset(dataViewerDatasets[datasetId]);
      setViewerHighlightId(sampleKeyValue);
    } else {
      const fallbackKey = Object.keys(dataViewerDatasets)[0];
      if (fallbackKey) {
        setViewerDataset(dataViewerDatasets[fallbackKey]);
        setViewerHighlightId(sampleKeyValue);
      } else {
        setPreviewDataset(ds);
      }
    }
  }, [controlDetails]);

  const [evidenceViewerUrl, setEvidenceViewerUrl] = useState<{ url: string; fileName: string } | null>(null);
  const [setupStage, setSetupStage] = useState<SetupStage>("population");
  const [testingStep, setTestingStep] = useState<1 | 2>(1);

  const currentSample = localSamples[currentSampleIndex];

  // --- UPDATERS ---
  const handleApplyMapping = useCallback((session: BulkUploadSession) => {
    const mappedFiles = session.files.filter(f => f.mappingStatus === 'MAPPED');
    
    setLocalSamples(prevSamples => prevSamples.map(sample => {
      const filesForSample = mappedFiles.filter(f => f.mappedSampleId === sample.sampleId);
      if (filesForSample.length === 0) return sample;

      const newEvidence = sample.evidence.map(slot => {
        const fileForSlot = filesForSample.find(f => f.mappedEvidenceId === slot.evidenceId);
        if (fileForSlot && fileForSlot.storageReference) {
          return {
            ...slot,
            fileName: fileForSlot.fileName,
            storageReference: fileForSlot.storageReference,
            uploadedAt: new Date().toLocaleDateString()
          };
        }
        return slot;
      });

      return {
        ...sample,
        evidence: newEvidence
      };
    }));

    setBulkUploadSession(null);
  }, []);
  const handleEvidenceUpload = useCallback((evidenceId: string, file: File) => {
    if (!currentSample) return;
    const storageReference = URL.createObjectURL(file);
    
    setLocalSamples(prev => prev.map(sample => {
      if (sample.sampleId === currentSample.sampleId) {
        return {
          ...sample,
          evidence: sample.evidence.map(ev => 
             ev.evidenceId === evidenceId 
               ? { ...ev, fileName: file.name, storageReference, uploadedAt: new Date().toLocaleDateString() }
               : ev
          )
        };
      }
      return sample;
    }));
  }, [currentSample]);

  const handleEvidenceView = useCallback((ev: EvidenceModel) => {
    if (ev.storageReference) {
      setEvidenceViewerUrl({ url: ev.storageReference, fileName: ev.fileName || 'Document' });
    }
  }, []);

  // --- DERIVED STATES ---
  const evidenceReadiness = useMemo(() => {
    const result: Record<string, 'pending' | 'ready'> = {};
    localSamples.forEach(sample => {
      const allUploaded = sample.evidence.length > 0 && sample.evidence.every(ev => !!ev.fileName);
      result[sample.sampleId] = allUploaded ? 'ready' : 'pending';
    });
    return result;
  }, [localSamples]);

  const hasPendingBulkSession = !!bulkUploadSession && bulkUploadSession.files.length > 0;

  const allSamplesReady = useMemo(() => {
    if (hasPendingBulkSession) return false;
    if (localSamples.length === 0) return false;
    return localSamples.every(s => evidenceReadiness[s.sampleId] === 'ready');
  }, [localSamples, evidenceReadiness, hasPendingBulkSession]);

  const currentSampleMissingEvidence = useMemo(() => {
    if (!currentSample) return [];
    return currentSample.evidence.filter(ev => !ev.fileName);
  }, [currentSample]);

  const handleRunTesting = () => {
    if (!allSamplesReady) {
      showToast('Please upload all required evidence for every sample before running testing.');
      return;
    }
    setTestingStep(2);
    showToast('Testing executed. Review results below.');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const evaluateRule = useCallback(
    (sample: any, rule: TestScriptRule): RuleExecutionResult => {
      const actualValue = sample.sourceRowReference[rule.logic.fieldName];
      if (actualValue === undefined || actualValue === null) {
        return {
          systemResult: "NOT_APPLICABLE",
          evaluatedValue: actualValue,
          expectedValue: rule.logic.expectedValue,
        };
      }
      let pass = false;
      switch (rule.logic.operator) {
        case "===":
          pass = actualValue === rule.logic.expectedValue;
          break;
        default:
          pass = false;
      }
      return {
        systemResult: pass ? "PASS" : "FAIL",
        evaluatedValue: actualValue,
        expectedValue: rule.logic.expectedValue,
      };
    },
    [],
  );

  const getDynamicSampleFinalStatus = useCallback(
    (sample: SampleModel): SampleFinalStatus => {
      const rules = controlDetails?.testScript?.rules;
      if (!rules) return "NOT TESTED";

      if (sample.auditorResult) return sample.auditorResult;

      let isFail = false;
      let isOverridden = false;
      let allNotApplicable = true;

      for (const rule of rules) {
        const { systemResult } = evaluateRule(sample, rule);
        const attrResult = sample.attributeResults.find(ar => ar.attributeId === rule.id);
        const auditorOverride = attrResult?.auditorResult || null;
        
        if (auditorOverride !== null && auditorOverride !== systemResult)
          isOverridden = true;

        const effectiveResult = auditorOverride !== null ? auditorOverride : systemResult;
        if (effectiveResult === "FAIL") {
          isFail = true;
          break;
        }
        if (effectiveResult !== "NOT_APPLICABLE") {
          allNotApplicable = false;
        }
      }

      if (isFail) return "FAIL";
      if (allNotApplicable) return "NOT_APPLICABLE";
      if (isOverridden) return "OVERRIDDEN";
      return "PASS";
    },
    [controlDetails, evaluateRule],
  );

  const getLegacySampleFinalStatus = useCallback(
    (sample: SampleModel): SampleFinalStatus => {
      const attributes = controlDetails?.attributes;
      if (!attributes) return "NOT TESTED";

      let allNotApplicable = true;
      let hasFailure = false;

      for (const attr of attributes) {
        const attrResult = sample.attributeResults.find(ar => ar.attributeId === attr.attributeId);
        const auditorResult = attrResult?.auditorResult;

        const systemResult = attr.ruleLogic(sample);
        const effectiveResult = auditorResult !== undefined && auditorResult !== null
          ? auditorResult
          : systemResult ? "PASS" : "FAIL";

        if (effectiveResult !== "NOT_APPLICABLE") {
          allNotApplicable = false;
        }

        if (effectiveResult === "FAIL") {
            hasFailure = true;
            break;
        }
      }

      if (hasFailure) return "FAIL";
      if (allNotApplicable) return "NOT_APPLICABLE";
      return "PASS";
    },
    [controlDetails],
  );

  const sampleStatuses = useMemo(() => {
    const statuses: Record<string, SampleFinalStatus> = {};
    const statusFn = isDynamicTestScript ? getDynamicSampleFinalStatus : getLegacySampleFinalStatus;

    localSamples.forEach((s) => {
      statuses[s.sampleId] = statusFn(s);
    });
    return statuses;
  }, [localSamples, isDynamicTestScript, getDynamicSampleFinalStatus, getLegacySampleFinalStatus]);

  const summary: TestingSummary = useMemo(() => {
    const statuses = Object.values(sampleStatuses);
    const total = statuses.length;
    let notTested = 0;
    
    // Check if evidence is ready, if not, consider NOT TESTED
    localSamples.forEach(sample => {
       if (evidenceReadiness[sample.sampleId] !== 'ready') {
           notTested++;
       }
    });

    const failed = statuses.filter((s) => s === "FAIL").length;
    const notApplicable = statuses.filter((s) => s === "NOT_APPLICABLE").length;
    const tested = total - notTested;
    const passed = statuses.filter(s => s === "PASS" || s === "OVERRIDDEN").length;

    return { total, tested, passed, failed, notApplicable, notTested };
  }, [sampleStatuses, localSamples, evidenceReadiness]);

  const handleUpdateRuleResult = (ruleId: number, newResultData: any) => {
    setLocalSamples(prev => prev.map(sample => {
      if (sample.sampleId === currentSample?.sampleId) {
        return {
          ...sample,
          attributeResults: sample.attributeResults.map(ar => 
             ar.attributeId === ruleId ? { ...ar, auditorResult: newResultData.override !== undefined ? newResultData.override : ar.auditorResult, comments: newResultData.comment !== undefined ? newResultData.comment : ar.comments } : ar
          )
        };
      }
      return sample;
    }));
  };

  const handleUpdateLegacyResult = (sampleId: string, attributeId: number, newResultData: any) => {
    setLocalSamples(prev => prev.map(sample => {
      if (sample.sampleId === sampleId) {
        return {
          ...sample,
          attributeResults: sample.attributeResults.map(ar => 
             ar.attributeId === attributeId 
             ? { ...ar, auditorResult: newResultData.auditorResult !== undefined ? newResultData.auditorResult : ar.auditorResult, comments: newResultData.comment !== undefined ? newResultData.comment : ar.comments } 
             : ar
          )
        };
      }
      return sample;
    }));
  };

  const handleSampleFinalDecision = (sampleId: string, decision: AuditorOverride) => {
     setLocalSamples(prev => prev.map(sample => {
         if (sample.sampleId === sampleId) {
             return { ...sample, auditorResult: decision || null };
         }
         return sample;
     }));
  };

  const handleSubmitForReview = () => {
    if (summary.notTested > 0) {
      alert("All samples must be tested before submitting for review.");
      return;
    }
    if (window.confirm("Are you sure you want to submit for review? This action will lock testing.")) {
      const computedSystemResult: 'Effective' | 'Ineffective' = summary.failed / summary.total > 0.1 ? "Ineffective" : "Effective";
      const updatedControl: EngagementControl = {
        ...control,
        status: "Pending Review",
        systemResult: computedSystemResult,
        conclusion: null,
        samplesTested: `${summary.tested}/${summary.total}`,
        testedSamples: summary.tested,
        totalSamples: summary.total,
        exceptions: summary.failed,
        lastUpdated: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        submittedBy: "Aarav Mehta",
        submittedOn: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      };
      setOverallStatus("Submitted");
      showToast("Control submitted for review.");
      setTimeout(() => onExit(updatedControl), 500);
    }
  };


  const currentSampleExecutionResults = useMemo(
    () =>
      isDynamicTestScript && controlDetails?.testScript && currentSample
        ? controlDetails.testScript.rules.reduce(
            (acc, rule) => {
              acc[rule.id] = evaluateRule(currentSample, rule);
              return acc;
            },
            {} as Record<number, RuleExecutionResult>,
          )
        : {},
    [isDynamicTestScript, controlDetails, currentSample, evaluateRule],
  );

  const systemDeterminedResult = useMemo(() => {
    if (!isDynamicTestScript) return "N/A";
    const results = Object.values(currentSampleExecutionResults) as RuleExecutionResult[];
    if (results.some((r) => r.systemResult === "FAIL")) return "FAIL";
    if (
      results.length > 0 &&
      results.every((r) => r.systemResult === "NOT_APPLICABLE")
    )
      return "NOT_APPLICABLE";
    return "PASS";
  }, [isDynamicTestScript, currentSampleExecutionResults]);

  if (
    !controlDetails ||
    (!controlDetails.testScript && !controlDetails.attributes)
  ) {
    return (
      <div className="p-8 text-center">
        Error: Control details or test script/attributes not found for this
        control.
      </div>
    );
  }

  const workflowStages = useMemo(() => {
    if (setupStage !== "complete") {
      return [
        { id: "s0", name: "Population Selected", state: setupStage !== "population" ? "completed" : "current" as const },
        { id: "s1", name: "Samples Generated", state: setupStage === "preview" ? "current" : "not_started" as const },
        { id: "s2", name: "Testing Ready", state: "not_started" as const }
      ];
    }
    
    let s1: "completed" | "current" | "not_started" = "not_started";
    let s2: "completed" | "current" | "not_started" = "not_started";
    let s3: "completed" | "current" | "not_started" = "not_started";
    let s4: "completed" | "current" | "not_started" = "not_started";
    let s5: "completed" | "current" | "not_started" = "not_started";

    const isCompleted = control.status === "Completed";
    const isSubmitted =
      overallStatus === "Submitted" ||
      control.status === "Pending Review" ||
      control.status === "Reviewed";
    const isTestingDone = summary.notTested === 0;

    if (isCompleted) {
      s1 = "completed"; s2 = "completed"; s3 = "completed"; s4 = "completed"; s5 = "completed";
    } else if (isSubmitted) {
      s1 = "completed"; s2 = "completed"; s3 = "completed"; s4 = "completed"; s5 = "current";
    } else if (testingStep === 2) {
      s1 = "completed"; s2 = "completed";
      if (isTestingDone) {
        s3 = "completed"; s4 = "current"; s5 = "not_started";
      } else {
        s3 = "current"; s4 = "not_started"; s5 = "not_started";
      }
    } else {
      s3 = "not_started"; s4 = "not_started"; s5 = "not_started";
      if (allSamplesReady) {
        s1 = "completed"; s2 = "completed"; s3 = "current";
      } else if (dataSources.length > 0) {
        s1 = "completed"; s2 = "current";
      } else {
        s1 = "current"; s2 = "not_started";
      }
    }

    return [
      { id: "data", name: "Data Source", state: s1 },
      { id: "evidence", name: "Evidence Collection", state: s2 },
      { id: "testing", name: "Testing", state: s3 },
      { id: "review", name: "Review", state: s4 },
      { id: "conclusion", name: "Conclusion", state: s5 },
    ];
  }, [control.status, overallStatus, summary.notTested, testingStep, allSamplesReady, dataSources.length, setupStage]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* --- HEADER --- */}
      <header className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <button onClick={() => onExit()} className="hover:text-gray-900">
            Engagement
          </button>
          <ChevronRightIcon className="h-4 w-4 mx-1" />
          <span className="font-medium text-gray-800">Perform Testing</span>
          <ChevronRightIcon className="h-4 w-4 mx-1" />
          <span className={`font-medium ${testingStep === 1 ? 'text-indigo-600' : 'text-gray-800'}`}>
            {testingStep === 1 ? 'Step 1: Evidence Collection' : 'Step 2: Testing Results'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 truncate shrink-0 max-w-[400px]">
              {control.controlId}: {control.controlName}
            </h2>
            <ControlTestingWorkflow stages={workflowStages} />
            {testingStep === 2 && (
              <button
                onClick={() => setTestingStep(1)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 ml-auto lg:ml-0"
              >
                ← Back to Evidence
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {setupStage === 'complete' && testingStep === 1 && (
              <button
                onClick={() => setTestingStep(2)}
                 className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
              >
                Go to Attribute Testing <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            )}
            {/* Step indicator pills */}
            <div className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full ${testingStep === 1 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
              <span className={`w-3 h-3 rounded-full ${testingStep === 2 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
            </div>
            <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
              Sample{" "}
              <span className="text-indigo-600">{currentSampleIndex + 1}</span> of{" "}
              {summary.total}
            </div>
          </div>
        </div>
      </header>

      {/* --- BODY --- */}
      <div className="flex-grow flex overflow-hidden">
        {setupStage !== 'complete' ? (
          <div className="flex-grow overflow-y-auto w-full p-6">
             <PopulationSamplingSetup onComplete={() => setSetupStage('complete')} mockSamples={localSamples} />
          </div>
        ) : (
          <>
            <SampleNavigator
              samples={localSamples}
              statuses={sampleStatuses}
              currentIndex={currentSampleIndex}
              onSelect={setCurrentSampleIndex}
              mode={testingStep === 1 ? 'evidence' : 'results'}
              evidenceStatuses={evidenceReadiness}
            />

            <main className="flex-grow p-6 overflow-y-auto">
              <TestScriptHeader control={control} controlDetails={controlDetails} isWorkflowPlanOpen={isWorkflowPlanOpen} onViewWorkflowPlan={() => setIsWorkflowPlanOpen(!isWorkflowPlanOpen)} />

              {/* ========================= STEP 1: Evidence Collection ========================= */}
              {testingStep === 1 && (
                <>
                  {/* Action Required Banner */}
                  <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                    <InfoCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 font-medium">
                      <span className="font-bold">Action Required:</span> You must upload or select all required data sources before you can submit testing for review.
                    </p>
                  </div>

              {/* Bulk Upload Section */}
              <BulkEvidenceUpload
                controlInstanceId={control.controlId}
                session={bulkUploadSession}
                samples={localSamples}
                onSessionUpdate={setBulkUploadSession}
                onApplyMapping={handleApplyMapping}
              />

              {/* Sample Data */}
              {currentSample && (
                <SampleData recordData={currentSample.sourceRowReference} dataSources={dataSources} setPreviewDataset={setPreviewDataset} onOpenDataViewer={openDataViewer} />
              )}

              {/* Sample Evidence */}
              {currentSample && (
                <SampleEvidenceSection
                  evidence={currentSample.evidence || []}
                  onUpload={handleEvidenceUpload}
                  onReplace={handleEvidenceUpload}
                  onView={handleEvidenceView}
                  isLocked={overallStatus === "Submitted"}
                />
              )}

              {/* Attributes to be Tested */}
              {currentSample && (controlDetails.attributes || controlDetails.testScript) && (() => {
                // Build attribute list from either attributes or testScript rules
                const attrList: { name: string; type: string }[] = isAmzTransport
                  ? ['Name Match', 'DL Verification Status', 'Criminal Record Check'].map(name => ({ name, type: 'Mandatory' }))
                  : controlDetails.testScript
                    ? controlDetails.testScript.rules.map(r => ({ name: r.description || r.name, type: r.type }))
                    : (controlDetails.attributes || []).map(a => ({ name: a.name, type: a.mandatory ? 'Mandatory' : 'Optional' }));

                if (attrList.length === 0) return null;

                // Map each attribute to required evidence types based on keywords
                const evidenceKeywordMap: Record<string, string[]> = {
                  'estimate': ['Estimate PDF'],
                  'media invoice': ['Media Invoice PDF'],
                  'publication invoice': ['Publication Invoice PDF'],
                  'supporting': ['Supporting Document'],
                  'invoice': ['Media Invoice PDF', 'Publication Invoice PDF'],
                  'vendor': ['Publication Invoice PDF'],
                  'document': ['Supporting Document'],
                };

                const currentEvidence = currentSample.evidence || [];

                const rows = attrList.map(attr => {
                  const nameLower = attr.name.toLowerCase();
                  const requiredEvidenceSet = new Set<string>();
                  
                  for (const [keyword, evidenceTypes] of Object.entries(evidenceKeywordMap)) {
                    if (nameLower.includes(keyword)) {
                      evidenceTypes.forEach(et => requiredEvidenceSet.add(et));
                    }
                  }
                  
                  // If no keywords matched, require all evidence
                  if (requiredEvidenceSet.size === 0) {
                    currentEvidence.forEach(ev => requiredEvidenceSet.add(ev.evidenceType));
                  }

                  const requiredEvidence = Array.from(requiredEvidenceSet);
                  const allPresent = requiredEvidence.length > 0 && requiredEvidence.every(
                    reqType => currentEvidence.some(ev => ev.evidenceType === reqType && !!ev.fileName)
                  );

                  return { name: attr.name, type: attr.type, requiredEvidence, ready: allPresent };
                });

                return (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-3">Attributes to be Tested</h3>
                    <p className="text-xs text-gray-500 mb-3">These checks will be evaluated when testing runs. No results are shown until testing is executed.</p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/2">Attribute / Test Rule</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">Evidence Required</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/6">Readiness</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {rows.map((row, i) => (
                            <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                              <td className="px-4 py-3 text-sm text-gray-800">
                                <div className="flex items-center gap-2">
                                  <span>{row.name}</span>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${row.type === 'Mandatory' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {row.type}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {row.requiredEvidence.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {row.requiredEvidence.map(ev => (
                                      <span key={ev} className="inline-block px-2 py-0.5 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {ev}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">No specific evidence mapped</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {row.ready ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                    Ready
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
                                    Missing Evidence
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Evidence Completion Tracker */}
              {currentSample && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Evidence Completion — Sample {currentSampleIndex + 1}</h4>
                  {currentSampleMissingEvidence.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      <span className="text-sm font-medium">All evidence uploaded for this sample.</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-red-700 font-medium mb-2">Missing {currentSampleMissingEvidence.length} item(s):</p>
                      <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                        {currentSampleMissingEvidence.map(ev => (
                          <li key={ev.evidenceId}>{ev.evidenceType}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Overall readiness */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-600 uppercase mb-1">Overall Control Readiness</h5>
                    <div className="flex items-center gap-2">
                      {allSamplesReady ? (
                        <>
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-green-700">All samples ready — you can run testing.</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-sm font-medium text-amber-700">
                            {Object.values(evidenceReadiness).filter(v => v === 'ready').length} of {controlDetails.samples.length} samples ready.
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================= STEP 2: Testing Results ========================= */}
          {testingStep === 2 && (
            <>
              {isDynamicTestScript && currentSample ? (
                <>
                  <SampleData recordData={currentSample.sourceRowReference} dataSources={dataSources} setPreviewDataset={setPreviewDataset} onOpenDataViewer={openDataViewer} />
                  <RuleEvaluationTable
                    rules={controlDetails.testScript?.rules || []}
                    executionResults={currentSampleExecutionResults}
                    auditorInputs={(currentSample.attributeResults || []).reduce((acc, ar) => ({...acc, [ar.attributeId]: { override: ar.auditorResult, comment: ar.comments, evidence: '' }}), {})}
                    onUpdate={handleUpdateRuleResult}
                    isLocked={overallStatus === "Submitted"}
                  />
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Final Sample Result
                      </h4>
                      <p className="text-sm text-gray-500">
                        System Determined Result:{" "}
                        <span
                          className={`font-bold ${systemDeterminedResult === "PASS" ? "text-green-600" : systemDeterminedResult === "FAIL" ? "text-red-600" : "text-gray-500"}`}
                        >
                          {systemDeterminedResult === "NOT_APPLICABLE"
                            ? "N/A"
                            : systemDeterminedResult}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowSampleReportModal(true)}
                        className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50"
                      >
                        Sample Report
                      </button>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="finalDecision"
                          className="text-sm font-medium"
                        >
                          Auditor Final Decision:
                        </label>
                        <select
                          id="finalDecision"
                          value={currentSample.auditorResult || ""}
                          onChange={(e) => handleSampleFinalDecision(currentSample.sampleId, e.target.value as AuditorOverride)}
                          disabled={overallStatus === "Submitted"}
                          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                        >
                          <option value="">System</option>
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="NOT_APPLICABLE">N/A</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {controlDetails.attributes ? (
                    <TestingPanel
                      sample={currentSample}
                      attributes={controlDetails.attributes}
                      results={(currentSample.attributeResults || []).reduce((acc, ar) => ({...acc, [ar.attributeId]: { auditorResult: ar.auditorResult, comment: ar.comments, evidence: '' }}), {})}
                      onUpdate={handleUpdateLegacyResult}
                      isLocked={overallStatus === "Submitted"}
                    />
                  ) : (
                    <div className="p-8 text-center text-gray-500 italic">
                      This control uses automated test rules. Review the evaluation results below.
                    </div>
                  )}
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">Final Sample Result</h4>
                      <p className="text-sm text-gray-500">
                        System Determined Result: <span className="font-bold text-gray-800">{sampleStatuses[currentSample.sampleId] || "Not Tested"}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSampleReportModal(true)}
                      className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50"
                    >
                      Sample Report
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </main>

        {/* Right side panel — only show Control Summary in Step 2 */}
        {testingStep === 2 && <TestingSummaryPanel summary={summary} />}

        {/* Step 1: Evidence readiness panel */}
        {testingStep === 1 && (
          <aside className="w-72 flex-shrink-0 border-l border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Evidence Overview</h3>
            <div className="space-y-3">
              {localSamples.map((sample: SampleModel, idx: number) => {
                const status = evidenceReadiness[sample.sampleId] || 'pending';
                const evList = sample.evidence || [];
                const uploaded = evList.filter(ev => !!ev.fileName).length;
                return (
                  <button
                    key={sample.sampleId}
                    onClick={() => setCurrentSampleIndex(idx)}
                    className={`w-full text-left p-3 rounded-md border text-sm transition ${
                      idx === currentSampleIndex ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">Sample {idx + 1}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {status === 'ready' ? 'Ready' : 'Pending'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{uploaded}/{evList.length} evidence items</div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${status === 'ready' ? 'bg-green-500' : 'bg-amber-400'}`}
                        style={{ width: `${evList.length > 0 ? (uploaded / evList.length) * 100 : 0}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}
          </>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentSampleIndex((i) => i - 1)}
            disabled={currentSampleIndex === 0}
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous Sample
          </button>
          <button
            onClick={() => setCurrentSampleIndex((i) => i + 1)}
            disabled={currentSampleIndex === summary.total - 1}
            className="rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Next Sample
          </button>
        </div>

        {testingStep === 1 ? (
          <button
            onClick={handleRunTesting}
            disabled={!allSamplesReady}
            title={hasPendingBulkSession ? "Please clear pending bulk upload session to run testing" : ""}
            className={`rounded-md px-6 py-2.5 text-sm font-bold text-white shadow-sm transition
              ${!allSamplesReady 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            Run Testing
          </button>
        ) : (
          <>
          <button
            onClick={() => setShowReportModal(true)}
            disabled={summary.notTested > 0}
            className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            View Working Paper
          </button>
          <button
            onClick={handleSubmitForReview}
            disabled={
              summary.notTested > 0 ||
              overallStatus === "Submitted" ||
              (engagement.status !== "IN PROGRESS" && engagement.status !== "PLANNING")
            }
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Submit for Review
          </button>
          </>
        )}
      </footer>

      <Toast message={toastMessage} />
      {previewDataset && (
         <DatasetPreviewModal dataset={previewDataset} onClose={() => setPreviewDataset(null)} />
      )}
      {viewerDataset && (
        <DataViewerPanel dataset={viewerDataset} onClose={() => { setViewerDataset(null); setViewerHighlightId(undefined); }} highlightRowId={viewerHighlightId} />
      )}
      {evidenceViewerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Evidence: {evidenceViewerUrl.fileName}</h3>
              <button onClick={() => setEvidenceViewerUrl(null)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-grow overflow-hidden p-1">
              <iframe src={evidenceViewerUrl.url} className="w-full h-full min-h-[60vh]" title="Evidence Viewer" />
            </div>
          </div>
        </div>
      )}
      {showReportModal && controlDetails && (
        <TestingReportModal
          control={control}
          onClose={() => setShowReportModal(false)}
        />
      )}
      {showSampleReportModal && controlDetails && currentSample && (
        <SampleDetailReportModal
          controlId={control.controlId}
          controlName={control.controlName}
          sample={currentSample}
          sampleIndex={currentSampleIndex}
          evidence={currentSample.evidence || []}
          sampleStatus={sampleStatuses[currentSample.sampleId] || 'NOT_TESTED'}
          systemDeterminedResult={systemDeterminedResult}
          attributes={isDynamicTestScript ? (controlDetails.testScript?.rules || []).map(r => ({id: r.id, name: r.description || r.name})) : (controlDetails.attributes || []).map(a => ({id: a.attributeId, name: a.name}))}
          onClose={() => setShowSampleReportModal(false)}
        />
      )}
      
      <WorkflowInspectorPanel
        isOpen={isWorkflowPlanOpen}
        onClose={() => setIsWorkflowPlanOpen(false)}
        plan={controlDetails.testScript?.workflowPlan}
      />
    </div>
  );
};

export default TestingWorkspacePage;
