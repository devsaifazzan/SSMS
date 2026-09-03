import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  BookOpen, Loader2, Printer, Award, X
} from 'lucide-react';
import client from '../../api/client';
import ReportsNav from './ReportsNav';

const AcademicReportView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await client.get('/reports/grades');
      if (res.data?.status === 'success') {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch academic report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <ReportsNav />
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-slate-500 font-medium text-sm">Loading Academic Performance Analytics...</p>
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
            <BookOpen className="w-7 h-7 text-purple-600" />
            Academic Performance & Assessment Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Subject grade averages, historical term trends, examination results, and pass/fail statistics.
          </p>
        </div>

        <button
          onClick={() => setShowPrintModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-sm text-sm"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* KPI Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Overall Grade Average (GPA)</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{reportData.summary.overall_gpa}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Across all subjects</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Overall Pass Rate</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary.pass_rate_overall}%</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Exceeding Standard Threshold</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Highest Performing Subject</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{reportData.summary.highest_performing_subject}</p>
            <p className="text-[11px] text-slate-400 mt-1">Top Subject Benchmark</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Recorded Examinations</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{reportData.summary.total_exams_recorded}</p>
            <p className="text-[11px] text-slate-400 mt-1">Evaluated Assessments</p>
          </div>
        </div>
      )}

      {/* Analytics Chart */}
      {reportData && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Historical Subject Performance Trends
          </h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.grade_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#475569' }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#475569' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="الرياضيات" name="Mathematics" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="العلوم" name="Science" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="اللغة العربية" name="Arabic" stroke="#8b5cf6" strokeWidth={3} />
                <Line type="monotone" dataKey="الإنجليزي" name="English" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6 text-left print:p-0 print:shadow-none">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                Official Academic Performance Document
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
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
                  <p className="text-sm font-semibold text-slate-600">Academic Assessment & GPA Performance Summary</p>
                  <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right border-l-2 border-slate-200 pl-4">
                  <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-md border border-purple-200">
                    ACADEMIC AUDIT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                <p><strong>Overall Grade Average (GPA):</strong> {reportData?.summary?.overall_gpa}%</p>
                <p><strong>Pass Rate Benchmark:</strong> {reportData?.summary?.pass_rate_overall}%</p>
                <p><strong>Top Subject:</strong> {reportData?.summary?.highest_performing_subject}</p>
                <p><strong>Total Exams Recorded:</strong> {reportData?.summary?.total_exams_recorded}</p>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm font-bold text-slate-700">
                <div>
                  <p>Head of Academic Affairs</p>
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

export default AcademicReportView;
