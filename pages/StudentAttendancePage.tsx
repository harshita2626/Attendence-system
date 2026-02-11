
import React, { useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/api';
import { AttendanceStatus } from '../types';

const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  
  const myRecords = useMemo(() => {
    if (!user?.studentId) return [];
    return attendanceService.getRecordsByStudent(user.studentId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [user]);

  const stats = useMemo(() => {
    const total = myRecords.length;
    const present = myRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
    return {
      total,
      present,
      absent: total - present,
      rate: total > 0 ? ((present / total) * 100).toFixed(1) : '0'
    };
  }, [myRecords]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">My Attendance</h2>
          <p className="text-slate-500">View your academic presence records and statistics.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Rank</p>
          <div className="flex items-center gap-1 text-emerald-600 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            Top 15%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
          <p className="text-indigo-100/80 text-sm font-medium mb-1">Attendance Rate</p>
          <p className="text-4xl font-bold">{stats.rate}%</p>
          <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-white h-full rounded-full" style={{ width: `${stats.rate}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Days Present</p>
            <p className="text-2xl font-bold">{stats.present}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Days Absent</p>
            <p className="text-2xl font-bold">{stats.absent}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Attendance Logs
          </h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {myRecords.map((record) => (
            <div key={record.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  record.status === AttendanceStatus.PRESENT ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{new Date(record.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p className="text-xs text-slate-400">Marked by Faculty ID: {record.markedBy}</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                record.status === AttendanceStatus.PRESENT ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {record.status}
              </div>
            </div>
          ))}

          {myRecords.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <p>No attendance records found yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;
