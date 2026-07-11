import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, BookOpen, CheckCircle, Download, Mail } from 'lucide-react';
import { getMostRecentSunday, getSundays } from '../../utils/dateUtils';

export default function AdminDashboard() {
  const { users, attendance, assignments, topics } = useAppContext();
  
  const sundays = getSundays();
  const [selectedWeek, setSelectedWeek] = useState(getMostRecentSunday());
  const [recipientEmail, setRecipientEmail] = useState('');
  
  const students = users.filter(u => u.role === 'student');
  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  
  // Calculate attendance for the selected Sunday
  const selectedWeekAttendance = attendance.filter(a => a.date === selectedWeek);
  const presentSelectedWeek = selectedWeekAttendance.filter(a => a.status === 'present').length;

  const currentTopic = topics[selectedWeek] || 'Not specified';

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Report Heading
    csvContent += `STUDENT DAILY REPORT - ${selectedWeek}\n`;
    csvContent += `Topic Covered: ${currentTopic}\n\n`;
    
    // Column Headers
    csvContent += "Serial No,Student Name,Attendance Status,Assignment Name,Assignment Score\n";

    // Data rows
    let serialNo = 1;
    students.forEach(student => {
      // Get attendance status for the selected Sunday
      const weekRecord = attendance.find(a => a.studentId === student.id && a.date === selectedWeek);
      const attendanceStatus = weekRecord ? weekRecord.status.toUpperCase() : 'NOT MARKED';
      
      const studentAssignments = assignments.filter(a => a.studentId === student.id);

      if (studentAssignments.length === 0) {
        // Row with just attendance if no assignments
        csvContent += `${serialNo},${student.name},${attendanceStatus},,\n`;
        serialNo++;
      } else {
        // Row for each assignment
        studentAssignments.forEach((assign, index) => {
          if (index === 0) {
            csvContent += `${serialNo},${student.name},${attendanceStatus},${assign.assignmentName},${assign.score}\n`;
            serialNo++;
          } else {
            csvContent += `,,,${assign.assignmentName},${assign.score}\n`;
          }
        });
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_report_${selectedWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailReport = async () => {
    if (!recipientEmail) {
      alert("Please enter a recipient email address.");
      return;
    }

    try {
      // Generate CSV string internally to send to backend
      let csvData = "Serial No,Student Name,Attendance Status,Assignment Name,Assignment Score\n";
      let sNo = 1;
      students.forEach(student => {
        const weekRecord = attendance.find(a => a.studentId === student.id && a.date === selectedWeek);
        const attStatus = weekRecord ? weekRecord.status.toUpperCase() : 'NOT MARKED';
        const stAssignments = assignments.filter(a => a.studentId === student.id);
        if (stAssignments.length === 0) {
          csvData += `${sNo},${student.name},${attStatus},,\n`;
          sNo++;
        } else {
          stAssignments.forEach((assign, index) => {
            if (index === 0) {
              csvData += `${sNo},${student.name},${attStatus},${assign.assignmentName},${assign.score}\n`;
              sNo++;
            } else {
              csvData += `,,,${assign.assignmentName},${assign.score}\n`;
            }
          });
        }
      });

      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          selectedWeek,
          currentTopic,
          totalStudents,
          presentSelectedWeek,
          csvContent: csvData
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Report emailed successfully to " + recipientEmail);
      } else {
        alert("Failed to send email: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while sending the email.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1>Overview & Reports</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Select Week:</label>
          <select 
            className="input-field" 
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {sundays.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Total Students</p>
            <h2 style={{ fontSize: '28px' }}>{totalStudents}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Present on {selectedWeek}</p>
            <h2 style={{ fontSize: '28px' }}>{presentSelectedWeek} <span style={{fontSize: '16px', color: 'var(--text-muted)', fontWeight: 'normal'}}>/ {totalStudents}</span></h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '12px', color: 'var(--warning)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Total Grades Logged</p>
            <h2 style={{ fontSize: '28px' }}>{totalAssignments}</h2>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Weekly Report Actions ({selectedWeek})</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-muted)' }}>
              Download Full Report (Excel/CSV)
            </label>
            <button className="btn" onClick={handleDownloadCSV} style={{ width: '100%' }}>
              <Download size={18} /> Export Data
            </button>
          </div>

          <div style={{ flex: 1, minWidth: '300px', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-muted)' }}>
              Email Excel/CSV Report Automatically
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                className="input-field" 
                placeholder="Recipient Email (To:)" 
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn" style={{ backgroundColor: 'var(--primary)' }} onClick={handleEmailReport}>
                <Mail size={18} /> Send Email
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
