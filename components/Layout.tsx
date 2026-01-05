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
  Settings,
  BellRing,
  Check
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
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userSwitcherRef = useRef<HTMLDivElement>(null);

  const isExecutive = user.role === Role.Chairman || user.role === Role.CEO || user.role === Role.COO || user.role === Role.MD || user.role === Role.CFO;
  const isChairman = user.role === Role.Chairman;
  const canSeeAuditTrail = user.role === Role.Chairman || user.role === Role.CEO;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userSwitcherRef.current && !userSwitcherRef.current.contains(event.target as Node)) {
        setShowUserSwitcher(false);
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
    setShowUserSwitcher(false);
  };

  const handleToggleUserSwitcher = () => {
    setShowUserSwitcher(!showUserSwitcher);
    setShowNotifications(false);
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
            <div className="relative" ref={userSwitcherRef}>
              <button 
                onClick={handleToggleUserSwitcher} 
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all shadow-sm ${showUserSwitcher ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
              >
                <UserCog size={16} className={showUserSwitcher ? 'text-white' : 'text-slate-400'} />
                <ChevronDown size={14} className={`transition-transform ${showUserSwitcher ? 'rotate-180 text-white' : 'text-slate-400'}`} />
              </button>

              {showUserSwitcher && (
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Personnel Override</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                    {MOCK_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser?.(u);
                          setShowUserSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all ${user.id === u.id ? 'bg-emerald-50' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm ${user.id === u.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {u.name.charAt(0)}
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="text-xs font-black text-slate-900 truncate">{u.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">{u.role}</p>
                        </div>
                        {user.id === u.id && <Check size={14} className="ml-auto text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button onClick={handleToggleNotifications} className={`p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Feed</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{notifications.length} Unresolved Alerts</p>
                    </div>
                    <BellRing size={16} className="text-emerald-600" />
                  </div>
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-6 hover:bg-slate-50 transition-colors relative group ${!n.read ? 'bg-emerald-50/30' : ''}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                n.type === NotificationType.Task ? 'bg-blue-100 text-blue-600' : 
                                n.type === NotificationType.Meeting ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                                {n.type === NotificationType.Task ? <CheckSquare size={18} /> : <Calendar size={18} />}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-xs font-black text-slate-900 truncate pr-2">{n.title}</h4>
                                  <span className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">{format(new Date(n.timestamp), 'HH:mm')}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onClearNotification(n.id);
                              }}
                              className="absolute top-6 right-6 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                          <ShieldCheck size={32} className="text-slate-200" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">System Clear. No Active Alerts.</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-slate-50 text-center">
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-[0.2em] transition-all"
                      >
                        Acknowledge All
                      </button>
                    </div>
                  )}
                </div>
              )}
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