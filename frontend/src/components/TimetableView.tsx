import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Loader2, X, Plus, Filter, User } from 'lucide-react';
import client from '../api/client';

interface TimetableItem {
  id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  classroom: string | null;
  section_name?: string;
  subject_name?: string;
  teacher_name?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00'];

const TimetableView: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newClass, setNewClass] = useState({
    section_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 'Monday',
    start_time: '08:00:00',
    end_time: '09:00:00',
    classroom: 'Room 101'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ttRes, secRes, subRes, teachRes] = await Promise.all([
        client.get('/timetable'),
        client.get('/academics/sections'),
        client.get('/academics/subjects'),
        client.get('/academics/teachers')
      ]);

      if (ttRes.data?.status === 'success') setTimetable(ttRes.data.data);
      if (secRes.data?.status === 'success') setSections(secRes.data.data);
      if (subRes.data?.status === 'success') setSubjects(subRes.data.data);
      if (teachRes.data?.status === 'success') setTeachers(teachRes.data.data);
    } catch (error) {
      console.error("Failed to fetch timetable data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/timetable', {
        section_id: parseInt(newClass.section_id),
        subject_id: parseInt(newClass.subject_id),
        teacher_id: parseInt(newClass.teacher_id),
        day_of_week: newClass.day_of_week,
        start_time: newClass.start_time,
        end_time: newClass.end_time,
        classroom: newClass.classroom
      });
      setIsModalOpen(false);
      setNewClass({ section_id: '', subject_id: '', teacher_id: '', day_of_week: 'Monday', start_time: '08:00:00', end_time: '09:00:00', classroom: 'Room 101' });
      fetchData();
    } catch (err) {
      console.error("Failed to add class schedule", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTimetable = timetable.filter((entry) => {
    if (selectedSectionFilter === 'all') return true;
    return entry.section_id === parseInt(selectedSectionFilter);
  });

  const getEntry = (day: string, time: string) => {
    return filteredTimetable.find(
      (entry) => entry.day_of_week === day && entry.start_time.startsWith(time.substring(0, 5))
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Section Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center">
            <CalendarIcon className="w-7 h-7 mr-2.5 text-emerald-600 shrink-0" />
            Weekly Class Timetable
          </h2>
          <p className="text-xs text-slate-500 mt-1">Organize weekly subject schedules, classroom assignments, and teaching periods.</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Section Filter Dropdown */}
          <div className="relative flex-1 sm:w-56">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700"
            >
              <option value="all">All Class Sections</option>
              {sections.map((sec: any) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-md text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Schedule Class
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="card p-0 overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px] text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-4 font-semibold border-r border-slate-200 w-24 text-center">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="px-4 py-4 font-semibold text-center border-r border-slate-200 w-1/5">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HOURS.map((hour) => (
                  <tr key={hour} className="group">
                    <td className="px-4 py-4 text-xs font-bold text-slate-600 border-r border-slate-200 text-center bg-slate-50/70">
                      {hour.substring(0, 5)}
                    </td>
                    {DAYS.map((day) => {
                      const entry = getEntry(day, hour);
                      return (
                        <td key={`${day}-${hour}`} className="p-2 border-r border-slate-100 text-center relative h-24 transition-colors hover:bg-slate-50">
                          {entry ? (
                            <div className="absolute inset-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
                              <span className="text-xs font-bold text-emerald-900 line-clamp-1">{entry.subject_name}</span>
                              <span className="text-[11px] text-emerald-700 font-semibold">{entry.section_name}</span>
                              {entry.teacher_name && (
                                <span className="text-[10px] text-slate-500 font-medium flex items-center mt-0.5">
                                  <User className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                                  {entry.teacher_name}
                                </span>
                              )}
                              {entry.classroom && (
                                <span className="text-[10px] text-slate-600 mt-1 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 font-semibold">
                                  {entry.classroom}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs font-medium">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto border border-slate-200">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Schedule Class Period
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section / Class *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newClass.section_id} 
                    onChange={(e) => setNewClass({...newClass, section_id: e.target.value})}
                  >
                    <option value="">Select Section...</option>
                    {sections.map((sec: any) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newClass.subject_id} 
                    onChange={(e) => setNewClass({...newClass, subject_id: e.target.value})}
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newClass.teacher_id} 
                    onChange={(e) => setNewClass({...newClass, teacher_id: e.target.value})}
                  >
                    <option value="">Select Teacher...</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week *</label>
                  <select 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newClass.day_of_week} 
                    onChange={(e) => setNewClass({...newClass, day_of_week: e.target.value})}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input 
                    type="time" 
                    step="1" 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newClass.start_time} 
                    onChange={(e) => setNewClass({...newClass, start_time: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                  <input 
                    type="time" 
                    step="1" 
                    required 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                    value={newClass.end_time} 
                    onChange={(e) => setNewClass({...newClass, end_time: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom / Room No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. Room 101 / Physics Lab"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" 
                  value={newClass.classroom} 
                  onChange={(e) => setNewClass({...newClass, classroom: e.target.value})} 
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
