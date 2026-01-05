import React, { useState, useEffect, useMemo } from 'react';
import { User, Meeting, Task, Role, TaskStatus, Department, Team, Region, AuditLog, ActionType, MeetingType, Recurrence, TaskPriority, AppNotification, NotificationType, CustomCalendar, SystemBranding } from './types';
import { MOCK_USERS, DEPARTMENTS, getDepartmentEmoji } from './constants';
import { Layout } from './components/Layout';
import { CalendarView } from './components/Calendar';
import { MeetingModal } from './components/MeetingModal';
import { TaskBoard } from './components/TaskBoard';
import { MeetingLogs } from './components/MeetingLogs';
import { TaskModal } from './components/TaskModal';
import { AuditTrail } from './components/AuditTrail';
import { ReminderSystem } from './components/ReminderSystem';
import { Login } from './components/Login';
import { EmployeeModal } from './components/EmployeeModal';
import { CustomCalendarModal } from './components/CustomCalendarModal';
import { SystemSettings } from './components/SystemSettings';
import { format, addMinutes, addDays, endOfMonth, eachDayOfInterval, isSameDay, isAfter } from 'date-fns';
import { 
  Users, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  Plus, 
  Activity, 
  Filter, 
  Search, 
  UserCog, 
  Globe, 
  Layers,
  MapPin,
  Zap,
  Target,
  BadgePlus,
  UserPlus,
  LayoutList,
  Clock,
  ArrowRight,
  History,
  CheckCircle2,
  Boxes,
  LayoutTemplate,
  Pencil,
  Settings,
  Building2
} from 'lucide-react';

const DEFAULT_BRANDING: SystemBranding = {
  companyName: 'DIRECTUS PRO',
  companySubtitle: 'Sovereign Governance',
  primaryColor: '#10b981',
  logoBase64: 'https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/pharma-s-logo.png'
};

