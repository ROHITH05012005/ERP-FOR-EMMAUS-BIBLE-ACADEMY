import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getSundays, getMostRecentSunday } from '../../utils/dateUtils';

export default function AttendanceTracker() {
  const { users, attendance, topics, addAttendance, setTopic } = useAppContext();
  const students = users.filter(u => u.role === 'student');
  
  const sundays = getSundays();
  const [selectedDate, setSelectedDate] = useState(getMostRecentSunday());
  
  const [topicInput, setTopicInput] = useState('');

  // Sync topicInput with the selected date's saved topic
  useEffect(() => {
    setTopicInput(topics[selectedDate] || '');
  }, [selectedDate, topics]);

  const handleSaveTopic = () => {
    setTopic(selectedDate, topicInput);
    alert('Topic saved for ' + selectedDate);
  };

  const handleStatusChange = (studentId, status) => {
    addAttendance(studentId, selectedDate, status);
  };

  const markAll = (status) => {
    students.forEach(student => {
      addAttendance(student.id, selectedDate, status);
    });
  };

  const getStatus = (studentId) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return record ? record.status : null;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>Attendance Tracker</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Sunday Class Date:</label>
          <select 
            className="input-field" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {sundays.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-muted)' }}>Topic Covered:</label>
          <input 
            type="text" 
            className="input-field" 
            style={{ width: '100%' }}
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Introduction to Genesis"
          />
        </div>
        <button className="btn" style={{ marginTop: '28px' }} onClick={handleSaveTopic}>
          Save Topic
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button className="btn" style={{ backgroundColor: 'var(--success)' }} onClick={() => markAll('present')} disabled={students.length === 0}>
          Mark All Present
        </button>
        <button className="btn btn-danger" onClick={() => markAll('absent')} disabled={students.length === 0}>
          Mark All Absent
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students found. Add students first.</td>
              </tr>
            ) : (
              students.map(student => {
                const currentStatus = getStatus(student.id);
                return (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td>
                      {currentStatus ? (
                        <span className={`status-badge ${currentStatus}`}>
                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Not marked</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn" 
                          style={{ 
                            backgroundColor: currentStatus === 'present' ? 'var(--success)' : 'rgba(16, 185, 129, 0.2)',
                            color: currentStatus === 'present' ? 'white' : 'var(--success)',
                            padding: '6px 12px'
                          }}
                          onClick={() => handleStatusChange(student.id, 'present')}
                        >
                          Present
                        </button>
                        <button 
                          className="btn" 
                          style={{ 
                            backgroundColor: currentStatus === 'absent' ? 'var(--danger)' : 'rgba(239, 68, 68, 0.2)',
                            color: currentStatus === 'absent' ? 'white' : 'var(--danger)',
                            padding: '6px 12px'
                          }}
                          onClick={() => handleStatusChange(student.id, 'absent')}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
