import React, { useState, useRef, useEffect } from 'react';
import { User, Role, AppNotification, NotificationType, CustomCalendar, SystemBranding } from '../types';
import { MOCK_USERS } from '../constants';
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  LogOut, 
  Bell, 
  LayoutDashboard,
  Building2,
  Briefcase,
  History,
  Activity,
  Layers,
  Crown,
  ChevronDown,
  UserCog,
  ShieldCheck,
  Globe,
  Trash2,
  X,
  Target,
  Zap,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Menu,
  Plus,
  LayoutList,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';

interface LayoutProps {
  user: User;
  branding: SystemBranding;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  onSwitchUser?: (user: User) => void;
  notifications: AppNotification[];
  onClearNotification: (id: string) => void;
  onMarkNotificationsRead: () => void;
  onQuickTask?: () => void;
  onQuickMeeting?: () => void;
  customCalendars?: CustomCalendar[];
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  branding,
  onLogout, 
  activeTab, 
  setActiveTab, 
  children, 
  onSwitchUser, 
  notifications,
  onClearNotification,
  onMarkNotificationsRead,
  onQuickTask,
  onQuickMeeting,
  customCalendars = []
}) => {
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const isExecutive = user.role === Role.Chairman || user.role === Role.CEO || user.role === Role.COO || user.role === Role.MD || user.role === Role.CFO;
  const isChairman = user.role === Role.Chairman;
  const canSeeAuditTrail = user.role === Role.Chairman || user.role === Role.CEO;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      onMarkNotificationsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Hub', icon: LayoutDashboard },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    ...(isExecutive ? [{ id: 'exec-sync', label: 'Executive', icon: Crown }] : []),
    { id: 'dept-calendar', label: 'Ops Sync', icon: Globe },
    ...customCalendars.map(c => ({ id: c.id, label: c.name, icon: Users })),
    { id: 'tasks', label: 'Manifest', icon: CheckSquare },
    { id: 'logs', label: 'Logs', icon: History },
    ...(canSeeAuditTrail ? [{ id: 'activity', label: 'Audit', icon: Activity }] : []),
    { id: 'directory', label: 'Directory', icon: Building2 },
    ...(isChairman ? [{ id: 'system', label: 'Master Admin', icon: Settings }] : []),
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-8 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 overflow-hidden border border-white/10 shrink-0">
            {branding.logoBase64 ? (
              <img src={branding.logoBase64} alt="Company Logo" className="w-full h-full object-cover p-1.5" />
            ) : (
              <div className="text-slate-900 font-black text-xl italic">{branding.companyName.charAt(0)}</div>
            )}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-lg leading-tight tracking-tight text-white truncate uppercase">{branding.companyName}</h1>
            <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest truncate">{branding.companySubtitle}</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isSystem = item.id === 'system';
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all group ${
                isActive 
                  ? (isSystem ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20') 
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'group-hover:text-emerald-400'} />
              <span className="font-bold text-xs truncate uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/40 rounded-[28px] p-5 border border-white/5">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-slate-900 font-black ${isExecutive ? 'bg-amber-400 shadow-amber-400/20' : 'bg-emerald-400 shadow-emerald-400/20'} shadow-lg`}>
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-xs truncate text-slate-100">{user.name}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
            <LogOut size={12} />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <aside className="hidden lg:flex w-64 flex-col shrink-0 shadow-2xl z-40">
        {renderSidebarContent()}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-100 px-4 lg:px-10 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
              <Menu size={20} />
            </button>
            <h2 className="text-sm lg:text-xl font-black text-slate-900 tracking-tight uppercase truncate">
              {activeTab === 'system' ? 'Platform Administration' : activeTab.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => setShowUserSwitcher(!showUserSwitcher)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all shadow-sm">
              <UserCog size={16} className="text-slate-400" />
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserSwitcher ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="relative" ref={notificationRef}>
              <button onClick={handleToggleNotifications} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all relative">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">{unreadCount}</span>}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-24 lg:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};