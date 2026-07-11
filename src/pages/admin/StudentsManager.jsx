import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserPlus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function StudentsManager() {
  const { users, registerUser, deleteUser, editUser } = useAppContext();
  const students = users.filter(u => u.role === 'student');

  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;
    
    // Check if username exists
    if (users.some(u => u.username === formData.username)) {
      alert('Username already exists');
      return;
    }

    registerUser(formData.username, formData.password, 'student', formData.name);
    setFormData({ name: '', username: '', password: '' });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also delete their attendance and grades.`)) {
      deleteUser(id);
    }
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditData({ name: student.name, username: student.username, password: student.password });
  };

  const handleSaveEdit = (id) => {
    if (!editData.name || !editData.username || !editData.password) {
      alert("Fields cannot be empty");
      return;
    }
    
    // Check if new username conflicts with another existing user
    if (users.some(u => u.username === editData.username && u.id !== id)) {
      alert('Username already exists');
      return;
    }

    editUser(id, editData);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Manage Students</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '24px' }}>Add New Student</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                placeholder="janesmith123"
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px' }}>
              <UserPlus size={18} /> Add Student
            </button>
          </form>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Password</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students added yet.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id}>
                    {editingId === student.id ? (
                      <>
                        <td>
                          <input type="text" className="input-field" style={{ padding: '6px', width: '100%' }} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                        </td>
                        <td>
                          <input type="text" className="input-field" style={{ padding: '6px', width: '100%' }} value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} />
                        </td>
                        <td>
                          <input type="text" className="input-field" style={{ padding: '6px', width: '100%' }} value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleSaveEdit(student.id)} className="btn" style={{ padding: '6px', minWidth: 'auto', backgroundColor: 'var(--success)' }} title="Save">
                              <Save size={16} />
                            </button>
                            <button onClick={cancelEdit} className="btn" style={{ padding: '6px', minWidth: 'auto', backgroundColor: 'transparent', color: 'var(--text-muted)' }} title="Cancel">
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 500 }}>{student.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{student.username}</td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{student.password}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => startEdit(student)}
                              className="btn"
                              style={{ padding: '6px', minWidth: 'auto', backgroundColor: 'transparent', color: 'var(--text-main)' }}
                              title="Edit Student"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(student.id, student.name)}
                              className="btn btn-danger"
                              style={{ padding: '6px', minWidth: 'auto', backgroundColor: 'transparent', color: 'var(--danger)' }}
                              title="Delete Student"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
