
import type { RACM, RACMDetail, Engagement, EngagementType, EngagementControl, ControlFullDetail, SampleModel } from './types';

export const racmData: RACM[] = [
  {
    "id": 1,
    "name": "FY26 SOX Master RACM",
    "framework": "SOX",
    "financialYear": "FY 2026",
    "version": "v1.0",
    "status": "Active",
    "locked": true,
    "linkedEngagements": 2,
    "lastUpdated": "12 Oct 2025",
    "owner": "Aarav Mehta"
  },
  {
    "id": 2,
    "name": "FY26 Internal Audit ITGC",
    "framework": "Internal",
    "financialYear": "FY 2026",
    "version": "v1.2",
    "status": "Draft",
    "locked": false,
    "linkedEngagements": 0,
    "lastUpdated": "14 Oct 2025",
    "owner": "Riya Sharma"
  },
  {
    "id": 3,
    "name": "FY25 SOX Master RACM",
    "framework": "SOX",
    "financialYear": "FY 2025",
    "version": "v2.1",
    "status": "Archived",
    "locked": false,
    "linkedEngagements": 1,
    "lastUpdated": "01 Apr 2025",
    "owner": "Aarav Mehta"
  },
  {
    "id": 4,
    "name": "IFC Manufacturing Operations",
    "framework": "IFC",
    "financialYear": "FY 2026",
    "version": "v1.0",
    "status": "Active",
    "locked": true,
    "linkedEngagements": 4,
    "lastUpdated": "10 Oct 2025",
    "owner": "Kabir Shah"
  },
   {
    "id": 5,
    "name": "FY26 Financial Reporting Controls",
    "framework": "SOX",
    "financialYear": "FY 2026",
    "version": "v1.1",
    "status": "Active",
    "locked": false,
    "linkedEngagements": 3,
    "lastUpdated": "11 Oct 2025",
    "owner": "Neha Patel"
  },
   {
    "id": 6,
    "name": "FY25 Internal Audit - Procurement",
    "framework": "Internal",
    "financialYear": "FY 2025",
    "version": "v1.0",
    "status": "Archived",
    "locked": false,
    "linkedEngagements": 2,
    "lastUpdated": "15 Mar 2025",
    "owner": "Riya Sharma"
  },
   {
    "id": 7,
    "name": "FY26 Draft IT Controls",
    "framework": "ITGC",
    "financialYear": "FY 2026",
    "version": "v0.5",
    "status": "Draft",
    "locked": false,
    "linkedEngagements": 0,
    "lastUpdated": "15 Oct 2025",
    "owner": "Kabir Shah"
  }
];

