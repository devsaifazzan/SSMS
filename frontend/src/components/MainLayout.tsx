import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Users, LayoutDashboard, Calendar, FileText, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, resource: 'Dashboard' },
    { name: 'Students', path: '/students', icon: Users, resource: 'Students' },
    { name: 'Teachers', path: '/teachers', icon: Users, resource: 'Teachers' },
    { name: 'Timetable', path: '/timetable', icon: Calendar, resource: 'Timetable' },
    { name: 'Grades', path: '/grades', icon: FileText, resource: 'Grades' },
    { name: 'Reports', path: '/reports', icon: FileText, resource: 'Reports' },
    { name: 'Finance', path: '/finance', icon: FileText, resource: 'Finance' },
    { name: 'Academics', path: '/academics', icon: GraduationCap, resource: 'Dashboard' }, // Assuming Academics falls under general or dashboard for now
    { name: 'Users & Roles', path: '/users', icon: Shield, resource: 'Users' },
    { name: 'Roles', path: '/roles', icon: Shield, resource: 'Roles' },
    { name: 'Attendance', path: '/attendance', icon: Calendar, resource: 'Attendance' },
    { name: 'Promotions', path: '/promotions', icon: GraduationCap, resource: 'Academics' },
  ];

  const navItems = allNavItems.filter(item => {
    // If user has read permission for this resource, show it
    if (item.path === '/') return true; // Dashboard is usually available to all, or you can restrict it
    return hasPermission(item.resource, 'can_read');
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
          <img src="/logo.png" alt="SSMS Logo" className="w-9 h-9 rounded-lg mr-3 object-contain" />
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 tracking-wide">SSMS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-500' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <Link to="/settings" className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
            location.pathname === '/settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
          }`}>
            <Settings className={`w-5 h-5 mr-3 ${location.pathname === '/settings' ? 'text-blue-500' : ''}`} />
            <span className="font-medium">Settings</span>
          </Link>
          <button onClick={onLogout} className="w-full flex items-center px-4 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">
            {navItems.find(item => item.path === location.pathname)?.name || 
             (location.pathname === '/settings' ? 'Settings' : 'Admin Dashboard')}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800">{user?.username || 'User'}</span>
              <span className="text-xs text-slate-500">{user?.role || 'Guest'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm uppercase">
              {user?.username ? user.username.substring(0, 2) : 'US'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
