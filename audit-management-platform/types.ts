

export interface RACM {
  id: number;
  name: string;
  framework: string;
  financialYear: string;
  version: string;
  status: 'Active' | 'Draft' | 'Archived';
  locked: boolean;
  linkedEngagements: number;
  lastUpdated: string;
  owner: string;
}

export type SortDirection = 'ascending' | 'descending';

export type SortKey = keyof RACM | '';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export type SummaryFilter = 'Active' | 'Draft' | 'Locked' | 'Linked to Engagement';

export type AssertionType = 'Existence' | 'Completeness' | 'Accuracy' | 'Valuation' | 'Cut-off';

export type RACMStatus = 'Draft' | 'Validated' | 'Locked';

export interface RACMDetail {
  id: number;
  riskId: string;
  riskDescription: string;
  assertion: AssertionType | '';
  controlName: string;
  controlDescription: string;
  key: boolean;
}

export type RACMDetailSortKey = keyof RACMDetail;

export type ValidationErrors = Record<number, Partial<Record<keyof Omit<RACMDetail, 'id' | 'key'>, string>>>;


// Engagement Types
// FIX: Added 'PLANNING' to EngagementStatus to allow its use for new engagements.
export type EngagementStatus = "NOT STARTED" | "IN PROGRESS" | "UNDER REVIEW" | "CLOSED" | "PLANNING";
export type EngagementType = "SOX" | "Internal Audit" | "Operational" | "IT Audit" | "Compliance";

export interface Engagement {
  id: number;
  name: string;
  type: EngagementType | string; // Allow string for future flexibility
  period: string;
  totalDeficiencies: number;
  status: EngagementStatus;
  linkedRacmName?: string;
  leadPartner?: string;
  // FIX: Added optional description property to align with its usage in the CreateEngagementModal form.
  description?: string;
}

export type NewEngagementData = Omit<Engagement, 'id' | 'totalDeficiencies' | 'status' | 'period'> & {
    periodStart: string;
    periodEnd: string;
    linkedRacmId?: number;
};

export type EngagementSortKey = keyof Engagement | '';

export interface EngagementSortConfig {
  key: EngagementSortKey;
  direction: SortDirection;
}

export type EngagementSummaryFilter = "Total Active" | "In Progress" | "Under Review" | "Completed (YTD)";

export interface EngagementFilters {
    types: string[];
    statuses: EngagementStatus[];
    periods: string[];
}


// Engagement Workspace Types
export type ControlStatus = 'Not Started' | 'Evidence Collection' | 'Testing In Progress' | 'Pending Review' | 'Concluded';
export type ControlConclusion = 'Effective' | 'Ineffective';
export type SystemResultValue = 'Effective' | 'Ineffective' | null;

export interface EngagementControl {
  id: number;
  controlId: string;
  controlName: string;
  domain: string;
  key: boolean;
  status: ControlStatus;
  samplesTested: string;
  testedSamples: number;
  totalSamples: number;
  exceptions: number;
  systemResult: SystemResultValue;
  conclusion: ControlConclusion | null;
  lastUpdated: string;
  submittedBy?: string;
  submittedOn?: string;
  process?: string;
  frequency?: string;
}

export type EngagementControlSortKey = keyof EngagementControl | '';

export interface EngagementControlSortConfig {
    key: EngagementControlSortKey;
    direction: SortDirection;
}

export type EngagementControlSummaryFilter = 'Key Controls' | 'Work In Progress' | 'Pending Review' | 'Concluded' | 'Deficient';

// Control Detail Panel Types
export interface ControlOverview {
    controlId: string;
    controlName: string;
    description: string;
    classification: string;
    assertions: string[];
}

export type SampleRecord = Record<string, any>;

export interface PopulationSnapshot {
    snapshotId: string;
    datasetName: string;
    recordCount: number;
    uploadedBy: string;
    uploadDate: string;
    status: 'Frozen' | 'Active';
}

// NEW types for dynamic testing
export type SystemResult = 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
export type AuditorOverride = 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | null;
export type SampleFinalStatus = 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'OVERRIDDEN' | 'NOT TESTED';

export interface RuleLogic {
    fieldName: string;
    operator: string;
    expectedValue: any;
    referenceField?: string;
}

export interface TestScriptRule {
    id: number;
    name: string;
    description: string;
    type: 'Completeness' | 'Accuracy' | 'Validity' | 'Custom';
    logic: RuleLogic;
}

export interface TestScript {
    version: string;
    generatedDate: string;
    rules: TestScriptRule[];
}

export interface TestScriptAttribute {
  attributeId: number;
  name: string;
  mandatory: boolean;
  ruleLogic: (sample: any) => boolean;
}

export interface ControlDataSource {
  id: string;
  filename: string;
  type: 'excel' | 'csv' | 'pdf' | 'other';
  uploadDate: string;
  size: number;
  records?: Record<string, any>[]; // Mock parsed data for Excel/CSV
  matchingKey?: string; // Configured matching key for this dataset
  fileUrl?: string; // For PDFs
}

// Sample Evidence — per-sample document evidence


