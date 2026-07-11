import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsManager from './pages/admin/StudentsManager';
import AttendanceTracker from './pages/admin/AttendanceTracker';
import GradesManager from './pages/admin/GradesManager';
import StudentDashboard from './pages/student/StudentDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser } = useAppContext();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && currentUser.role !== allowedRole) {
    // If they are logged in but have the wrong role, send them to their respective dashboard
    return <Navigate to={`/${currentUser.role}`} replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { currentUser } = useAppContext();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={currentUser ? `/${currentUser.role}` : "/login"} replace />} />
        
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentsManager />} />
          <Route path="attendance" element={<AttendanceTracker />} />
          <Route path="grades" element={<GradesManager />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
