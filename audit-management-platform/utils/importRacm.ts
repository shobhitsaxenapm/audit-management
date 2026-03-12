import type { RACMDetail, EngagementControl } from '../types';

export const HARDCODED_RACM_NAME = "RACM AMZ TRANSPORT";
export const HARDCODED_RACM_DESCRIPTION = "Amazon transport compliance RACM imported via hardcoded setup";
export const AMZ_RACM_ID = 9999;

export const amzTransportEngagementControls: EngagementControl[] = [
  { id: 991, controlId: 'C-DR-01', controlName: 'Driver Background Verification Check', domain: 'Driver Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 992, controlId: 'C-DR-02', controlName: 'Driver Contract Clause Validation', domain: 'Driver Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 993, controlId: 'C-DR-03', controlName: 'Driver Insurance Coverage Validation', domain: 'Driver Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 994, controlId: 'C-VH-01', controlName: 'Vehicle Registration Validation', domain: 'Vehicle Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 995, controlId: 'C-VH-02', controlName: 'Vehicle Pollution Certificate Validation', domain: 'Vehicle Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 996, controlId: 'C-VH-03', controlName: 'Vehicle Fitness Certificate Validation', domain: 'Vehicle Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 997, controlId: 'C-PT-01', controlName: 'Partner Business Registration Verification', domain: 'Partner Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 998, controlId: 'C-PT-02', controlName: 'Subcontractor Declaration Verification', domain: 'Partner Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 999, controlId: 'C-PT-03', controlName: 'Security Policy Acknowledgement Verification', domain: 'Partner Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' },
  { id: 1000, controlId: 'C-PT-04', controlName: 'POSH Compliance Declaration Verification', domain: 'Partner Management', key: true, status: 'Not Started', samplesTested: '0/0', testedSamples: 0, totalSamples: 0, exceptions: 0, systemResult: null, conclusion: null, lastUpdated: '12 Mar 26' }
];

export const hardcodedRacmDetails: RACMDetail[] = [
  {
    id: 99001,
    riskId: "R-DR-01",
    riskDescription: "Driver operating without background verification",
    assertion: "Existence",
    controlName: "Driver Background Verification Check",
    controlDescription: "Verify driver background verification report before onboarding",
    key: true,
  },
  {
    id: 99002,
    riskId: "R-DR-02",
    riskDescription: "Driver contract missing required clauses",
    assertion: "Completeness",
    controlName: "Driver Contract Clause Validation",
    controlDescription: "Verify driver offer letter / SLA contains mandatory clauses",
    key: true,
  },
  {
    id: 99003,
    riskId: "R-DR-03",
    riskDescription: "Driver without insurance coverage",
    assertion: "Valuation",
    controlName: "Driver Insurance Coverage Validation",
    controlDescription: "Validate driver insurance policy exists and is active",
    key: true,
  },
  {
    id: 99004,
    riskId: "R-VH-01",
    riskDescription: "Vehicle operating without valid registration",
    assertion: "Existence",
    controlName: "Vehicle Registration Validation",
    controlDescription: "Verify RC document validity",
    key: true,
  },
  {
    id: 99005,
    riskId: "R-VH-02",
    riskDescription: "Vehicle pollution certificate expired",
    assertion: "Accuracy",
    controlName: "Vehicle Pollution Certificate Validation",
    controlDescription: "Validate PUC certificate validity",
    key: true,
  },
  {
    id: 99006,
    riskId: "R-VH-03",
    riskDescription: "Vehicle fitness certificate invalid",
    assertion: "Accuracy",
    controlName: "Vehicle Fitness Certificate Validation",
    controlDescription: "Validate vehicle fitness certificate",
    key: true,
  },
  {
    id: 99007,
    riskId: "R-PT-01",
    riskDescription: "Partner operating without business registration",
    assertion: "Existence",
    controlName: "Partner Business Registration Verification",
    controlDescription: "Verify business registration documents",
    key: true,
  },
  {
    id: 99008,
    riskId: "R-PT-02",
    riskDescription: "Subcontracting without declaration",
    assertion: "Completeness",
    controlName: "Subcontractor Declaration Verification",
    controlDescription: "Verify subcontractor declaration form",
    key: true,
  },
  {
    id: 99009,
    riskId: "R-PT-03",
    riskDescription: "Missing security policy compliance",
    assertion: "Accuracy",
    controlName: "Security Policy Acknowledgement Verification",
    controlDescription: "Validate security policy acknowledgement",
    key: true,
  },
  {
    id: 99010,
    riskId: "R-PT-04",
    riskDescription: "Missing POSH / anti-harassment compliance",
    assertion: "Existence",
    controlName: "POSH Compliance Declaration Verification",
    controlDescription: "Verify POSH / anti-harassment policy acknowledgement",
    key: true,
  }
];
