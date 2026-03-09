import re

with open('constants.ts', 'r') as f:
    content = f.read()

# I will just write the helper and replace detailedControlData entirely
new_block = """
// Helper to migrate legacy flat sample objects to new SampleModel
const createMockSample = (controlId: string, datasetId: string, sampleId: string, identifier: string, data: Record<string, any>, overrides: Partial<SampleModel> = {}): SampleModel => ({
    sampleId,
    controlInstanceId: controlId,
    populationDatasetId: datasetId,
    sampleIdentifier: identifier,
    sampleNumber: parseInt(sampleId.split('-').pop()?.replace(/\\D/g, '') || '0', 10),
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
        overview: { controlId: "ITGC-07", controlName: "Segregation of Duties (IT)", description: "IT roles and responsibilities are segregated to prevent fraudulent activities.", classification: "Key Control", assertions: ["Prevention"] },
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
        overview: { controlId: "ITGC-09", controlName: "Batch Job Monitoring", description: "Automated batch jobs are monitored for successful completion, and failures are investigated.", classification: "Non-Key Control", assertions: ["Completeness", "Accuracy"] },
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
"""

content = re.sub(r'export const detailedControlData[^;]+;', new_block, content, flags=re.MULTILINE|re.DOTALL)
content = content.replace("import type { RACM, RACMDetail, Engagement, EngagementType, EngagementControl, ControlFullDetail } from './types';", "import type { RACM, RACMDetail, Engagement, EngagementType, EngagementControl, ControlFullDetail, SampleModel } from './types';")

with open('constants.ts', 'w') as f:
    f.write(content)
