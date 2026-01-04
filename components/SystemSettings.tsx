import React, { useRef, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  RefreshCw, 
  Settings, 
  LayoutDashboard, 
  Globe, 
  Zap, 
  HardDrive,
  Cpu,
  Monitor,
  CheckCircle2,
  FileJson,
  Palette,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { SystemBranding } from '../types';

interface SystemSettingsProps {
  branding: SystemBranding;
  onUpdateBranding: (branding: SystemBranding) => void;
  onExport: () => void;
  onImport: (data: string) => void;
  onReset: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ 
  branding, 
  onUpdateBranding, 
  onExport, 
  onImport, 
  onReset 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateBranding({ ...branding, logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImport(event.target.result as string);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[120%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
              <Settings className="text-emerald-400" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">Platform Master Controls</h2>
          </div>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed text-lg">
            Manage the operational identity and data persistence of your enterprise environment. These settings affect the global white-labeling and audit portability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branding Engine */}
        <section className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="text-emerald-500" size={24} />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">White-Label Identity</h3>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Enterprise Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Primary Company Name</span>
                <input 
                  value={branding.companyName}
                  onChange={e => onUpdateBranding({...branding, companyName: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Corporate Subtitle</span>
                <input 
                  value={branding.companySubtitle}
                  onChange={e => onUpdateBranding({...branding, companySubtitle: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-500 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </label>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex flex-col items-center justify-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 overflow-hidden border border-slate-100">
                {branding.logoBase64 ? (
                  <img src={branding.logoBase64} alt="Logo" className="w-full h-full object-cover p-2" />
                ) : (
                  <ImageIcon size={32} className="text-slate-300" />
                )}
              </div>
              <p className="text-xs font-black text-slate-900 mb-2 uppercase tracking-widest">Corporate Seal</p>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest"
              >
                Change Official Logo
              </button>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>
          </div>
        </section>

        {/* System Health */}
        <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Monitor className="text-indigo-500" size={24} />
            <h3 className="text-xl font-black text-slate-900 tracking-tight">System Intel</h3>
          </div>
          <div className="space-y-4 flex-1">
             {[
               { label: 'Intelligence Engine', value: 'Gemini-3-Flash', icon: Cpu, color: 'text-amber-500' },
               { label: 'E2E Encryption', value: 'AES-256 Valid', icon: ShieldCheck, color: 'text-emerald-500' },
               { label: 'Network Node', value: 'Primary Sovereign', icon: Globe, color: 'text-blue-500' },
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-3">
                   <item.icon size={16} className={item.color} />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                 </div>
                 <span className="text-xs font-black text-slate-800">{item.value}</span>
               </div>
             ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memory Allocation</span>
                <span className="text-[10px] font-black text-slate-800 uppercase">4% Utilization</span>
             </div>
             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[4%]"></div>
             </div>
          </div>
        </section>

        {/* Data Handover Center */}
        <section className="lg:col-span-3 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Database className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Data Handover & Persistence</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform border border-slate-100">
                <Download size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Full DB Export</h4>
              <p className="text-[10px] text-slate-400 font-medium mb-6 leading-relaxed">Package all meetings, personnel, and branding into a secure JSON manifest.</p>
              <button onClick={onExport} className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                <FileJson size={14} /> Download Package
              </button>
            </div>

            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform border border-slate-100">
                <Upload size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Restore Instance</h4>
              <p className="text-[10px] text-slate-400 font-medium mb-6 leading-relaxed">Import a previously exported manifest to initialize a new server node.</p>
              <button onClick={() => fileInputRef.current?.click()} className="mt-auto w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                <RefreshCw size={14} /> Upload Package
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportFile} />
            </div>

            <div className="p-8 rounded-[32px] bg-rose-50 border border-rose-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform border border-rose-100">
                <Trash2 size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Factory Wipe</h4>
              <p className="text-[10px] text-rose-400 font-medium mb-6 leading-relaxed">Purge all local records. Use this to prepare the platform for a new client handover.</p>
              <button onClick={onReset} className="mt-auto w-full py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                <ShieldAlert size={14} /> Wipe Database
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};