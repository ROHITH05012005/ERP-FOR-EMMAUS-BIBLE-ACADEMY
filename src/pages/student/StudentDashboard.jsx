import { useAppContext } from '../../context/AppContext';

export default function StudentDashboard() {
  const { currentUser, attendance, assignments } = useAppContext();
  
  // Filter data for the current logged-in student
  const myAttendance = attendance.filter(a => a.studentId === currentUser.id);
  const myAssignments = assignments.filter(a => a.studentId === currentUser.id);

  // Calculate attendance stats
  const totalDays = myAttendance.length;
  const presentDays = myAttendance.filter(a => a.status === 'present').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>My Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Attendance Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Attendance</h2>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: attendancePercentage >= 80 ? 'var(--success)' : attendancePercentage >= 60 ? 'var(--warning)' : 'var(--danger)'
            }}>
              {totalDays > 0 ? `${attendancePercentage}%` : 'N/A'}
            </div>
          </div>
          
          {myAttendance.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No attendance records found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...myAttendance].reverse().slice(0, 5).map(record => (
                <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 500 }}>{record.date}</span>
                  <span className={`status-badge ${record.status}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grades Section */}
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h2>My Grades</h2>
          </div>
          
          {myAssignments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No grades posted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...myAssignments].reverse().map(assignment => (
                <div key={assignment.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 500 }}>{assignment.assignmentName}</span>
                  <span style={{ 
                    fontWeight: 600,
                    color: assignment.score >= 90 ? 'var(--success)' : 
                           assignment.score >= 70 ? 'var(--warning)' : 
                           'var(--danger)'
                  }}>
                    {assignment.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
