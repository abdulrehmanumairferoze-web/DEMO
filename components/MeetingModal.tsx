import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Users, MapPin, FileText, Globe, UserPlus, Plus, Trash2, Mic, Square, Loader2, LayoutTemplate, ShieldCheck, FileDown, Calendar as CalendarIcon, Zap, Search, Hourglass, Pencil } from 'lucide-react';
import { Meeting, User, Department, Task, TaskStatus, MeetingType, Role, Recurrence, Team, Region, ExternalAttendee, SystemBranding } from '../types';
import { MOCK_USERS } from '../constants';
import { transcribeStructuredMoM } from '../services/geminiService';
import { format, isValid } from 'date-fns';
import { TaskModal } from './TaskModal';

interface MeetingModalProps {
  meeting?: Meeting;
  initialDate?: Date;
  currentUser: User;
  branding: SystemBranding;
  onClose: () => void;
  onSave: (meeting: Partial<Meeting>, tasks?: Partial<Task>[]) => void;
}

interface MoMRow {
  id: string;
  discussion: string;
  resolution: string;
  ownerId: string;
  deadline: string;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ meeting, initialDate, currentUser, branding, onClose, onSave }) => {
  const [title, setTitle] = useState(meeting?.title || '');
  const [dept, setDept] = useState<Department>(meeting?.department || currentUser.department);
  const [startTime, setStartTime] = useState(meeting ? meeting.startTime.slice(0, 16) : initialDate && isValid(initialDate) ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = useState(meeting ? meeting.endTime.slice(0, 16) : '');
  const [location, setLocation] = useState(meeting?.location || '');
  const [description, setDescription] = useState(meeting?.description || '');
  const [attendees, setAttendees] = useState<string[]>(meeting?.attendees || [currentUser.id]);
  const [externalAttendees, setExternalAttendees] = useState<ExternalAttendee[]>(meeting?.externalAttendees || []);
  const [leaderId, setLeaderId] = useState<string>(meeting?.leaderId || currentUser.id);
  const [finalizedBy, setFinalizedBy] = useState<string[]>(meeting?.finalizedBy || []);
  
  const [extName, setExtName] = useState('');
  const [extCompany, setExtCompany] = useState('');
  const [extDesignation, setExtDesignation] = useState('');

  const initialRows: MoMRow[] = useMemo(() => {
    try {
      if (meeting?.minutes && meeting.minutes.startsWith('[{"id":')) {
        return JSON.parse(meeting.minutes);
      }
    } catch (e) {}
    return [{ id: '1', discussion: '', resolution: '', ownerId: '', deadline: '' }];
  }, [meeting]);

  const [rows, setRows] = useState<MoMRow[]>(initialRows);
  const [rowForDirective, setRowForDirective] = useState<{ rowId: string, assignee: User, resolution: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [meetingType, setMeetingType] = useState<MeetingType>(meeting?.type || MeetingType.Standard);
  const [pendingTasks, setPendingTasks] = useState<Partial<Task>[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  
  const [team] = useState<Team>(meeting?.team || Team.None);
  const [region] = useState<Region>(meeting?.region || Region.None);
  
  const isFullyFinalized = meeting?.isFinalized || (attendees.length > 0 && finalizedBy.length === attendees.length);
  const hasUserFinalized = finalizedBy.includes(currentUser.id);
  const isLockedForUser = isFullyFinalized || hasUserFinalized;

  const attendeeUsers = MOCK_USERS.filter(u => attendees.includes(u.id));
  const availableUsers = useMemo(() => {
    return MOCK_USERS.filter(u => 
      u.name.toLowerCase().includes(attendeeSearch.toLowerCase()) || 
      u.role.toLowerCase().includes(attendeeSearch.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [attendeeSearch]);

  const handleAddExternalGuest = () => {
    if (extName.trim() && extCompany.trim() && extDesignation.trim()) {
      setExternalAttendees(prev => [...prev, { 
        name: extName.trim(), 
        company: extCompany.trim(),
        designation: extDesignation.trim() 
      }]);
      setExtName('');
      setExtCompany('');
      setExtDesignation('');
    }
  };

  const handleRemoveExternalGuest = (index: number) => {
    if (isLockedForUser) return;
    setExternalAttendees(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    if (isLockedForUser) return;
    setRows(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), discussion: '', resolution: '', ownerId: '', deadline: '' }]);
  };

  // Define handleRemoveRow to fix the missing function error
  const handleRemoveRow = (id: string) => {
    if (isLockedForUser) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof MoMRow, value: string) => {
    if (isLockedForUser) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

    if (field === 'ownerId' && value) {
      const selectedRow = rows.find(r => r.id === id);
      const user = MOCK_USERS.find(u => u.id === value);
      if (user && selectedRow) {
        setRowForDirective({
          rowId: id,
          assignee: user,
          resolution: selectedRow.resolution || "Meeting Directive"
        });
      }
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsLoading(true);
          const structuredData = await transcribeStructuredMoM(base64, 'audio/webm');
          if (structuredData && structuredData.length > 0) {
            const mappedRows: MoMRow[] = structuredData.map((item: any) => {
              const owner = MOCK_USERS.find(u => u.name.toLowerCase().includes(item.ownerName?.toLowerCase() || ''));
              return { id: Math.random().toString(36).substr(2, 9), discussion: item.discussion, resolution: item.resolution, ownerId: owner?.id || '', deadline: item.deadline || '' };
            });
            setRows(prev => (prev.length === 1 && !prev[0].discussion && !prev[0].resolution) ? mappedRows : [...prev, ...mappedRows]);
          }
          setIsLoading(false);
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

  const handleStopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const allAttendees = [
      ...attendeeUsers.map(u => u.name),
      ...externalAttendees.map(g => `${g.name} - ${g.designation} (${g.company})`)
    ];
    const attendeesNames = allAttendees.join(', ');
    const finalizedNames = MOCK_USERS.filter(u => finalizedBy.includes(u.id)).map(u => u.name).join(', ');
    const startDate = new Date(startTime);
    const dateStr = isValid(startDate) ? format(startDate, 'PPP') : 'N/A';

    const contentHtml = `
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Deliberations</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Resolution</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Assignee</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Timeline</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px;">${r.discussion || '-'}</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px; font-weight: bold;">${r.resolution || '-'}</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px;">${MOCK_USERS.find(u => u.id === r.ownerId)?.name || 'Unassigned'}</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px; font-size: 11px;">${r.deadline || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>MoM - ${title}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid ${branding.primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: ${branding.primaryColor}; margin-top: 30px; border-left: 4px solid ${branding.primaryColor}; padding-left: 10px; margin-bottom: 10px; }
            .logo { height: 60px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${branding.logoBase64 ? `<img src="${branding.logoBase64}" class="logo" />` : ''}
            <h1 class="title">Minutes of Meeting</h1>
            <p style="margin: 5px 0; color: ${branding.primaryColor}; font-weight: bold;">${branding.companyName} - ${branding.companySubtitle}</p>
            <div class="meta">
              <div><strong>Subject:</strong> ${title}</div>
              <div><strong>Date:</strong> ${dateStr}</div>
              <div><strong>Department:</strong> ${dept}</div>
              <div><strong>Location:</strong> ${location}</div>
            </div>
          </div>
          <div class="section-title">Participants</div>
          <p style="font-size: 11px;">${attendeesNames}</p>
          <div class="section-title">Resolutions</div>
          ${contentHtml}
          <div class="section-title">Verification</div>
          <p style="font-size: 10px; color: #64748b;">Authentic Records &copy; ${branding.companyName}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleFinalize = () => {
    if (!finalizedBy.includes(currentUser.id)) {
      const nextFinalizedBy = [...finalizedBy, currentUser.id];
      const isNowFinalized = attendees.length > 0 && nextFinalizedBy.length === attendees.length;
      const finalMinutes = JSON.stringify(rows);
      onSave({
        ...meeting, title, department: dept, team, region, startTime, endTime, location, description,
        attendees, externalAttendees, leaderId, minutes: finalMinutes, type: meetingType,
        finalizedBy: nextFinalizedBy, isFinalized: isNowFinalized
      }, pendingTasks.map(t => ({ ...t, status: TaskStatus.PendingApproval })));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-[40px] shadow-2xl w-full max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-hidden flex flex-col relative`}>
        <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Governance Session Log</h2>
            <p className="text-sm text-slate-400 font-medium">Platform: {branding.companyName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPDF} className="p-3 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-2xl transition-all flex items-center gap-2 group">
              <FileDown size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Export Branded PDF</span>
            </button>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-all"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar space-y-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Meeting Subject</span>
                  <input required disabled={isLockedForUser} value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold bg-slate-50 focus:bg-white outline-none transition-all" />
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2 ml-1">
                  <Globe size={14} className="text-indigo-400" /> External Collaborators
                </span>
                {!isLockedForUser && (
                  <div className="space-y-3 mb-4 bg-slate-50 p-4 rounded-[28px] border border-slate-100 shadow-inner">
                    <input type="text" placeholder="Name" value={extName} onChange={e => setExtName(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none" />
                    <input type="text" placeholder="Designation" value={extDesignation} onChange={e => setExtDesignation(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none" />
                    <input type="text" placeholder="External Company" value={extCompany} onChange={e => setExtCompany(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none" />
                    <button type="button" onClick={handleAddExternalGuest} className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
                      <Plus size={14} /> Add Guest
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  {externalAttendees.map((guest, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group">
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-slate-900 truncate">{guest.name}</p>
                        <p className="text-[8px] font-black text-emerald-500 uppercase truncate tracking-tighter">{guest.designation}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{guest.company}</p>
                      </div>
                      {!isLockedForUser && <button onClick={() => handleRemoveExternalGuest(idx)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg"><Trash2 size={12} /></button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
              <div className="flex-1 bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[500px] relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">AI Logic Processing...</p>
                  </div>
                )}
                <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[35%]">Deliberations</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[35%]">Resolution</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[20%]">Assignee</th>
                        <th className="px-6 py-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {rows.map((row) => (
                        <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-2"><textarea disabled={isLockedForUser} value={row.discussion} onChange={e => updateRow(row.id, 'discussion', e.target.value)} placeholder="..." className="w-full p-4 bg-transparent outline-none resize-none text-xs h-24" /></td>
                          <td className="p-2"><textarea disabled={isLockedForUser} value={row.resolution} onChange={e => updateRow(row.id, 'resolution', e.target.value)} placeholder="..." className="w-full p-4 bg-transparent outline-none resize-none text-xs font-bold text-emerald-700 h-24" /></td>
                          <td className="p-2 align-top pt-4">
                            <select disabled={isLockedForUser} value={row.ownerId} onChange={e => updateRow(row.id, 'ownerId', e.target.value)} className="w-full p-2 border border-slate-100 rounded-lg text-[10px] font-black uppercase bg-white">
                              <option value="">Tag Staff...</option>
                              {attendeeUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                          </td>
                          <td className="p-2 align-top pt-4"><button onClick={() => handleRemoveRow(row.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!isLockedForUser && <button onClick={handleAddRow} className="w-full py-4 border-t border-dashed border-slate-200 text-slate-400 hover:text-emerald-600 text-[10px] font-black uppercase flex items-center justify-center gap-2"><Plus size={14} /> Append Row</button>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 font-black text-slate-400 uppercase tracking-widest text-[10px] hover:text-slate-600">Cancel</button>
          {!isLockedForUser && <button onClick={handleFinalize} className="px-14 py-4 rounded-[24px] font-black text-white bg-slate-900 shadow-2xl flex items-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 group"><ShieldCheck size={20} /> Sign & Finalize Session</button>}
        </div>
      </div>
    </div>
  );
};