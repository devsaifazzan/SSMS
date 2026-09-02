import React, { useState, useEffect } from 'react';
import { Book, Search, Loader2, X, Plus } from 'lucide-react';
import client from '../api/client';

const AcademicsView: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [newClass, setNewClass] = useState({ name: '' });
  const [newSection, setNewSection] = useState({ class_level_id: 0, name: '', capacity: 30 });
  const [newYear, setNewYear] = useState({ name: '', start_date: '', end_date: '', is_active: true });

  const fetchAcademics = async () => {
    setLoading(true);
    try {
      const res = await client.get('/academics/subjects');
      if (res.data?.status === 'success') {
        setSubjects(res.data.data);
      }
      const yearRes = await client.get('/academics/academic_years');
      if (yearRes.data?.status === 'success') {
        setAcademicYears(yearRes.data.data);
      }
      const classRes = await client.get('/academics/class_levels');
      if (classRes.data?.status === 'success') {
        const fetchedLevels = classRes.data.data;
        setClassLevels(fetchedLevels);
        if (fetchedLevels.length > 0) {
          setNewSection(prev => prev.class_level_id ? prev : { ...prev, class_level_id: fetchedLevels[0].id });
        }
      }
      const sectionRes = await client.get('/academics/sections');
      if (sectionRes.data?.status === 'success') {
        setSections(sectionRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch academics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/academics/subjects', newSubject);
      setIsSubjectModalOpen(false);
      setNewSubject({ name: '', code: '' });
      fetchAcademics();
    } catch (err) {
      console.error("Failed to add subject", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/academics/class_levels', newClass);
      setIsClassModalOpen(false);
      setNewClass({ name: '' });
      fetchAcademics();
    } catch (err) {
      console.error("Failed to add class", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/academics/sections', {
        ...newSection,
        class_level_id: Number(newSection.class_level_id),
        capacity: Number(newSection.capacity)
      });
      setIsSectionModalOpen(false);
      setNewSection({ class_level_id: classLevels[0]?.id || 0, name: '', capacity: 30 });
      fetchAcademics();
    } catch (err) {
      console.error("Failed to add section", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/academics/academic_years', newYear);
      setIsYearModalOpen(false);
      setNewYear({ name: '', start_date: '', end_date: '', is_active: true });
      fetchAcademics();
    } catch (err) {
      console.error("Failed to add academic year", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Book className="w-6 h-6 mr-2 text-indigo-500" />
          Academics Management
        </h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsYearModalOpen(true)} className="btn-primary bg-indigo-600 hover:bg-indigo-700">Add Academic Year</button>
          <button onClick={() => setIsSubjectModalOpen(true)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300">Add Subject</button>
          <button onClick={() => setIsClassModalOpen(true)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300">Add Class Level</button>
          <button onClick={() => setIsSectionModalOpen(true)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300">Add Section</button>
        </div>
      </div>

      <div className="card p-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-semibold text-slate-800">Subjects</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search subjects..." 
              className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm w-56 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Subject Code</th>
                  <th className="px-6 py-4 font-semibold">Subject Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{s.code}</td>
                    <td className="px-6 py-4 text-slate-600">{s.name}</td>
                  </tr>
                ))}
                {filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-500">No subjects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-0">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h3 className="font-semibold text-slate-800">Class Levels</h3>
            <button onClick={() => setIsClassModalOpen(true)} className="text-xs text-indigo-600 font-semibold hover:underline flex items-center">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Class Level
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Class Level Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classLevels.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-400 text-sm">#{c.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                    </tr>
                  ))}
                  {classLevels.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-500">No class levels found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card p-0">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h3 className="font-semibold text-slate-800">Sections (e.g. 10-A)</h3>
            <button onClick={() => setIsSectionModalOpen(true)} className="text-xs text-indigo-600 font-semibold hover:underline flex items-center">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">Section Display</th>
                    <th className="px-6 py-4 font-semibold">Class Level</th>
                    <th className="px-6 py-4 font-semibold">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sections.map((sec: any) => (
                    <tr key={sec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-indigo-600">
                        {sec.class_level?.name ? `${sec.class_level.name}-${sec.name}` : sec.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{sec.class_level?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-slate-600">{sec.capacity}</td>
                    </tr>
                  ))}
                  {sections.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No sections found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 mt-6">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-semibold text-slate-800">Academic Years</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Start Date</th>
                  <th className="px-6 py-4 font-semibold">End Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((y: any) => (
                  <tr key={y.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{y.name}</td>
                    <td className="px-6 py-4 text-slate-600">{y.start_date}</td>
                    <td className="px-6 py-4 text-slate-600">{y.end_date}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${y.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {y.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {academicYears.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No academic years found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Subject</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newSubject.name} onChange={(e) => setNewSubject({...newSubject, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newSubject.code} onChange={(e) => setNewSubject({...newSubject, code: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Class Level</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (e.g. 10, Grade 10)</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newClass.name} onChange={(e) => setNewClass({...newClass, name: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Class Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Section</h3>
              <button onClick={() => setIsSectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Class Level</label>
                <select 
                  required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={newSection.class_level_id} 
                  onChange={(e) => setNewSection({...newSection, class_level_id: Number(e.target.value)})}
                >
                  {classLevels.map((cl: any) => (
                    <option key={cl.id} value={cl.id}>{cl.name}</option>
                  ))}
                  {classLevels.length === 0 && <option value="">No class levels available</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section Name (e.g. A, B)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={newSection.name} 
                  onChange={(e) => setNewSection({...newSection, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={newSection.capacity} 
                  onChange={(e) => setNewSection({...newSection, capacity: Number(e.target.value)})} 
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsSectionModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting || classLevels.length === 0} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isYearModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add Academic Year</h3>
              <button onClick={() => setIsYearModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddYear} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (e.g. 2023-2024)</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newYear.name} onChange={(e) => setNewYear({...newYear, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newYear.start_date} onChange={(e) => setNewYear({...newYear, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newYear.end_date} onChange={(e) => setNewYear({...newYear, end_date: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <input type="checkbox" id="isActive" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked={newYear.is_active} onChange={(e) => setNewYear({...newYear, is_active: e.target.checked})} />
                <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
                  Is Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsYearModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicsView;
