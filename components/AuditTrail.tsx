
import React, { useState } from 'react';
import { AuditLog, ActionType, Task, TaskStatus, Role, User, Meeting } from '../types';
import { MOCK_USERS, getDepartmentEmoji, DEPARTMENTS } from '../constants';
import { format, addMonths, isSameMonth } from 'date-fns';
import { 
  ClipboardList, 
  Calendar, 
  ArrowRightCircle, 
  FileEdit,
  LogIn,
  Activity,
  History,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Trash2,
  Trophy,
  Sparkles,
  Target,
  Loader2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { generateKPIAppraisal } from '../services/geminiService';

interface AuditTrailProps {
  logs: AuditLog[];
  tasks: Task[];
  meetings: Meeting[];
}

const ROLE_KPIS: Record<string, string> = {
  [Role.CEO]: "Enterprise strategic growth, board alignment, high-level policy implementation, and ensuring 100% executive consensus on critical decisions.",
  [Role.MD]: "Export Sales growth (Target: PKR 950Mn), market expansion into West Africa (e.g., Cameroon, Ivory Coast), and new product pipeline finalization.",
  [Role.CFO]: "Financial governance, tax compliance, budget allocation efficiency, and ensuring sustainable cash flow for global expansion projects.",
  [Role.COO]: "Operational excellence, production adherence (Target: 95% uptime), facility registration (e.g., Nutra facility), and supply chain cost optimization.",
  [Role.HOD]: "Departmental task completion rates, meeting participation, team mentorship, and adherence to specialized quality/regulatory protocols."
};

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs, tasks, meetings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'performance' | 'kpi'>('logs');
  const [performanceMonth, setPerformanceMonth] = useState(new Date());
  const [appraisals, setAppraisals] = useState<Record<string, { score: number; justification: string; loading: boolean }>>({});

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case ActionType.TaskAssigned: return <ClipboardList className="text-blue-500" size={18} />;
      case ActionType.TaskStatusUpdate: return <ArrowRightCircle className="text-emerald-500" size={18} />;
      case ActionType.TaskDeleted: return <Trash2 className="text-rose-500" size={18} />;
      case ActionType.MeetingScheduled: return <Calendar className="text-emerald-500" size={18} />;
      case ActionType.MeetingUpdated: return <FileEdit className="text-amber-500" size={18} />;
      case ActionType.Login: return <LogIn className="text-slate-500" size={18} />;
      default: return <Activity className="text-slate-400" size={18} />;
    }
  };

  const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown User';

  const runAppraisal = async (user: User) => {
    setAppraisals(prev => ({ ...prev, [user.id]: { score: 0, justification: '', loading: true } }));
    
    const userTasks = tasks.filter(t => t.assignedToId === user.id || t.assignedById === user.id);
    const userMeetings = meetings.filter(m => m.attendees.includes(user.id) || m.leaderId === user.id);
    const records = { tasks: userTasks, meetings: userMeetings };
    
    const kpiDesc = ROLE_KPIS[user.role] || ROLE_KPIS[Role.HOD];
    // Fixed: 'user.role' type alignment by casting to string for generateKPIAppraisal
    const result = await generateKPIAppraisal(user.name, user.role as string, kpiDesc, records);
    
    setAppraisals(prev => ({ 
      ...prev, 
      [user.id]: { score: result.score, justification: result.justification, loading: false } 
    }));
  };

  const scorecardUsers = MOCK_USERS.filter(u => 
    [Role.CEO, Role.MD, Role.CFO, Role.COO, Role.HOD].includes(u.role as Role)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Governance & Audit Center</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">SWISS Pharmaceuticals Operational Integrity</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-3xl border border-slate-200 shadow-inner">
           {[
             { id: 'logs', label: 'System Logs', icon: History },
             { id: 'performance', label: 'Staff Metrics', icon: BarChart3 },
             { id: 'kpi', label: 'KPI Scorecard', icon: Trophy },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveSubTab(tab.id as any)}
               className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeSubTab === tab.id ? 'bg-white text-emerald-600 shadow-xl border border-slate-100' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               <tab.icon size={16} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-[11px] font-bold text-slate-400 tabular-nums">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-[11px] font-black text-slate-600 border border-slate-200">
                        {getUserName(log.userId).charAt(0)}
                      </div>
                      <span className="text-xs font-black text-slate-800">{getUserName(log.userId)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <span className="text-xs font-black text-slate-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
                      {getDepartmentEmoji(log.department)} {log.department}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-500 font-medium max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:max-w-none transition-all">
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'performance' && (
        <div className="space-y-12">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                <CalendarDays size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Monthly Staff Performance</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Cycle: {format(performanceMonth, 'MMMM yyyy')}</p>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              <button onClick={() => setPerformanceMonth(prev => addMonths(prev, -1))} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600"><ChevronLeft size={18} /></button>
              <div className="px-4 py-2 text-xs font-black text-slate-900 uppercase tracking-widest min-w-[140px] text-center">{format(performanceMonth, 'MMM yyyy')}</div>
              <button onClick={() => setPerformanceMonth(prev => addMonths(prev, 1))} className="p-2 hover:bg-white rounded-xl transition-all text-slate-600"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="space-y-10">
            {DEPARTMENTS.map(dept => {
              const deptUsers = MOCK_USERS.filter(u => 
                u.department === dept && 
                (u.role === Role.Junior || u.role === Role.Senior || u.isMSD)
              );

              if (deptUsers.length === 0) return null;

              return (
                <div key={dept} className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 px-6">
                    <span className="text-2xl">{getDepartmentEmoji(dept)}</span>
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-[0.2em]">{dept} Division</h4>
                  </div>
                  <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Total</th>
                          <th className="px-8 py-5 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center">Done</th>
                          <th className="px-8 py-5 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Working</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">On Hold</th>
                          <th className="px-8 py-5 text-[10px] font-black text-amber-600 uppercase tracking-widest text-center">Pending Ack</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {deptUsers.map((u) => {
                          const uTasks = tasks.filter(t => 
                            t.assignedToId === u.id && 
                            isSameMonth(new Date(t.createdAt), performanceMonth)
                          );

                          return (
                            <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-xs font-black text-emerald-600 border border-emerald-100">
                                    {u.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-900">{u.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.department}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-[10px] font-black text-slate-600 uppercase bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                  {u.role} {u.isMSD ? '(MSD)' : ''}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <div className="text-sm font-black text-slate-900">{uTasks.length}</div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-sm border border-emerald-100">
                                  {uTasks.filter(t => t.status === TaskStatus.Completed).length}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-black text-sm border border-blue-100">
                                  {uTasks.filter(t => t.status === TaskStatus.InProgress || t.status === TaskStatus.Approved).length}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 font-black text-sm border border-slate-100">
                                  {uTasks.filter(t => t.status === TaskStatus.Pending).length}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 font-black text-sm border border-amber-100">
                                  {uTasks.filter(t => t.status === TaskStatus.PendingApproval).length}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'kpi' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-600 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles size={160} />
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black tracking-tight mb-4">Strategic KPI Scorecard</h3>
              <p className="text-emerald-100 font-medium max-w-2xl leading-relaxed text-lg">
                The SWISS Governance Engine utilizes Gemini AI to analyze historical manifests, meeting consensus, and directive adherence to provide objective performance appraisals for leadership.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {scorecardUsers.map((user) => {
              const appraisal = appraisals[user.id];
              return (
                <div key={user.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col hover:border-emerald-200 hover:shadow-2xl transition-all group">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-2xl font-black text-slate-800 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{user.role}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.department}</span>
                        </div>
                      </div>
                    </div>
                    {appraisal?.score !== undefined && !appraisal.loading && (
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-black text-emerald-600 leading-none">{appraisal.score}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score / 10</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                      <Target size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Key Performance Indicators</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                      {ROLE_KPIS[user.role as string] || ROLE_KPIS[Role.HOD]}
                    </p>
                  </div>

                  {appraisal?.loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-emerald-600 gap-4">
                      <Loader2 className="animate-spin" size={32} />
                      <span className="text-xs font-black uppercase tracking-widest animate-pulse">Analyzing manifest records...</span>
                    </div>
                  ) : appraisal?.justification ? (
                    <div className="flex-1 space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Sparkles size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">AI Performance Justification</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {appraisal.justification}
                        </p>
                      </div>
                      <button 
                        onClick={() => runAppraisal(user)}
                        className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={12} /> Recalculate Metrics
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-[32px] gap-6">
                      <div className="text-center px-8">
                        <p className="text-xs font-bold text-slate-400 mb-2">No appraisal on record for this cycle.</p>
                        <p className="text-[10px] text-slate-300 font-medium leading-relaxed">System requires cross-referencing task outcomes and meeting finalizations to generate a score.</p>
                      </div>
                      <button 
                        onClick={() => runAppraisal(user)}
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <TrendingUp size={18} /> Run AI Appraisal
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
