import React, { useState, useEffect } from 'react';
import { Meeting } from '../types';
import { BellRing, Clock, X, ArrowRight } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';

interface ReminderSystemProps {
  meetings: Meeting[];
  userId: string;
  onViewMeeting: (meeting: Meeting) => void;
}

export const ReminderSystem: React.FC<ReminderSystemProps> = ({ meetings, userId, onViewMeeting }) => {
  const [activeReminders, setActiveReminders] = useState<Meeting[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const upcoming = meetings.filter(m => {
        // Only remind for meetings the user is attending
        if (!m.attendees.includes(userId)) return false;
        if (dismissedIds.has(m.id)) return false;

        const startTime = new Date(m.startTime);
        const secondsUntil = differenceInSeconds(startTime, now);
        
        // Trigger reminder if between 0 and 5 minutes (300 seconds)
        // Using in-app visual reminders exclusively to avoid 'Illegal constructor' errors
        // that occur when using the native Notification constructor in restricted environments.
        return secondsUntil > 0 && secondsUntil <= 300;
      });

      setActiveReminders(upcoming);
    };

    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [meetings, userId, dismissedIds]);

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 max-w-sm w-full animate-in slide-in-from-right-8 duration-500">
      {activeReminders.map((meeting) => {
        const secondsLeft = differenceInSeconds(new Date(meeting.startTime), new Date());
        const mins = Math.floor(secondsLeft / 60);
        const secs = Math.max(0, secondsLeft % 60);

        return (
          <div 
            key={meeting.id} 
            className="bg-white/95 backdrop-blur-xl border border-amber-200 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/20 overflow-hidden relative group"
          >
            {/* Pulsing Urgency Indicator */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 animate-pulse"></div>
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center animate-bounce shadow-inner">
                  <BellRing size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Protocol Alert</p>
                  <h4 className="font-black text-slate-900 text-sm tracking-tight leading-tight truncate max-w-[180px]">
                    {meeting.title}
                  </h4>
                </div>
              </div>
              <button 
                onClick={() => handleDismiss(meeting.id)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between mb-4 shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} className="text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Commencing In:</span>
              </div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {mins}:{secs.toString().padStart(2, '0')}
              </div>
            </div>

            <button 
              onClick={() => {
                onViewMeeting(meeting);
                handleDismiss(meeting.id);
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 group"
            >
              Open Session Records
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        );
      })}
    </div>
  );
};