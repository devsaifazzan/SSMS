import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, MoreVertical, Loader2, X } from 'lucide-react';
import client from '../api/client';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  enrollment_date: string;
  user_id: number;
  status?: string;
}

const StudentTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiNote, setAiNote] = useState<{title: string, content: string} | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [viewDetailsStudent, setViewDetailsStudent] = useState<any>(null);
  const [editProfileStudent, setEditProfileStudent] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await client.get('/students');
      if (response.data && response.data.status === 'success') {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    client.get('/academics/academic_years').then(res => {
      if (res.data?.status === 'success') setAcademicYears(res.data.data);
    });
    client.get('/academics/sections').then(res => {
      if (res.data?.status === 'success') setSections(res.data.data);
    });
  }, []);

  const handleViewDetails = async (id: number) => {
    setOpenDropdownId(null);
    setActionLoading(true);
    setStudentEnrollments([]);
    try {
      const response = await client.get(`/students/${id}`);
      if (response.data?.status === 'success') {
        setViewDetailsStudent(response.data.data);
      }
      const enrollRes = await client.get(`/academics/enrollments/student/${id}`);
      if (enrollRes.data?.status === 'success') {
        setStudentEnrollments(enrollRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load student details", err);
      alert("Failed to load student details");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProfile = async (id: number) => {
    setOpenDropdownId(null);
    setActionLoading(true);
    setSelectedAcademicYearId('');
    setSelectedSectionId('');
    try {
      const response = await client.get(`/students/${id}`);
      if (response.data?.status === 'success') {
        setEditProfileStudent(response.data.data);
      }
      const enrollRes = await client.get(`/academics/enrollments/student/${id}`);
      if (enrollRes.data?.status === 'success') {
        const enrolls = enrollRes.data.data;
        if (enrolls && enrolls.length > 0) {
          // Pre-populate with the latest enrollment
          const latest = enrolls[enrolls.length - 1];
          setSelectedAcademicYearId(latest.academic_year_id.toString());
          setSelectedSectionId(latest.section_id.toString());
        }
      }
    } catch (err) {
      console.error("Failed to load student details", err);
      alert("Failed to load student details");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    setOpenDropdownId(null);
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await client.delete(`/students/${id}`);
      if (response.data?.status === 'success') {
        fetchStudents();
      }
    } catch (err) {
      console.error("Failed to delete student", err);
      alert("Failed to delete student");
    }
  };

  const submitEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await client.put(`/students/${editProfileStudent.id}`, {
        first_name: editProfileStudent.first_name,
        last_name: editProfileStudent.last_name,
        date_of_birth: editProfileStudent.date_of_birth || null,
        gender: editProfileStudent.gender || null,
        blood_type: editProfileStudent.blood_type || null,
        national_id: editProfileStudent.national_id || null,
        address: editProfileStudent.address || null,
        phone_number: editProfileStudent.phone_number || null,
        medical_conditions: editProfileStudent.medical_conditions || null,
        status: editProfileStudent.status || 'Active'
      });

      if (selectedAcademicYearId && selectedSectionId) {
        await client.post('/academics/enrollments', {
          student_id: editProfileStudent.id,
          academic_year_id: parseInt(selectedAcademicYearId),
          section_id: parseInt(selectedSectionId)
        }).catch(err => console.error("Enrollment error (maybe already enrolled):", err));
      }

      setEditProfileStudent(null);
      fetchStudents();
    } catch (err) {
      console.error("Failed to update student", err);
      alert("Failed to update student");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInsight = async (studentId: number, name: string) => {
    setGenerating(studentId);
    try {
      const response = await client.post(`/students/${studentId}/ai-insights`);
      if (response.data?.status === 'success') {
        setAiNote({
          title: `AI Insight for ${name}`,
          content: response.data.data.note_content
        });
      }
    } catch (err) {
      console.error("Failed to generate insight", err);
      alert("Failed to generate AI insight.");
    } finally {
      setGenerating(null);
    }
  };

  const filteredData = students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="p-4 flex justify-between items-center border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Enrollment Date</th>
                <th className="px-6 py-4 font-semibold">Academic Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{student.first_name} {student.last_name}</div>
                    <div className="text-xs text-slate-400">ID: STU-{student.id.toString().padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{student.enrollment_date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'Graduated'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : student.status === 'Suspended'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : student.status === 'Transferred'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : student.status === 'Withdrawn'
                          ? 'bg-slate-200 text-slate-700 border border-slate-300'
                          : student.status === 'At Risk'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center space-x-2 opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleGenerateInsight(student.id, `${student.first_name} ${student.last_name}`)}
                        disabled={generating === student.id}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded flex items-center space-x-1" 
                        title="AI Generate Summary"
                      >
                        {generating === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                      <div className="relative" ref={openDropdownId === student.id ? dropdownRef : null}>
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === student.id ? null : student.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdownId === student.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                            <button onClick={() => handleViewDetails(student.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">View Details</button>
                            <button onClick={() => handleEditProfile(student.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Edit Profile</button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => handleDeleteStudent(student.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Delete Student</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && filteredData.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-sm">
          No students found.
        </div>
      )}

      {/* AI Insight Modal */}
      {aiNote && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Sparkles className="w-5 h-5"/></div>
              <h3 className="text-lg font-bold text-slate-800">{aiNote.title}</h3>
              <button onClick={() => setAiNote(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="prose prose-sm text-slate-600 whitespace-pre-wrap mt-4">
              {aiNote.content}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setAiNote(null)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">Student Details</h3>
              <button onClick={() => setViewDetailsStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div><span className="font-semibold text-slate-600">First Name:</span> {viewDetailsStudent.first_name}</div>
              <div><span className="font-semibold text-slate-600">Last Name:</span> {viewDetailsStudent.last_name}</div>
              <div><span className="font-semibold text-slate-600">Date of Birth:</span> {viewDetailsStudent.date_of_birth || 'N/A'}</div>
              <div><span className="font-semibold text-slate-600">Gender:</span> {viewDetailsStudent.gender || 'N/A'}</div>
              <div><span className="font-semibold text-slate-600">National ID:</span> {viewDetailsStudent.national_id || 'N/A'}</div>
              <div><span className="font-semibold text-slate-600">Blood Type:</span> {viewDetailsStudent.blood_type || 'N/A'}</div>
              <div><span className="font-semibold text-slate-600">Phone Number:</span> {viewDetailsStudent.phone_number || 'N/A'}</div>
              <div><span className="font-semibold text-slate-600">Enrollment Date:</span> {viewDetailsStudent.enrollment_date || 'N/A'}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-600">Address:</span> {viewDetailsStudent.address || 'N/A'}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-600">Medical Conditions:</span> {viewDetailsStudent.medical_conditions || 'N/A'}</div>
              
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Enrollment History</h4>
                {studentEnrollments.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {studentEnrollments.map((enr: any, idx: number) => (
                      <li key={idx}>
                        Enrolled in Academic Year ID: <span className="font-medium">{enr.academic_year_id}</span>, Section ID: <span className="font-medium">{enr.section_id}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-500 italic">No enrollments found.</span>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewDetailsStudent(null)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">Edit Student Profile</h3>
              <button onClick={() => setEditProfileStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitEditProfile} className="space-y-4">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200">
                <label className="block text-xs font-bold text-blue-900 mb-1">Academic / Enrollment Status *</label>
                <select
                  value={editProfileStudent.status || 'Active'}
                  onChange={e => setEditProfileStudent({...editProfileStudent, status: e.target.value})}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900"
                >
                  <option value="Active">Active (منتظم)</option>
                  <option value="Graduated">Graduated (متخرج)</option>
                  <option value="Suspended">Suspended (موقوف مؤقتاً)</option>
                  <option value="Transferred">Transferred (منتقل)</option>
                  <option value="Withdrawn">Withdrawn (منسحب / طارد)</option>
                  <option value="At Risk">At Risk (في خطر أكاديمي)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input required type="text" value={editProfileStudent.first_name || ''} onChange={e => setEditProfileStudent({...editProfileStudent, first_name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input required type="text" value={editProfileStudent.last_name || ''} onChange={e => setEditProfileStudent({...editProfileStudent, last_name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input type="date" value={editProfileStudent.date_of_birth || ''} onChange={e => setEditProfileStudent({...editProfileStudent, date_of_birth: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select value={editProfileStudent.gender || ''} onChange={e => setEditProfileStudent({...editProfileStudent, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">National ID</label>
                  <input type="text" value={editProfileStudent.national_id || ''} onChange={e => setEditProfileStudent({...editProfileStudent, national_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
                  <select value={editProfileStudent.blood_type || ''} onChange={e => setEditProfileStudent({...editProfileStudent, blood_type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="text" value={editProfileStudent.phone_number || ''} onChange={e => setEditProfileStudent({...editProfileStudent, phone_number: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea value={editProfileStudent.address || ''} onChange={e => setEditProfileStudent({...editProfileStudent, address: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medical Conditions</label>
                  <textarea value={editProfileStudent.medical_conditions || ''} onChange={e => setEditProfileStudent({...editProfileStudent, medical_conditions: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Enroll Student (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                    <select value={selectedAcademicYearId} onChange={e => setSelectedAcademicYearId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Academic Year...</option>
                      {academicYears.map((y: any) => (
                        <option key={y.id} value={y.id}>{y.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section / Class</label>
                    <select value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Section...</option>
                      {sections.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditProfileStudent(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-primary flex items-center">
                  {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
