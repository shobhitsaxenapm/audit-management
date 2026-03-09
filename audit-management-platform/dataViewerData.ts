import type { DataViewerDataset } from './types';

// --- Helper to generate realistic tabular data ---

const generateUserAccessRows = (count: number): Record<string, any>[] => {
  const departments = ['IT', 'Finance', 'HR', 'Operations', 'Legal', 'Sales', 'Marketing', 'Executive'];
  const accessLevels = ['Admin', 'Power User', 'Read Only', 'Standard', 'Elevated'];
  const systems = ['SAP ERP', 'Oracle DB', 'ServiceNow', 'Jira', 'Salesforce', 'Active Directory', 'Azure AD', 'AWS Console'];
  const statuses = ['Active', 'Active', 'Active', 'Disabled', 'Active', 'Under Review'];
  const reviewers = ['J. Smith', 'A. Patel', 'M. Johnson', 'K. Singh', 'L. Vega', 'R. Chen'];
  
  return Array.from({ length: count }, (_, i) => ({
    'Row': i + 1,
    'User ID': `USR-${String(i + 1).padStart(4, '0')}`,
    'Employee Name': `Employee ${i + 1}`,
    'Department': departments[i % departments.length],
    'System': systems[i % systems.length],
    'Access Level': accessLevels[i % accessLevels.length],
    'Last Login': `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    'Account Status': statuses[i % statuses.length],
    'Last Review Date': `2025-${String(((i + 3) % 12) + 1).padStart(2, '0')}-15`,
    'Reviewed By': reviewers[i % reviewers.length],
    'Provisioning Date': `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
    'Manager': `Manager ${(i % 15) + 1}`,
    'Notes': i % 7 === 0 ? 'Pending re-certification' : '',
  }));
};

const generatePODumpRows = (count: number): Record<string, any>[] => {
  const vendors = ['Tech Corp', 'Supply Co', 'MegaSource Ltd', 'Parts Direct', 'Global Materials', 'FastShip Inc', 'QualityFirst', 'BulkBuy'];
  const statuses = ['Approved', 'Approved', 'Pending', 'Approved', 'Rejected', 'Approved'];
  const plants = ['Plant-A', 'Plant-B', 'Plant-C', 'Plant-D'];
  
  return Array.from({ length: count }, (_, i) => ({
    'Row': i + 1,
    'PO Number': `PO-${String(1001 + i).padStart(5, '0')}`,
    'Vendor': vendors[i % vendors.length],
    'PO Date': `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    'PO Amount': Math.round((1000 + Math.random() * 50000) * 100) / 100,
    'Currency': 'USD',
    'PO Quantity': Math.floor(10 + Math.random() * 500),
    'Plant': plants[i % plants.length],
    'Status': statuses[i % statuses.length],
    'Approver': `Approver ${(i % 8) + 1}`,
    'GRN Matched': i % 3 !== 0 ? 'Yes' : 'No',
  }));
};

const generateGRNRows = (count: number): Record<string, any>[] => {
  return Array.from({ length: count }, (_, i) => ({
    'Row': i + 1,
    'GRN Number': `GRN-${String(5001 + i).padStart(5, '0')}`,
    'PO Number': `PO-${String(1001 + (i % 40)).padStart(5, '0')}`,
    'Receipt Date': `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    'GRN Quantity': Math.floor(5 + Math.random() * 200),
    'PO Quantity': Math.floor(10 + Math.random() * 250),
    'Variance': (Math.random() * 10 - 5).toFixed(1) + '%',
    'Inspector': `Inspector ${(i % 6) + 1}`,
    'Quality Check': i % 5 !== 0 ? 'Passed' : 'Failed',
    'Warehouse': `WH-${(i % 4) + 1}`,
  }));
};

