import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, CalendarCheck, BookOpen, Loader2 } from 'lucide-react';
import client from '../api/client';

const ReportsView: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [attendanceRes, gradesRes] = await Promise.all([
          client.get('/reports/attendance'),
          client.get('/reports/grades')
        ]);
        
        if (attendanceRes.data?.status === 'success') {
          setAttendanceData(attendanceRes.data.data);
        }
        if (gradesRes.data?.status === 'success') {
          setGradeData(gradesRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
          Analytics & Reports
        </h2>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Term</option>
          </select>
          <button className="btn-primary flex items-center text-sm">
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center space-x-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Attendance</p>
            <p className="text-2xl font-bold text-slate-800">92.4%</p>
          </div>
        </div>
        
        <div className="card p-6 flex items-center space-x-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Classes Held</p>
            <p className="text-2xl font-bold text-slate-800">145</p>
          </div>
        </div>

        <div className="card p-6 flex items-center space-x-4 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Grade</p>
            <p className="text-2xl font-bold text-slate-800">84.5%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="card p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Weekly Attendance Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="Present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Performance Chart */}
        <div className="card p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Academic Performance (Averages)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Line type="monotone" dataKey="Math" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                <Line type="monotone" dataKey="Science" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                <Line type="monotone" dataKey="History" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