export const racmBuilderData: RACMDetail[] = [
  { id: 1, riskId: "R-101", riskDescription: "Unauthorized access to financial systems resulting in data manipulation", assertion: "Existence", controlName: "IT conducts quarterly logical access reviews across all tier 1 systems", controlDescription: "To ensure access rights remain appropriate, the IT department performs and documents a logical access review for all in-scope tier 1 systems on a quarterly basis. Evidence of review and sign-off by system owners is retained.", key: true },
  { id: 2, riskId: "R-101", riskDescription: "Unauthorized access to financial systems resulting in data manipulation", assertion: "Completeness", controlName: "Automated termination scripts revoke user access within 24 hours", controlDescription: "Upon an employee's termination date as recorded in the HR system, an automated script is triggered to disable all system access within a 24-hour service level agreement.", key: false },
  { id: 3, riskId: "R-102", riskDescription: "Data loss or corruption due to insufficient backup mechanisms", assertion: "Completeness", controlName: "Automated daily backups are performed and replicated to offsite storage", controlDescription: "Full backups of critical financial data are performed daily. Upon successful completion, backups are encrypted and replicated to a secure, geographically separate offsite storage facility.", key: true },
  { id: 4, riskId: "R-103", riskDescription: "Inaccurate financial reporting due to unrecorded transactions", assertion: "Accuracy", controlName: "Manual reconciliation of financial statements", controlDescription: "The finance team performs a manual reconciliation of the balance sheet and income statement to underlying sub-ledgers on a monthly basis. Any discrepancies are investigated and resolved.", key: true },
  { id: 5, riskId: "R-103", riskDescription: "Inaccurate financial reporting due to unrecorded transactions", assertion: "Accuracy", controlName: "System enforced tolerance limits for automated journal entries", controlDescription: "The ERP system is configured with tolerance limits for automated journal entries. Any entry exceeding these predefined thresholds requires manual review and approval before posting.", key: false },
  { id: 6, riskId: "R-104", riskDescription: "Unapproved vendor payments or fictitious vendors created", assertion: "Valuation", controlName: "Vendor onboarding requires independent review and approval by Controller", controlDescription: "New vendor setup requests are subject to an independent review by the Accounts Payable manager and final approval from the Controller to prevent fictitious vendor creation.", key: true },
  { id: 7, riskId: "R-104", riskDescription: "Unapproved vendor payments or fictitious vendors created", assertion: "Accuracy", controlName: "System performs a three-way match before invoice processing", controlDescription: "The accounts payable system is configured to automatically perform a three-way match between the purchase order, goods receipt note, and vendor invoice. Invoices with discrepancies are flagged for manual review.", key: false },
  { id: 8, riskId: "R-105", riskDescription: "Duplicate payments processed for the same invoice", assertion: "Completeness", controlName: "ERP system is configured to flag duplicate invoice numbers automatically", controlDescription: "To prevent duplicate payments, the ERP system is configured with a check to identify and flag any vendor invoice number that has already been processed.", key: true },
  { id: 9, riskId: "R-106", riskDescription: "Unauthorized journal entries posted to the general ledger", assertion: "Existence", controlName: "Segregation of duties enforced within ERP access roles", controlDescription: "ERP access roles are designed to enforce segregation of duties, preventing a single user from having conflicting permissions (e.g., creating a vendor and processing a payment to that vendor).", key: true },
  { id: 10, riskId: "R-107", riskDescription: "Misstatement of revenue due to incorrect contract terms applied", assertion: "Cut-off", controlName: "Legal and Finance review all non-standard revenue contracts", controlDescription: "All sales contracts with non-standard terms, including customized payment schedules or revenue recognition criteria, are reviewed and approved by both the Legal and Finance departments before execution.", key: true },
];

export const CONTROL_LIBRARY: string[] = [
  "IT conducts quarterly logical access reviews across all tier 1 systems",
  "Automated termination scripts revoke user access within 24 hours",
  "Automated daily backups are performed and replicated to offsite storage",
  "Manual reconciliation of financial statements",
  "System enforced tolerance limits for automated journal entries",
  "Vendor onboarding requires independent review and approval by Controller",
  "System performs a three-way match before invoice processing",
  "ERP system is configured to flag duplicate invoice numbers automatically",
  "Segregation of duties enforced within ERP access roles",
  "Legal and Finance review all non-standard revenue contracts",
  "User access rights are reviewed semi-annually by data owners.",
  "Data classification policies are defined and communicated.",
  "Incident response plan is tested annually.",
  "Change management procedures are documented and followed for all system changes.",
  "Physical access to data centers is restricted and monitored.",
];


