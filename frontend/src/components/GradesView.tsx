import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Search, Loader2, X, Plus, Award, Clock, MapPin } from 'lucide-react';
import client from '../api/client';

const GradesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'grades'>('exams');
  
  // Data States
  const [exams, setExams] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [newExam, setNewExam] = useState({
    title: '',
    subject_id: '',
    section_id: '',
    exam_type_id: '',
    exam_date: new Date().toISOString().split('T')[0],
    start_time: '09:00 AM',
    end_time: '11:00 AM',
    max_marks: 100,
    room: 'Hall A'
  });

  const [newGrade, setNewGrade] = useState({
    student_id: '',
    subject_id: '',
    exam_type_id: '',
    score: '',
    max_score: 100
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [examsRes, gradesRes, studentsRes, subjectsRes, sectionsRes, typesRes] = await Promise.all([
        client.get('/grades/exams'),
        client.get('/grades/'),
        client.get('/students/'),
        client.get('/academics/subjects'),
        client.get('/academics/sections'),
        client.get('/grades/exam-types')
      ]);

      if (examsRes.data?.status === 'success') setExams(examsRes.data.data);
      if (gradesRes.data?.status === 'success') setGrades(gradesRes.data.data);
      if (studentsRes.data?.status === 'success') setStudents(studentsRes.data.data);
      if (subjectsRes.data?.status === 'success') setSubjects(subjectsRes.data.data);
      if (sectionsRes.data?.status === 'success') setSections(sectionsRes.data.data);
      if (typesRes.data?.status === 'success') setExamTypes(typesRes.data.data);
    } catch (err) {
      console.error("Failed to fetch exam and grade data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/grades/exams', {
        title: newExam.title,
        subject_id: parseInt(newExam.subject_id),
        section_id: newExam.section_id ? parseInt(newExam.section_id) : null,
        exam_type_id: parseInt(newExam.exam_type_id),
        exam_date: newExam.exam_date,
        start_time: newExam.start_time,
        end_time: newExam.end_time,
        max_marks: Number(newExam.max_marks),
        room: newExam.room
      });
      setIsExamModalOpen(false);
      setNewExam({
        title: '',
        subject_id: '',
        section_id: '',
        exam_type_id: '',
        exam_date: new Date().toISOString().split('T')[0],
        start_time: '09:00 AM',
        end_time: '11:00 AM',
        max_marks: 100,
        room: 'Hall A'
      });
      fetchAllData();
    } catch (err) {
      console.error("Failed to schedule exam", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/grades/', {
        student_id: parseInt(newGrade.student_id),
        subject_id: parseInt(newGrade.subject_id),
        exam_type_id: parseInt(newGrade.exam_type_id),
        score: parseFloat(newGrade.score),
        max_score: Number(newGrade.max_score)
      });
      setIsGradeModalOpen(false);
      setNewGrade({ student_id: '', subject_id: '', exam_type_id: '', score: '', max_score: 100 });
      fetchAllData();
    } catch (err) {
      console.error("Failed to record grade", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExams = exams.filter((e: any) =>
    (e.title && e.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.subject_name && e.subject_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGrades = grades.filter((g: any) =>
    (g.student_name && g.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (g.subject_name && g.subject_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center">
            <Award className="w-7 h-7 mr-2.5 text-emerald-600 shrink-0" />
            Exams & Grades Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">Schedule examination timetables and record student grade book marks.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'exams' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Exam Schedules</span>
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'grades' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Student Grade Book</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="card p-0 overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'exams' ? "Search exam schedules..." : "Search grades by student or subject..."}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            {activeTab === 'exams' ? (
              <button 
                onClick={() => setIsExamModalOpen(true)}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-md text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Schedule New Exam
              </button>
            ) : (
              <button 
                onClick={() => setIsGradeModalOpen(true)}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-md text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Record Student Grade
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Exam Schedules Table */}
        {activeTab === 'exams' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                    <th className="px-6 py-4 font-semibold">Exam Title</th>
                    <th className="px-6 py-4 font-semibold">Subject & Type</th>
                    <th className="px-6 py-4 font-semibold">Section / Class</th>
                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                    <th className="px-6 py-4 font-semibold">Room</th>
                    <th className="px-6 py-4 font-semibold">Max Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExams.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{e.title}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-xs">{e.subject_name}</div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-block mt-0.5">
                          {e.exam_type_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                        {e.section_name}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 space-y-1">
                        <div className="font-semibold text-slate-800 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {e.exam_date}
                        </div>
                        <div className="text-slate-500 flex items-center text-[11px]">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {e.start_time} - {e.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span className="inline-flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {e.room}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 text-sm">
                        {e.max_marks} pts
                      </td>
                    </tr>
                  ))}
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                        No upcoming exams scheduled. Click "Schedule New Exam" to set examination dates.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Grade Book Table */}
        {activeTab === 'grades' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                    <th className="px-6 py-4 font-semibold">Student Name</th>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">Exam Type</th>
                    <th className="px-6 py-4 font-semibold">Score</th>
                    <th className="px-6 py-4 font-semibold">Grade Letter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrades.map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{g.student_name}</td>
                      <td className="px-6 py-4 font-medium text-slate-700 text-xs">{g.subject_name}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                          {g.exam_type_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-800">
                        {g.score} <span className="text-slate-400 text-xs font-normal">/ {g.max_score}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                          g.grade_letter?.startsWith('A') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          g.grade_letter?.startsWith('B') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          g.grade_letter?.startsWith('C') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {g.grade_letter || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredGrades.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                        No student grade marks recorded yet. Click "Record Student Grade" to enter scores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal 1: Schedule New Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                Schedule New Exam
              </h3>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Mathematics Midterm Exam" 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                  value={newExam.title} 
                  onChange={(e) => setNewExam({...newExam, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newExam.subject_id} 
                    onChange={(e) => setNewExam({...newExam, subject_id: e.target.value})}
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newExam.exam_type_id} 
                    onChange={(e) => setNewExam({...newExam, exam_type_id: e.target.value})}
                  >
                    <option value="">Select Exam Type...</option>
                    {examTypes.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section / Class</label>
                  <select 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newExam.section_id} 
                    onChange={(e) => setNewExam({...newExam, section_id: e.target.value})}
                  >
                    <option value="">All Sections</option>
                    {sections.map((sec: any) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newExam.exam_date} 
                    onChange={(e) => setNewExam({...newExam, exam_date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input 
                    type="text" 
                    placeholder="09:00 AM" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newExam.start_time} 
                    onChange={(e) => setNewExam({...newExam, start_time: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input 
                    type="text" 
                    placeholder="11:00 AM" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newExam.end_time} 
                    onChange={(e) => setNewExam({...newExam, end_time: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Hall</label>
                  <input 
                    type="text" 
                    placeholder="Hall 1" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newExam.room} 
                    onChange={(e) => setNewExam({...newExam, room: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Student Grade Modal */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
                Record Student Grade
              </h3>
              <button onClick={() => setIsGradeModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                <select 
                  required 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                  value={newGrade.student_id} 
                  onChange={(e) => setNewGrade({...newGrade, student_id: e.target.value})}
                >
                  <option value="">Select Student...</option>
                  {students.map((st: any) => (
                    <option key={st.id} value={st.id}>{st.first_name} {st.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newGrade.subject_id} 
                    onChange={(e) => setNewGrade({...newGrade, subject_id: e.target.value})}
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Category *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newGrade.exam_type_id} 
                    onChange={(e) => setNewGrade({...newGrade, exam_type_id: e.target.value})}
                  >
                    <option value="">Select Exam Category...</option>
                    {examTypes.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Score Obtained *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    required 
                    placeholder="e.g. 88.5"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newGrade.score} 
                    onChange={(e) => setNewGrade({...newGrade, score: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Score</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newGrade.max_score} 
                    onChange={(e) => setNewGrade({...newGrade, max_score: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsGradeModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Student Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesView;
