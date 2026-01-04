
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, ClipboardList, CalendarDays, Send, AlertCircle, Clock, Zap, Target, MousePointerClick, User as UserIcon, Search, RefreshCw, Paperclip, FileText, Trash2 } from 'lucide-react';
import { User, Task, TaskStatus, TaskPriority, Role, Recurrence, MeetingAttachment } from '../types';
import { MOCK_USERS } from '../constants';
import { format, addDays } from 'date-fns';

interface TaskModalProps {
  assignee?: User;
  currentUser: User;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  initialTitle?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ assignee: initialAssignee, currentUser, onClose, onSave, initialTitle }) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Q2);
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [recurrence, setRecurrence] = useState<Recurrence>(Recurrence.None);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>(initialAssignee?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState<MeetingAttachment[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
  }, [initialTitle]);

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.department.toLowerCase().includes(searchQuery.toLowerCase());
      const isNotSelf = u.id !== currentUser.id;
      return matchesSearch && isNotSelf;
    });
  }, [searchQuery, currentUser.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAttachments(prev => [...prev, {
        name: file.name,
        type: file.type,
        data: base64
      }]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigneeId) return;
    
    onSave({
      title,
      description,
      assignedToId: selectedAssigneeId,
      assignedById: currentUser.id,
      dueDate,
      priority,
      recurrence,
      attachments,
      status: TaskStatus.PendingApproval,
      createdAt: new Date().toISOString()
    });
  };

  const selectedAssignee = MOCK_USERS.find(u => u.id === selectedAssigneeId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-4 border-b border-slate-50 mb-2">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Issue Directive</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                {selectedAssignee ? `Assignee: ${selectedAssignee.name}` : 'Corporate Command Protocol'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300">
              <X size={24} />
            </button>
          </div>

          {!initialAssignee && (
            <div className="space-y-4">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] block">Assign To Personnel</span>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search by name, role, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-slate-700 text-sm shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {filteredUsers.slice(0, 10).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedAssigneeId(u.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      selectedAssigneeId === u.id ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${selectedAssigneeId === u.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-[11px] font-black truncate ${selectedAssigneeId === u.id ? 'text-white' : 'text-slate-900'}`}>{u.name}</p>
                      <p className={`text-[8px] font-black uppercase tracking-tight ${selectedAssigneeId === u.id ? 'text-white/70' : 'text-emerald-500'}`}>{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <label className="block">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 block">Task Title</span>
              <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100">
                <input 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-300 text-base" 
                  placeholder="e.g., Audit Production Line B" 
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 block">Scope of Responsibility</span>
              <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100">
                <textarea 
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-32 px-5 py-4 bg-transparent outline-none resize-none font-medium text-slate-600 placeholder:text-slate-300 text-sm leading-relaxed"
                  placeholder="Detail the technical requirements and success criteria..."
                />
              </div>
            </label>

            <div className="space-y-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] block">Reference Documents</span>
              <div className="flex flex-wrap gap-3">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 animate-in fade-in zoom-in-95">
                    <FileText size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <Paperclip size={14} /> Attach Reference
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <label className="block">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 block">Priority Level</span>
                <div className="relative group">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white font-bold text-slate-700 text-sm shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                  >
                    <option value={TaskPriority.Q1}>Q1 - Critical</option>
                    <option value={TaskPriority.Q2}>Q2 - Important</option>
                    <option value={TaskPriority.Q3}>Q3 - Standard</option>
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 block">Deadline</span>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white font-bold text-slate-700 text-sm shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none" 
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 block">Recurrence</span>
                <div className="relative group">
                  <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as Recurrence)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white font-bold text-slate-700 text-sm shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                  >
                    {Object.values(Recurrence).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-[28px] border border-amber-200 flex gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <MousePointerClick className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-amber-800 font-black leading-tight uppercase tracking-widest mb-1">Acknowledgment Protocol Required</p>
              <p className="text-[9px] text-amber-700/80 font-bold leading-relaxed">Directives remain inactive until the assignee explicitly acknowledges and performs intake via their Command Interface.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 sticky bottom-0 bg-white pb-2 border-t border-slate-50">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 font-black text-slate-400 hover:text-slate-600 transition-all text-[11px] uppercase tracking-[0.2em]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!selectedAssigneeId}
              className="px-10 py-5 rounded-2xl font-black bg-slate-900 text-white hover:bg-black shadow-2xl transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
            >
              <Send size={16} />
              Issue directive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
