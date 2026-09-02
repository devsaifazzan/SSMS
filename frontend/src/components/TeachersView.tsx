import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, X, Mail, Phone, BookOpen, UserCheck } from 'lucide-react';
import client from '../api/client';

const TeachersView: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newTeacher, setNewTeacher] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    gender: 'Male',
    national_id: '',
    specialization: 'Mathematics',
    qualification: "Bachelor's Degree",
    experience_years: 1,
    address: '',
    status: 'Active',
    hire_date: new Date().toISOString().split('T')[0]
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await client.get('/academics/teachers');
      if (res.data?.status === 'success') {
        setTeachers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/academics/teachers', {
        ...newTeacher,
        experience_years: Number(newTeacher.experience_years)
      });
      setIsModalOpen(false);
      setNewTeacher({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        gender: 'Male',
        national_id: '',
        specialization: 'Mathematics',
        qualification: "Bachelor's Degree",
        experience_years: 1,
        address: '',
        status: 'Active',
        hire_date: new Date().toISOString().split('T')[0]
      });
      fetchTeachers();
    } catch (err) {
      console.error("Failed to add teacher", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t: any) => 
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center">
            <Users className="w-7 h-7 mr-2.5 text-emerald-600 shrink-0" />
            Teachers Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage teaching staff profiles, academic qualifications, and contact information.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white font-semibold py-2.5 px-5 rounded-xl transition-all"
        >
          + Add New Teacher
        </button>
      </div>

      {/* Directory Card */}
      <div className="card p-0 overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, subject, or email..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">Total Teachers: {teachers.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                  <th className="px-6 py-4 font-semibold">Teacher Name</th>
                  <th className="px-6 py-4 font-semibold">Specialization</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Qualification</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Hire Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{t.first_name} {t.last_name}</div>
                      {t.national_id && <div className="text-xs text-slate-400">ID: {t.national_id}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center">
                        <BookOpen className="w-3 h-3 mr-1 text-emerald-600" />
                        {t.specialization || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 space-y-1">
                      {t.email && (
                        <div className="flex items-center text-slate-600">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                          <span>{t.email}</span>
                        </div>
                      )}
                      {t.phone_number && (
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                          <span>{t.phone_number}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="font-medium text-xs">{t.qualification || "Bachelor's Degree"}</div>
                      <div className="text-xs text-slate-400">{t.experience_years || 0} yrs exp.</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${t.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'}`}>
                        {t.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {t.hire_date || 'N/A'}
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No teachers found. Click "Add New Teacher" to register staff.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Comprehensive Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center">
                  <UserCheck className="w-6 h-6 mr-2 text-emerald-600" />
                  Add New Teacher Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter complete personal, contact, and academic details for the staff profile.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-6">
              {/* Section 1: Personal Details */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">1. Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.first_name}
                      onChange={(e) => setNewTeacher({...newTeacher, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Doe"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.last_name}
                      onChange={(e) => setNewTeacher({...newTeacher, last_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                      value={newTeacher.gender}
                      onChange={(e) => setNewTeacher({...newTeacher, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">National ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1029384756"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.national_id}
                      onChange={(e) => setNewTeacher({...newTeacher, national_id: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Info */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">2. Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. teacher@school.edu"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +1 555 123 4567"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.phone_number}
                      onChange={(e) => setNewTeacher({...newTeacher, phone_number: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Building 12, Main Street, City"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={newTeacher.address}
                    onChange={(e) => setNewTeacher({...newTeacher, address: e.target.value})}
                  />
                </div>
              </div>

              {/* Section 3: Professional & Employment Info */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">3. Professional & Employment Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization / Subject</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mathematics, Science, English"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.specialization}
                      onChange={(e) => setNewTeacher({...newTeacher, specialization: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                    <select 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                      value={newTeacher.qualification}
                      onChange={(e) => setNewTeacher({...newTeacher, qualification: e.target.value})}
                    >
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="PhD / Doctorate">PhD / Doctorate</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.experience_years}
                      onChange={(e) => setNewTeacher({...newTeacher, experience_years: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hire Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      value={newTeacher.hire_date}
                      onChange={(e) => setNewTeacher({...newTeacher, hire_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-md text-white font-semibold py-2.5 px-6 rounded-xl flex items-center text-sm transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersView;
