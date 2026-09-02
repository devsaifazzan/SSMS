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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create User
      const userRes = await client.post('/auth/register', {
        username,
        email,
        password,
        role: 'Student'
      });
      
      const userId = userRes.data.data.id;

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
        user_id: userId
      });
      
      const studentId = studentRes.data?.data?.id || studentRes.data?.id;

      // 3. Create Enrollment if year and section are selected
      if (selectedAcademicYearId && selectedSectionId && studentId) {
        await client.post('/academics/enrollments', {
          student_id: studentId,
          academic_year_id: parseInt(selectedAcademicYearId),
          section_id: parseInt(selectedSectionId)
        });
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
      setError(err.response?.data?.detail || err.response?.data?.error || "Failed to create student");
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

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Add New Student</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleAddStudent} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Account Info */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-800 border-b pb-1 mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-800 border-b pb-1 mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">National ID</label>
                    <input type="text" value={nationalId} onChange={e => setNationalId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Date</label>
                    <input type="date" value={enrollmentDate} onChange={e => setEnrollmentDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Enrollment Info */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-800 border-b pb-1 mb-3">Enrollment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                    <select required value={selectedAcademicYearId} onChange={e => setSelectedAcademicYearId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Academic Year...</option>
                      {academicYears.map((y: any) => (
                        <option key={y.id} value={y.id}>{y.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section / Class</label>
                    <select required value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Section...</option>
                      {sections.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-800 border-b pb-1 mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-800 border-b pb-1 mb-3">Medical Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
                    <select value={bloodType} onChange={e => setBloodType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medical Conditions / Allergies</label>
                    <textarea value={medicalConditions} onChange={e => setMedicalConditions(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex items-center">
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