export const engagementData: Engagement[] = [
  {
    "id": 1,
    "name": "SOX 2024 Q1 - North America",
    "type": "SOX",
    "period": "Q1 2024",
    "totalDeficiencies": 2,
    "status": "IN PROGRESS"
  },
  {
    "id": 2,
    "name": "ITGC Annual Review FY24",
    "type": "Internal Audit",
    "period": "FY 2024",
    "totalDeficiencies": 0,
    "status": "UNDER REVIEW"
  },
  {
    "id": 3,
    "name": "EMEA Payroll Controls",
    "type": "Operational",
    "period": "Q2 2024",
    "totalDeficiencies": 4,
    "status": "IN PROGRESS"
  },
  {
    "id": 4,
    "name": "APAC Financial Review",
    "type": "SOX",
    "period": "Q2 2024",
    "totalDeficiencies": 0,
    "status": "NOT STARTED"
  },
  {
    "id": 5,
    "name": "Procure-to-Pay Assessment",
    "type": "Internal Audit",
    "period": "Q1 2024",
    "totalDeficiencies": 1,
    "status": "IN PROGRESS"
  },
  {
    "id": 6,
    "name": "Cybersecurity Framework Audit",
    "type": "IT Audit",
    "period": "FY 2024",
    "totalDeficiencies": 3,
    "status": "UNDER REVIEW"
  },
  {
    "id": 7,
    "name": "Inventory Counts - US Plants",
    "type": "Operational",
    "period": "Q3 2024",
    "totalDeficiencies": 0,
    "status": "NOT STARTED"
  },
  {
    "id": 8,
    "name": "SOX 2023 Q4 - Wrap Up",
    "type": "SOX",
    "period": "Q4 2023",
    "totalDeficiencies": 0,
    "status": "CLOSED"
  }
];

export const LEAD_PARTNERS = ["Aarav Mehta", "Riya Sharma", "Kabir Shah", "Neha Patel"];
export const ENGAGEMENT_TYPES: EngagementType[] = ["SOX", "Internal Audit", "Operational", "IT Audit", "Compliance"];

