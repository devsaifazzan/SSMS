import React, { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, AlertTriangle, Sparkles, Loader2, BookOpen, X, Search, MoreVertical } from 'lucide-react';
import StudentTable from './StudentTable';
import client from '../api/client';

const DashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    total_students: 0,
    attendance_percentage: 0,
    ai_warnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await client.get('/dashboard/metrics');
        if (response.data && response.data.status === 'success') {
          setMetrics(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Students</p>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : (
              <p className="text-2xl font-bold text-slate-800">{metrics.total_students}</p>
            )}
          </div>
        </div>
        
        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-ssms-primary/20 text-[#6a9e22] rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today's Attendance</p>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : (
              <p className="text-2xl font-bold text-slate-800">{metrics.attendance_percentage}%</p>
            )}
          </div>
        </div>

        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-ssms-secondary/20 text-[#d16c19] rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Revenue Collected</p>
            <p className="text-2xl font-bold text-slate-800">$124,500</p>
          </div>
        </div>

        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">AI Academic Warnings</p>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : (
              <p className="text-2xl font-bold text-slate-800">{metrics.ai_warnings}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Table) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-0 flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Recent Student Activity</h2>
              <button className="btn-primary flex items-center text-sm">
                View All
              </button>
            </div>
            <div className="p-0">
              <StudentTable />
            </div>
          </div>
        </div>

        {/* Right Column (AI Widget & Timetable Snippet) */}
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-ssms-primary rounded-full opacity-20 blur-2xl"></div>
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-5 h-5 text-ssms-primary" />
              <h3 className="font-bold text-lg">AI Insights Widget</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Gemini has detected potential improvement areas for 12 students based on recent midterm scores and attendance trends.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
              Review Interventions
            </button>
          </div>

          {/* User Guide Card */}
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">دليل المستخدم</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 font-arabic">
              تعرف على كيفية استخدام النظام والاستفادة من ميزات الذكاء الاصطناعي.
            </p>
            <button 
              onClick={() => setIsUserGuideOpen(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm font-arabic"
            >
              عرض الدليل
            </button>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Timetable</h3>
            <div className="space-y-4">
              {[
                { time: '09:00 AM', subject: 'Mathematics', class: 'Grade 10-A' },
                { time: '10:00 AM', subject: 'Physics', class: 'Grade 11-B' },
                { time: '11:30 AM', subject: 'History', class: 'Grade 9-C' },
              ].map((slot, i) => (
                <div key={i} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex flex-col items-center min-w-[70px]">
                    <span className="text-xs font-bold text-slate-500">{slot.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{slot.subject}</p>
                    <p className="text-xs text-slate-500">{slot.class}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Guide Modal */}
      {isUserGuideOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50" dir="rtl">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 font-arabic">دليل استخدام النظام</h2>
              </div>
              <button 
                onClick={() => setIsUserGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" dir="rtl">
              <div className="space-y-8 font-arabic">
                
                {/* Section 1 */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 space-x-reverse mb-3 border-b pb-2">
                    <Search className="w-5 h-5 text-blue-500" />
                    <span>البحث وإدارة الطلاب</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    يمكنك البحث عن أي طالب باستخدام شريط البحث أعلى الجدول. للعثور على طالب معين، ابدأ بكتابة اسمه الأول أو الأخير وسيقوم النظام بفلترة النتائج فوراً.
                  </p>
                  <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 flex items-start space-x-3 space-x-reverse">
                    <MoreVertical className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>انقر على أيقونة (النقاط الثلاث) بجانب اسم الطالب لعرض خيارات إضافية مثل: عرض التفاصيل، تعديل الملف الشخصي، أو حذف السجل.</span>
                  </div>
                </section>

                {/* Section 2 */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 space-x-reverse mb-3 border-b pb-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span>الرؤى المدعومة بالذكاء الاصطناعي (AI Insights)</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-3">
                    يقوم النظام بتحليل أداء الطلاب باستخدام تقنيات الذكاء الاصطناعي لتوفير ملخصات وتوصيات مخصصة لكل طالب.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 marker:text-purple-400">
                    <li>في جدول الطلاب، انقر على أيقونة <strong>النجوم</strong> بجانب اسم الطالب.</li>
                    <li>انتظر قليلاً حتى يقوم المساعد الذكي بتحليل البيانات (الدرجات، الحضور، إلخ).</li>
                    <li>ستظهر لك نافذة منبثقة تحتوي على ملخص لأداء الطالب ونصائح لتحسين مستواه.</li>
                  </ul>
                </section>

                {/* Section 3 */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 space-x-reverse mb-3 border-b pb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>تنبيهات النظام</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    يعرض قسم <strong>الإنذارات الأكاديمية (AI Academic Warnings)</strong> في أعلى لوحة التحكم عدد الطلاب الذين يحتاجون إلى انتباه فوري بناءً على انخفاض ملحوظ في درجاتهم أو غيابهم المتكرر.
                  </p>
                </section>

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsUserGuideOpen(false)}
                className="btn-primary font-arabic"
              >
                فهمت ذلك
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
