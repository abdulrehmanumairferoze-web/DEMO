
import { Role, Department, Team, Region, User } from './types';

export const DEPARTMENTS = Object.values(Department);

export const DEPARTMENT_EMOJIS: Record<Department, string> = {
  [Department.Executive]: '🏛️',
  [Department.Finance]: '📈',
  [Department.Engineering]: '🏗️',
  [Department.BusinessDevelopment]: '🚀',
  [Department.Regulatory]: '⚖️',
  [Department.RD]: '🧪',
  [Department.Sales]: '🎯',
  [Department.Marketing]: '📢',
  [Department.Production]: '🏭',
  [Department.SupplyChain]: '📦',
  [Department.QA]: '🔍',
  [Department.QC]: '🔬',
  [Department.Export]: '🌍',
  [Department.IT]: '💻'
};

export const getDepartmentEmoji = (dept: Department) => DEPARTMENT_EMOJIS[dept] || '🏢';

const generateDeptStaff = (dept: Department): User[] => {
  const deptKey = dept.toLowerCase().replace(/\s+/g, '');
  return [
    { 
      id: `${deptKey}_hod`, 
      name: `${dept} Lead`, 
      email: `${deptKey}.hod@pharma.com`, 
      role: Role.HOD, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
    { 
      id: `${deptKey}_j1`, 
      name: `${dept} Junior A`, 
      email: `${deptKey}.j1@pharma.com`, 
      role: Role.Junior, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
    { 
      id: `${deptKey}_j2`, 
      name: `${dept} Junior B`, 
      email: `${deptKey}.j2@pharma.com`, 
      role: Role.Junior, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
    { 
      id: `${deptKey}_j3`, 
      name: `${dept} Junior C`, 
      email: `${deptKey}.j3@pharma.com`, 
      role: Role.Junior, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
  ];
};

export const MOCK_USERS: User[] = [
  // --- EXECUTIVE MANAGEMENT ---
  { id: 'u100', name: 'Umair Feroze', email: 'chairman@pharma.com', role: Role.Chairman, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u1', name: 'Huzaifa Umair', email: 'ceo@pharma.com', role: Role.CEO, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u_coo', name: 'Imran', email: 'imran.coo@pharma.com', role: Role.COO, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u_md', name: 'Muhammad Naeem', email: 'naeem.md@pharma.com', role: Role.MD, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u_cfo', name: 'Agha Faisal', email: 'cfo@pharma.com', role: Role.CFO, department: Department.Executive, team: Team.None, region: Region.None },

  // --- GENERATE STAFF FOR ALL DEPARTMENTS ---
  ...generateDeptStaff(Department.Finance),
  ...generateDeptStaff(Department.Engineering),
  ...generateDeptStaff(Department.BusinessDevelopment),
  ...generateDeptStaff(Department.Regulatory),
  ...generateDeptStaff(Department.RD),
  ...generateDeptStaff(Department.Sales),
  ...generateDeptStaff(Department.Marketing),
  ...generateDeptStaff(Department.Production),
  ...generateDeptStaff(Department.SupplyChain),
  ...generateDeptStaff(Department.QA),
  ...generateDeptStaff(Department.QC),
  ...generateDeptStaff(Department.Export),
  ...generateDeptStaff(Department.IT)
];
