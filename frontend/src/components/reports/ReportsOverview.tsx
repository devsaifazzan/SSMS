import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Users, CalendarCheck, BookOpen, DollarSign, ArrowRight, TrendingUp
} from 'lucide-react';
import ReportsNav from './ReportsNav';

const ReportsOverview: React.FC = () => {
  const reportModules = [
    {
      title: 'Student Performance Report',
      description: 'Filter student demographics, GPA standings, attendance percentages, and generate printable report cards.',
      path: '/reports/students',
      icon: GraduationCap,
      color: 'bg-blue-500',
      badge: 'Interactive Filters'
    },
    {
      title: 'Faculty & Teacher Report',
      description: 'Analyze teacher specializations, academic qualifications, teaching experience, and weekly lesson workloads.',
      path: '/reports/teachers',
      icon: Users,
      color: 'bg-indigo-500',
      badge: 'Faculty Analytics'
    },
    {
      title: 'Attendance & Discipline Report',
      description: 'Track overall school attendance rates, unexcused absence occurrences, and weekly punctuality trends.',
      path: '/reports/attendance',
      icon: CalendarCheck,
      color: 'bg-emerald-500',
      badge: 'Discipline Audit'
    },
    {
      title: 'Academic Performance Report',
      description: 'Historical subject averages, grade progression trends, exam result tracking, and subject benchmarks.',
      path: '/reports/grades',
      icon: BookOpen,
      color: 'bg-purple-500',
      badge: 'GPA Tracking'
    },
    {
      title: 'Financial & Revenue Report',
      description: 'Monitor total invoiced tuition fees, collected revenues, pending balances, and overdue accounts.',
      path: '/reports/finance',
      icon: DollarSign,
      color: 'bg-amber-500',
      badge: 'Revenue Audit'
    },
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      <ReportsNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 rounded-3xl text-white shadow-lg">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
            Analytics & Reports Center
          </span>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            Comprehensive School Management Reports
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Select a specialized report module below to access real-time data visualizers, custom multi-dimensional filters, data tables, and print-ready official PDF audit documents.
          </p>
        </div>
      </div>

      {/* Grid of Report Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportModules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${module.color} text-white shadow-sm`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {module.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {module.description}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-800">
              <span>View Detailed Report</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReportsOverview;
