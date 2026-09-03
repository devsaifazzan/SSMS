import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  GraduationCap, Users, LayoutDashboard, Calendar, FileText, Settings,
  LogOut, Shield, Menu, X, ChevronDown, BarChart2, DollarSign, CalendarCheck, BookOpen
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportsExpanded, setIsReportsExpanded] = useState<boolean>(
    location.pathname.startsWith('/reports')
  );

  // Close mobile menu whenever location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Keep Reports dropdown expanded if we are on any report sub-page
  useEffect(() => {
    if (location.pathname.startsWith('/reports')) {
      setIsReportsExpanded(true);
    }
  }, [location.pathname]);

  const reportSubItems = [
    { name: 'Student Report', path: '/reports/students', icon: GraduationCap },
    { name: 'Teacher Report', path: '/reports/teachers', icon: Users },
    { name: 'Attendance Report', path: '/reports/attendance', icon: CalendarCheck },
    { name: 'Academic Report', path: '/reports/grades', icon: BookOpen },
    { name: 'Financial Report', path: '/reports/finance', icon: DollarSign },
  ];

  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, resource: 'Dashboard' },
    { name: 'Students', path: '/students', icon: Users, resource: 'Students' },
    { name: 'Teachers', path: '/teachers', icon: Users, resource: 'Teachers' },
    { name: 'Timetable', path: '/timetable', icon: Calendar, resource: 'Timetable' },
    { name: 'Grades', path: '/grades', icon: FileText, resource: 'Grades' },
    { name: 'Reports', path: '/reports', icon: BarChart2, resource: 'Reports', isParent: true },
    { name: 'Finance', path: '/finance', icon: DollarSign, resource: 'Finance' },
    { name: 'Academics', path: '/academics', icon: GraduationCap, resource: 'Dashboard' },
    { name: 'Users & Roles', path: '/users', icon: Shield, resource: 'Users' },
    { name: 'Roles', path: '/roles', icon: Shield, resource: 'Roles' },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, resource: 'Attendance' },
    { name: 'Promotions', path: '/promotions', icon: GraduationCap, resource: 'Academics' },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.path === '/') return true;
    return hasPermission(item.resource, 'can_read');
  });

  const getPageTitle = () => {
    if (location.pathname.startsWith('/reports')) {
      if (location.pathname === '/reports/students') return 'Reports / Student Report';
      if (location.pathname === '/reports/teachers') return 'Reports / Teacher Report';
      if (location.pathname === '/reports/attendance') return 'Reports / Attendance Report';
      if (location.pathname === '/reports/grades') return 'Reports / Academic Report';
      if (location.pathname === '/reports/finance') return 'Reports / Financial Report';
      return 'Reports Overview';
    }
    return navItems.find(item => item.path === location.pathname)?.name ||
           (location.pathname === '/settings' ? 'Settings' : 'Admin Dashboard');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar - Desktop (fixed) & Mobile (slide-out drawer) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/50">
          <div className="flex items-center">
            <img src="/logo.png" alt="SSMS Logo" className="w-9 h-9 rounded-lg mr-3 object-contain" />
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 tracking-wide">SSMS</span>
          </div>
          {/* Close button inside mobile menu */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            if (item.isParent && item.name === 'Reports') {
              const isReportsActive = location.pathname.startsWith('/reports');
              return (
                <div key="reports-parent-menu" className="space-y-1">
                  <button
                    onClick={() => setIsReportsExpanded(!isReportsExpanded)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isReportsActive
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'hover:bg-slate-800 hover:text-white text-slate-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <BarChart2 className={`w-5 h-5 mr-3 ${isReportsActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="text-sm">Reports</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isReportsExpanded ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`} />
                  </button>

                  {/* Sub-menu items */}
                  {isReportsExpanded && (
                    <div className="pl-4 space-y-1 border-l-2 border-slate-800 ml-5 my-1">
                      {reportSubItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              isSubActive
                                ? 'bg-emerald-500/30 text-emerald-300 font-bold border-l-2 border-emerald-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <FileText className={`w-4 h-4 mr-2.5 ${isSubActive ? 'text-emerald-400' : 'text-amber-400/90'}`} />
                            <span>{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50 space-y-1.5">
          <Link
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              location.pathname === '/settings' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className={`w-5 h-5 mr-3 ${location.pathname === '/settings' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Responsive Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800">{user?.username || 'User'}</span>
              <span className="text-xs text-slate-500">{user?.role || 'Guest'}</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm uppercase text-sm">
              {user?.username ? user.username.substring(0, 2) : 'US'}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
