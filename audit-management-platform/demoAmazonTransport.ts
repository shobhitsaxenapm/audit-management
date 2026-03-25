// TEMP_DEMO_AMAZON_TRANSPORT: hardcoded RACM for demo
export const documentDataAmazonRacm: RACM = {
  id: 101,
  name: "AMZ TRANSPORT",
  framework: "Operational",
  financialYear: "FY 2026",
  version: "v1.0",
  status: "Active",
  locked: true,
  linkedEngagements: 1,
  lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  owner: "Aarav Mehta"
};

// TEMP_DEMO_AMAZON_TRANSPORT: hardcoded CEO demo engagement
// TEMP_DEMO_AMAZON_TRANSPORT: hardcoded 18-control demo data
// TEMP_DEMO_AMAZON_TRANSPORT: safe to remove after demo
// TEMP_DEMO_AMAZON_TRANSPORT: side panel content for CEO demo controls — remove this entire file to revert

import type { Engagement, EngagementControl, ControlFullDetail, SampleModel, RACM } from './types';

// TEMP_DEMO_AMAZON_TRANSPORT: side panel detail data for all 18 ATC controls
// To revert: delete this export entirely (or delete this file)
export interface AtcControlDetail {
    description: string;
    classification: string;
    assertions: string[];
    attributes: string[]; // all treated as mandatory Y
}

