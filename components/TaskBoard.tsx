import React, { useState, useRef } from 'react';
import { Task, TaskStatus, User, Meeting, TaskPriority, Role, MeetingAttachment } from '../types';
import { MOCK_USERS } from '../constants';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  X,
  CalendarDays,
  PauseCircle,
  ShieldCheck,
  AlertOctagon,
  Timer,
  Trash2,
  Zap,
  Filter,
  Info,
  FileText,
  Paperclip,
  Send,
  MessageCircleX,
  ShieldAlert
} from 'lucide-react';
import { format, differenceInDays, isValid } from 'date-fns';

interface TaskBoardProps {
  tasks: Task[];
  meetings: Meeting[];
  currentUser: User;
  onStatusChange: (taskId: string, status: TaskStatus, details?: any) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask?: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, meetings, currentUser, onStatusChange, onDeleteTask, onAddTask }) => {
  const [acknowledgingTask, setAcknowledgingTask] = useState<Task | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [completionMessage, setCompletionMessage] = useState('');
  const [completionAttachments, setCompletionAttachments] = useState<MeetingAttachment[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const completionFileInputRef = useRef<HTMLInputElement>(null);

  const getAssignee = (id: string) => MOCK_USERS.find(u => u.id === id);
  
  const statusColumns = [
    { id: TaskStatus.PendingApproval, label: 'Awaiting Ack', icon: AlertCircle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: TaskStatus.Approved, label: 'Acknowledged', icon: UserPlus, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: TaskStatus.Pending, label: 'Pending / Hold', icon: PauseCircle, color: 'text-slate-600 bg-slate-50 border-slate-200' },
    { id: TaskStatus.InProgress, label: 'Working', icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: TaskStatus.Completed, label: 'Done', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: TaskStatus.Rejected, label: 'Rejected', icon: X, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ];

  const filteredTasks = tasks.filter(task => {
    let isVisible = false;
    const isExec = [Role.CEO, Role.Chairman, Role.MD, Role.COO, Role.CFO].includes(currentUser.role as Role);
    
    if (isExec) {
      isVisible = true;
    } else {
      const assignee = MOCK_USERS.find(u => u.id === task.assignedToId);
      if (currentUser.role === Role.HOD && assignee?.department === currentUser.department) isVisible = true;
      else if (task.assignedToId === currentUser.id || task.assignedById === currentUser.id) isVisible = true;
    }
    
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) isVisible = false;
    return isVisible;
  });

  const handleOpenReject = (taskId: string) => {
    setRejectingTaskId(taskId);
    setRejectionReason('');
    setAcknowledgingTask(null);
  };

  const submitRejection = () => {
    if (rejectingTaskId && rejectionReason.trim()) {
      onStatusChange(rejectingTaskId, TaskStatus.Rejected, { reason: rejectionReason.trim() });
      setRejectingTaskId(null);
      setRejectionReason('');
    }
  };

  const handleOpenCompletion = (task: Task) => {
    setCompletingTask(task);
    setCompletionMessage('');
    setCompletionAttachments([]);
  };

  const submitCompletion = () => {
    if (completingTask) {
      onStatusChange(completingTask.id, TaskStatus.Completed, {
        completionMessage,
        completionAttachments
      });
      setCompletingTask(null);
    }
  };

  const handleCompletionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompletionAttachments(prev => [...prev, {
        name: file.name,
        type: file.type,
        data: reader.result as string
      }]);
    };
    reader.readAsDataURL(file);
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Q1: return 'bg-rose-100 text-rose-700 border-rose-200';
      case TaskPriority.Q2: return 'bg-amber-100 text-amber-700 border-amber-200';
      case TaskPriority.Q3: return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getUrgencyData = (dueDateStr: string) => {
    if (!dueDateStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    if (!isValid(dueDate)) return null;
    dueDate.setHours(0, 0, 0, 0);
    const daysUntil = differenceInDays(dueDate, today);
    if (daysUntil < 0) return { type: 'overdue', label: 'Overdue', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (daysUntil <= 2) return { type: 'soon', label: 'Due Soon', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return null;
  };

  const safeFormat = (dateStr: string, formatStr: string) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, formatStr) : 'N/A';
  };

  return (
    <div className="relative h-full space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Manifest</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Responsibility Tracking</p>
          </div>
          <button 
            onClick={onAddTask}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95"
          >
            <Zap size={16} /> Issue Directive
          </button>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <Filter size={16} className="text-slate-400 ml-2" />
          {['All', ...Object.values(TaskPriority)].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                priorityFilter === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-20">
        {statusColumns.map((col) => {
          const Icon = col.icon;
          const columnTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col gap-4">
              <div className={`flex items-center justify-between p-3 rounded-2xl border ${col.color} sticky top-0 z-10 bg-white shadow-sm`}>
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="font-black text-[9px] uppercase tracking-widest">{col.label}</span>
                </div>
                <span className="bg-white/60 px-2 py-0.5 rounded-lg text-[9px] font-black">{columnTasks.length}</span>
              </div>

              <div className="space-y-4">
                {columnTasks.map(task => {
                  const urgency = (task.status !== TaskStatus.Completed && task.status !== TaskStatus.Pending) ? getUrgencyData(task.dueDate) : null;
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setViewingTask(task)}
                      className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-black text-[11px] text-slate-900 leading-tight flex-1">{task.title}</h4>
                        <div className={`px-1.5 py-0.5 rounded text-[8px] font-black border shrink-0 ${getPriorityStyle(task.priority)}`}>{task.priority}</div>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[8px] font-black">{getAssignee(task.assignedToId)?.name.charAt(0)}</div>
                          <span className="text-[9px] font-black text-slate-600 truncate max-w-[50px]">{getAssignee(task.assignedToId)?.name.split(' ')[0]}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400">{safeFormat(task.dueDate, 'MMM dd')}</span>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-2 space-y-2" onClick={e => e.stopPropagation()}>
                        {task.status === TaskStatus.PendingApproval && task.assignedToId === currentUser.id && (
                          <>
                            <button onClick={() => setAcknowledgingTask(task)} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase">Intake</button>
                            <button onClick={() => handleOpenReject(task.id)} className="w-full py-2 border border-rose-200 text-rose-500 rounded-xl text-[9px] font-black uppercase">Decline</button>
                          </>
                        )}
                        {task.status === TaskStatus.Approved && task.assignedToId === currentUser.id && (
                          <button onClick={() => onStatusChange(task.id, TaskStatus.InProgress)} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase">Start Task</button>
                        )}
                        {task.status === TaskStatus.InProgress && task.assignedToId === currentUser.id && (
                          <button onClick={() => handleOpenCompletion(task)} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase">Finish</button>
                        )}
                        {task.status === TaskStatus.Completed && (
                          <button onClick={() => onDeleteTask(task.id)} className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase hover:text-rose-500 transition-colors">Archive</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Modal */}
      {viewingTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl p-10 flex flex-col gap-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{viewingTask.title}</h3>
              <button onClick={() => setViewingTask(null)}><X className="text-slate-300 hover:text-slate-500" /></button>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">{viewingTask.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase">Deadline</span>
                <span className="text-xs font-black">{safeFormat(viewingTask.dueDate, 'PPP')}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase">Priority</span>
                <span className={`text-xs font-black uppercase ${viewingTask.priority === 'Q1' ? 'text-rose-600' : 'text-slate-600'}`}>{viewingTask.priority}</span>
              </div>
            </div>
            <button onClick={() => setViewingTask(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase">Close Record</button>
          </div>
        </div>
      )}

      {/* Acknowledgment Modal */}
      {acknowledgingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full text-center space-y-6">
            <ShieldCheck className="mx-auto text-emerald-600" size={48} />
            <h3 className="text-2xl font-black text-slate-900">Task Intake Protocol</h3>
            <p className="text-sm text-slate-500">Confirm commitment to the directive: <strong>{acknowledgingTask.title}</strong></p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { onStatusChange(acknowledgingTask.id, TaskStatus.Approved); setAcknowledgingTask(null); }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs">Acknowledge & Sync</button>
              <button onClick={() => setAcknowledgingTask(null)} className="w-full py-4 text-slate-400 font-bold uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingTaskId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full space-y-6">
            <div className="flex items-center gap-4 text-rose-600 mb-2">
              <ShieldAlert size={32} />
              <h3 className="text-xl font-black uppercase tracking-tight">Decline Directive</h3>
            </div>
            <textarea 
              value={rejectionReason} 
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Provide technical justification for declining this task..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectingTaskId(null)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px]">Cancel</button>
              <button onClick={submitRejection} disabled={!rejectionReason.trim()} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs disabled:opacity-50">Confirm Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-xl w-full space-y-6">
            <div className="flex items-center gap-4 text-emerald-600">
              <CheckCircle2 size={32} />
              <h3 className="text-xl font-black uppercase tracking-tight">Finalize Directive</h3>
            </div>
            <textarea 
              value={completionMessage} 
              onChange={e => setCompletionMessage(e.target.value)}
              placeholder="Document the outcome and specific deliverables of this task..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none resize-none"
            />
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Deliverables / Proof</span>
              <div className="flex flex-wrap gap-2">
                {completionAttachments.map((att, i) => (
                  <div key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                    <FileText size={12} /> {att.name}
                  </div>
                ))}
                <button onClick={() => completionFileInputRef.current?.click()} className="px-3 py-1.5 border border-dashed border-slate-200 text-slate-400 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 hover:border-emerald-300 hover:text-emerald-600 transition-all">
                  <Paperclip size={12} /> Add Evidence
                </button>
                <input type="file" ref={completionFileInputRef} className="hidden" onChange={handleCompletionFileUpload} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setCompletingTask(null)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px]">Back</button>
              <button onClick={submitCompletion} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs">Verify Completion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
