import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, X } from 'lucide-react';
import client from '../api/client';

const TeachersView: React.FC = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ first_name: '', last_name: '', user_id: 1 });

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
      await client.post('/academics/teachers', newTeacher);
      setIsModalOpen(false);
      setNewTeacher({ first_name: '', last_name: '', user_id: 1 });
      fetchTeachers();
    } catch (err) {
      console.error("Failed to add teacher", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t: any) => 
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-500" />
          Teachers Directory
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">Add Teacher</button>
      </div>

      <div className="card p-0">
        <div className="p-4 border-b border-slate-100 relative">
          <Search className="w-4 h-4 absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search teachers..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Hire Date</th>
                  <th className="px-6 py-4 font-semibold">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{t.first_name} {t.last_name}</td>
                    <td className="px-6 py-4 text-slate-600">{t.hire_date}</td>
                    <td className="px-6 py-4 text-slate-600">{t.user_id}</td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No teachers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Teacher</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTeacher.first_name}
                  onChange={(e) => setNewTeacher({...newTeacher, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTeacher.last_name}
                  onChange={(e) => setNewTeacher({...newTeacher, last_name: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center">
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
