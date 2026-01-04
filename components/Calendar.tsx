import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  endOfMonth, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, RefreshCw, Lock, Calendar as CalIcon, Plane, Crown, Search, X } from 'lucide-react';
import { Meeting, Department, Recurrence, MeetingType } from '../types';
import { getDepartmentEmoji } from '../constants';

interface CalendarProps {
  meetings: Meeting[];
  onAddMeeting: (date: Date) => void;
  onViewMeeting: (meeting: Meeting) => void;
}

export const CalendarView: React.FC<CalendarProps> = ({ meetings, onAddMeeting, onViewMeeting }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - monthStart.getDay());
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const goToToday = () => setCurrentDate(new Date());

  const filteredMeetings = useMemo(() => {
    if (!searchTerm.trim()) return meetings;
    const term = searchTerm.toLowerCase();
    return meetings.filter(m => 
      m.title.toLowerCase().includes(term) || 
      (m.description && m.description.toLowerCase().includes(term))
    );
  }, [meetings, searchTerm]);

  const getMeetingStyles = (meeting: Meeting) => {
    if (meeting.type === MeetingType.Travel) {
      return 'bg-teal-50 text-teal-700 border-teal-200 hover:shadow-teal-100';
    }
    if (meeting.type === MeetingType.Strategic) {
      return 'bg-amber-50 text-amber-700 border-amber-200 hover:shadow-amber-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-inner">
              <span className="text-[10px] font-black text-indigo-500 uppercase">{format(currentDate, 'MMM')}</span>
              <span className="text-xl font-black text-slate-800">{format(currentDate, 'yyyy')}</span>
           </div>
           <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{format(currentDate, 'MMMM')}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <CalIcon size={12} /> Cycle Schedule Manifest
              </p>
           </div>
        </div>

        <div className="flex-1 max-w-md relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search manifest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-black uppercase tracking-widest outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={goToToday} className="px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Go Today</button>
          <div className="flex bg-slate-100 p-1.5 rounded-[20px] shadow-inner">
            <button onClick={prevMonth} className="p-3 hover:bg-white rounded-[14px] transition-all text-slate-600"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-3 hover:bg-white rounded-[14px] transition-all text-slate-600"><ChevronRight size={20} /></button>
          </div>
          <button onClick={() => onAddMeeting(new Date())} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[24px] hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-widest shadow-2xl">
            <Plus size={18} /> Add Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-50">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="py-6 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] bg-slate-50/20">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr min-h-[800px]">
        {calendarDays.map((day, idx) => {
          const dayMeetings = filteredMeetings.filter(m => {
            const start = new Date(m.startTime);
            const end = new Date(m.endTime);
            if (m.type === MeetingType.Travel) {
              return isSameDay(day, start) || isSameDay(day, end);
            }
            return isSameDay(day, start);
          });
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={idx} 
              onClick={() => onAddMeeting(day)}
              className={`min-h-[160px] p-6 border-r border-b border-slate-50 group transition-all hover:bg-indigo-50/10 cursor-pointer ${!isCurrentMonth ? 'opacity-20 bg-slate-50/40' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`w-10 h-10 flex items-center justify-center rounded-[18px] font-black text-base ${isToday ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'text-slate-800'}`}>{format(day, 'd')}</span>
              </div>
              <div className="space-y-3">
                {dayMeetings.map(meeting => {
                  const isArrival = meeting.type === MeetingType.Travel && isSameDay(day, new Date(meeting.endTime));
                  const isDeparture = meeting.type === MeetingType.Travel && isSameDay(day, new Date(meeting.startTime));
                  
                  return (
                    <button
                      key={meeting.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents the cell's onClick from firing when a meeting is clicked
                        onViewMeeting(meeting);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border text-[10px] font-black truncate transition-all relative pl-8 group/meeting ${getMeetingStyles(meeting)}`}
                    >
                      <div className="absolute left-2.5 top-3.5">
                        {meeting.isFinalized ? <Lock size={12} /> : (meeting.type === MeetingType.Travel ? <Plane size={12} className="text-teal-600" /> : <Clock size={12} className="opacity-40" />)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between opacity-60 text-[8px] uppercase tracking-widest">
                          {meeting.type === MeetingType.Travel ? (
                            <span>{isArrival ? 'Arrival' : 'Departure'}</span>
                          ) : (
                            <span>{format(new Date(meeting.startTime), 'HH:mm')}</span>
                          )}
                        </div>
                        <span className="leading-tight block truncate">
                          {getDepartmentEmoji(meeting.department)} {meeting.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};