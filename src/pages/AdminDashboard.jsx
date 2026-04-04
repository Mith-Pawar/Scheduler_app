import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getUsers,
  saveUsers,
  getLecturesForUser,
  saveLecturesForUser,
  getLeaveRequests,
  saveLeaveRequests,
  getSwapRequests,
  saveSwapRequests,
} from '../utils/Storage';
import LeaveRequestCard from '../components/LeaveRequestCard.jsx';
import SwapRequestCard from '../components/SwapRequestCard.jsx';

const AdminDashboard = () => {
  const { currentUser, logout, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ fullName: '', username: '', email: '', password: '' });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherLectures, setTeacherLectures] = useState([]);
  const [newLecture, setNewLecture] = useState({ title: '', startTime: '', room: '' });

  // Requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);

  // Load teachers
  useEffect(() => {
    const allUsers = getUsers();
    const teacherList = allUsers.filter(u => u.role === 'teacher');
    setTeachers(teacherList);
  }, []);

  // Load pending requests
  useEffect(() => {
    const allLeaves = getLeaveRequests();
    setLeaveRequests(allLeaves.filter(req => req.status === 'pending'));
    const allSwaps = getSwapRequests();
    setSwapRequests(allSwaps.filter(req => req.status === 'pending'));
  }, []);

  const handleAddTeacher = (e) => {
    e.preventDefault();
    const { fullName, username, email, password } = newTeacher;
    if (!fullName || !username || !email || !password) {
      toast.showToast('All fields are required', 'error');
      return;
    }
    const result = register(fullName, username, email, password, 'teacher');
    if (result.success) {
      const newUser = { fullName, username, email, password, role: 'teacher' };
      setTeachers(prev => [...prev, newUser]);
      setNewTeacher({ fullName: '', username: '', email: '', password: '' });
      toast.showToast(`Teacher ${fullName} added successfully`, 'success');
    } else {
      toast.showToast(result.error, 'error');
    }
  };

  const handleDeleteTeacher = (username) => {
    if (window.confirm(`Are you sure you want to delete teacher "${username}"?`)) {
      const users = getUsers();
      const updatedUsers = users.filter(u => u.username !== username);
      saveUsers(updatedUsers);
      setTeachers(teachers.filter(t => t.username !== username));
      if (selectedTeacher?.username === username) {
        setSelectedTeacher(null);
        setTeacherLectures([]);
      }
      toast.showToast(`Teacher ${username} removed`, 'info');
    }
  };

  const handleViewLectures = (teacher) => {
    setSelectedTeacher(teacher);
    const lectures = getLecturesForUser(teacher.username);
    setTeacherLectures(lectures);
  };

  const handleAddLecture = (e) => {
    e.preventDefault();
    if (!newLecture.title || !newLecture.startTime) {
      toast.showToast('Title and start time required', 'error');
      return;
    }
    const startDate = new Date(newLecture.startTime);
    if (isNaN(startDate.getTime())) {
      toast.showToast('Invalid date/time', 'error');
      return;
    }
    const newId = Date.now();
    const lectureToAdd = {
      id: newId,
      title: newLecture.title,
      startTime: startDate.toISOString(),
      room: newLecture.room || 'TBD',
      alerted: false,
    };
    const currentLectures = getLecturesForUser(selectedTeacher.username);
    saveLecturesForUser(selectedTeacher.username, [...currentLectures, lectureToAdd]);
    setTeacherLectures([...teacherLectures, lectureToAdd]);
    setNewLecture({ title: '', startTime: '', room: '' });
    toast.showToast('Lecture added', 'success');
  };

  const handleDeleteLecture = (id) => {
    if (window.confirm('Delete this lecture?')) {
      const updatedLectures = teacherLectures.filter(lec => lec.id !== id);
      saveLecturesForUser(selectedTeacher.username, updatedLectures);
      setTeacherLectures(updatedLectures);
      toast.showToast('Lecture deleted', 'info');
    }
  };

  // Request actions
  const handleLeaveAction = (requestId, action) => {
    const allLeaves = getLeaveRequests();
    const updated = allLeaves.map(req => {
      if (req.id === requestId) {
        return { ...req, status: action };
      }
      return req;
    });
    saveLeaveRequests(updated);
    setLeaveRequests(updated.filter(req => req.status === 'pending'));
    toast.showToast(`Leave request ${action}`, 'success');
  };

  const handleSwapAction = (requestId, action) => {
    const allSwaps = getSwapRequests();
    const request = allSwaps.find(req => req.id === requestId);
    if (!request) return;

    if (action === 'approved') {
      const requestingLectures = getLecturesForUser(request.requestingTeacher);
      const targetLectures = getLecturesForUser(request.targetTeacher);
      const lectureToMove = requestingLectures.find(l => l.id === request.lectureId);
      if (lectureToMove) {
        const newRequestingLectures = requestingLectures.filter(l => l.id !== request.lectureId);
        saveLecturesForUser(request.requestingTeacher, newRequestingLectures);
        saveLecturesForUser(request.targetTeacher, [...targetLectures, { ...lectureToMove }]);
      }
    }

    const updated = allSwaps.map(req => {
      if (req.id === requestId) {
        return { ...req, status: action };
      }
      return req;
    });
    saveSwapRequests(updated);
    setSwapRequests(updated.filter(req => req.status === 'pending'));
    toast.showToast(`Swap request ${action}`, 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.showToast('Logged out successfully', 'success');
  };

  return (
    <div className="dashboard-card" style={{ maxWidth: '1400px' }}>
      <div className="dashboard-header">
        <div className="welcome-text">
          <span className="powered"><i className="fas fa-user-shield"></i> SIMS | Admin Portal</span>
          <h2>👑 Welcome, Admin {currentUser?.name || currentUser?.username}</h2>
          <p style={{ fontSize: '0.8rem', color: '#4a627a' }}>Full timetable control + request management</p>
        </div>
        <button onClick={handleLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        {/* Left: Teacher management */}
        <div>
          <h3><i className="fas fa-chalkboard-user"></i> Teachers</h3>
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem' }}>
            <h4>Add Teacher</h4>
            <form onSubmit={handleAddTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Full Name" className="input-field" value={newTeacher.fullName} onChange={e => setNewTeacher({ ...newTeacher, fullName: e.target.value })} />
              <input type="text" placeholder="Username" className="input-field" value={newTeacher.username} onChange={e => setNewTeacher({ ...newTeacher, username: e.target.value })} />
              <input type="email" placeholder="Email" className="input-field" value={newTeacher.email} onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })} />
              <input type="password" placeholder="Password" className="input-field" value={newTeacher.password} onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })} />
              <button type="submit" className="btn-primary">Add Teacher</button>
            </form>
          </div>
          <div className="lecture-grid" style={{ gridTemplateColumns: '1fr' }}>
            {teachers.map((teacher) => (
              <div
                key={teacher.username}
                className="lecture-card"
              >
                <div className="lecture-title">
                  <span><i className="fas fa-user-graduate"></i> {teacher.fullName}</span>
                  <div>
                    <button className="delete-lecture" onClick={() => handleViewLectures(teacher)} style={{ marginRight: '8px', color: '#2c7da0' }}>
                      <i className="fas fa-eye"></i> Manage Lectures
                    </button>
                    <button className="delete-lecture" onClick={() => handleDeleteTeacher(teacher.username)}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <div>@{teacher.username} | {teacher.email}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Timetable CRUD */}
        <div>
          <h3><i className="fas fa-calendar-alt"></i> {selectedTeacher ? `${selectedTeacher.fullName}'s Timetable ` : 'Select teacher'}</h3>
          {selectedTeacher && (
            <>
              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem' }}>
                <h4>Add Lecture</h4>
                <form onSubmit={handleAddLecture} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Title" className="input-field" style={{ flex: 1 }} value={newLecture.title} onChange={e => setNewLecture({ ...newLecture, title: e.target.value })} />
                  <input type="datetime-local" className="input-field" style={{ flex: 1 }} value={newLecture.startTime} onChange={e => setNewLecture({ ...newLecture, startTime: e.target.value })} />
                  <input type="text" placeholder="Room" className="input-field" style={{ flex: 1 }} value={newLecture.room} onChange={e => setNewLecture({ ...newLecture, room: e.target.value })} />
                  <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }}>Add</button>
                </form>
              </div>
              <div className="lecture-grid">
                {teacherLectures.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1.5rem', gridColumn: '1 / -1' }}>
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 1rem', display: 'block' }}>
                      <rect x="25" y="30" width="50" height="50" rx="4" fill="none" stroke="#ef4444" strokeWidth="2"/>
                      <line x1="35" y1="45" x2="65" y2="45" stroke="#ef4444" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="35" y1="55" x2="55" y2="55" stroke="#ef4444" strokeWidth="1.5" opacity="0.5"/>
                      <circle cx="65" cy="70" r="8" fill="none" stroke="#dc2626" strokeWidth="1.5"/>
                      <line x1="62" y1="70" x2="68" y2="70" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="65" y1="67" x2="65" y2="73" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p style={{ color: '#666', fontSize: '0.95rem', margin: '0' }}>No lectures assigned to this teacher</p>
                  </div>
                ) : (
                  teacherLectures.map((lec) => (
                    <div
                      key={lec.id}
                      className="lecture-card"
                    >
                      <div className="lecture-title">
                        <span><i className="fas fa-chalkboard"></i> {lec.title}</span>
                        <button className="delete-lecture" onClick={() => handleDeleteLecture(lec.id)}>
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      <div><i className="far fa-clock"></i> {new Date(lec.startTime).toLocaleString()}</div>
                      <div><i className="fas fa-door-open"></i> {lec.room}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Requests */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Pending Requests</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h4>Leave Requests</h4>
          {leaveRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem' }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 0.5rem', display: 'block' }}>
                <path d="M20 50 L30 60 L60 30" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="40" cy="40" r="32" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.4"/>
              </svg>
              <p style={{ color: '#666', fontSize: '0.85rem', margin: '0' }}>No pending leave requests</p>
            </div>
          ) : leaveRequests.map(req => (
            <LeaveRequestCard key={req.id} request={req} onApprove={(id) => handleLeaveAction(id, 'approved')} onReject={(id) => handleLeaveAction(id, 'rejected')} />
          ))}
        </div>
          <div>
            <h4>Swap Requests</h4>
            {swapRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 0.5rem', display: 'block' }}>
                  <rect x="15" y="25" width="20" height="30" rx="2" fill="none" stroke="#ef4444" strokeWidth="2"/>
                  <rect x="45" y="25" width="20" height="30" rx="2" fill="none" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M37 45 L43 45" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M43 45 L40 42" stroke="#dc2626" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0' }}>No pending swap requests</p>
              </div>
            ) : swapRequests.map(req => (
              <SwapRequestCard key={req.id} request={req} onApprove={(id) => handleSwapAction(id, 'approved')} onReject={(id) => handleSwapAction(id, 'rejected')} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
