import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Loader2, X } from 'lucide-react';
import client from '../api/client';

const GradesView: React.FC = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newGrade, setNewGrade] = useState({ 
    student_id: '', 
    subject_id: '', 
    term_id: '', 
    exam_type_id: '', 
    score: '',
    max_score: 100
  });

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await client.get('/grades');
      if (res.data?.status === 'success') {
        setGrades(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch grades", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/grades', {
        student_id: parseInt(newGrade.student_id),
        subject_id: parseInt(newGrade.subject_id),
        term_id: parseInt(newGrade.term_id),
        exam_type_id: parseInt(newGrade.exam_type_id),
        score: parseFloat(newGrade.score),
        max_score: newGrade.max_score
      });
      setIsModalOpen(false);
      setNewGrade({ student_id: '', subject_id: '', term_id: '', exam_type_id: '', score: '', max_score: 100 });
      fetchGrades();
    } catch (err) {
      console.error("Failed to add grade", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGrades = grades.filter((g: any) => 
    g.score.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
          Grades Management
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center">
          Add Grade
        </button>
      </div>

      <div className="card p-0">
        <div className="p-4 border-b border-slate-100 relative">
          <Search className="w-4 h-4 absolute left-7 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search grades..." 
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
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Subject ID</th>
                  <th className="px-6 py-4 font-semibold">Term ID</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrades.map((g: any) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{g.student_id}</td>
                    <td className="px-6 py-4 text-slate-600">{g.subject_id}</td>
                    <td className="px-6 py-4 text-slate-600">{g.term_id}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{g.score} / {g.max_score}</td>
                  </tr>
                ))}
                {filteredGrades.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No grades found.</td>
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
              <h3 className="text-lg font-bold text-slate-800">Add New Grade</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newGrade.student_id} onChange={(e) => setNewGrade({...newGrade, student_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newGrade.subject_id} onChange={(e) => setNewGrade({...newGrade, subject_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Term ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newGrade.term_id} onChange={(e) => setNewGrade({...newGrade, term_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newGrade.exam_type_id} onChange={(e) => setNewGrade({...newGrade, exam_type_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Score</label>
                  <input type="number" step="0.1" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newGrade.score} onChange={(e) => setNewGrade({...newGrade, score: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Grade
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
