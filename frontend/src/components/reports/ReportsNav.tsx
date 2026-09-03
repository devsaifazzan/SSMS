import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap, Users, CalendarCheck, BookOpen, DollarSign, LayoutDashboard
} from 'lucide-react';

const ReportsNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/reports', icon: LayoutDashboard },
    { name: 'Student Report', path: '/reports/students', icon: GraduationCap },
    { name: 'Teacher Report', path: '/reports/teachers', icon: Users },
    { name: 'Attendance Report', path: '/reports/attendance', icon: CalendarCheck },
    { name: 'Academic Report', path: '/reports/grades', icon: BookOpen },
    { name: 'Financial Report', path: '/reports/finance', icon: DollarSign },
  ];

  return (
    <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1 mb-6">
      {navItems.map((item) => {
        const isActive = item.path === '/reports'
          ? location.pathname === '/reports'
          : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              isActive
                ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default ReportsNav;