export const engagementControlsData: EngagementControl[] = [
    { id: 1, controlId: 'ITGC-01', controlName: 'Logical Access - User Provisioning', domain: 'Logical Access', key: true, status: 'Concluded', samplesTested: '25/25', testedSamples: 25, totalSamples: 25, exceptions: 0, systemResult: 'Effective', conclusion: 'Effective', lastUpdated: '12 Oct 25' },
    { id: 2, controlId: 'ITGC-02', controlName: 'Terminated User Access Revocation', domain: 'Logical Access', key: true, status: 'Pending Review', samplesTested: '25/25', testedSamples: 25, totalSamples: 25, exceptions: 2, systemResult: 'Ineffective', conclusion: null, lastUpdated: '15 Oct 25', submittedBy: "Aarav Mehta", submittedOn: "15 Oct 2025" },
    { id: 3, controlId: 'ITGC-03', controlName: 'Privileged Access Review', domain: 'Logical Access', key: true, status: 'Evidence Collection', samplesTested: '0/4', testedSamples: 0, totalSamples: 4, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '15 Oct 25', process: 'IT Access Management', frequency: 'Quarterly' },
    { id: 4, controlId: 'ITGC-04', controlName: 'Password Configuration', domain: 'Logical Access', key: false, status: 'Not Started', samplesTested: '0/1', testedSamples: 0, totalSamples: 1, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '10 Oct 25' },
    { id: 5, controlId: 'ITGC-05', controlName: 'Change Management - Code Migration', domain: 'Change Management', key: true, status: 'Concluded', samplesTested: '45/45', testedSamples: 45, totalSamples: 45, exceptions: 0, systemResult: 'Effective', conclusion: 'Effective', lastUpdated: '13 Oct 25' },
    { id: 6, controlId: 'ITGC-06', controlName: 'Emergency Change Process', domain: 'Change Management', key: true, status: 'Testing In Progress', samplesTested: '8/10', testedSamples: 8, totalSamples: 10, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '15 Oct 25' },
    { id: 7, controlId: 'ITGC-07', controlName: 'Segregation of Duties (IT)', domain: 'Change Management', key: true, status: 'Evidence Collection', samplesTested: '0/3', testedSamples: 0, totalSamples: 3, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Oct 25' },
    { id: 8, controlId: 'ITGC-08', controlName: 'System Backup Procedures', domain: 'IT Operations', key: true, status: 'Concluded', samplesTested: '30/30', testedSamples: 30, totalSamples: 30, exceptions: 0, systemResult: 'Effective', conclusion: 'Effective', lastUpdated: '09 Oct 25' },
    { id: 9, controlId: 'ITGC-09', controlName: 'Batch Job Monitoring', domain: 'IT Operations', key: false, status: 'Testing In Progress', samplesTested: '3/3', testedSamples: 3, totalSamples: 3, exceptions: 1, systemResult: 'Ineffective', conclusion: null, lastUpdated: '10 Oct 25' },
];

// Helper to migrate legacy flat sample objects to new SampleModel
const createMockSample = (controlId: string, datasetId: string, sampleId: string, identifier: string, data: Record<string, any>, overrides: Partial<SampleModel> = {}): SampleModel => ({
    sampleId,
    controlInstanceId: controlId,
    populationDatasetId: datasetId,
    sampleIdentifier: identifier,
    sampleNumber: parseInt(sampleId.split('-').pop()?.replace(/\D/g, '') || '0', 10),
    sourceRowReference: data,
    status: overrides.status || 'NOT TESTED',
    systemResult: overrides.systemResult || null,
    auditorResult: overrides.auditorResult || null,
    comments: overrides.comments || '',
    selectedAt: new Date().toISOString(),
    evidence: overrides.evidence || [],
    attributeResults: overrides.attributeResults || []
});

export const detailedControlData: Record<string, ControlFullDetail> = {
    'ITGC-01': {
        overview: { controlId: "ITGC-01", controlName: "Logical Access - User Provisioning", description: "Access for new employees is provisioned according to approved roles and within service level agreements.", classification: "Key Control", assertions: ["Accuracy", "Timeliness"] },
        attributes: [
            { attributeId: 1, name: "Verify approved access request exists", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.hasRequestForm === true },
            { attributeId: 2, name: "Verify access granted matches request", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.accessMatchesRequest === true },
            { attributeId: 3, name: "Verify access granted within SLA (48h)", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.provisioningHours <= 48 }
        ],
        snapshot: { snapshotId: "SNAP-1041", datasetName: "new_hires_Q1", recordCount: 50, uploadedBy: "S. Lee", uploadDate: "10 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-01', 'SNAP-1041', 'ITGC-01-S01', 'E-NEW-01', { employeeId: 'E-NEW-01', hasRequestForm: true, accessMatchesRequest: true, provisioningHours: 24 }),
            createMockSample('ITGC-01', 'SNAP-1041', 'ITGC-01-S02', 'E-NEW-02', { employeeId: 'E-NEW-02', hasRequestForm: true, accessMatchesRequest: true, provisioningHours: 12 }),
            createMockSample('ITGC-01', 'SNAP-1041', 'ITGC-01-S03', 'E-NEW-F1', { employeeId: 'E-NEW-F1', hasRequestForm: false, accessMatchesRequest: true, provisioningHours: 12 }),
            createMockSample('ITGC-01', 'SNAP-1041', 'ITGC-01-S04', 'E-NEW-F2', { employeeId: 'E-NEW-F2', hasRequestForm: true, accessMatchesRequest: false, provisioningHours: 36 }),
            createMockSample('ITGC-01', 'SNAP-1041', 'ITGC-01-S05', 'E-NEW-F3', { employeeId: 'E-NEW-F3', hasRequestForm: true, accessMatchesRequest: true, provisioningHours: 72 })
        ]
    },
    'ITGC-02': {
        overview: { controlId: "ITGC-02", controlName: "Terminated User Access Revocation", description: "Access for terminated employees and contractors is revoked within 24 hours of their effective termination date.", classification: "Key Control", assertions: ["Completeness", "Accuracy", "Validity"] },
        attributes: [
            { attributeId: 1, name: "Verify term date matches HR record", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.terminationDate === sample.sourceRowReference.hrRecordDate },
            { attributeId: 2, name: "Verify ticket creation date", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.ticketId !== null },
            { attributeId: 3, name: "Verify access disabled <= 24h", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.revocationTimeHours <= 24 }
        ],
        snapshot: { snapshotId: "SNAP-1042", datasetName: "hr_terms_Q1", recordCount: 245, uploadedBy: "M. Johnson", uploadDate: "12 Oct 25", status: "Frozen" },
        samples: [
            ...Array.from({ length: 23 }, (_, i) => createMockSample('ITGC-02', 'SNAP-1042', `S-${String(i + 1).padStart(3, '0')}`, `E${String(i + 1).padStart(3, '0')}`, {
                primaryIdentifier: `E${String(i + 1).padStart(3, '0')}`,
                primaryIdentifierLabel: "Employee ID",
                terminationDate: `2025-07-${String((i % 10) + 1).padStart(2, '0')}`,
                hrRecordDate: `2025-07-${String((i % 10) + 1).padStart(2, '0')}`,
                ticketId: `T-23${i + 45}`,
                revocationTimeHours: 10 + (i % 14)
            }, {
                status: 'PASS',
                auditorResult: 'PASS',
                comments: 'Verified via screenshot.',
                evidence: [{ evidenceId: `EV-${i}`, sampleId: `S-${String(i + 1).padStart(3, '0')}`, evidenceType: 'Screenshot', evidenceName: 'Term verify', fileName: `E${String(i + 1).padStart(3, '0')}_term_verify.pdf`, fileType: 'pdf', storageReference: null, status: 'Uploaded', uploadedAt: '12 Oct 25', uploadedBy: 'A. Patel', sourceOrigin: 'Manual' }]
            })),
            createMockSample('ITGC-02', 'SNAP-1042', 'S-024', 'E-FAIL-02', {
                primaryIdentifier: "E-FAIL-02",
                primaryIdentifierLabel: "Employee ID",
                terminationDate: "2025-07-11",
                hrRecordDate: "2025-07-11",
                ticketId: null,
                revocationTimeHours: 18
            }, {
                status: 'FAIL',
                auditorResult: 'FAIL',
                comments: 'No deprovisioning ticket was created for this user.',
                evidence: [{ evidenceId: 'EV-24', sampleId: 'S-024', evidenceType: 'Log File', evidenceName: 'HR Term list', fileName: 'HR_term_list.csv', fileType: 'csv', storageReference: null, status: 'Uploaded', uploadedAt: '12 Oct 25', uploadedBy: 'A. Patel', sourceOrigin: 'System' }]
            }),
            createMockSample('ITGC-02', 'SNAP-1042', 'S-025', 'E-FAIL-03', {
                 primaryIdentifier: "E-FAIL-03",
                 primaryIdentifierLabel: "Employee ID",
                 terminationDate: "2025-07-12",
                 hrRecordDate: "2025-07-12",
                 ticketId: "T-FAIL-3",
                 revocationTimeHours: 30
            }, {
                status: 'FAIL',
                auditorResult: 'FAIL',
                comments: 'Access was revoked at 30 hours, exceeding the 24 hour SLA.',
                evidence: [{ evidenceId: 'EV-25', sampleId: 'S-025', evidenceType: 'JSON Log', evidenceName: 'Ticket Log', fileName: 'T-FAIL-3_ticket_log.json', fileType: 'json', storageReference: null, status: 'Uploaded', uploadedAt: '12 Oct 25', uploadedBy: 'A. Patel', sourceOrigin: 'System' }]
            })
        ]
    },
    'ITGC-03': {
        overview: { controlId: "ITGC-03", controlName: "Privileged Access Review", description: "Privileged access to critical systems is reviewed quarterly by system owners to ensure appropriateness.", classification: "Key Control", assertions: ["Existence", "Valuation"] },
        testScript: {
            version: 'TS-v1.2',
            generatedDate: '12 Oct 2025',
            rules: [
                { id: 1, name: 'Quarterly Review Completion', description: 'Verify review was completed in the quarter', type: 'Completeness', logic: { fieldName: 'reviewCompleted', operator: '===', expectedValue: true } },
                { id: 2, name: 'System Owner Sign-off', description: 'Verify system owner signed off on review', type: 'Validity', logic: { fieldName: 'isSignedOff', operator: '===', expectedValue: true } },
                { id: 3, name: 'Revocation of Inappropriate Access', description: 'Verify inappropriate access was revoked if identified', type: 'Accuracy', logic: { fieldName: 'revokedIfInappropriate', operator: '===', expectedValue: true } }
            ],
            workflowPlan: [
                { id: 1, description: "Extract vendor name, gross amount, publication name and dates from Publication Invoice and Media Invoice", actionType: "Extract" },
                { id: 2, description: "Match Publication Invoice to Media Invoice using vendor name and gross amount", actionType: "Match" },
                { id: 3, description: "Match Media Invoice to Estimate using publication name and gross amount", actionType: "Match" },
                { id: 4, description: "Validate supporting documents exist and publication dates match", actionType: "Validate" },
                { id: 5, description: "Extract R0/R1/R2 rate slabs from vendor quotation or supporting documents", actionType: "Extract" },
                { id: 6, description: "Sample 5–10 high value invoice items", actionType: "Other" },
                { id: 7, description: "Verify rate hierarchy rule: R1 <= R0 and R2 <= R1", actionType: "Verify" },
                { id: 8, description: "Record deviations if any", actionType: "Record" },
                { id: 9, description: "Generate compliance summary", actionType: "Generate" }
            ]
        },
        snapshot: { snapshotId: "SNAP-1043", datasetName: "privileged_access_Q3", recordCount: 120, uploadedBy: "M. Johnson", uploadDate: "13 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-03', 'SNAP-1043', 'PR-S01', 'SYS-01', { systemId: 'SYS-01', reviewCompleted: true, isSignedOff: true, revokedIfInappropriate: true, reviewer: 'J. Smith' }),
            createMockSample('ITGC-03', 'SNAP-1043', 'PR-S02', 'SYS-F1', { systemId: 'SYS-F1', reviewCompleted: false, isSignedOff: false, revokedIfInappropriate: true, reviewer: 'A. Patel' }),
            createMockSample('ITGC-03', 'SNAP-1043', 'PR-S03', 'SYS-F2', { systemId: 'SYS-F2', reviewCompleted: true, isSignedOff: false, revokedIfInappropriate: true, reviewer: 'J. Smith' }),
            createMockSample('ITGC-03', 'SNAP-1043', 'PR-S04', 'SYS-04', { systemId: 'SYS-04', reviewCompleted: true, isSignedOff: true, revokedIfInappropriate: true, reviewer: 'B. Jones' })
        ]
    },
     'ITGC-04': {
        overview: { controlId: "ITGC-04", controlName: "Password Configuration", description: "System password parameters are configured to enforce complexity, length, and history requirements.", classification: "Non-Key Control", assertions: ["Completeness"] },
        attributes: [
            { attributeId: 1, name: "Verify minimum length is >= 12 characters", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.minLength >= 12 },
            { attributeId: 2, name: "Verify complexity is enabled", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.complexityEnabled === true },
            { attributeId: 3, name: "Verify password history is >= 5", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.historyCount >= 5 }
        ],
        snapshot: { snapshotId: "SNAP-1044", datasetName: "system_configs", recordCount: 35, uploadedBy: "J. Doe", uploadDate: "09 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-04', 'SNAP-1044', 'ITGC-04-S01', 'APP-01', { systemId: 'APP-01', minLength: 14, complexityEnabled: true, historyCount: 10 }),
            createMockSample('ITGC-04', 'SNAP-1044', 'ITGC-04-S02', 'APP-F1', { systemId: 'APP-F1', minLength: 8, complexityEnabled: true, historyCount: 10 }),
            createMockSample('ITGC-04', 'SNAP-1044', 'ITGC-04-S03', 'DB-01', { systemId: 'DB-01', minLength: 12, complexityEnabled: true, historyCount: 4 }),
            createMockSample('ITGC-04', 'SNAP-1044', 'ITGC-04-S04', 'OS-F1', { systemId: 'OS-F1', minLength: 16, complexityEnabled: false, historyCount: 5 })
        ]
    },
    'ITGC-05': {
        overview: { controlId: "ITGC-05", controlName: "Change Management - Code Migration", description: "All changes to production systems follow a documented, approved change management process.", classification: "Key Control", assertions: ["Accuracy", "Authorization"] },
        attributes: [
            { attributeId: 1, name: "Verify change request is approved", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.approved === true },
            { attributeId: 2, name: "Verify testing was completed and signed off", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.tested === true },
            { attributeId: 3, name: "Verify segregation of duties between dev and deploy", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.dev !== sample.sourceRowReference.deployer }
        ],
        snapshot: { snapshotId: "SNAP-1045", datasetName: "cm_log_Q3", recordCount: 210, uploadedBy: "K. Singh", uploadDate: "13 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-05', 'SNAP-1045', 'ITGC-05-S01', 'CR-001', { changeId: 'CR-001', approved: true, tested: true, dev: 'userA', deployer: 'userB' }),
            createMockSample('ITGC-05', 'SNAP-1045', 'ITGC-05-S02', 'CR-F01', { changeId: 'CR-F01', approved: false, tested: true, dev: 'userC', deployer: 'userD' }),
            createMockSample('ITGC-05', 'SNAP-1045', 'ITGC-05-S03', 'CR-F02', { changeId: 'CR-F02', approved: true, tested: false, dev: 'userE', deployer: 'userF' }),
            createMockSample('ITGC-05', 'SNAP-1045', 'ITGC-05-S04', 'CR-F03', { changeId: 'CR-F03', approved: true, tested: true, dev: 'userG', deployer: 'userG' })
        ]
    },
    'ITGC-06': {
        overview: { controlId: "ITGC-06", controlName: "Emergency Change Process", description: "Emergency changes have a retrospective approval and review process.", classification: "Key Control", assertions: ["Completeness", "Authorization"] },
        attributes: [
            { attributeId: 1, name: "Verify change was classified as emergency", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.isEmergency === true },
            { attributeId: 2, name: "Verify retrospective approval was obtained within 48h", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.retroApprovedHours <= 48 }
        ],
        snapshot: { snapshotId: "SNAP-1046", datasetName: "emergency_cm_log_Q3", recordCount: 15, uploadedBy: "K. Singh", uploadDate: "15 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-06', 'SNAP-1046', 'ITGC-06-S01', 'ECR-01', { changeId: 'ECR-01', isEmergency: true, retroApprovedHours: 24 }),
            createMockSample('ITGC-06', 'SNAP-1046', 'ITGC-06-S02', 'ECR-02', { changeId: 'ECR-02', isEmergency: true, retroApprovedHours: 4 }),
            createMockSample('ITGC-06', 'SNAP-1046', 'ITGC-06-S03', 'ECR-F01', { changeId: 'ECR-F01', isEmergency: true, retroApprovedHours: 72 }),
            createMockSample('ITGC-06', 'SNAP-1046', 'ITGC-06-S04', 'ECR-F02', { changeId: 'ECR-F02', isEmergency: false, retroApprovedHours: 12 })
        ]
    },
    'ITGC-07': {
        overview: { controlId: "ITGC-07", controlName: "Segregation of Duties (IT)", description: "IT roles and responsibilities are segregated to prevent fraudulent activities. Key conflicting duties are identified and monitored.", classification: "Key Control", assertions: ["Prevention"] },
        attributes: [
            { attributeId: 1, name: "Verify user does not have conflicting roles", mandatory: true, ruleLogic: (sample: any) => !sample.sourceRowReference.hasConflict },
            { attributeId: 2, name: "Verify mitigating control is in place if conflict exists", mandatory: false, ruleLogic: (sample: any) => sample.sourceRowReference.hasConflict ? sample.sourceRowReference.mitigatingControlExists : true }
        ],
        snapshot: { snapshotId: "SNAP-1047", datasetName: "user_roles_matrix", recordCount: 850, uploadedBy: "R. Chen", uploadDate: "12 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-07', 'SNAP-1047', 'ITGC-07-S01', 'user_a', { userId: 'user_a', hasConflict: false, mitigatingControlExists: false }),
            createMockSample('ITGC-07', 'SNAP-1047', 'ITGC-07-S02', 'user_b', { userId: 'user_b', hasConflict: true, mitigatingControlExists: true }),
            createMockSample('ITGC-07', 'SNAP-1047', 'ITGC-07-S03', 'user_f1', { userId: 'user_f1', hasConflict: true, mitigatingControlExists: false })
        ]
    },
    'ITGC-08': {
        overview: { controlId: "ITGC-08", controlName: "System Backup Procedures", description: "Critical systems data is backed up regularly, and backups are tested for restorability.", classification: "Key Control", assertions: ["Availability"] },
        attributes: [
            { attributeId: 1, name: "Verify backup was completed successfully", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.backupStatus === "Success" },
            { attributeId: 2, name: "Verify backup is stored offsite", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.isOffsite === true },
            { attributeId: 3, name: "Verify quarterly restore test was successful", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.restoreTestStatus === "Success" }
        ],
        snapshot: { snapshotId: "SNAP-1048", datasetName: "backup_logs_Q3", recordCount: 500, uploadedBy: "L. Vega", uploadDate: "09 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-08', 'SNAP-1048', 'ITGC-08-S01', 'SYS-DB-01', { systemId: 'SYS-DB-01', backupStatus: 'Success', isOffsite: true, restoreTestStatus: 'Success' }),
            createMockSample('ITGC-08', 'SNAP-1048', 'ITGC-08-S02', 'SYS-APP-F1', { systemId: 'SYS-APP-F1', backupStatus: 'Failed', isOffsite: false, restoreTestStatus: 'N/A' }),
            createMockSample('ITGC-08', 'SNAP-1048', 'ITGC-08-S03', 'SYS-WEB-F2', { systemId: 'SYS-WEB-F2', backupStatus: 'Success', isOffsite: false, restoreTestStatus: 'Success' }),
            createMockSample('ITGC-08', 'SNAP-1048', 'ITGC-08-S04', 'SYS-AUTH-F3', { systemId: 'SYS-AUTH-F3', backupStatus: 'Success', isOffsite: true, restoreTestStatus: 'Failed' })
        ]
    },
    'ITGC-09': {
        overview: { controlId: "ITGC-09", controlName: "Batch Job Monitoring", description: "Automated batch jobs are monitored for successful completion, and failures are investigated and resolved timely.", classification: "Non-Key Control", assertions: ["Completeness", "Accuracy"] },
        attributes: [
            { attributeId: 1, name: "Verify job completed successfully", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.jobStatus === "Success" },
            { attributeId: 2, name: "If failed, verify investigation ticket was created", mandatory: true, ruleLogic: (sample: any) => sample.sourceRowReference.jobStatus === "Success" || sample.sourceRowReference.ticketId !== null }
        ],
        snapshot: { snapshotId: "SNAP-1049", datasetName: "batch_job_logs", recordCount: 1500, uploadedBy: "L. Vega", uploadDate: "10 Oct 25", status: "Frozen" },
        samples: [
            createMockSample('ITGC-09', 'SNAP-1049', 'ITGC-09-S01', 'JOB-001', { jobId: 'JOB-001', jobStatus: 'Success', ticketId: null }),
            createMockSample('ITGC-09', 'SNAP-1049', 'ITGC-09-S02', 'JOB-F01', { jobId: 'JOB-F01', jobStatus: 'Failed', ticketId: 'T-BJ-01' }),
            createMockSample('ITGC-09', 'SNAP-1049', 'ITGC-09-S03', 'JOB-F02', { jobId: 'JOB-F02', jobStatus: 'Failed', ticketId: null })
        ]
    }
};
