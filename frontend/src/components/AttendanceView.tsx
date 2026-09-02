import { useState, useEffect } from 'react';
import client from '../api/client';
import { Users, Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';

interface Timetable {
  id: number;
  subject_id: number;
  section_id: number;
  teacher_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  classroom: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

interface AttendanceRecord {
  student_id: number;
  timetable_id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

const AttendanceView = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch timetables (in a real app we'd fetch by day_of_week or teacher_id)
  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const res = await client.get('/timetable');
        if (res.data?.status === 'success') {
          setTimetables(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching timetables", error);
      }
    };
    fetchTimetables();
  }, []);

  // Fetch students and existing attendance when timetable or date changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTimetableId || !date) return;
      setLoading(true);
      setMessage('');
      try {
        // Fetch students (for simplicity, we fetch all, but normally we'd filter by section_id)
        const studentsRes = await client.get('/students');
        let studentsList: Student[] = [];
        if (studentsRes.data?.status === 'success') {
          studentsList = studentsRes.data.data;
          setStudents(studentsList);
        }

        // Fetch existing attendance
        const attendanceRes = await client.get(`/attendance?timetable_id=${selectedTimetableId}&filter_date=${date}`);
        const existingRecords: AttendanceRecord[] = attendanceRes.data?.status === 'success' ? attendanceRes.data.data : [];
        
        const initialData: Record<number, AttendanceRecord> = {};
        
        // Initialize all students as Present by default if no record exists
        studentsList.forEach(student => {
          const existing = existingRecords.find(r => r.student_id === student.id);
          initialData[student.id] = existing || {
            student_id: student.id,
            timetable_id: selectedTimetableId,
            date: date,
            status: 'Present',
            remarks: ''
          };
        });
        
        setAttendanceData(initialData);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTimetableId, date]);

  const handleStatusChange = (studentId: number, status: AttendanceRecord['status']) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleSave = async () => {
    if (!selectedTimetableId || !date) return;
    setSaving(true);
    setMessage('');
    try {
      const records = Object.values(attendanceData);
      const res = await client.post('/attendance/batch', {
        timetable_id: selectedTimetableId,
        date: date,
        records: records
      });
      if (res.data?.status === 'success') {
        setMessage('Attendance saved successfully!');
      }
    } catch (error) {
      console.error("Error saving attendance", error);
      setMessage('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'Late': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Attendance</h1>
          <p className="text-slate-500 mt-1">Manage daily student attendance</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <Calendar size={18} className="text-indigo-500" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-slate-700 outline-none"
            />
          </div>
          <select 
            value={selectedTimetableId || ''}
            onChange={(e) => setSelectedTimetableId(Number(e.target.value))}
            className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Select Class Schedule...</option>
            {timetables.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.subject_name || `Subject ${t.subject_id}`} - {t.section_name || `Section ${t.section_id}`} ({t.classroom || 'Room 101'}) [{t.start_time}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${message.includes('success') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          <AlertCircle size={20} />
          <p className="font-medium">{message}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : selectedTimetableId && students.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 font-semibold text-slate-700">Student Name</th>
                  <th className="py-4 px-6 font-semibold text-slate-700">Status</th>
                  <th className="py-4 px-6 font-semibold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const record = attendanceData[student.id];
                  if (!record) return null;
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-slate-500">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleStatusChange(student.id, 'Present')}
                            className={`p-2 rounded-lg transition-all ${record.status === 'Present' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            title="Present"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(student.id, 'Absent')}
                            className={`p-2 rounded-lg transition-all ${record.status === 'Absent' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            title="Absent"
                          >
                            <X size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(student.id, 'Late')}
                            className={`p-2 rounded-lg transition-all ${record.status === 'Late' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            title="Late"
                          >
                            <Clock size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{students.length}</span> students total
            </p>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Attendance</span>
              )}
            </button>
          </div>
        </div>
      ) : selectedTimetableId ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg text-slate-600 font-medium">No students found for this class.</p>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Select a Class</h3>
          <p className="text-slate-500 max-w-md mx-auto">Please select a date and class from the top menu to start marking attendance.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