const generateTransactionRows = (count: number): Record<string, any>[] => {
  const types = ['Journal Entry', 'Payment', 'Receipt', 'Transfer', 'Adjustment', 'Accrual'];
  const approvers = ['J. Smith', 'A. Patel', 'M. Johnson', 'K. Singh', 'L. Vega', 'R. Chen', 'B. Jones'];
  
  return Array.from({ length: count }, (_, i) => ({
    'Row': i + 1,
    'Txn ID': `TXN-${String(8801 + i).padStart(6, '0')}`,
    'Type': types[i % types.length],
    'Date': `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    'Amount': Math.round((500 + Math.random() * 100000) * 100) / 100,
    'Debit Account': `${1000 + (i % 50) * 100}`,
    'Credit Account': `${2000 + (i % 50) * 100}`,
    'Approved By': approvers[i % approvers.length],
    'Status': i % 8 === 0 ? 'Pending' : 'Posted',
    'Reference': `REF-${String(i + 1).padStart(4, '0')}`,
  }));
};

const generateTerminationRows = (count: number): Record<string, any>[] => {
  const departments = ['IT', 'Finance', 'HR', 'Operations', 'Legal', 'Sales'];
  
  return Array.from({ length: count }, (_, i) => ({
    'Row': i + 1,
    'Employee ID': `E${String(i + 1).padStart(3, '0')}`,
    'Employee Name': `Employee ${i + 1}`,
    'Department': departments[i % departments.length],
    'Termination Date': `2025-07-${String((i % 28) + 1).padStart(2, '0')}`,
    'HR Record Date': `2025-07-${String((i % 28) + 1).padStart(2, '0')}`,
    'Ticket ID': i % 12 !== 0 ? `T-${2300 + i}` : null,
    'Access Disabled': i % 12 !== 0 ? 'Yes' : 'No',
    'Revocation Hours': 4 + (i % 20),
    'Systems Count': 2 + (i % 6),
    'Status': i % 12 !== 0 ? 'Completed' : 'Overdue',
  }));
};


// --- Exported datasets ---

export const dataViewerDatasets: Record<string, DataViewerDataset> = {
  'user-access-export': {
    id: 'user-access-export',
    name: 'User Access Export',
    sourceType: 'System Dataset',
    fileType: 'xlsx',
    totalRows: 10542,
    totalColumns: 12,
    columns: ['Row', 'User ID', 'Employee Name', 'Department', 'System', 'Access Level', 'Last Login', 'Account Status', 'Last Review Date', 'Reviewed By', 'Provisioning Date', 'Manager'],
    rows: generateUserAccessRows(80),
    idColumn: 'User ID',
  },
  'po-dump': {
    id: 'po-dump',
    name: 'PO Dump',
    sourceType: 'Uploaded Dataset',
    fileType: 'xlsx',
    totalRows: 3218,
    totalColumns: 11,
    columns: ['Row', 'PO Number', 'Vendor', 'PO Date', 'PO Amount', 'Currency', 'PO Quantity', 'Plant', 'Status', 'Approver', 'GRN Matched'],
    rows: generatePODumpRows(60),
    idColumn: 'PO Number',
  },
  'grn-dump': {
    id: 'grn-dump',
    name: 'GRN Dump',
    sourceType: 'Uploaded Dataset',
    fileType: 'xlsx',
    totalRows: 2890,
    totalColumns: 10,
    columns: ['Row', 'GRN Number', 'PO Number', 'Receipt Date', 'GRN Quantity', 'PO Quantity', 'Variance', 'Inspector', 'Quality Check', 'Warehouse'],
    rows: generateGRNRows(50),
    idColumn: 'GRN Number',
  },
  'transaction-export': {
    id: 'transaction-export',
    name: 'System Transaction Export',
    sourceType: 'System Dataset',
    fileType: 'csv',
    totalRows: 45300,
    totalColumns: 10,
    columns: ['Row', 'Txn ID', 'Type', 'Date', 'Amount', 'Debit Account', 'Credit Account', 'Approved By', 'Status', 'Reference'],
    rows: generateTransactionRows(70),
    idColumn: 'Txn ID',
  },
  'hr-terminations': {
    id: 'hr-terminations',
    name: 'HR Terminations Q1',
    sourceType: 'Population File',
    fileType: 'csv',
    totalRows: 245,
    totalColumns: 11,
    columns: ['Row', 'Employee ID', 'Employee Name', 'Department', 'Termination Date', 'HR Record Date', 'Ticket ID', 'Access Disabled', 'Revocation Hours', 'Systems Count', 'Status'],
    rows: generateTerminationRows(50),
    idColumn: 'Employee ID',
  },
};

// Map common file names to dataset IDs for easy lookup
export const datasetNameToId: Record<string, string> = {
  'User_Access_Export_Q4.xlsx': 'user-access-export',
  'Transaction_Ledger_2025.csv': 'transaction-export',
  'PO_Dump_March_2025.xlsx': 'po-dump',
  'GRN_Report_FY25.xlsx': 'grn-dump',
  'Vendor_Master_List.csv': 'transaction-export',
  'hr_terms_Q1': 'hr-terminations',
  'new_hires_Q1': 'user-access-export',
  'privileged_access_Q3': 'user-access-export',
  'system_configs': 'transaction-export',
  'cm_log_Q3': 'transaction-export',
  'emergency_cm_log_Q3': 'transaction-export',
  'user_roles_matrix': 'user-access-export',
  'backup_logs_Q3': 'transaction-export',
  'batch_job_logs': 'transaction-export',
};
