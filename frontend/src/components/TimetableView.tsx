import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Loader2, X } from 'lucide-react';
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
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00'];

const TimetableView: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newClass, setNewClass] = useState({
    section_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 'Monday',
    start_time: '08:00:00',
    end_time: '09:00:00',
    classroom: ''
  });

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await client.get('/timetable');
      if (response.data && response.data.status === 'success') {
        setTimetable(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
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
      setNewClass({ section_id: '', subject_id: '', teacher_id: '', day_of_week: 'Monday', start_time: '08:00:00', end_time: '09:00:00', classroom: '' });
      fetchTimetable();
    } catch (err) {
      console.error("Failed to add class", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getEntry = (day: string, time: string) => {
    return timetable.find(
      (entry) => entry.day_of_week === day && entry.start_time.startsWith(time.substring(0, 5))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2 text-blue-500" />
          Weekly Timetable
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">Schedule Class</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px] text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
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
                    <td className="px-4 py-4 text-xs font-medium text-slate-500 border-r border-slate-200 text-center bg-slate-50/50">
                      {hour.substring(0, 5)}
                    </td>
                    {DAYS.map((day) => {
                      const entry = getEntry(day, hour);
                      return (
                        <td key={`${day}-${hour}`} className="p-2 border-r border-slate-100 text-center relative h-20 transition-colors hover:bg-slate-50">
                          {entry ? (
                            <div className="absolute inset-1 p-2 rounded-lg bg-blue-100 border border-blue-200 flex flex-col justify-center items-center shadow-sm">
                              <span className="text-sm font-bold text-blue-800">Class {entry.subject_id}</span>
                              <span className="text-xs text-blue-600 font-medium">Sec {entry.section_id}</span>
                              {entry.classroom && (
                                <span className="text-xs text-slate-500 mt-1 bg-white/50 px-1.5 py-0.5 rounded">{entry.classroom}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Schedule Class</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Section ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClass.section_id} onChange={(e) => setNewClass({...newClass, section_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClass.subject_id} onChange={(e) => setNewClass({...newClass, subject_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teacher ID</label>
                  <input type="number" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClass.teacher_id} onChange={(e) => setNewClass({...newClass, teacher_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                  <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClass.day_of_week} onChange={(e) => setNewClass({...newClass, day_of_week: e.target.value})}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input type="time" step="1" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClass.start_time} onChange={(e) => setNewClass({...newClass, start_time: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input type="time" step="1" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClass.end_time} onChange={(e) => setNewClass({...newClass, end_time: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Classroom</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newClass.classroom} onChange={(e) => setNewClass({...newClass, classroom: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Schedule
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