export const amazonTransportControlDetails: Record<string, AtcControlDetail> = {
    // ATC-01 Partner Declaration Sheet
    "ATC-01": {
        description: "Verify that the transport partner has submitted a signed declaration sheet confirming compliance with Amazon's operational and contractual requirements.",
        classification: "Preventive",
        assertions: ["Existence", "Completeness"],
        attributes: [
            "Signature present",
            "Date stamp present",
            "Validity date",
            "I Agree tick mark",
            "Company stamp/seal",
            "Authorized signatory name",
            "All sections filled",
        ],
    },

    // ATC-02 QB-1.1 Background Check
    "ATC-02": {
        description: "Ensure all drivers have undergone a comprehensive background verification covering identity, criminal records, address, and watchlist screening prior to onboarding.",
        classification: "Preventive",
        assertions: ["Existence", "Validity", "Completeness"],
        attributes: [
            "Driver Name",
            "DL Verification status",
            "PAN card verification status",
            "Criminal case status",
            "Police verification status",
            "Address verification status",
            "Watchlist screening status",
            "BGV agency name",
            "BGV date",
            "BGV expiry",
        ],
    },

    // TEMP_DEMO_AMAZON_TRANSPORT: Driving License attributes hardcoded — ATC-03 hero control
    // ATC-03 QB-1.5 Driving License
    "ATC-03": {
        description: "Verify driver holds a valid and active driving license suitable for assigned transport operations and compliant with required regulatory norms.",
        classification: "Preventive",
        assertions: ["Validity", "Existence", "Completeness"],
        attributes: [
            "DL Number",
            "Driver Name",
            "Father's Name",
            "Date of Birth",
            "Issue Date",
            "Expiry Date",
            "License Class (LMV / HMV / Transport)",
            "Transport Badge (if applicable)",
            "Issuing RTO / State",
            "Photo Present",
            "Address",
            "License Status (Active / Suspended / Revoked)",
            "Pending Challans",
        ],
    },

    // ATC-04 QB-2.12 Return Workers Documents
    "ATC-04": {
        description: "Confirm that original documents collected during onboarding have been returned to workers upon separation or when no longer required by policy.",
        classification: "Detective",
        assertions: ["Existence", "Completeness"],
        attributes: [
            "Declaration uploaded",
            "Company letterhead",
            "Signature present",
            "Date stamp",
            "Return of original documents confirmed",
        ],
    },

    // ATC-05 QB-2.2 Recruiting
    "ATC-05": {
        description: "Verify that recruitment documentation including offer/appointment letters are in place, signed by both parties, and compliant with applicable labour norms.",
        classification: "Preventive",
        assertions: ["Existence", "Completeness", "Accuracy"],
        attributes: [
            "Employee/Contractor name",
            "Start date",
            "NDA clause present",
            "Salary/Compensation mentioned",
            "Employee signature",
            "Employer signature",
            "Letterhead/stamp",
            "Date on letter",
        ],
    },

    // ATC-06 QB-2.4 Subcontractors
    "ATC-06": {
        description: "Confirm that any subcontracting arrangement is declared, approved by Amazon, and backed by a formal agreement between the principal contractor and subcontractor.",
        classification: "Preventive",
        assertions: ["Existence", "Authorisation", "Completeness"],
        attributes: [
            "Subcontracting declared",
            "Amazon consent obtained",
            "Subcontractor agreement uploaded",
            "Principal contractor signature/stamp",
            "Subcontractor details",
        ],
    },

    // ATC-07 QB-2.8 Information and Network Security
    "ATC-07": {
        description: "Verify that the transport partner has a documented information and network security policy covering password management, data protection, and incident reporting.",
        classification: "Preventive",
        assertions: ["Existence", "Completeness", "Accuracy"],
        attributes: [
            "Policy uploaded",
            "Password policy mentioned",
            "ISO certification details",
            "Incident response plan included",
            "Data protection measures",
            "Data leakage reporting process",
            "Effective date",
            "Authorized signatory",
        ],
    },

    // ATC-08 QB-3.1 Offer Letter / SLA / Contract
    "ATC-08": {
        description: "Ensure all drivers and workers have a signed offer letter, SLA, or contract in place specifying role, compensation, notice period, and termination clauses.",
        classification: "Preventive",
        assertions: ["Existence", "Completeness", "Validity"],
        attributes: [
            "Driver/worker name",
            "Contract start date",
            "Role defined",
            "Compensation/payment terms",
            "Notice/termination clause",
            "Worker signature",
            "Employer signature",
            "Company stamp",
            "Contract validity period",
        ],
    },

    // ATC-09 QB-3.2 Anti-Discrimination and Anti-Harassment
    "ATC-09": {
        description: "Verify that the transport partner has a formal anti-discrimination and anti-harassment policy that is acknowledged by relevant personnel.",
        classification: "Preventive",
        assertions: ["Existence", "Completeness"],
        attributes: [
            "Policy uploaded",
            "Anti-discrimination clause present",
            "Anti-harassment clause present",
            "Employee acknowledgement/signature",
            "Effective date",
            "Company signatory/stamp",
        ],
    },

    // TEMP_DEMO_AMAZON_TRANSPORT: POSH attributes hardcoded — ATC-10 hero control
    // ATC-10 QB-3.21 POSH Compliance
    "ATC-10": {
        description: "Ensure POSH policy is implemented, acknowledged by relevant personnel, and supported by required internal committee and policy artifacts.",
        classification: "Preventive",
        assertions: ["Existence", "Completeness", "Compliance"],
        attributes: [
            "POSH policy uploaded",
            "POSH clause present",
            "Internal Committee details mentioned",
            "Employee acknowledgement / signature",
            "Effective date",
            "Company signatory / stamp",
        ],
    },

    // ATC-11 QB-3.3 Incident Response and On Road Emergency
    "ATC-11": {
        description: "Confirm that a documented SOP for on-road incidents and emergencies is in place, with clear escalation matrix and driver reporting process.",
        classification: "Corrective",
        assertions: ["Existence", "Completeness"],
        attributes: [
            "SOP uploaded",
            "Emergency contact details",
            "Escalation matrix included",
            "Driver incident reporting process",
            "Effective date",
            "Authorized signatory",
        ],
    },

    // ATC-12 QB-4.2 Training Program
    "ATC-12": {
        description: "Verify that drivers have completed required training programs with records showing training topic, date, trainer details, and driver acknowledgement.",
        classification: "Preventive",
        assertions: ["Existence", "Completeness", "Accuracy"],
        attributes: [
            "Training record uploaded",
            "Driver name",
            "Training date",
            "Training topic/module",
            "Trainer name/agency",
            "Driver acknowledgement/signature",
            "Validity/refresher due date",
        ],
    },

    // ATC-13 QB-4.5 Vehicle Maintenance
    "ATC-13": {
        description: "Confirm that vehicles used for transport operations have up-to-date maintenance records with supporting invoices and service provider details.",
        classification: "Preventive",
        assertions: ["Existence", "Validity", "Completeness"],
        attributes: [
            "Vehicle number",
            "Service record uploaded",
            "Last maintenance date",
            "Next due date",
            "Type of maintenance/service",
            "Garage/service provider name",
            "Supporting invoice/proof",
        ],
    },

    // ATC-14 QB-5.11 Driver Medical and Personal Accident Insurance
    "ATC-14": {
        description: "Verify that active personal accident and medical insurance policies are in place for all drivers with adequate coverage and valid policy periods.",
        classification: "Preventive",
        assertions: ["Existence", "Validity", "Completeness"],
        attributes: [
            "Driver name",
            "Document uploaded",
            "Policy/certificate number",
            "Coverage start date",
            "Coverage end date",
            "Insurer name",
            "Coverage amount",
            "Status active/inactive",
        ],
    },

    // ATC-15 QB-7.1 Business Registration
    "ATC-15": {
        description: "Confirm that the transport partner is a duly registered legal entity with valid and active business registration certificate.",
        classification: "Preventive",
        assertions: ["Existence", "Validity", "Accuracy"],
        attributes: [
            "Legal entity name",
            "Registration number",
            "Type of entity",
            "Date of registration",
            "Registered address",
            "Name on certificate",
            "Status active/inactive",
        ],
    },

    // ATC-16 QB-7.14 Additional Registrations and Licenses
    "ATC-16": {
        description: "Verify that all additional regulatory registrations and licenses required for transport operations are current, valid, and appropriately issued.",
        classification: "Preventive",
        assertions: ["Existence", "Validity"],
        attributes: [
            "License/registration type",
            "License number",
            "Entity name",
            "Issue date",
            "Expiry date",
            "Issuing authority",
            "Status active/expired",
        ],
    },

    // ATC-17 QB-7.3 Business Ownership
    "ATC-17": {
        description: "Confirm the ownership structure of the transport partner entity with supporting declarations and identification linkage to registration documents.",
        classification: "Preventive",
        assertions: ["Existence", "Accuracy", "Completeness"],
        attributes: [
            "Owner/proprietor/director name",
            "Ownership proof uploaded",
            "ID/registration linkage",
            "Effective date",
            "Signature/declaration present",
            "Company stamp/signatory",
        ],
    },

    // ATC-18 QB-7.4 Vehicle Insurance
    "ATC-18": {
        description: "Verify that all vehicles used in Amazon transport operations carry valid and active commercial vehicle insurance policies covering the required operational period.",
        classification: "Preventive",
        assertions: ["Existence", "Validity", "Completeness"],
        attributes: [
            "Vehicle number",
            "Policy number",
            "Insured party name",
            "Coverage start date",
            "Coverage end date",
            "Insurer name",
            "Policy type",
            "Status active/expired",
        ],
    },
};

