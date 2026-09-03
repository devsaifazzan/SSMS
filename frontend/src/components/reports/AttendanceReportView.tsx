import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  CalendarCheck, Loader2, Printer, X
} from 'lucide-react';
import client from '../../api/client';
import ReportsNav from './ReportsNav';

const AttendanceReportView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);
  const [period, setPeriod] = useState<string>('week');

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/reports/attendance?period=${period}`);
      if (res.data?.status === 'success') {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <ReportsNav />
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-slate-500 font-medium text-sm">Loading Attendance & Punctuality Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      <ReportsNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-emerald-600" />
            Attendance & Punctuality Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tracking daily attendance trends, unexcused absences, tardiness, and school discipline metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="week">Weekly View</option>
            <option value="month">Monthly View</option>
            <option value="term">Term View</option>
          </select>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Overall Attendance Rate</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary.overall_attendance_pct}%</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">High Discipline Benchmark</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Recorded Sessions</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.summary.total_recorded_sessions}</p>
            <p className="text-[11px] text-slate-400 mt-1">Monitored Timetable Slots</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Absence Records</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{reportData.summary.absent_count}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Unexcused Absences</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Tardy / Late Records</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{reportData.summary.late_count}</p>
            <p className="text-[11px] text-slate-400 mt-1">Late Arrivals</p>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">Daily Attendance & Absence Trends</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.attendance_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#475569' }} />
                  <YAxis tick={{ fill: '#475569' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Present" fill="#10b981" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Late" fill="#f59e0b" name="Late" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-base mb-4">Overall Status Share</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportData.status_distribution} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {reportData.status_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6 text-left print:p-0 print:shadow-none">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                Official Attendance Report Document
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 border border-slate-200 rounded-xl space-y-6 bg-white">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Smart Future Academy</h1>
                  <p className="text-sm font-semibold text-slate-600">Attendance & Punctuality Discipline Report</p>
                  <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right border-l-2 border-slate-200 pl-4">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                    ATTENDANCE AUDIT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                <p><strong>Overall Attendance Rate:</strong> {reportData?.summary?.overall_attendance_pct}%</p>
                <p><strong>Total Sessions Monitored:</strong> {reportData?.summary?.total_recorded_sessions}</p>
                <p><strong>Total Absence Count:</strong> {reportData?.summary?.absent_count}</p>
                <p><strong>Total Tardy Count:</strong> {reportData?.summary?.late_count}</p>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm font-bold text-slate-700">
                <div>
                  <p>Discipline Supervisor</p>
                  <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p>School Principal</p>
                  <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReportView;
