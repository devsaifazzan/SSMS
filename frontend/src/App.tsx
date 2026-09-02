import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import DashboardView from './components/DashboardView'
import StudentsView from './components/StudentsView'
import TimetableView from './components/TimetableView'
import ReportsView from './components/ReportsView'
import SettingsView from './components/SettingsView'
import LoginView from './components/LoginView'
import GradesView from './components/GradesView'
import FinanceView from './components/FinanceView'
import TeachersView from './components/TeachersView'
import AcademicsView from './components/AcademicsView'
import UsersManagementView from './components/UsersManagementView'
import RolesManagementView from './components/RolesManagementView'
import AttendanceView from './components/AttendanceView'
import PromotionsView from './components/PromotionsView'
import { useAuth, AuthProvider } from './AuthContext'

const AppRoutes = () => {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-arabic">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginView onLogin={login} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout onLogout={logout} />}>
          <Route index element={<DashboardView />} />
          <Route path="students" element={<StudentsView />} />
          <Route path="teachers" element={<TeachersView />} />
          <Route path="timetable" element={<TimetableView />} />
          <Route path="grades" element={<GradesView />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="finance" element={<FinanceView />} />
          <Route path="academics" element={<AcademicsView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="users" element={<UsersManagementView />} />
          <Route path="roles" element={<RolesManagementView />} />
          <Route path="attendance" element={<AttendanceView />} />
          <Route path="promotions" element={<PromotionsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App