export const documentDataAmazonEngagement: Engagement = {
  id: 999, // hardcoded temporary ID
  name: "Amazon Transporter Compliance",
  type: "Operational",
  period: "FY 2026",
  totalDeficiencies: 0,
  status: "NOT STARTED",
  linkedRacmName: "Amazon Transport Compliance v1.0",
  description: "Date Range: 1 Apr 2025 – 31 Mar 2026"
};

const createFreshControl = (id: number, controlId: string, controlName: string, domain: string, isKey: boolean): EngagementControl => {
    return {
        id: 9000 + id,
        controlId,
        controlName,
        domain,
        key: isKey,
        status: 'Not Started',
        samplesTested: '0 / 0',
        testedSamples: 0,
        totalSamples: 0,
        exceptions: 0,
        systemResult: null,
        conclusion: null,
        lastUpdated: '--',
    };
};

export const documentDataAmazonControls: EngagementControl[] = [
    createFreshControl(1, "ATC-01", "Partner Declaration Sheet", "Partner Compliance", true),
    createFreshControl(2, "ATC-02", "QB-1.1 Background Check", "Driver Compliance", true),
    createFreshControl(3, "ATC-03", "QB-1.5 Driving License", "Driver Compliance", true),
    createFreshControl(4, "ATC-04", "QB-2.12 Return Workers Documents", "HR Compliance", false),
    createFreshControl(5, "ATC-05", "QB-2.2 Recruiting", "HR Compliance", false),
    createFreshControl(6, "ATC-06", "QB-2.4 Subcontractors", "Partner Compliance", true),
    createFreshControl(7, "ATC-07", "QB-2.8 Information and Network Security", "InfoSec Compliance", true),
    createFreshControl(8, "ATC-08", "QB-3.1 Offer Letter / SLA / Contract", "HR Compliance", true),
    createFreshControl(9, "ATC-09", "QB-3.2 Anti-Discrimination and Anti-Harassment", "HR Compliance", false),
    createFreshControl(10, "ATC-10", "QB-3.21 POSH Compliance", "HR Compliance", false),
    createFreshControl(11, "ATC-11", "QB-3.3 Incident Response and On Road Emergency", "Safety Compliance", true),
    createFreshControl(12, "ATC-12", "QB-4.2 Training Program", "HR Compliance", false),
    createFreshControl(13, "ATC-13", "QB-4.5 Vehicle Maintenance", "Vehicle Compliance", true),
    createFreshControl(14, "ATC-14", "QB-5.11 Driver Medical and Personal Accident Insurance", "Driver Compliance", false),
    createFreshControl(15, "ATC-15", "QB-7.1 Business Registration", "Legal / Registration", true),
    createFreshControl(16, "ATC-16", "QB-7.14 Additional Registrations and Licenses", "Legal / Registration", false),
    createFreshControl(17, "ATC-17", "QB-7.3 Business Ownership", "Legal / Registration", false),
    createFreshControl(18, "ATC-18", "QB-7.4 Vehicle Insurance", "Vehicle Compliance", true)
];

