
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Save, 
  Calendar as CalendarIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { attendanceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, AttendanceStatus, AttendanceRecord } from '../types';

const MarkAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const data = attendanceService.getStudents();
    setStudents(data);
    
    // Check if attendance already exists for this date
    const existingRecords = attendanceService.getRecordsByDate(selectedDate);
    const initialAttendance: Record<string, AttendanceStatus> = {};
    
    // Initialize all to Present by default or use existing
    data.forEach(s => {
      const existing = existingRecords.find(r => r.studentId === (s.studentId || s.id));
      initialAttendance[s.studentId || s.id] = existing ? existing.status : AttendanceStatus.PRESENT;
    });
    setAttendance(initialAttendance);
  }, [selectedDate]);

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === AttendanceStatus.PRESENT 
        ? AttendanceStatus.ABSENT 
        : AttendanceStatus.PRESENT
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const recordsToSave = students.map(s => ({
        studentId: s.studentId || s.id,
        studentName: s.name,
        date: selectedDate,
        status: attendance[s.studentId || s.id],
        markedBy: user?.id || 'admin'
      }));

      attendanceService.markAttendance(recordsToSave);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">Mark Attendance</h2>
          <p className="text-slate-500">Record daily presence for your students.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-lg ${
              saveStatus === 'success' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-70'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveStatus === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saveStatus === 'success' ? 'Saved!' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {saveStatus === 'error' && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Failed to save attendance. Please try again.</p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.studentId || 'No ID'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      attendance[student.studentId || student.id] === AttendanceStatus.PRESENT 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {attendance[student.studentId || student.id] === AttendanceStatus.PRESENT ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      {attendance[student.studentId || student.id]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleStatus(student.studentId || student.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        attendance[student.studentId || student.id] === AttendanceStatus.PRESENT
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      Mark as {attendance[student.studentId || student.id] === AttendanceStatus.PRESENT ? 'Absent' : 'Present'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400 font-medium">No students found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkAttendancePage;
