import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, X, Users, AlertCircle, Loader2 } from 'lucide-react';
import client from '../api/client';

interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Section {
  id: number;
  name: string;
  capacity: number;
}

interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  national_id: string;
}

interface Enrollment {
  id: number;
  student_id: number;
  section_id: number;
  academic_year_id: number;
  student: StudentProfile;
}

const PromotionsView: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  
  // Source State
  const [sourceYearId, setSourceYearId] = useState<number | ''>('');
  const [sourceSectionId, setSourceSectionId] = useState<number | ''>('');
  const [sourceEnrollments, setSourceEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [isLoadingSource, setIsLoadingSource] = useState(false);

  // Destination State
  const [destYearId, setDestYearId] = useState<number | ''>('');
  const [destSectionId, setDestSectionId] = useState<number | ''>('');
  
  // Action State
  const [isPromoting, setIsPromoting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [yearsRes, sectionsRes] = await Promise.all([
          client.get('/academics/academic_years'),
          client.get('/academics/sections')
        ]);
        if (yearsRes.data.status === 'success') {
          setAcademicYears(yearsRes.data.data);
        }
        if (sectionsRes.data.status === 'success') {
          setSections(sectionsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (sourceYearId && sourceSectionId) {
        setIsLoadingSource(true);
        try {
          const res = await client.get(`/academics/enrollments`, {
            params: { academic_year_id: sourceYearId, section_id: sourceSectionId }
          });
          if (res.data.status === 'success') {
            setSourceEnrollments(res.data.data);
            setSelectedStudentIds(new Set());
          }
        } catch (err) {
          console.error('Failed to fetch enrollments', err);
        } finally {
          setIsLoadingSource(false);
        }
      } else {
        setSourceEnrollments([]);
        setSelectedStudentIds(new Set());
      }
    };
    fetchEnrollments();
  }, [sourceYearId, sourceSectionId]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(new Set(sourceEnrollments.map(e => e.student_id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectStudent = (studentId: number) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };

  const handlePromote = async () => {
    if (!destYearId || !destSectionId || selectedStudentIds.size === 0) {
      return;
    }

    setIsPromoting(true);
    setNotification(null);

    try {
      const payload = {
        student_ids: Array.from(selectedStudentIds),
        to_academic_year_id: destYearId,
        to_section_id: destSectionId
      };
      const res = await client.post('/academics/promote', payload);
      
      if (res.data.status === 'success') {
        setNotification({
          type: 'success',
          message: `Successfully promoted ${res.data.data.promoted_count} student(s)!`
        });
        // Deselect promoted students
        setSelectedStudentIds(new Set());
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to promote students.'
        });
      }
    } catch (err) {
      console.error('Promotion error', err);
      setNotification({
        type: 'error',
        message: 'An error occurred during promotion.'
      });
    } finally {
      setIsPromoting(false);
    }
  };

  const isFormValid = destYearId !== '' && destSectionId !== '' && selectedStudentIds.size > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Promotion</h2>
          <p className="text-slate-500">Transition students to their next academic year and section.</p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {notification.type === 'success' ? <Check className="w-5 h-5 mr-3 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
          <p className="font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-auto text-current opacity-70 hover:opacity-100">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Source Pane */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Source Class
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                <select 
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white border"
                  value={sourceYearId}
                  onChange={(e) => setSourceYearId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select Year...</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <select 
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white border"
                  value={sourceSectionId}
                  onChange={(e) => setSourceSectionId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select Section...</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white min-h-[300px]">
            {isLoadingSource ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <p>Loading students...</p>
              </div>
            ) : sourceEnrollments.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedStudentIds.size === sourceEnrollments.length && sourceEnrollments.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {sourceEnrollments.map((enrollment) => (
                    <tr 
                      key={enrollment.student_id} 
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedStudentIds.has(enrollment.student_id) ? 'bg-blue-50/50' : ''}`}
                      onClick={() => handleSelectStudent(enrollment.student_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedStudentIds.has(enrollment.student_id)}
                          onChange={() => {}} // handled by row click
                          onClick={(e) => e.stopPropagation()} // in case they click exactly the checkbox
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3">
                            {enrollment.student.first_name[0]}{enrollment.student.last_name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{enrollment.student.first_name} {enrollment.student.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {enrollment.student.national_id || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                <Users className="w-12 h-12 mb-3 text-slate-300" />
                <p>Select an academic year and section to view enrolled students.</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-sm text-slate-600 flex justify-between items-center">
            <span>Total Students: {sourceEnrollments.length}</span>
            <span className="font-semibold text-blue-600">{selectedStudentIds.size} Selected</span>
          </div>
        </div>

        {/* Destination Pane */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
              <ArrowRight className="w-5 h-5 mr-2 text-indigo-500" />
              Target Class
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                <select 
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-white border"
                  value={destYearId}
                  onChange={(e) => setDestYearId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select Year...</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <select 
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-white border"
                  value={destSectionId}
                  onChange={(e) => setDestSectionId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select Section...</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[300px]">
            
            <div className="max-w-xs w-full mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 text-center">
                <p className="text-sm text-indigo-800 font-medium mb-1">Ready to Promote</p>
                <p className="text-3xl font-bold text-indigo-600">{selectedStudentIds.size}</p>
                <p className="text-xs text-indigo-500 mt-1">Students Selected</p>
              </div>
            </div>

            <button
              onClick={handlePromote}
              disabled={!isFormValid || isPromoting}
              className={`w-full max-w-xs flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition-all
                ${isFormValid && !isPromoting 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer' 
                  : 'bg-slate-300 cursor-not-allowed'}`}
            >
              {isPromoting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Promoting...
                </>
              ) : (
                <>
                  <ArrowRight className="w-6 h-6 mr-3" />
                  Promote Students
                </>
              )}
            </button>
            
            {!isFormValid && (
              <p className="mt-4 text-sm text-slate-500 text-center max-w-xs">
                Select students from the source class and choose a target academic year and section to proceed.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PromotionsView;