const generateEnterpriseMeetings = (): Meeting[] => {
  const meetings: Meeting[] = [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const strategicDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
  meetings.push({
    id: 'm-strat-blackwell',
    title: 'Q4 Global Performance Review',
    description: 'Strategic analysis of export milestones and regional compliance metrics. Led by Director David Blackwell.',
    startTime: strategicDate.toISOString(),
    endTime: addMinutes(strategicDate, 120).toISOString(),
    location: 'Executive Suite - Floor 12',
    department: Department.Executive,
    team: Team.None,
    region: Region.None,
    organizerId: 'u_md', 
    leaderId: 'u_md',
    attendees: ['u_md', 'u1', 'u100'],
    finalizedBy: ['u_md', 'u1'],
    rejectedBy: {},
    minutes: `Session commenced at 10:00 AM.`,
    isCustomRoom: true,
    type: MeetingType.Strategic,
    recurrence: Recurrence.Monthly,
    isFinalized: true
  });

  return meetings;
};

const INITIAL_TASKS: Task[] = [
  { id: 't-blackwell-1', title: 'Approve Strategic Market Expansion', description: 'Review regional compliance data.', assignedToId: 'u_md', assignedById: 'u1', dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'), status: TaskStatus.InProgress, priority: TaskPriority.Q1, createdAt: addDays(new Date(), -1).toISOString() }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [designations, setDesignations] = useState<string[]>(Object.values(Role));
  const [customCalendars, setCustomCalendars] = useState<CustomCalendar[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');
  const [searchDirectory, setSearchDirectory] = useState('');
  const [branding, setBranding] = useState<SystemBranding>(DEFAULT_BRANDING);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isCustomCalendarModalOpen, setIsCustomCalendarModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<User | undefined>();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>();
  const [initialDate, setInitialDate] = useState<Date | undefined>();

  useEffect(() => {
    const savedMeetings = localStorage.getItem('directus_v1_meetings');
    const savedTasks = localStorage.getItem('directus_v1_tasks');
    const savedLogs = localStorage.getItem('directus_v1_logs');
    const savedUser = localStorage.getItem('directus_v1_user');
    const savedNotifs = localStorage.getItem('directus_v1_notifs');
    const savedUsers = localStorage.getItem('directus_v1_users_list');
    const savedDesignations = localStorage.getItem('directus_v1_designations');
    const savedCustomCals = localStorage.getItem('directus_v1_custom_calendars');
    const savedBranding = localStorage.getItem('directus_v1_branding');
    
    if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
    else setMeetings(generateEnterpriseMeetings());

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    else setTasks(INITIAL_TASKS);

    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    else setAuditLogs([]);

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else setUsers(MOCK_USERS);

    if (savedDesignations) setDesignations(JSON.parse(savedDesignations));
    if (savedCustomCals) setCustomCalendars(JSON.parse(savedCustomCals));
    if (savedBranding) setBranding(JSON.parse(savedBranding));
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('directus_v1_meetings', JSON.stringify(meetings));
    localStorage.setItem('directus_v1_tasks', JSON.stringify(tasks));
    localStorage.setItem('directus_v1_logs', JSON.stringify(auditLogs));
    localStorage.setItem('directus_v1_notifs', JSON.stringify(notifications));
    localStorage.setItem('directus_v1_users_list', JSON.stringify(users));
    localStorage.setItem('directus_v1_designations', JSON.stringify(designations));
    localStorage.setItem('directus_v1_custom_calendars', JSON.stringify(customCalendars));
    localStorage.setItem('directus_v1_branding', JSON.stringify(branding));
    if (currentUser) {
      localStorage.setItem('directus_v1_user', JSON.stringify(currentUser));
    }
  }, [meetings, tasks, auditLogs, currentUser, notifications, users, designations, customCalendars, branding]);

  const upcomingMeeting = useMemo(() => {
    if (!currentUser) return undefined;
    const now = new Date();
    return meetings
      .filter(m => m.attendees.includes(currentUser.id) && isAfter(new Date(m.startTime), now))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  }, [meetings, currentUser?.id]);

  const completionRate = useMemo(() => {
    if (!currentUser) return 0;
    const myTasks = tasks.filter(t => t.assignedToId === currentUser.id);
    if (myTasks.length === 0) return 0;
    return Math.round((myTasks.filter(t => t.status === TaskStatus.Completed).length / myTasks.length) * 100);
  }, [tasks, currentUser?.id]);

  const addAuditLog = (action: ActionType, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      action,
      details,
      department: currentUser.department
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setDeptFilter(user.department);
    addAuditLog(ActionType.Login, `Authenticated session for ${user.name} (${user.role}).`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('directus_v1_user');
    setActiveTab('dashboard');
  };

  const handleSaveMeeting = (meetingData: Partial<Meeting>, newTasks?: Partial<Task>[]) => {
    const newMeeting: Meeting = {
      id: selectedMeeting?.id || Math.random().toString(36).substr(2, 9),
      title: meetingData.title!,
      description: meetingData.description || '',
      startTime: meetingData.startTime!,
      endTime: meetingData.endTime!,
      location: meetingData.location || '',
      department: meetingData.department!,
      team: meetingData.team || Team.None,
      region: meetingData.region || Region.None,
      organizerId: meetingData.organizerId || currentUser!.id,
      leaderId: meetingData.leaderId || meetingData.organizerId || currentUser!.id,
      attendees: meetingData.attendees || [],
      externalAttendees: meetingData.externalAttendees || [],
      finalizedBy: meetingData.finalizedBy || [],
      rejectedBy: meetingData.rejectedBy || {},
      minutes: meetingData.minutes || '',
      isCustomRoom: meetingData.isCustomRoom || false,
      type: meetingData.type || MeetingType.Standard,
      recurrence: meetingData.recurrence || Recurrence.None,
      isFinalized: meetingData.isFinalized || false,
      attachments: meetingData.attachments || []
    };

    if (selectedMeeting) {
      setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? newMeeting : m));
    } else {
      setMeetings(prev => [...prev, newMeeting]);
      addAuditLog(ActionType.MeetingScheduled, `Scheduled: "${newMeeting.title}"`);
    }
    setIsModalOpen(false);
    setSelectedMeeting(undefined);
  };

  const handleSaveCustomCalendar = (calendarData: Partial<CustomCalendar>) => {
    const newCalendar: CustomCalendar = {
      id: calendarData.id!,
      name: calendarData.name!,
      userIds: calendarData.userIds || [],
      createdBy: currentUser!.id
    };
    setCustomCalendars(prev => [...prev, newCalendar]);
    setIsCustomCalendarModalOpen(false);
    addAuditLog(ActionType.CustomCalendarCreated, `Created strategic calendar: "${newCalendar.name}"`);
  };

  const handleSaveStandaloneTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskData.title!,
      description: taskData.description || '',
      assignedToId: taskData.assignedToId!,
      assignedById: currentUser!.id,
      dueDate: taskData.dueDate!,
      priority: taskData.priority || TaskPriority.Q2,
      recurrence: taskData.recurrence || Recurrence.None,
      status: TaskStatus.PendingApproval,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    setIsTaskModalOpen(false);
    setSelectedAssignee(undefined);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus, details?: any) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status, ...details } : t)));
    addAuditLog(ActionType.TaskStatusUpdate, `Status updated for task to ${status}`);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addAuditLog(ActionType.TaskDeleted, `Purged task record.`);
  };

  const handleUpdateEmployee = (updatedEmployee: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === updatedEmployee.id);
      if (exists) {
        return prev.map(u => u.id === updatedEmployee.id ? updatedEmployee : u);
      }
      return [updatedEmployee, ...prev];
    });
    addAuditLog(ActionType.PersonnelUpdate, `Master Admin updated employee: ${updatedEmployee.name}`);
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const handleExportSystem = () => {
    const data = {
      meetings, tasks, users, designations, customCalendars, auditLogs, branding
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `directuspro_export_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    link.click();
    addAuditLog(ActionType.DatabaseExported, 'Full system database exported.');
  };

  const handleImportSystem = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.meetings) setMeetings(data.meetings);
      if (data.tasks) setTasks(data.tasks);
      if (data.users) setUsers(data.users);
      if (data.branding) setBranding(data.branding);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      alert("System restored successfully.");
    } catch (e) {
      alert("Failed to parse import file.");
    }
  };

  const handleResetSystem = () => {
    if (confirm("FACTORY RESET: This will delete all personnel, tasks, and meetings. Branding will return to default. Continue?")) {
      setMeetings([]);
      setTasks([]);
      setUsers(MOCK_USERS);
      setBranding(DEFAULT_BRANDING);
      setAuditLogs([]);
      setActiveTab('dashboard');
      addAuditLog(ActionType.DatabaseReset, 'System returned to factory state.');
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} branding={branding} />;

  const isExecutive = currentUser.role === Role.Chairman || currentUser.role === Role.CEO || currentUser.role === Role.COO || currentUser.role === Role.MD || currentUser.role === Role.CFO;
  const isChairman = currentUser.role === Role.Chairman;
  const canSeeAuditTrail = currentUser.role === Role.Chairman || currentUser.role === Role.CEO;

  const stats = [
    { label: 'Manifest Load', value: tasks.filter(t => t.assignedToId === currentUser.id && t.status !== TaskStatus.Completed).length, icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Daily Schedule', value: meetings.filter(m => m.attendees.includes(currentUser.id) && isSameDay(new Date(m.startTime), new Date())).length, icon: CalendarIcon, color: 'text-rose-600 bg-rose-50' },
    { label: 'Critical Tasks', value: tasks.filter(t => t.priority === TaskPriority.Q1 && t.status !== TaskStatus.Completed).length, icon: Zap, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active Sessions', value: meetings.filter(m => isAfter(new Date(m.startTime), new Date()) && m.attendees.includes(currentUser.id)).length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <Layout 
      user={currentUser} 
      branding={branding}
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onSwitchUser={handleLogin}
      notifications={notifications.filter(n => n.recipientId === currentUser.id)}
      onClearNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      onMarkNotificationsRead={() => setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, read: true } : n))}
      onQuickTask={() => setIsTaskModalOpen(true)}
      onQuickMeeting={() => setIsModalOpen(true)}
      customCalendars={customCalendars.filter(c => c.createdBy === currentUser.id || c.userIds.includes(currentUser.id))}
    >
      <ReminderSystem meetings={meetings} userId={currentUser.id} onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} />
      
      {activeTab === 'dashboard' && (
        <div className="space-y-10 animate-in fade-in duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 flex items-center gap-5 group hover:shadow-xl hover:border-emerald-100 transition-all cursor-default overflow-hidden relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon size={28} /></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                  </div>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <CheckCircle2 size={120} />
                </div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Target size={20} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Manifest Compliance</h3>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-6xl font-black text-slate-900 tracking-tighter">{completionRate}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase mb-3">Finalized</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                      <Zap size={20} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Critical Manifest</h3>
                  </div>
                  <button onClick={() => setActiveTab('tasks')} className="text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-widest">View All</button>
                </div>
                <div className="space-y-3 flex-1">
                  {tasks.filter(t => t.priority === TaskPriority.Q1 && t.status !== TaskStatus.Completed).slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4 hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer" onClick={() => setActiveTab('tasks')}>
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 animate-pulse"></div>
                      <p className="text-xs font-black text-slate-900 truncate leading-tight flex-1">{task.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[80px]"></div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-xl">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Schedule Pulse</h3>
                </div>
                {upcomingMeeting ? (
                  <div className="space-y-4 mb-8">
                    <h4 className="text-xl font-black tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">{upcomingMeeting.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <CalendarIcon size={12} className="text-emerald-500" />
                      {format(new Date(upcomingMeeting.startTime), 'MMM dd')}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 opacity-40 italic text-xs py-6">No sessions.</div>
                )}
                <button onClick={() => setActiveTab('calendar')} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5">Schedule Portal <ArrowRight size={14} /></button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'calendar' && <CalendarView meetings={meetings.filter(m => m.attendees.includes(currentUser.id))} onAddMeeting={(date) => { setInitialDate(date); setIsModalOpen(true); }} onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} />}
      {activeTab === 'exec-sync' && isExecutive && <CalendarView meetings={meetings.filter(m => m.department === Department.Executive)} onAddMeeting={(date) => { setInitialDate(date); setIsModalOpen(true); }} onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} />}
      
      {activeTab === 'dept-calendar' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
                <Building2 className="text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Operational Sync Division</h3>
             </div>
             <select 
               value={deptFilter} 
               onChange={(e) => setDeptFilter(e.target.value as any)}
               className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
             >
               <option value="All">All Divisions</option>
               {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>
          <CalendarView 
            meetings={meetings.filter(m => isExecutive ? (deptFilter === 'All' ? true : m.department === deptFilter) : m.department === currentUser.department)} 
            onAddMeeting={(date) => { setInitialDate(date); setIsModalOpen(true); }} 
            onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} 
          />
        </div>
      )}

      {activeTab === 'tasks' && <TaskBoard tasks={tasks} meetings={meetings} currentUser={currentUser} onStatusChange={updateTaskStatus} onDeleteTask={handleDeleteTask} onAddTask={() => setIsTaskModalOpen(true)} />}
      {activeTab === 'logs' && <MeetingLogs meetings={meetings} currentUser={currentUser} branding={branding} />}
      {activeTab === 'activity' && canSeeAuditTrail && <AuditTrail logs={auditLogs} tasks={tasks} meetings={meetings} />}
      
      {activeTab === 'system' && isChairman && (
        <SystemSettings 
          branding={branding} 
          onUpdateBranding={setBranding} 
          onExport={handleExportSystem} 
          onImport={handleImportSystem} 
          onReset={handleResetSystem} 
        />
      )}

      {activeTab === 'directory' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-8">
              <div className="relative w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Search directory..." value={searchDirectory} onChange={(e) => setSearchDirectory(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-black outline-none focus:ring-4" />
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
              {users.filter(u => u.name.toLowerCase().includes(searchDirectory.toLowerCase())).map(u => (
                <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 hover:shadow-2xl transition-all h-full">
                   <div className="w-20 h-20 rounded-[32px] bg-slate-50 text-slate-900 flex items-center justify-center text-3xl font-black mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">{u.name.charAt(0)}</div>
                   <h3 className="text-lg font-black text-slate-900 leading-tight">{u.name}</h3>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">{u.role}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{u.department}</p>
                   <div className="mt-auto w-full pt-6">
                     {isChairman && <button onClick={() => { setEditingEmployee(u); setIsEmployeeModalOpen(true); }} className="w-full py-3 bg-amber-500 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 active:scale-95"><Pencil size={14} /> Modify</button>}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
      
      {isModalOpen && <MeetingModal branding={branding} currentUser={currentUser} initialDate={initialDate || new Date()} meeting={selectedMeeting} onClose={() => { setIsModalOpen(false); setSelectedMeeting(undefined); }} onSave={handleSaveMeeting} />}
      {isTaskModalOpen && <TaskModal assignee={selectedAssignee} currentUser={currentUser} onClose={() => { setIsTaskModalOpen(false); setSelectedAssignee(undefined); }} onSave={handleSaveStandaloneTask} />}
      {isEmployeeModalOpen && <EmployeeModal employee={editingEmployee || undefined} designations={designations} onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }} onSave={handleUpdateEmployee} />}
      {isCustomCalendarModalOpen && <CustomCalendarModal currentUser={currentUser} onClose={() => setIsCustomCalendarModalOpen(false)} onSave={handleSaveCustomCalendar} />}
    </Layout>
  );
};

export default App;