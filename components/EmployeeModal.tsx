
import React, { useState } from 'react';
import { X, User as UserIcon, ShieldCheck, Mail, Briefcase, Building, UserPlus } from 'lucide-react';
import { User, Role, Department, Team, Region } from '../types';
import { DEPARTMENTS } from '../constants';

interface EmployeeModalProps {
  employee?: User;
  designations: string[];
  onClose: () => void;
  onSave: (updatedEmployee: User) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, designations, onClose, onSave }) => {
  const isNew = !employee?.id;
  const [name, setName] = useState(employee?.name || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [role, setRole] = useState(employee?.role || designations[0] || Role.Junior);
  const [department, setDepartment] = useState<Department>(employee?.department || Department.Finance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: employee?.id || `u_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      department,
      team: employee?.team || Team.None,
      region: employee?.region || Region.None,
      isMSD: employee?.isMSD || false
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isNew ? 'Register New Staff' : 'Modify Personnel'}
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Sovereign Management Protocol</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Full Name</span>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  required
                  placeholder="Employee Full Name"
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none" 
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Official Email</span>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  required
                  placeholder="name@pharma.com"
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none" 
                />
              </div>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Designation</span>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                    className="w-full pl-12 pr-8 py-4 rounded-2xl border border-slate-200 font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none bg-white"
                  >
                    {designations.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Department</span>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={department} 
                    onChange={e => setDepartment(e.target.value as Department)}
                    className="w-full pl-12 pr-8 py-4 rounded-2xl border border-slate-200 font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none bg-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[11px]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`flex-[2] py-4 ${isNew ? 'bg-emerald-600' : 'bg-slate-900'} text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:opacity-90 transition-all`}
            >
              {isNew ? <UserPlus size={18} /> : <ShieldCheck size={18} />} 
              {isNew ? 'Add to Manifest' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
