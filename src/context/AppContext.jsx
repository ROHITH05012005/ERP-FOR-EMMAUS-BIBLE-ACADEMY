import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [topics, setTopics] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, attRes, assignRes, topicsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/attendance'),
          fetch('/api/assignments'),
          fetch('/api/topics')
        ]);

        if (usersRes.ok) setUsers(await usersRes.json());
        if (attRes.ok) setAttendance(await attRes.json());
        if (assignRes.ok) setAssignments(await assignRes.json());
        if (topicsRes.ok) setTopics(await topicsRes.json());
        
        // Restore local login session
        const savedUser = localStorage.getItem('app_currentUser');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        
      } catch (err) {
        console.error("Failed to load initial data from backend", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save current user session locally
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('app_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('app_currentUser');
    }
  }, [currentUser]);

  const registerUser = async (name, username, password, role = 'student') => {
    if (users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    const newUser = { id: Date.now().toString(), name, username, password, role };
    
    // Save to DB
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    setUsers([...users, newUser]);
    return newUser;
  };

  const editUser = async (userId, updatedData) => {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setUsers(users.map(u => u.id === userId ? { ...u, ...updatedData } : u));
  };

  const deleteUser = async (userId) => {
    await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });
    setUsers(users.filter(u => u.id !== userId));
    setAttendance(attendance.filter(a => a.studentId !== userId));
    setAssignments(assignments.filter(a => a.studentId !== userId));
  };

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addAttendance = async (studentId, date, status) => {
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date, status })
    });

    setAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.studentId === studentId && a.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], status };
        return updated;
      }
      return [...prev, { id: Date.now().toString() + Math.random(), studentId, date, status }];
    });
  };

  const addBulkAssignments = async (newAssignmentsList) => {
    const res = await fetch('/api/assignments/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignmentsList)
    });
    
    if (res.ok) {
      // Reload assignments to get DB generated IDs or just update state manually
      const assignRes = await fetch('/api/assignments');
      setAssignments(await assignRes.json());
    }
  };

  const setTopic = async (date, topicName) => {
    await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, topicName })
    });
    setTopics(prev => ({
      ...prev,
      [date]: topicName
    }));
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Connecting to Database...</div>;
  }

  return (
    <AppContext.Provider value={{
      users,
      attendance,
      assignments,
      topics,
      currentUser,
      registerUser,
      editUser,
      login,
      logout,
      addAttendance,
      addBulkAssignments,
      setTopic,
      deleteUser
    }}>
      {children}
    </AppContext.Provider>
  );
}