export const DEFAULT_EVIDENCE_TYPES: Omit<EvidenceModel, 'evidenceId' | 'sampleId'>[] = [
  { evidenceType: 'Estimate PDF', evidenceName: 'Estimate document containing expected publication details', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
  { evidenceType: 'Media Invoice PDF', evidenceName: 'Agency invoice document', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
  { evidenceType: 'Publication Invoice PDF', evidenceName: 'Vendor invoice with supporting pages', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
  { evidenceType: 'Supporting Document', evidenceName: 'Additional supporting evidence', fileName: '', fileType: '', storageReference: '', status: 'pending', uploadedAt: '', uploadedBy: '', sourceOrigin: 'User' },
];

export interface ControlFullDetail {
    overview: ControlOverview;
    testScript?: TestScript;
    attributes?: TestScriptAttribute[];
    snapshot: PopulationSnapshot | null;
    samples: SampleModel[]; // Replaced SampleRecord[] with the formalized SampleModel
}

// --- CORE DATA MODEL ALIGNMENT ---

export interface EngagementModel {
  engagementId: string;
  engagementName: string;
  linkedRacmId: string;
  auditPeriod: string;
  status: EngagementStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
  
  // Legacy aliases for backward compatibility
  id?: number; 
  name?: string;
  type?: string;
  period?: string;
}

export interface ControlModel {
  controlInstanceId: string;
  engagementId: string;
  controlId: string;
  controlName: string;
  controlDescription: string;
  domain: string;
  keyControlFlag: boolean;
  frequency: string;
  status: ControlStatus;
  result: ControlConclusion | null;
  testScriptId?: string;
  totalSamples: number;
  testedSamples: number;
  exceptionsCount: number;
  lastUpdated: string;
}

export interface PopulationDatasetModel {
  populationDatasetId: string;
  controlInstanceId: string;
  sourceName: string;
  sourceType: string;
  fileName: string;
  totalRecords: number;
  uploadedAt: string;
  uploadedBy: string;
  matchingKeyConfig: string;
  previewAvailable: boolean;
}

export type FileMappingStatus = 'MAPPED' | 'UNMATCHED' | 'DUPLICATE' | 'AMBIGUOUS';

export interface BulkUploadFile {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  storageReference: string | null;
  mappingStatus?: FileMappingStatus;
  mappedSampleId?: string;
  mappedEvidenceId?: string; // This corresponds to the evidence type or an existing ID
  mappedEvidenceType?: string; // Storing the string representation of expected evidence type
}

export interface BulkUploadSession {
  bulkUploadSessionId: string;
  controlInstanceId: string;
  uploadedFilesCount: number;
  mappedFilesCount: number;
  unmatchedFilesCount: number;
  duplicateFilesCount: number;
  createdAt: string;
  createdBy: string;
  status: 'initialized' | 'in_progress' | 'completed' | 'failed';
  files: BulkUploadFile[];
}

export interface EvidenceModel {
  evidenceId: string;
  sampleId: string;
  evidenceType: string;
  evidenceName: string;
  fileName: string | null;
  fileType: string;
  storageReference: string | null;
  status: string;
  uploadedAt: string | null;
  uploadedBy: string;
  sourceOrigin: string;
}

export interface AttributeResultModel {
  attributeResultId: string;
  sampleId: string;
  controlInstanceId: string;
  attributeId: string | number;
  attributeName: string;
  expectedValue: any;
  actualValue: any;
  readinessStatus: string;
  systemResult: SystemResult;
  auditorResult: AuditorOverride;
  comments: string;
  evidenceReferences: string[];
  testedAt: string;
}

export interface SampleModel {
  sampleId: string;
  controlInstanceId: string;
  populationDatasetId: string;
  sampleIdentifier: string;
  sampleNumber: number;
  sourceRowReference: Record<string, any>;
  status: SampleFinalStatus;
  systemResult: SystemResult | null;
  auditorResult: AuditorOverride | null;
  comments: string;
  selectedAt: string;
  
  evidence: EvidenceModel[];
  attributeResults: AttributeResultModel[];
}

// Testing Workspace Types
// FIX: Added AuditorResult and TestingResult types for use in the legacy TestingPanel component.
export type AuditorResult = 'Pass' | 'Fail' | 'Not Applicable';

export interface TestingResult {
    auditorResult?: AuditorResult;
    comment?: string;
    evidence?: string;
}

export interface AuditorRuleInput {
    override: AuditorOverride;
    comment: string;
    evidence: string;
}
export type AllSamplesResultsState = Record<string, Record<number, AuditorRuleInput>>; // sampleId -> ruleId -> AuditorRuleInput

export interface RuleExecutionResult {
    systemResult: SystemResult;
    evaluatedValue: any;
    expectedValue: any;
}


export interface TestingSummary {
    total: number;
    tested: number;
    passed: number;
    failed: number;
    notApplicable: number;
    notTested: number;
}

// Reviewer Workspace Types
export interface AuditTrailEntry {
    date: string;
    user: string;
    action: string;
    details?: string;
}

// Data Viewer Types
export type DataViewerFileType = 'csv' | 'xlsx' | 'pdf' | 'png' | 'jpg';
export type DataViewerSourceType = 'Uploaded Dataset' | 'System Dataset' | 'Population File';

export interface DataViewerDataset {
    id: string;
    name: string;
    sourceType: DataViewerSourceType;
    fileType: DataViewerFileType;
    totalRows: number;
    totalColumns: number;
    columns: string[];
    rows: Record<string, any>[];
    idColumn?: string; // column used for sample-context highlighting
}