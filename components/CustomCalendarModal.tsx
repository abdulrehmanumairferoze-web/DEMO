
import React, { useState, useMemo } from 'react';
import { X, Calendar, Users, Search, ShieldCheck, Zap } from 'lucide-react';
import { User, CustomCalendar } from '../types';
import { MOCK_USERS } from '../constants';

interface CustomCalendarModalProps {
  currentUser: User;
  onClose: () => void;
  onSave: (calendar: Partial<CustomCalendar>) => void;
}

export const CustomCalendarModal: React.FC<CustomCalendarModalProps> = ({ currentUser, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([currentUser.id]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedUserIds.length === 0) return;
    
    onSave({
      id: `custom-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      userIds: selectedUserIds,
      createdBy: currentUser.id
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register Strategic Calendar</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Council Member Authority Registry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-6">
            <label className="block">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 block ml-1">Calendar Label</span>
              <div className="bg-slate-50 rounded-2xl p-1 border border-slate-200">
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-5 py-4 bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-300 text-lg" 
                  placeholder="e.g., Export Taskforce Sync" 
                />
              </div>
            </label>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] block ml-1">Member Registry ({selectedUserIds.length})</span>
              </div>
              
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search personnel to include..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
                {filteredUsers.map(u => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUser(u.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                        isSelected ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{u.name}</p>
                        <p className={`text-[9px] font-black uppercase tracking-tight ${isSelected ? 'text-white/70' : 'text-emerald-500'}`}>{u.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-emerald-800 font-black leading-tight uppercase tracking-widest mb-1">Authenticated Sovereign View</p>
              <p className="text-[9px] text-emerald-700/80 font-bold leading-relaxed">This custom schedule will be visible to you and all tagged personnel in their primary navigation interfaces.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 font-black text-slate-400 hover:text-slate-600 transition-all text-[11px] uppercase tracking-[0.2em]"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="px-12 py-5 rounded-2xl font-black bg-slate-900 text-white hover:bg-black shadow-2xl transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] active:scale-95"
            >
              <Zap size={16} />
              Register Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
