import React, { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, AlertTriangle, Sparkles, Loader2, BookOpen, X, Search, ShieldAlert } from 'lucide-react';
import StudentTable from './StudentTable';
import client from '../api/client';

const DashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState({
    total_students: 0,
    attendance_percentage: 0,
    ai_warnings: 0,
    total_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiWarnings, setAiWarnings] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

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

  const handleOpenAIModal = async () => {
    setIsAIModalOpen(true);
    setLoadingAI(true);
    try {
      const res = await client.get('/dashboard/ai-warnings');
      if (res.data?.status === 'success') {
        setAiWarnings(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch AI warnings", err);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Students</p>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : (
              <p className="text-2xl font-extrabold text-slate-800">{metrics.total_students}</p>
            )}
          </div>
        </div>
        
        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Attendance</p>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : (
              <p className="text-2xl font-extrabold text-slate-800">{metrics.attendance_percentage}%</p>
            )}
          </div>
        </div>

        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue Collected</p>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : (
              <p className="text-2xl font-extrabold text-slate-800">${metrics.total_revenue.toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="card p-6 flex items-center space-x-4 hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Academic Warnings</p>
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400 mt-1" /> : (
              <p className="text-2xl font-extrabold text-slate-800">{metrics.ai_warnings}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Table) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-0 flex flex-col overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-extrabold text-slate-800">Recent Student Directory</h2>
              <span className="text-xs font-medium text-slate-500">Active Academic Session</span>
            </div>
            <div className="p-0">
              <StudentTable />
            </div>
          </div>
        </div>

        {/* Right Column (AI Widget & Timetable Snippet) */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="card p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white relative overflow-hidden rounded-2xl border border-slate-800 shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <h3 className="font-extrabold text-lg text-emerald-300">Gemini AI Insights</h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Gemini AI continuously monitors grade trajectories and attendance anomalies to generate early warning interventions for struggling students.
            </p>
            <button 
              onClick={handleOpenAIModal}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Review Interventions ({metrics.ai_warnings})</span>
            </button>
          </div>

          {/* User Guide Card */}
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">System User Guide</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Learn how to navigate the Smart School System, manage academic sections, and utilize AI insights.
            </p>
            <button 
              onClick={() => setIsUserGuideOpen(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Open Documentation Guide
            </button>
          </div>

          {/* Quick Timetable Widget */}
          <div className="card p-6 border border-slate-200/80 rounded-2xl">
            <h3 className="font-extrabold text-slate-800 mb-4 text-base">Today's Class Schedule</h3>
            <div className="space-y-3">
              {[
                { time: '09:00 AM', subject: 'Mathematics', class: 'Grade 10-A' },
                { time: '10:00 AM', subject: 'Physics', class: 'Grade 11-B' },
                { time: '11:30 AM', subject: 'History', class: 'Grade 9-C' },
              ].map((slot, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="px-2.5 py-1.5 bg-slate-100 rounded-lg text-center min-w-[75px]">
                    <span className="text-xs font-bold text-slate-700">{slot.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-xs">{slot.subject}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{slot.class}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Warnings Interventions Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-emerald-600" />
                  Gemini AI Interventions & Warnings
                </h3>
                <p className="text-xs text-slate-500 mt-1">Students requiring academic attention or attendance intervention based on AI analysis.</p>
              </div>
              <button 
                onClick={() => setIsAIModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingAI ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : aiWarnings.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <ShieldAlert className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 text-sm">No Active Student Interventions Needed</p>
                <p className="text-xs text-slate-400 mt-1">All enrolled students are performing within standard thresholds.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiWarnings.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 text-sm">{item.student_name}</span>
                      <span className="text-[11px] font-semibold text-slate-400">{item.created_at || 'Recent'}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium"><strong>Observation:</strong> {item.note}</p>
                    {item.advice && (
                      <div className="p-3 bg-white rounded-xl border border-amber-200/60 text-xs text-emerald-800 space-y-1">
                        <span className="font-bold block text-emerald-900">🤖 Gemini Recommended Action:</span>
                        <span>{item.advice}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsAIModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Guide Modal */}
      {isUserGuideOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800">System Navigation & User Guide</h2>
              </div>
              <button 
                onClick={() => setIsUserGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2 border-b pb-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span>1. Student & Staff Directory Management</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use the directory search bar to filter students and teachers by name, email, or national ID. Use the action menu (...) on table rows to view or modify profile records.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2 border-b pb-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>2. Gemini AI Insights & Interventions</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The system automatically evaluates attendance patterns and grade trends. Click the AI star icons in student rows to generate real-time AI performance summaries and recommendations.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2 border-b pb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>3. Class Sections & Academic Structure</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage class levels (e.g. Grade 10) and sections (e.g. 10-A, 10-B) in the Academics tab to properly assign enrolled students and timetables.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsUserGuideOpen(false)}
                className="btn-primary px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
