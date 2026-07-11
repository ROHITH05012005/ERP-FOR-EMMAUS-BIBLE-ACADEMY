import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Save } from 'lucide-react';

export default function GradesManager() {
  const { users, assignments, addBulkAssignments } = useAppContext();
  const students = users.filter(u => u.role === 'student');

  const [assignmentName, setAssignmentName] = useState('');
  const [scores, setScores] = useState({});

  const handleScoreChange = (studentId, value) => {
    setScores({
      ...scores,
      [studentId]: value
    });
  };

  const handleSaveAll = () => {
    if (!assignmentName.trim()) {
      alert('Please enter an assignment name first.');
      return;
    }

    const newGrades = [];
    students.forEach(student => {
      const score = scores[student.id];
      if (score !== undefined && score !== '') {
        newGrades.push({
          studentId: student.id,
          assignmentName: assignmentName.trim(),
          score: Number(score)
        });
      }
    });

    if (newGrades.length === 0) {
      alert('No grades entered. Please enter at least one score.');
      return;
    }

    addBulkAssignments(newGrades);
    
    // Reset form
    setScores({});
    alert('All entered grades saved successfully!');
  };

  const handleSaveSingle = (student) => {
    const score = scores[student.id];
    if (!assignmentName.trim()) {
      alert('Please enter an assignment name first.');
      return;
    }
    if (score === undefined || score === '') {
      alert('Please enter a score for this student.');
      return;
    }

    addBulkAssignments([{
      studentId: student.id,
      assignmentName: assignmentName.trim(),
      score: Number(score)
    }]);

    // Clear just this student's score input after saving
    setScores({
      ...scores,
      [student.id]: ''
    });
    alert(`Saved ${student.name}'s grade successfully!`);
  };

  const getStudentName = (id) => {
    const student = users.find(u => u.id === id);
    return student ? student.name : 'Unknown';
  };

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Grades Manager</h1>

      <div className="card" style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '24px' }}>Log Grades for Class</h3>
        
        <div className="input-group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
          <label>Assignment Name</label>
          <input 
            type="text" 
            className="input-field" 
            value={assignmentName}
            onChange={e => setAssignmentName(e.target.value)}
            placeholder="e.g. Math Quiz 1"
          />
        </div>

        <div className="table-container" style={{ marginBottom: '24px' }}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th style={{ width: '150px' }}>Score (%)</th>
                <th style={{ width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students available.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        className="input-field"
                        style={{ padding: '8px', width: '100px' }}
                        placeholder="--"
                        value={scores[student.id] || ''}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                      />
                    </td>
                    <td>
                      <button 
                        className="btn" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleSaveSingle(student)}
                      >
                        <Save size={14} /> Save
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button 
          className="btn" 
          onClick={handleSaveAll}
          disabled={students.length === 0}
        >
          <Save size={18} /> Save All Grades
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '24px' }}>Recent Grades History</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Assignment</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No grades logged yet.</td>
                </tr>
              ) : (
                [...assignments].reverse().map(assignment => (
                  <tr key={assignment.id}>
                    <td style={{ fontWeight: 500 }}>{getStudentName(assignment.studentId)}</td>
                    <td>{assignment.assignmentName}</td>
                    <td>
                      <span style={{ 
                        fontWeight: 600,
                        color: assignment.score >= 90 ? 'var(--success)' : 
                               assignment.score >= 70 ? 'var(--warning)' : 
                               'var(--danger)'
                      }}>
                        {assignment.score}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