// ─────────────────────────────────────────────────────────────────────────────
// TEMP_DEMO_AMAZON_TRANSPORT: testing flow helpers — remove block below to revert
// ─────────────────────────────────────────────────────────────────────────────

// TEMP_DEMO_AMAZON_TRANSPORT: population size shown in sampling UI
// Updated to 5 per user request for ATC-03 and ATC-10 consistency
export const ATC_POPULATION_COUNT = 5;

// TEMP_DEMO_AMAZON_TRANSPORT: evidence type templates per ATC control
// Used in TestingWorkspacePage to initialise per-sample evidence slots
export function getAtcEvidenceTemplates(controlId: string): { evidenceType: string; evidenceName: string }[] {
    switch (controlId) {
        case 'ATC-03':
            // TEMP_DEMO_AMAZON_TRANSPORT: Driving License evidence types
            return [
                { evidenceType: 'Driving License Document', evidenceName: 'Physical or digital copy of the driving license' },
                { evidenceType: 'Transport Badge', evidenceName: 'Transport badge or endorsement proof (if applicable)' },
                { evidenceType: 'RTO Verification Letter', evidenceName: 'RTO issued license verification confirmation' },
            ];
        case 'ATC-10':
            // TEMP_DEMO_AMAZON_TRANSPORT: POSH testing flow content — evidence types
            return [
                { evidenceType: 'POSH Policy PDF', evidenceName: 'Company POSH policy document' },
                { evidenceType: 'Employee Acknowledgement PDF', evidenceName: 'Signed employee acknowledgement of POSH policy' },
                { evidenceType: 'POSH Committee / Declaration Proof', evidenceName: 'Internal committee details and declaration' },
            ];
        case 'ATC-02':
            return [
                { evidenceType: 'BGV Report PDF', evidenceName: 'Background Verification Report from agency' },
                { evidenceType: 'Police Verification Certificate', evidenceName: 'Police clearance certificate' },
            ];
        case 'ATC-07':
            return [
                { evidenceType: 'InfoSec Policy Document', evidenceName: 'Information and network security policy' },
                { evidenceType: 'ISO / Certification Proof', evidenceName: 'ISO certification or equivalent' },
            ];
        case 'ATC-13':
            return [
                { evidenceType: 'Vehicle Service Record', evidenceName: 'Latest maintenance / service record' },
                { evidenceType: 'Service Invoice', evidenceName: 'Invoice from garage or service provider' },
            ];
        case 'ATC-14':
            return [
                { evidenceType: 'Insurance Certificate', evidenceName: 'Driver personal accident / medical insurance certificate' },
            ];
        case 'ATC-15':
        case 'ATC-16':
        case 'ATC-17':
            return [
                { evidenceType: 'Registration Certificate', evidenceName: 'Business registration or license document' },
                { evidenceType: 'Identity Proof', evidenceName: 'Supporting ownership or identity proof' },
            ];
        case 'ATC-18':
            return [
                { evidenceType: 'Vehicle Insurance Policy', evidenceName: 'Commercial vehicle insurance policy document' },
            ];
        default:
            return [
                { evidenceType: 'Policy / Declaration Document', evidenceName: 'Primary compliance document or signed declaration' },
                { evidenceType: 'Supporting Proof', evidenceName: 'Additional supporting evidence or attachment' },
            ];
    }
}

