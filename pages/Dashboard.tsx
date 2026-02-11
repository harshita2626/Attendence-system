
import React, { useMemo, useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  BrainCircuit,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/api';
import { analyzeAttendance } from '../services/gemini';
import { UserRole, AttendanceStatus } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const records = useMemo(() => {
    if (user?.role === UserRole.STUDENT) {
      return attendanceService.getRecordsByStudent(user.studentId!);
    }
    return attendanceService.getAllRecords();
  }, [user]);

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    return { total, present, absent, percentage };
  }, [records]);

  const chartData = useMemo(() => {
    // Group records by date for the last 7 days with data
    const dates = [...new Set(records.map(r => r.date))].sort().slice(-7);
    return dates.map(date => {
      const dayRecords = records.filter(r => r.date === date);
      const p = dayRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const a = dayRecords.length - p;
      return { date, present: p, absent: a };
    });
  }, [records]);

  const getAiInsights = async () => {
    setIsAiLoading(true);
    const insight = await analyzeAttendance(records, "Provide a brief analysis of this attendance data.");
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  const pieData = [
    { name: 'Present', value: stats.present, color: '#6366f1' },
    { name: 'Absent', value: stats.absent, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1">Welcome back, {user?.name}</h2>
        <p className="text-slate-500">Here's what's happening with attendance today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Records" 
          value={stats.total.toString()} 
          icon={<Users className="w-5 h-5 text-indigo-600" />} 
          trend="+12% from last month"
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${stats.percentage}%`} 
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} 
          trend="Keep it up!"
        />
        <StatCard 
          title="Total Present" 
          value={stats.present.toString()} 
          icon={<CheckCircle className="w-5 h-5 text-indigo-600" />} 
          trend="Marked across all sessions"
        />
        <StatCard 
          title="Total Absent" 
          value={stats.absent.toString()} 
          icon={<XCircle className="w-5 h-5 text-rose-600" />} 
          trend="Needs attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Attendance History
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                Present
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                Absent
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 rounded-3xl p-6 text-white flex flex-col h-full overflow-hidden shadow-xl shadow-indigo-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-indigo-200" />
            </div>
            <h3 className="font-bold text-lg italic">AI Insights</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {aiInsight ? (
              <div className="space-y-4 text-indigo-100 leading-relaxed text-sm">
                <p>{aiInsight}</p>
                <button 
                  onClick={getAiInsights}
                  className="text-xs font-semibold text-white/60 hover:text-white underline"
                >
                  Refresh insights
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <p className="text-indigo-200/80 text-sm">
                  Let Gemini analyze your attendance data to find patterns and trends automatically.
                </p>
                <button
                  onClick={getAiInsights}
                  disabled={isAiLoading}
                  className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  Generate AI Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string }> = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</span>
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{trend}</p>
    </div>
  </div>
);

export default Dashboard;
