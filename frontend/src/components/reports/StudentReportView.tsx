import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Loader2, Filter, Search, Printer, GraduationCap, Award, FileText, RefreshCw, X
} from 'lucide-react';
import client from '../../api/client';
import ReportsNav from './ReportsNav';

const StudentReportView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedStudentCard, setSelectedStudentCard] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await client.get(`/reports/students?${params.toString()}`);
      if (res.data?.status === 'success') {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [genderFilter, statusFilter, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <ReportsNav />
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium text-sm">Loading Student Analytics Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      <ReportsNav />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            Student Performance & Demographic Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive analytics on student enrollment, attendance rates, academic standing, and demographic breakdown.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedStudentCard(null);
            setShowPrintModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <Printer className="w-4 h-4" />
          Print / Export Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            Report Filters
          </span>
          <button
            onClick={fetchReport}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
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
              placeholder="Search by name or national ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Genders (Male & Female)</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>

          {/* Academic Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Academic Statuses</option>
              <option value="active">Active (Regular)</option>
              <option value="graduated">Graduated (متخرج)</option>
              <option value="suspended">Suspended (موقوف مؤقتاً)</option>
              <option value="transferred">Transferred (منتقل)</option>
              <option value="withdrawn">Withdrawn (منسحب)</option>
              <option value="at risk">At Risk (في خطر أكاديمي)</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg font-medium">
              Total Found: <strong className="text-blue-600">{reportData?.summary?.total_students || 0}</strong> Students
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Enrolled</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{reportData.summary.total_students}</p>
            <p className="text-[11px] text-slate-400 mt-1">Active Academic Term</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Avg Attendance Rate</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary.avg_attendance}%</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Excellent Discipline</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Average GPA</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{reportData.summary.avg_gpa}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Overall Subject Average</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-pink-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Gender Ratio</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              👨 {reportData.summary.male_count} M | 👩 {reportData.summary.female_count} F
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Balanced Demographics</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">At-Risk Students</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{reportData.summary.at_risk_count}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">GPA Below 70%</p>
          </div>
        </div>
      )}

      {/* Visual Analytics */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Academic Performance Bracket Breakdown
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.performance_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bracket" tick={{ fill: '#475569', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#475569' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Student Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              Gender Distribution
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.gender_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportData.gender_distribution.map((entry: any, index: number) => (
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

      {/* Table Data */}
      {reportData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Filtered Student Directory & Report Cards
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">National ID</th>
                  <th className="p-3.5">Class & Section</th>
                  <th className="p-3.5">Gender</th>
                  <th className="p-3.5">Attendance</th>
                  <th className="p-3.5">GPA</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{student.first_name} {student.last_name}</td>
                    <td className="p-3.5 text-slate-500">{student.national_id}</td>
                    <td className="p-3.5">{student.class_name} ({student.section_name})</td>
                    <td className="p-3.5">{student.gender}</td>
                    <td className="p-3.5 font-medium text-emerald-600">{student.attendance_pct}%</td>
                    <td className="p-3.5 font-bold text-blue-600">{student.gpa}%</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          student.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedStudentCard(student);
                          setShowPrintModal(true);
                        }}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Preview Card
                      </button>
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
                <Printer className="w-5 h-5 text-blue-600" />
                Official Student Report Document
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
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
                  <p className="text-sm font-semibold text-slate-600">Student Academic & Demographic Official Report</p>
                  <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right border-l-2 border-slate-200 pl-4">
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
                    VERIFIED DOCUMENT
                  </span>
                </div>
              </div>

              {selectedStudentCard ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 rounded text-center">
                    Individual Student Performance Card
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                    <p><strong>Student Name:</strong> {selectedStudentCard.first_name} {selectedStudentCard.last_name}</p>
                    <p><strong>National ID:</strong> {selectedStudentCard.national_id}</p>
                    <p><strong>Class & Section:</strong> {selectedStudentCard.class_name} ({selectedStudentCard.section_name})</p>
                    <p><strong>Gender:</strong> {selectedStudentCard.gender}</p>
                    <p><strong>GPA Score:</strong> <span className="text-blue-700 font-bold">{selectedStudentCard.gpa}%</span></p>
                    <p><strong>Attendance Rate:</strong> <span className="text-emerald-700 font-bold">{selectedStudentCard.attendance_pct}%</span></p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-sm text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2">Student Name</th>
                      <th className="border border-slate-300 p-2">Class & Section</th>
                      <th className="border border-slate-300 p-2">Attendance</th>
                      <th className="border border-slate-300 p-2">GPA</th>
                      <th className="border border-slate-300 p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.students.map((s: any) => (
                      <tr key={s.id}>
                        <td className="border border-slate-300 p-2 font-bold">{s.first_name} {s.last_name}</td>
                        <td className="border border-slate-300 p-2">{s.class_name} ({s.section_name})</td>
                        <td className="border border-slate-300 p-2">{s.attendance_pct}%</td>
                        <td className="border border-slate-300 p-2 font-bold">{s.gpa}%</td>
                        <td className="border border-slate-300 p-2">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm font-bold text-slate-700">
                <div>
                  <p>Quality Assurance Director</p>
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

export default StudentReportView;