// TEMP_DEMO_AMAZON_TRANSPORT: per-sample source row data for ATC-03 and ATC-10 hero controls
// sourceRowReference drives the Sample Data grid shown in the testing workspace
function getAtcSampleRows(controlId: string, index: number): Record<string, any> {
    if (controlId === 'ATC-03') {
        // TEMP_DEMO_AMAZON_TRANSPORT: Driving License sample rows — fresh demo data
        const rows = [
            { 'Driver ID': 'DRV-1021', 'Driver Name': 'Ramesh Kumar',  'DL Number': 'MH12 20180001234', 'Expiry Date': '15 Mar 2027', 'License Class': 'HMV / Transport', 'Status': 'Active'  },
            { 'Driver ID': 'DRV-1047', 'Driver Name': 'Suresh Verma',  'DL Number': 'DL05 20190087652', 'Expiry Date': '22 Jun 2026', 'License Class': 'LMV',             'Status': 'Active'  },
            { 'Driver ID': 'DRV-1103', 'Driver Name': 'Anil Sharma',   'DL Number': 'KA01 20170034512', 'Expiry Date': '08 Nov 2028', 'License Class': 'HMV / Transport', 'Status': 'Active'  },
            { 'Driver ID': 'DRV-1189', 'Driver Name': 'Manoj Yadav',   'DL Number': 'UP32 20200065478', 'Expiry Date': '30 Apr 2025', 'License Class': 'Transport',       'Status': 'Expired' },
            { 'Driver ID': 'DRV-1214', 'Driver Name': 'Rajesh Singh',  'DL Number': 'TN07 20210098321', 'Expiry Date': '14 Sep 2029', 'License Class': 'HMV',             'Status': 'Active'  },
        ];
        return rows[index % rows.length];
    }
    if (controlId === 'ATC-10') {
        // TEMP_DEMO_AMAZON_TRANSPORT: POSH Compliance sample rows
        const rows = [
            { 'Partner ID': 'PRT-401', 'Company Name': 'FastMove Logistics',   'Policy Date': '01 Apr 2025', 'Committee Formed': 'Yes', 'Employees': 48, 'Acknowledgement': 'Signed'  },
            { 'Partner ID': 'PRT-402', 'Company Name': 'QuickShip India',      'Policy Date': '01 Apr 2025', 'Committee Formed': 'Yes', 'Employees': 32, 'Acknowledgement': 'Pending' },
            { 'Partner ID': 'PRT-403', 'Company Name': 'SafeDrive Solutions',  'Policy Date': '15 Mar 2025', 'Committee Formed': 'No',  'Employees': 21, 'Acknowledgement': 'Signed'  },
            { 'Partner ID': 'PRT-404', 'Company Name': 'Express Carriers',     'Policy Date': '01 Apr 2025', 'Committee Formed': 'Yes', 'Employees': 67, 'Acknowledgement': 'Signed'  },
            { 'Partner ID': 'PRT-405', 'Company Name': 'Metro Transports',     'Policy Date': '01 Apr 2025', 'Committee Formed': 'Yes', 'Employees': 15, 'Acknowledgement': 'Signed'  },
        ];
        return rows[index % rows.length];
    }
    // TEMP_DEMO_AMAZON_TRANSPORT: generic rows for remaining 16 ATC controls
    const partnerNames = ['FastMove Logistics', 'QuickShip India', 'SafeDrive Solutions', 'Express Carriers', 'Metro Transports'];
    return {
        'Record ID':    `REC-${7000 + index + 1}`,
        'Partner Name': partnerNames[index % partnerNames.length],
        'Date':         '01 Apr 2025',
        'Status':       'Pending Review',
    };
}

