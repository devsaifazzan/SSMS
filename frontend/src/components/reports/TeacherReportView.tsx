import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, Loader2, Filter, Search, Printer, BookOpen, Award, RefreshCw, X
} from 'lucide-react';
import client from '../../api/client';
import ReportsNav from './ReportsNav';

const TeacherReportView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);
  const [specFilter, setSpecFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qualFilter, setQualFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specFilter !== 'all') params.append('specialization', specFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (qualFilter !== 'all') params.append('qualification', qualFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await client.get(`/reports/teachers?${params.toString()}`);
      if (res.data?.status === 'success') {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch teacher report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [specFilter, statusFilter, qualFilter, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <ReportsNav />
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium text-sm">Loading Faculty Analytics Report...</p>
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
            <Users className="w-7 h-7 text-indigo-600" />
            Teacher & Faculty Analytics Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Detailed workload distribution, specialization analysis, experience brackets, and qualifications.
          </p>
        </div>

        <button
          onClick={() => setShowPrintModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm"
        >
          <Printer className="w-4 h-4" />
          Print / Export Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500" />
            Faculty Filters
          </span>
          <button
            onClick={fetchReport}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Specialization Filter */}
          <div>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Specializations</option>
              <option value="الرياضيات">Mathematics</option>
              <option value="العلوم">General Science & Physics</option>
              <option value="إنجليزية">English Language</option>
              <option value="العربية">Arabic Language</option>
              <option value="الحاسب">Computer Science & IT</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Employment Statuses</option>
              <option value="active">Active (On Duty)</option>
              <option value="on leave">On Leave</option>
            </select>
          </div>

          {/* Qualification Filter */}
          <div>
            <select
              value={qualFilter}
              onChange={(e) => setQualFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Academic Qualifications</option>
              <option value="دكتوراه">PhD / Doctorate</option>
              <option value="ماجستير">Master's Degree</option>
              <option value="بكالوريوس">Bachelor's Degree</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Teaching Faculty</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{reportData.summary.total_teachers}</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              {reportData.summary.active_teachers} Active Teachers On Duty
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Avg Experience</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.summary.avg_experience} Years</p>
            <p className="text-[11px] text-slate-400 mt-1">High Instructional Competency</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Weekly Workload</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary.total_weekly_hours} Hours</p>
            <p className="text-[11px] text-slate-400 mt-1">Assigned across all sections</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Top Specialization</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{reportData.summary.top_specialization}</p>
            <p className="text-[11px] text-slate-400 mt-1">Full Curriculum Coverage</p>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Specialization Distribution
            </h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.specialization_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Teacher Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              Teaching Experience Brackets
            </h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.experience_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bracket" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Teacher Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Directory Table */}
      {reportData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Faculty Directory & Workload Summary
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Teacher Name</th>
                  <th className="p-3.5">Specialization</th>
                  <th className="p-3.5">Qualification</th>
                  <th className="p-3.5">Experience</th>
                  <th className="p-3.5">Weekly Workload</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.teachers.map((teacher: any) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{teacher.first_name} {teacher.last_name}</td>
                    <td className="p-3.5 font-medium text-indigo-600">{teacher.specialization}</td>
                    <td className="p-3.5">{teacher.qualification}</td>
                    <td className="p-3.5">{teacher.experience_years} Years</td>
                    <td className="p-3.5 font-bold">{teacher.weekly_hours} Hours/Week</td>
                    <td className="p-3.5 text-xs text-slate-500">{teacher.email} <br />{teacher.phone_number}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          teacher.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6 text-left print:p-0 print:shadow-none">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                Official Faculty & Staff Report Document
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
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
                  <p className="text-sm font-semibold text-slate-600">Faculty & Instructional Staff Summary Report</p>
                  <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right border-l-2 border-slate-200 pl-4">
                  <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-200">
                    VERIFIED FACULTY DOCUMENT
                  </span>
                </div>
              </div>

              <table className="w-full text-sm text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2">Teacher Name</th>
                    <th className="border border-slate-300 p-2">Specialization</th>
                    <th className="border border-slate-300 p-2">Qualification</th>
                    <th className="border border-slate-300 p-2">Experience</th>
                    <th className="border border-slate-300 p-2">Workload</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.teachers.map((t: any) => (
                    <tr key={t.id}>
                      <td className="border border-slate-300 p-2 font-bold">{t.first_name} {t.last_name}</td>
                      <td className="border border-slate-300 p-2">{t.specialization}</td>
                      <td className="border border-slate-300 p-2">{t.qualification}</td>
                      <td className="border border-slate-300 p-2">{t.experience_years} Years</td>
                      <td className="border border-slate-300 p-2 font-bold">{t.weekly_hours} Hours/Wk</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm font-bold text-slate-700">
                <div>
                  <p>Academic Dean</p>
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

export default TeacherReportView;
