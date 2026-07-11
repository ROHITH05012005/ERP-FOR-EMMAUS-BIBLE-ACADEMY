import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, Users, CalendarCheck, GraduationCap, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { logout, currentUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 style={{ fontSize: '20px', color: 'var(--primary)' }}>Admin Portal</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Welcome, {currentUser?.name}</p>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Students
          </NavLink>
          <NavLink to="/admin/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CalendarCheck size={20} /> Attendance
          </NavLink>
          <NavLink to="/admin/grades" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <GraduationCap size={20} /> Grades
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