// TEMP_DEMO_AMAZON_TRANSPORT: generate 5 fresh SampleModel objects for any ATC control
function createAtcSamples(controlId: string, count = 5): SampleModel[] {
    return Array.from({ length: count }, (_, i) => ({
        sampleId:            `${controlId}-S${String(i + 1).padStart(3, '0')}`,
        controlInstanceId:   controlId,
        populationDatasetId: `${controlId}-POP`,
        sampleIdentifier:    `${controlId}-${String(i + 1).padStart(3, '0')}`,
        sampleNumber:        i + 1,
        sourceRowReference:  getAtcSampleRows(controlId, i),
        status:              'NOT TESTED' as const,
        systemResult:        null,
        auditorResult:       null,
        comments:            '',
        selectedAt:          '01 Apr 2025',
        evidence:            [],        // populated by TestingWorkspacePage
        attributeResults:    [],        // populated by TestingWorkspacePage
    }));
}

// TEMP_DEMO_AMAZON_TRANSPORT: build a synthetic ControlFullDetail for any ATC control
// Returned object drives the entire testing workspace (evidence, attributes, samples)
// To revert: delete this function and remove its import from TestingWorkspacePage
export function buildAtcControlDetails(controlId: string, controlName: string): ControlFullDetail {
    const detail = amazonTransportControlDetails[controlId];

    // Build TestScriptAttribute array — all mandatory; ruleLogic returns true (system presumes pass)
    const attributes = (detail?.attributes ?? []).map((name, i) => ({
        attributeId: i + 1,
        name,
        mandatory:   true,
        ruleLogic:   (_sample: any): boolean => true,
        // Document compliance controls: system cannot auto-evaluate physical docs;
        // ruleLogic=true signals "system presumes pass — auditor must confirm"
    }));

    return {
        overview: {
            controlId,
            controlName,
            description:    detail?.description    ?? '',
            classification: detail?.classification ?? 'Preventive',
            assertions:     detail?.assertions     ?? [],
        },
        // Use attributes path (not testScript) → legacy TestingPanel for step 2
        attributes,
        snapshot: null,      // fresh engagement — no frozen snapshot
        samples:  createAtcSamples(controlId, 5),
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// END TEMP_DEMO_AMAZON_TRANSPORT testing flow helpers
// ─────────────────────────────────────────────────────────────────────────────
