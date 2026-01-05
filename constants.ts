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
      name: `${dept} Strategic Lead`, 
      email: `${deptKey}.hod@directuspro.com`, 
      role: Role.HOD, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
    { 
      id: `${deptKey}_j1`, 
      name: `${dept} Associate Alpha`, 
      email: `${deptKey}.j1@directuspro.com`, 
      role: Role.Junior, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
    { 
      id: `${deptKey}_j2`, 
      name: `${dept} Associate Beta`, 
      email: `${deptKey}.j2@directuspro.com`, 
      role: Role.Junior, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
    { 
      id: `${deptKey}_j3`, 
      name: `${dept} Associate Gamma`, 
      email: `${deptKey}.j3@directuspro.com`, 
      role: Role.Junior, 
      department: dept, 
      team: Team.None, 
      region: Region.None 
    },
  ];
};

export const MOCK_USERS: User[] = [
  // --- EXECUTIVE MANAGEMENT ---
  { id: 'u100', name: 'Alexander Vane', email: 'chairman@directuspro.com', role: Role.Chairman, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u1', name: 'Julian Thorne', email: 'ceo@directuspro.com', role: Role.CEO, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u_coo', name: 'Marcus Sterling', email: 'coo@directuspro.com', role: Role.COO, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u_md', name: 'David Blackwell', email: 'md@directuspro.com', role: Role.MD, department: Department.Executive, team: Team.None, region: Region.None },
  { id: 'u_cfo', name: 'Richard Vance', email: 'cfo@directuspro.com', role: Role.CFO, department: Department.Executive, team: Team.None, region: Region.None },

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