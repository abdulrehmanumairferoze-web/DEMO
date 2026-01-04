import React, { useState } from 'react';
import { Meeting, User, Department } from '../types';
import { MOCK_USERS, getDepartmentEmoji } from '../constants';
import { format, isSameMonth, isValid } from 'date-fns';
import { FileText, Clock, MapPin, ChevronDown, ChevronUp, Lock, Crown, ShieldCheck, Activity, Calendar as CalendarIcon, FileDown, Globe } from 'lucide-react';

interface MeetingLogsProps {
  meetings: Meeting[];
  currentUser: User;
}

interface MoMRow {
  id: string;
  discussion: string;
  resolution: string;
  ownerId: string;
  deadline: string;
}

export const MeetingLogs: React.FC<MeetingLogsProps> = ({ meetings, currentUser }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentMonthMeetings = meetings.filter(m => 
    m.attendees.includes(currentUser.id) && 
    isSameMonth(new Date(m.startTime), new Date())
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown User';

  const safeFormat = (dateStr: string, formatStr: string) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, formatStr) : 'N/A';
  };

  const handleDownloadPDF = (meeting: Meeting) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const attendeesNames = [
      ...MOCK_USERS.filter(u => meeting.attendees.includes(u.id)).map(u => u.name),
      ...(meeting.externalAttendees || []).map(g => `${g.name} - ${g.designation} (${g.company})`)
    ].join(', ');
    
    const finalizedNames = MOCK_USERS.filter(u => (meeting.finalizedBy || []).includes(u.id)).map(u => u.name).join(', ');

    let minutesHtml = '';
    const minutes = meeting.minutes || '';
    if (minutes.startsWith('[{"id":')) {
      const rows: MoMRow[] = JSON.parse(minutes);
      minutesHtml = `
        <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px;">Deliberations</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px;">Resolution</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px;">Assignee</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px;">Timeline</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px;">${r.discussion || '-'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px; font-weight: bold;">${r.resolution || '-'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px;">${getUserName(r.ownerId)}</td>
                <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px;">${r.deadline || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      minutesHtml = `<div style="padding: 20px; font-size: 12px; color: #64748b; font-style: italic;">No refined deliberations recorded.</div>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>MoM - ${meeting.title}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; position: relative; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #10b981; margin-top: 30px; border-left: 4px solid #10b981; padding-left: 10px; }
            .auth-stamp { position: fixed; bottom: 40px; right: 40px; width: 100px; height: 100px; opacity: 0.15; transform: rotate(-15deg); z-index: 100; pointer-events: none; }
            .official-seal { position: fixed; bottom: 120px; right: 60px; width: 120px; height: 120px; border: 4px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ef4444; font-family: 'Courier New', Courier, monospace; font-weight: bold; opacity: 0.5; transform: rotate(-25deg); pointer-events: none; z-index: 101; text-align: center; }
            .seal-inner { border: 2px solid #ef4444; border-radius: 50%; width: 100px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .seal-text-top, .seal-text-bottom { font-size: 7px; text-transform: uppercase; }
            .seal-main { font-size: 14px; border-top: 2px solid #ef4444; border-bottom: 2px solid #ef4444; margin: 2px 0; padding: 2px 5px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="official-seal">
            <div class="seal-inner">
              <span class="seal-text-top">Swiss Pharma</span>
              <span class="seal-main">Approved</span>
              <span class="seal-text-bottom">Official Record</span>
            </div>
          </div>
          <img class="auth-stamp" src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/pharma-s-logo.png" alt="Auth Stamp" />
          <div class="header">
            <h1 class="title">Official Governance Record</h1>
            <p style="margin: 5px 0; color: #10b981; font-weight: bold;">SWISS Pharmaceuticals (Pvt) Ltd</p>
            <div class="meta">
              <div><strong>Subject:</strong> ${meeting.title}</div>
              <div><strong>Date:</strong> ${safeFormat(meeting.startTime, 'PPP')}</div>
              <div><strong>Department:</strong> ${meeting.department}</div>
              <div><strong>Location:</strong> ${meeting.location}</div>
            </div>
          </div>
          <div class="section-title">Verified Participants</div>
          <p style="font-size: 11px;">${attendeesNames}</p>
          <div class="section-title">Deliberations & Resolutions</div>
          ${minutesHtml}
          <div class="section-title">Digital Signatures</div>
          <p style="font-size: 10px; color: #64748b;">Authenticating Council: ${finalizedNames || 'Pending Verification'}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderMinutes = (meeting: Meeting) => {
    const minutes = meeting.minutes || '';
    try {
      if (minutes.startsWith('[{"id":')) {
        const rows: MoMRow[] = JSON.parse(minutes);
        return (
          <div className="space-y-6">
            <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-3xl bg-white shadow-inner">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Deliberations</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Resolution</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-5 text-xs font-medium text-slate-600 italic whitespace-pre-wrap">{row.discussion}</td>
                      <td className="px-6 py-5">
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                          <p className="text-xs font-bold text-emerald-800">{row.resolution}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black uppercase text-slate-700">{getUserName(row.ownerId)}</span>
                      </td>
                      <td className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase">{row.deadline || 'TBD'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(meeting.externalAttendees || []).length > 0 && (
              <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100/50 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={16} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">External Collaborators</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {meeting.externalAttendees?.map((guest, i) => (
                    <div key={i} className="bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm flex flex-col">
                      <p className="text-[10px] font-black text-slate-900 leading-tight">{guest.name}</p>
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter mt-0.5">{guest.designation}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{guest.company}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    } catch (e) {}
    return <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center text-slate-400 text-xs italic">No refined deliberations recorded.</div>;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-all duration-1000">
          <Activity size={160} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Activity Journal</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Governance Review: {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="text-right bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-inner">
          <p className="text-5xl font-black text-emerald-600 tracking-tighter">{currentMonthMeetings.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Validated Sessions</p>
        </div>
      </div>

      <div className="space-y-6">
        {currentMonthMeetings.map((meeting) => {
          const isExpanded = expandedId === meeting.id;
          return (
            <div key={meeting.id} className={`bg-white rounded-[40px] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-emerald-200 shadow-2xl ring-8 ring-emerald-500/5' : 'border-slate-100 shadow-sm hover:border-slate-300'}`}>
              <div className="p-8 cursor-pointer flex items-center justify-between" onClick={() => setExpandedId(isExpanded ? null : meeting.id)}>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex flex-col items-center justify-center shadow-xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{safeFormat(meeting.startTime, 'MMM')}</span>
                    <span className="text-2xl font-black text-white leading-none">{safeFormat(meeting.startTime, 'dd')}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{meeting.title}</h3>
                      {meeting.isFinalized && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg">
                           <ShieldCheck size={12} className="text-emerald-400" />
                           <span className="text-[9px] font-black uppercase tracking-widest">Locked</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-tight"><Clock size={14} className="text-indigo-400" />{safeFormat(meeting.startTime, 'HH:mm')} - {safeFormat(meeting.endTime, 'HH:mm')}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-tight"><MapPin size={14} className="text-rose-400" />{meeting.location}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-black uppercase tracking-widest"><Crown size={14} />Lead: {getUserName(meeting.leaderId)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] bg-slate-100 px-4 py-2 rounded-2xl font-black text-slate-600 uppercase tracking-widest border border-slate-200">
                    {getDepartmentEmoji(meeting.department)} {meeting.department}
                  </span>
                  <div className={`w-12 h-12 rounded-[20px] transition-all flex items-center justify-center ${isExpanded ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-8 pb-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="pt-8 border-t border-slate-100 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100"><FileText size={20} /></div>
                        <div>
                          <h4 className="font-black text-slate-900 tracking-tight">Session Governance Record</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Formal Council Deliberations</p>
                        </div>
                      </div>
                      <button onClick={() => handleDownloadPDF(meeting)} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg group transition-all active:scale-95"><FileDown size={14} /> Export PDF</button>
                    </div>
                    {renderMinutes(meeting)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};