import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Users, CalendarCheck, BookOpen, Loader2, Filter, Search,
  Printer, GraduationCap, DollarSign, Award, FileText, RefreshCw, X
} from 'lucide-react';
import client from '../api/client';

type TabType = 'students' | 'teachers' | 'attendance' | 'grades' | 'finance';

const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [loading, setLoading] = useState<boolean>(true);

  // Student Report State
  const [studentReport, setStudentReport] = useState<any>(null);
  const [studentGender, setStudentGender] = useState<string>('all');
  const [studentStatus, setStudentStatus] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Teacher Report State
  const [teacherReport, setTeacherReport] = useState<any>(null);
  const [teacherSpec, setTeacherSpec] = useState<string>('all');
  const [teacherStatus, setTeacherStatus] = useState<string>('all');
  const [teacherQual, setTeacherQual] = useState<string>('all');
  const [teacherSearch, setTeacherSearch] = useState<string>('');

  // Other Reports State
  const [attendanceReport, setAttendanceReport] = useState<any>(null);
  const [gradesReport, setGradesReport] = useState<any>(null);
  const [financeReport, setFinanceReport] = useState<any>(null);

  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<any>(null);

  const fetchStudentReport = async () => {
    try {
      const params = new URLSearchParams();
      if (studentGender !== 'all') params.append('gender', studentGender);
      if (studentStatus !== 'all') params.append('status', studentStatus);
      if (studentSearch) params.append('search', studentSearch);

      const res = await client.get(`/reports/students?${params.toString()}`);
      if (res.data?.status === 'success') {
        setStudentReport(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student report', err);
    }
  };

  const fetchTeacherReport = async () => {
    try {
      const params = new URLSearchParams();
      if (teacherSpec !== 'all') params.append('specialization', teacherSpec);
      if (teacherStatus !== 'all') params.append('status', teacherStatus);
      if (teacherQual !== 'all') params.append('qualification', teacherQual);
      if (teacherSearch) params.append('search', teacherSearch);

      const res = await client.get(`/reports/teachers?${params.toString()}`);
      if (res.data?.status === 'success') {
        setTeacherReport(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch teacher report', err);
    }
  };

  const fetchOtherReports = async () => {
    try {
      const [attRes, grdRes, finRes] = await Promise.all([
        client.get('/reports/attendance'),
        client.get('/reports/grades'),
        client.get('/reports/finance')
      ]);

      if (attRes.data?.status === 'success') setAttendanceReport(attRes.data.data);
      if (grdRes.data?.status === 'success') setGradesReport(grdRes.data.data);
      if (finRes.data?.status === 'success') setFinanceReport(finRes.data.data);
    } catch (err) {
      console.error('Failed to fetch other reports', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchStudentReport(),
        fetchTeacherReport(),
        fetchOtherReports()
      ]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') fetchStudentReport();
  }, [studentGender, studentStatus, studentSearch]);

  useEffect(() => {
    if (activeTab === 'teachers') fetchTeacherReport();
  }, [teacherSpec, teacherStatus, teacherQual, teacherSearch]);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !studentReport && !teacherReport) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium dir-rtl">جاري تحضير واستخرج التقارير والبيانات التحليلية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 dir-rtl text-right font-sans">
      {/* Header & Printable Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            مركز التقارير والإحصائيات الشاملة
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            تحليل دقيق ومباشر لبيانات الطلاب، الأساتذة، الحضور، الأداء الأكاديمي والمالية مع فلاتر مخصصة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" />
            طباعة وتصدير التقرير
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex space-x-2 space-x-reverse border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          تقرير الطلاب
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'teachers'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          تقرير الأساتذة
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'attendance'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          تقرير الحضور والغياب
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'grades'
              ? 'border-purple-600 text-purple-600 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          تقرير الأداء الأكاديمي
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'finance'
              ? 'border-amber-600 text-amber-600 bg-amber-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          التقرير المالي
        </button>
      </div>

      {/* TAB 1: STUDENT REPORT */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Smart Filter Bar for Students */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-500" />
                فلاتر تصفية تقارير الطلاب
              </span>
              <button
                onClick={fetchStudentReport}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" /> إعادة تحديث
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم الطالب أو الهوية..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gender Filter */}
              <div>
                <select
                  value={studentGender}
                  onChange={(e) => setStudentGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الأجناس (ذكور وإناث)</option>
                  <option value="male">ذكور فقط</option>
                  <option value="female">إناث فقط</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={studentStatus}
                  onChange={(e) => setStudentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الحالات الأكاديمية</option>
                  <option value="active">منتظم (Active)</option>
                  <option value="at risk">حاجة للتدخل / في خطر أكاديمي (At Risk)</option>
                </select>
              </div>

              <div className="flex items-center justify-end">
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg font-medium">
                  عدد النتائج: <strong className="text-blue-600">{studentReport?.summary?.total_students || 0}</strong> طالب
                </span>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          {studentReport && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-blue-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{studentReport.summary.total_students}</p>
                <p className="text-[11px] text-slate-400 mt-1">مسجلين بالفترات النشطة</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-emerald-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">متوسط الحضور والغياب</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{studentReport.summary.avg_attendance}%</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">نسبة انضباط ممتازة</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-purple-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">متوسط معدل الدرجات GPA</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{studentReport.summary.avg_gpa}%</p>
                <p className="text-[11px] text-slate-400 mt-1">المعدل العام لكافة المواد</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-pink-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">توزيع الجنسين</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  👨 {studentReport.summary.male_count} ذكور | 👩 {studentReport.summary.female_count} إناث
                </p>
                <p className="text-[11px] text-slate-400 mt-1">نسبة متوازنة</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-rose-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">طلاب بحاجة إلى متابعة</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{studentReport.summary.at_risk_count}</p>
                <p className="text-[11px] text-rose-500 font-medium mt-1">معدل أقل من 70%</p>
              </div>
            </div>
          )}

          {/* Student Visual Analytics Grid */}
          {studentReport && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Brackets Bar Chart */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  توزيع مستويات الطلاب الأكاديمية
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentReport.performance_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="bracket" tick={{ fill: '#475569', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#475569' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="عدد الطلاب" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gender Pie Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-500" />
                  التوزيع النسبي حسب الجنس
                </h3>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentReport.gender_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {studentReport.gender_distribution.map((entry: any, index: number) => (
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

          {/* Students Detailed Data Table */}
          {studentReport && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  قائمة الطلاب المفلترة والتقارير الأكاديمية
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">اسم الطالب</th>
                      <th className="p-3.5">الهوية الوطنية</th>
                      <th className="p-3.5">الصف والشعبة</th>
                      <th className="p-3.5">الجنس</th>
                      <th className="p-3.5">نسبة الحضور</th>
                      <th className="p-3.5">المعدل الأكاديمي</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5 text-center">بطاقة التقرير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {studentReport.students.map((student: any) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{student.first_name} {student.last_name}</td>
                        <td className="p-3.5 text-slate-500">{student.national_id}</td>
                        <td className="p-3.5">{student.class_name} ({student.section_name})</td>
                        <td className="p-3.5">{student.gender === 'Male' ? 'ذكر' : 'أنثى'}</td>
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
                            {student.status === 'Active' ? 'منتظم' : 'في خطر أكاديمي'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              setSelectedStudentForCard(student);
                              setShowPrintModal(true);
                            }}
                            className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            معاينة البطاقة
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEACHER REPORT */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          {/* Smart Filter Bar for Teachers */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-500" />
                فلاتر تصفية تقارير الأساتذة والكادر التعليمي
              </span>
              <button
                onClick={fetchTeacherReport}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" /> إعادة تحديث
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم المعلم أو التخصص..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Specialization Filter */}
              <div>
                <select
                  value={teacherSpec}
                  onChange={(e) => setTeacherSpec(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">جميع التخصصات</option>
                  <option value="الرياضيات">الرياضيات</option>
                  <option value="العلوم">العلوم العامة والفيزياء</option>
                  <option value="الإنجليزية">اللغة الإنجليزية</option>
                  <option value="العربية">اللغة العربية</option>
                  <option value="الحاسب">الحاسب الآلي والتقنية</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={teacherStatus}
                  onChange={(e) => setTeacherStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">جميع الحالات الوظيفية</option>
                  <option value="active">على رأس العمل (Active)</option>
                  <option value="on leave">في إجازة (On Leave)</option>
                </select>
              </div>

              {/* Qualification Filter */}
              <div>
                <select
                  value={teacherQual}
                  onChange={(e) => setTeacherQual(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">جميع المؤهلات العلمية</option>
                  <option value="دكتوراه">دكتوراه</option>
                  <option value="ماجستير">ماجستير</option>
                  <option value="بكالوريوس">بكالوريوس</option>
                </select>
              </div>
            </div>
          </div>

          {/* Teacher KPI Summary Cards */}
          {teacherReport && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-indigo-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">إجمالي الكادر التعليمي</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{teacherReport.summary.total_teachers}</p>
                <p className="text-[11px] text-indigo-600 font-medium mt-1">
                  {teacherReport.summary.active_teachers} معلم على رأس العمل
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-blue-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">متوسط سنوات الخبرة</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{teacherReport.summary.avg_experience} سنة</p>
                <p className="text-[11px] text-slate-400 mt-1">كفاءة تعليمية عالية</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-emerald-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">إجمالي الحصص الأسبوعية</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{teacherReport.summary.total_weekly_hours} حصة</p>
                <p className="text-[11px] text-slate-400 mt-1">موزعة على كافة الشعب</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-purple-500 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">التخصص الأكثر كثافة</p>
                <p className="text-xl font-bold text-purple-600 mt-1">{teacherReport.summary.top_specialization}</p>
                <p className="text-[11px] text-slate-400 mt-1">تغطية تامة للمنهج</p>
              </div>
            </div>
          )}

          {/* Teacher Analytics Grid */}
          {teacherReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Specialization Distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  توزيع المعلمين حسب التخصص
                </h3>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherReport.specialization_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#475569' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="عدد المعلمين" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Experience Brackets */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  توزيع المعلمين حسب الخبرة والسنوات
                </h3>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherReport.experience_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="bracket" tick={{ fill: '#475569', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#475569' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="عدد المعلمين" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Detailed Data Table */}
          {teacherReport && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  سجل الأساتذة والكادر التدريسي التفصيلي
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">الاسم والدرجة</th>
                      <th className="p-3.5">التخصص</th>
                      <th className="p-3.5">المؤهل العلمي</th>
                      <th className="p-3.5">سنوات الخبرة</th>
                      <th className="p-3.5">الحصص الأسبوعية</th>
                      <th className="p-3.5">البريد والاتصال</th>
                      <th className="p-3.5">الحالة الوظيفية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {teacherReport.teachers.map((teacher: any) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{teacher.first_name} {teacher.last_name}</td>
                        <td className="p-3.5 font-medium text-indigo-600">{teacher.specialization}</td>
                        <td className="p-3.5">{teacher.qualification}</td>
                        <td className="p-3.5">{teacher.experience_years} سنوات</td>
                        <td className="p-3.5 font-bold">{teacher.weekly_hours} حصة/أسبوع</td>
                        <td className="p-3.5 text-xs text-slate-500">{teacher.email} <br />{teacher.phone_number}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              teacher.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {teacher.status === 'Active' ? 'نشط (على رأس العمل)' : 'في إجازة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE REPORT */}
      {activeTab === 'attendance' && attendanceReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-emerald-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">نسبة الانضباط والحضور العام</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{attendanceReport.summary.overall_attendance_pct}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-blue-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">إجمالي الحصص والسيشنز</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{attendanceReport.summary.total_recorded_sessions}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-rose-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">حالات الغياب المسجلة</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{attendanceReport.summary.absent_count}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-amber-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">حالات التأخير المسجلة</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{attendanceReport.summary.late_count}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4">مؤشر الحضور والغياب الأسبوعي</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceReport.attendance_trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Present" fill="#10b981" name="حضور" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Late" fill="#f59e0b" name="تأخير" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent" fill="#ef4444" name="غياب" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4">التوزيع الكلي لحالات الحضور</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendanceReport.status_distribution} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                      {attendanceReport.status_distribution.map((entry: any, index: number) => (
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
        </div>
      )}

      {/* TAB 4: ACADEMIC GRADES REPORT */}
      {activeTab === 'grades' && gradesReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-purple-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">المعدل العام GPA</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{gradesReport.summary.overall_gpa}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-emerald-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">نسبة النجاح العامة</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{gradesReport.summary.pass_rate_overall}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-blue-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">المادة الأعلى تحصيلاً</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{gradesReport.summary.highest_performing_subject}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-amber-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">الاختبارات المسجلة</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{gradesReport.summary.total_exams_recorded}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">تطور الأداء الأكاديمي عبر الشهور والمواد</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gradesReport.grade_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="الرياضيات" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="العلوم" stroke="#10b981" strokeWidth={3} />
                  <Line type="monotone" dataKey="اللغة العربية" stroke="#8b5cf6" strokeWidth={3} />
                  <Line type="monotone" dataKey="الإنجليزي" stroke="#f59e0b" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL REPORT */}
      {activeTab === 'finance' && financeReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-blue-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">إجمالي الفواتير الصادرة</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{financeReport.summary.total_invoiced.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-emerald-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">الإيرادات المحصلة</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{financeReport.summary.total_collected.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-amber-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">الرسوم المعلقة</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{financeReport.summary.total_pending.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-rose-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">المتأخرات غير المسددة</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{financeReport.summary.total_overdue.toLocaleString()} ر.س</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4">الإيرادات المحصلة مقابل الرسوم المعلقة شهرياً</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeReport.monthly_revenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="collected" fill="#10b981" name="المحصل (ر.س)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="#f59e0b" name="المعلق (ر.س)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4">نسبة توزيع حالة التحصيل</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={financeReport.payment_status} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                      {financeReport.payment_status.map((entry: any, index: number) => (
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
        </div>
      )}

      {/* PRINT / PREVIEW REPORT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6 dir-rtl text-right print:p-0 print:shadow-none">
            {/* Action Bar (hidden during print) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                معاينة التقرير الرسمي للطباعة والتصدير
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" /> أمر الطباعة مباشرة
                </button>
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    setSelectedStudentForCard(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Printable Content Frame */}
            <div className="p-6 border border-slate-200 rounded-xl space-y-6 bg-white">
              {/* Report Official Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">مدرسة الذكاء المستقبلية الأهلية</h1>
                  <p className="text-sm font-semibold text-slate-600">Smart Future Academy - SSMS Reports</p>
                  <p className="text-xs text-slate-400 mt-1">تاريخ الاستخراج: {new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="text-left border-r-2 border-slate-200 pr-4">
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
                    تقرير رسمــي معتمـد
                  </span>
                </div>
              </div>

              {/* Report Body */}
              {selectedStudentForCard ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 rounded text-center">
                    بطاقة كشف درجات وحضور طالب
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                    <p><strong>اسم الطالب:</strong> {selectedStudentForCard.first_name} {selectedStudentForCard.last_name}</p>
                    <p><strong>رقم الهوية:</strong> {selectedStudentForCard.national_id}</p>
                    <p><strong>الصف والفرع:</strong> {selectedStudentForCard.class_name} ({selectedStudentForCard.section_name})</p>
                    <p><strong>الجنس:</strong> {selectedStudentForCard.gender === 'Male' ? 'ذكر' : 'أنثى'}</p>
                    <p><strong>معدل درجات الطالب:</strong> <span className="text-blue-700 font-bold">{selectedStudentForCard.gpa}%</span></p>
                    <p><strong>نسبة الحضور:</strong> <span className="text-emerald-700 font-bold">{selectedStudentForCard.attendance_pct}%</span></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 bg-slate-100 p-2 rounded text-center">
                    {activeTab === 'students' && 'ملخص التقرير الشامل لطلاب المدرسة'}
                    {activeTab === 'teachers' && 'ملخص التقرير الشامل لكادر الأساتذة والمعلمين'}
                    {activeTab === 'attendance' && 'ملخص تقرير الانضباط والحضور والغياب'}
                    {activeTab === 'grades' && 'ملخص التقرير الأكاديمي والتحصيل العلمي'}
                    {activeTab === 'finance' && 'ملخص التقرير المالي والإيرادات المسددة'}
                  </h2>

                  {/* Summary Table */}
                  {activeTab === 'students' && studentReport && (
                    <table className="w-full text-sm text-right border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-2">اسم الطالب</th>
                          <th className="border border-slate-300 p-2">الصف والشعبة</th>
                          <th className="border border-slate-300 p-2">نسبة الحضور</th>
                          <th className="border border-slate-300 p-2">المعدل الأكاديمي</th>
                          <th className="border border-slate-300 p-2">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentReport.students.map((s: any) => (
                          <tr key={s.id}>
                            <td className="border border-slate-300 p-2 font-bold">{s.first_name} {s.last_name}</td>
                            <td className="border border-slate-300 p-2">{s.class_name} ({s.section_name})</td>
                            <td className="border border-slate-300 p-2">{s.attendance_pct}%</td>
                            <td className="border border-slate-300 p-2 font-bold">{s.gpa}%</td>
                            <td className="border border-slate-300 p-2">{s.status === 'Active' ? 'منتظم' : 'في خطر'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'teachers' && teacherReport && (
                    <table className="w-full text-sm text-right border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-2">اسم الأستاذ</th>
                          <th className="border border-slate-300 p-2">التخصص</th>
                          <th className="border border-slate-300 p-2">المؤهل</th>
                          <th className="border border-slate-300 p-2">الخبرة</th>
                          <th className="border border-slate-300 p-2">الحصص</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherReport.teachers.map((t: any) => (
                          <tr key={t.id}>
                            <td className="border border-slate-300 p-2 font-bold">{t.first_name} {t.last_name}</td>
                            <td className="border border-slate-300 p-2">{t.specialization}</td>
                            <td className="border border-slate-300 p-2">{t.qualification}</td>
                            <td className="border border-slate-300 p-2">{t.experience_years} سنوات</td>
                            <td className="border border-slate-300 p-2 font-bold">{t.weekly_hours} حصة</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Official Signatures Footer */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm font-bold text-slate-700">
                <div>
                  <p>مدير قسم التقارير والجودة</p>
                  <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p>اعتماد مدير المدرسة</p>
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

export default ReportsView;
