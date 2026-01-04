export enum Role {
  Chairman = 'Chairman',
  CEO = 'CEO',
  COO = 'COO',
  MD = 'MD',
  CFO = 'CFO',
  HOD = 'HOD',
  Senior = 'Senior',
  Junior = 'Junior'
}

export enum Department {
  Executive = 'Executive',
  Finance = 'Finance',
  Engineering = 'Engineering',
  BusinessDevelopment = 'Business Development',
  Regulatory = 'Regulatory',
  RD = 'R&D',
  Sales = 'Sales',
  Marketing = 'Marketing',
  Production = 'Production',
  SupplyChain = 'Supply Chain',
  QA = 'Quality Assurance',
  QC = 'Quality Control',
  Export = 'Export',
  IT = 'IT'
}

export enum Team {
  None = 'None',
  Achievers = 'Achievers',
  Passionate = 'Passionate',
  Concord = 'Concord',
  Dynamic = 'Dynamic'
}

export enum Region {
  Region1 = 'Region 1',
  Region2 = 'Region 2',
  Region3 = 'Region 3',
  None = 'None'
}

export enum TaskStatus {
  PendingApproval = 'Pending Approval',
  Approved = 'Approved',
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Rejected = 'Rejected'
}

export enum TaskPriority {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3'
}

export enum ActionType {
  TaskAssigned = 'Task Assigned',
  TaskStatusUpdate = 'Task Status Update',
  TaskDeleted = 'Task Record Removed',
  MeetingScheduled = 'Meeting Scheduled',
  MeetingUpdated = 'Meeting Updated',
  MeetingFinalized = 'Meeting Finalized',
  MeetingRejected = 'Meeting Records Rejected',
  Login = 'User Login',
  PersonnelUpdate = 'Personnel Record Updated',
  DesignationAdded = 'New Designation Created',
  CustomCalendarCreated = 'Custom Calendar Created',
  SystemSettingsUpdated = 'System Branding Updated',
  DatabaseExported = 'Full Database Exported',
  DatabaseReset = 'System Factory Reset'
}

export enum NotificationType {
  Task = 'Task',
  Meeting = 'Meeting',
  System = 'System',
  Rejection = 'Rejection'
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTo?: string;
  referenceId?: string;
}

export enum MeetingType {
  Standard = 'Standard',
  Strategic = 'Strategic',
  Travel = 'Travel'
}

export enum Recurrence {
  None = 'None',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | string;
  department: Department;
  team: Team;
  region: Region;
  reportsTo?: string;
  isMSD?: boolean; 
}

export interface MeetingAttachment {
  name: string;
  data: string; // Base64 data
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedById: string;
  meetingId?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  rejectionReason?: string;
  createdAt: string;
  recurrence?: Recurrence;
  attachments?: MeetingAttachment[];
  completionMessage?: string;
  completionAttachments?: MeetingAttachment[];
}

export interface CustomCalendar {
  id: string;
  name: string;
  userIds: string[];
  createdBy: string;
}

export interface ExternalAttendee {
  name: string;
  company: string;
  designation: string;
}

export interface SystemBranding {
  companyName: string;
  companySubtitle: string;
  logoBase64?: string;
  primaryColor: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  department: Department;
  team: Team;
  region: Region;
  organizerId: string;
  leaderId: string; 
  attendees: string[];
  externalAttendees?: ExternalAttendee[]; 
  finalizedBy: string[]; 
  rejectedBy?: Record<string, string>; 
  minutes?: string;
  isCustomRoom: boolean;
  type: MeetingType;
  recurrence: Recurrence;
  isFinalized?: boolean;
  attachments?: MeetingAttachment[];
  travelCities?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: ActionType;
  details: string;
  department: Department;
}