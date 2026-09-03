import React, { useState } from 'react';
import StudentTable from './StudentTable';
import { UserPlus, X, Loader2 } from 'lucide-react';
import client from '../api/client';

const StudentsView: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  
  // New State for Enrollment
  const [academicYears, setAcademicYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (showModal) {
      client.get('/academics/academic_years').then(res => {
        if (res.data?.status === 'success') setAcademicYears(res.data.data);
      });
      client.get('/academics/sections').then(res => {
        if (res.data?.status === 'success') setSections(res.data.data);
      });
    }
  }, [showModal]);

  const formatErrorMsg = (err: any): string => {
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response) {
      return "تعذر الاتصال بالخادم (Network Error). إذا كنت تستخدم Vercel، يرجى التأكد من تشغيل خادم الباك إند وتعيين VITE_API_BASE_URL في إعدادات Vercel Environment Variables.";
    }
    const detail = err.response?.data?.detail || err.response?.data?.error;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: any) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join(', ');
    }
    if (typeof detail === 'object' && detail !== null) {
      return JSON.stringify(detail);
    }
    return err.message || "Failed to create student";
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create User Account
      const userRes = await client.post('/auth/register', {
        username,
        email,
        password,
        role_id: 3 // Student Role
      });
      
      const userId = userRes.data?.data?.id || userRes.data?.id;
      if (!userId) {
        throw new Error("User registration failed: User ID missing in response.");
      }

      // 2. Create Student Profile
      const studentRes = await client.post('/students/', {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        enrollment_date: enrollmentDate,
        gender: gender || null,
        blood_type: bloodType || null,
        national_id: nationalId || null,
        address: address || null,
        phone_number: phoneNumber || null,
        medical_conditions: medicalConditions || null,
        status: 'Active',
        user_id: userId
      });
      
      const studentId = studentRes.data?.data?.id || studentRes.data?.id;

      // 3. Create Enrollment if year and section are selected
      if (selectedAcademicYearId && selectedSectionId && studentId) {
        await client.post('/academics/enrollments', {
          student_id: studentId,
          academic_year_id: parseInt(selectedAcademicYearId),
          section_id: parseInt(selectedSectionId)
        }).catch(err => console.error("Enrollment error (non-fatal):", err));
      }

      setShowModal(false);
      setRefreshKey(old => old + 1);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setDateOfBirth('');
      setEnrollmentDate(new Date().toISOString().split('T')[0]);
      setGender('');
      setBloodType('');
      setNationalId('');
      setAddress('');
      setPhoneNumber('');
      setMedicalConditions('');
      setSelectedAcademicYearId('');
      setSelectedSectionId('');
    } catch (err: any) {
      console.error("Error creating student:", err);
      setError(formatErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Student Directory</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>
      
      <div className="card p-0">
        <StudentTable key={refreshKey} />
      </div>

      {/* Spacious & Professional Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center">
                  <UserPlus className="w-6 h-6 mr-2.5 text-emerald-600 shrink-0" />
                  Add New Student
                </h3>
                <p className="text-xs text-slate-500 mt-1">Fill in complete account, personal, academic enrollment, and health details for the student.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-6">
              {/* Section 1: Account Information */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">
                  1. Account Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. john_doe"
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="e.g. student@school.edu"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input 
                      required 
                      type="password" 
                      placeholder="••••••••"
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Personal Information */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">
                  2. Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Alice"
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Johnson"
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select 
                      value={gender} 
                      onChange={e => setGender(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                    >
                      <option value="">Select Gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={dateOfBirth} 
                      onChange={e => setDateOfBirth(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">National ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1098765432"
                      value={nationalId} 
                      onChange={e => setNationalId(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enrollment Date</label>
                    <input 
                      type="date" 
                      value={enrollmentDate} 
                      onChange={e => setEnrollmentDate(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Academic Enrollment */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">
                  3. Academic Enrollment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year *</label>
                    <select 
                      required 
                      value={selectedAcademicYearId} 
                      onChange={e => setSelectedAcademicYearId(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                    >
                      <option value="">Select Academic Year...</option>
                      {academicYears.map((y: any) => (
                        <option key={y.id} value={y.id}>{y.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Section / Class *</label>
                    <select 
                      required 
                      value={selectedSectionId} 
                      onChange={e => setSelectedSectionId(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                    >
                      <option value="">Select Section / Class...</option>
                      {sections.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.class_level?.name ? `${s.class_level.name} - ${s.name}` : s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Contact & Medical */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-3">
                  4. Contact & Health Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +1 555 987 6543"
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Type</label>
                    <select 
                      value={bloodType} 
                      onChange={e => setBloodType(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                    >
                      <option value="">Select Blood Type...</option>
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
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 123 School Street, City"
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Conditions / Allergies</label>
                    <textarea 
                      placeholder="Enter any relevant medical notes, allergies, or emergency conditions..."
                      value={medicalConditions} 
                      onChange={e => setMedicalConditions(e.target.value)} 
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                      rows={2} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-md text-white font-semibold py-2.5 px-6 rounded-xl flex items-center text-sm transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsView;
