import React, { useState, useEffect } from 'react';
import { User, SystemBranding } from '../types';
import { MOCK_USERS } from '../constants';
import { ShieldCheck, Lock, User as UserIcon, Key, AlertCircle, Building2, Fingerprint, Crown, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { format } from 'date-fns';

interface LoginProps {
  onLogin: (user: User) => void;
  branding: SystemBranding;
}

export const Login: React.FC<LoginProps> = ({ onLogin, branding }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(['Initializing kernel...', 'Mounting secure storage...']);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const logPool = [
      'Synchronizing node 04-A...',
      'Validating E2E encryption...',
      'Checking hardware integrity...',
      'Fetching latest audit trail...',
      'Handshake successful with DB-PROD...',
      'Biometric module ready...',
    ];
    const logTimer = setInterval(() => {
      setSystemLogs(prev => [logPool[Math.floor(Math.random() * logPool.length)], ...prev].slice(0, 10));
    }, 4000);
    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.id.toLowerCase() === employeeId.toLowerCase());
      if (user && password.length >= 4) {
        onLogin(user);
      } else {
        setError("Identity Verification Failed.");
      }
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[160px] animate-pulse"></div>

      <div className="w-full max-w-6xl z-10 flex flex-col lg:flex-row items-stretch animate-in fade-in zoom-in-95 duration-1000 shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[48px] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-2xl">
        <div className="lg:w-2/5 flex flex-col justify-between p-12 lg:p-16 text-white border-r border-white/5 relative">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                {branding.logoBase64 ? (
                  <img src={branding.logoBase64} alt="Logo" className="w-full h-full object-cover p-1.5" />
                ) : (
                  <div className="text-slate-900 font-black text-2xl">{branding.companyName.charAt(0)}</div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">{branding.companyName}</h1>
                <p className="text-[10px] text-emerald-400 font-black tracking-[0.4em] uppercase mt-1">{branding.companySubtitle}</p>
              </div>
            </div>

            <div className="space-y-2 mb-16">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
                Enterprise<br />
                Sovereign<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Governance</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs pt-4 border-t border-white/10 mt-6">
                Official secure node for {branding.companyName}. End-to-end synchronization for global pharmaceutical operations.
              </p>
            </div>

            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 font-mono text-[10px] space-y-2 overflow-hidden h-44 shadow-inner">
              <div className="flex items-center gap-2 text-emerald-400 mb-2 border-b border-white/10 pb-2 uppercase font-black">Kernel_Stream_v6.0</div>
              {systemLogs.map((log, i) => (
                <div key={i} className={`flex gap-3 transition-all duration-500 ${i === 0 ? 'text-white' : 'text-slate-500'}`}>
                  <span className="opacity-30">[{format(new Date(), 'HH:mm:ss')}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
             <span>Link Secure // AES-256</span>
             <span className="text-emerald-400">Station Active</span>
          </div>
        </div>

        <div className="lg:w-3/5 bg-[#0a0c10]/40 backdrop-blur-3xl flex flex-col p-8 lg:p-24 relative overflow-hidden">
          <div className="max-w-md mx-auto w-full relative z-10">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldAlert size={20} className="text-emerald-400" />
                 <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Identity Management</h3>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">Login to Console</h2>
              <p className="text-slate-400 font-medium text-sm">Input credentials to establish encrypted session.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest">{error}</div>}
              
              <div className="space-y-4">
                <input 
                  type="text" required placeholder="Employee ID (e.g., u100)"
                  value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                  className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 outline-none text-white font-bold"
                />
                <input 
                  type="password" required placeholder="Security Key"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 outline-none text-white font-bold"
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 shadow-2xl"
              >
                {isSubmitting ? 'Verifying...' : 'Establish Session'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};