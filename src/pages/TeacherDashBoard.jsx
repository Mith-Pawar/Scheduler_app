import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import {
  getLecturesForUser,
  getUsers,
  getLeaveRequests,
  saveLeaveRequests,
  getSwapRequests,
  saveSwapRequests,
} from '../utils/Storage';

const TeacherDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [lectures, setLectures] = useState([]);
  const [alertedMap, setAlertedMap] = useState({});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveData, setLeaveData] = useState({ lectureId: '', reason: '', date: '' });
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapData, setSwapData] = useState({ lectureId: '', targetTeacher: '' });
  const [mySwapRequests, setMySwapRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const username = currentUser?.username;

  // Load lectures
  useEffect(() => {
    if (!username) return;
    const saved = getLecturesForUser(username);
    setLectures(saved);
  }, [username]);

  // Alert checker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lectures.length) return;
      const now = new Date();
      const updatedAlerts = { ...alertedMap };
      let needUpdate = false;
      const updatedLectures = lectures.map(lec => {
        const startDate = new Date(lec.startTime);
        const diffMinutes = (startDate - now) / 60000;
        const isWithin5 = diffMinutes <= 5 && diffMinutes > 0;
        const alreadyAlerted = alertedMap[lec.id] === true;
        if (isWithin5 && !alreadyAlerted && startDate > now) {
          const minsLeft = Math.floor(diffMinutes);
          toast.showToast(`🔔 Reminder: "${lec.title}" starts in ${minsLeft} minute(s) in ${lec.room || 'room TBA'}!`, 'info');
          if (Notification.permission === 'granted') {
            new Notification(`SIMS Alert: ${lec.title}`, { body: `Starts in ${minsLeft} minutes. Room: ${lec.room}` });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
          updatedAlerts[lec.id] = true;
          needUpdate = true;
          return { ...lec, alerted: true };
        }
        return lec;
      });
      if (needUpdate) {
        setLectures(updatedLectures);
        setAlertedMap(updatedAlerts);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [lectures, alertedMap, toast]);

  // Load leave and swap requests
  useEffect(() => {
    const allLeave = getLeaveRequests();
    const myLeaves = allLeave.filter(req => req.teacherUsername === username);
    setMyLeaveRequests(myLeaves);

    const allSwaps = getSwapRequests();
    const mySwaps = allSwaps.filter(req => req.requestingTeacher === username);
    setMySwapRequests(mySwaps);
  }, [username]);

  // Load teachers for swap
  useEffect(() => {
    const allUsers = getUsers();
    const teacherList = allUsers.filter(u => u.role === 'teacher' && u.username !== username);
    setTeachers(teacherList);
  }, [username]);

  const getTimeRemaining = (startISO) => {
    const start = new Date(startISO);
    const now = new Date();
    const diffMs = start - now;
    if (diffMs <= 0) return 'Started / passed';
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m left`;
    return `${minutes} minutes left`;
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveData.lectureId || !leaveData.reason || !leaveData.date) {
      toast.showToast('Please fill all fields', 'error');
      return;
    }
    const newLeave = {
      id: Date.now(),
      teacherUsername: username,
      lectureId: parseInt(leaveData.lectureId),
      reason: leaveData.reason,
      date: leaveData.date,
      status: 'pending',
    };
    const allLeaves = getLeaveRequests();
    saveLeaveRequests([...allLeaves, newLeave]);
    setMyLeaveRequests([...myLeaveRequests, newLeave]);
    setLeaveData({ lectureId: '', reason: '', date: '' });
    setShowLeaveForm(false);
    toast.showToast('Leave request submitted!', 'success');
  };

  const handleSwapSubmit = (e) => {
    e.preventDefault();
    if (!swapData.lectureId || !swapData.targetTeacher) {
      toast.showToast('Please select lecture and teacher', 'error');
      return;
    }
    const newSwap = {
      id: Date.now(),
      requestingTeacher: username,
      targetTeacher: swapData.targetTeacher,
      lectureId: parseInt(swapData.lectureId),
      status: 'pending',
    };
    const allSwaps = getSwapRequests();
    saveSwapRequests([...allSwaps, newSwap]);
    setMySwapRequests([...mySwapRequests, newSwap]);
    setSwapData({ lectureId: '', targetTeacher: '' });
    setShowSwapForm(false);
    toast.showToast('Swap request sent!', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.showToast('Logged out successfully', 'success');
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <div className="welcome-text">
          <span className="powered"><i className="fas fa-bell"></i> SIMS | Teacher Portal</span>
          <h2>👋 Welcome, {currentUser?.name || currentUser?.username}</h2>
          <p style={{ fontSize: '0.8rem', color: '#4a627a' }}>Request leaves/swaps + 5-min alerts</p>
        </div>
        <button onClick={handleLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
      </div>

      <div className="alert-banner">
        <i className="fas fa-clock" style={{ fontSize: '1.4rem', color: '#f59e0b' }}></i>
        <span>✅ Alerts active: Toast + browser notification 5 mins before lecture</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setShowLeaveForm(true)} className="btn-primary">
          <i className="fas fa-calendar-times"></i> Apply Leave
        </button>
        <button onClick={() => setShowSwapForm(true)} className="btn-primary">
          <i className="fas fa-exchange-alt"></i> Request Swap
        </button>
      </div>

      {/* Leave Modal */}
      {showLeaveForm && (
        <div className="modal-overlay" onClick={() => setShowLeaveForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Apply for Leave</h3>
            <form onSubmit={handleLeaveSubmit}>
              <div className="input-group">
                <label>Lecture</label>
                <select value={leaveData.lectureId} onChange={e => setLeaveData({ ...leaveData, lectureId: e.target.value })} className="input-field" required>
                  <option value="">Choose lecture</option>
                  {lectures.map(lec => <option key={lec.id} value={lec.id}>{lec.title} - {new Date(lec.startTime).toLocaleString()}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Date</label>
                <input type="date" className="input-field" value={leaveData.date} onChange={e => setLeaveData({ ...leaveData, date: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Reason</label>
                <textarea className="input-field" rows="3" value={leaveData.reason} onChange={e => setLeaveData({ ...leaveData, reason: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowLeaveForm(false)} className="btn-primary" style={{ background: '#6c757d' }}>Cancel</button>
                <button type="submit" className="btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapForm && (
        <div className="modal-overlay" onClick={() => setShowSwapForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Request Lecture Swap</h3>
            <form onSubmit={handleSwapSubmit}>
              <div className="input-group">
                <label>Lecture</label>
                <select value={swapData.lectureId} onChange={e => setSwapData({ ...swapData, lectureId: e.target.value })} className="input-field" required>
                  <option value="">Choose lecture</option>
                  {lectures.map(lec => <option key={lec.id} value={lec.id}>{lec.title} - {new Date(lec.startTime).toLocaleString()}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Swap with</label>
                <select value={swapData.targetTeacher} onChange={e => setSwapData({ ...swapData, targetTeacher: e.target.value })} className="input-field" required>
                  <option value="">Choose teacher</option>
                  {teachers.map(t => <option key={t.username} value={t.username}>{t.fullName} (@{t.username})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSwapForm(false)} className="btn-primary" style={{ background: '#6c757d' }}>Cancel</button>
                <button type="submit" className="btn-primary">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Requests */}
      <h3>My Leave Requests</h3>
      <div className="lecture-grid">
        {myLeaveRequests.length === 0 ? <p>No requests</p> : myLeaveRequests.map(req => (
          <div key={req.id} className="lecture-card">
            <div>Lecture {req.lectureId} on {req.date}</div>
            <div>{req.reason}</div>
            <span className={`time-badge ${req.status === 'pending' ? 'pending' : req.status === 'approved' ? 'approved' : 'rejected'}`}>{req.status}</span>
          </div>
        ))}
      </div>

      <h3>My Swap Requests</h3>
      <div className="lecture-grid">
        {mySwapRequests.length === 0 ? <p>No requests</p> : mySwapRequests.map(req => (
          <div key={req.id} className="lecture-card">
            <div>Lecture {req.lectureId} with {req.targetTeacher}</div>
            <span className={`time-badge ${req.status === 'pending' ? 'pending' : req.status === 'approved' ? 'approved' : 'rejected'}`}>{req.status}</span>
          </div>
        ))}
      </div>

      <h3><i className="fas fa-calendar-alt"></i> Your Timetable (Admin Assigned)</h3>
      <div className="lecture-grid">
        {lectures.length === 0 ? (
          <p style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '1rem' }}>No timetable yet 📅</p>
        ) : lectures.map(lec => {
          const startDate = new Date(lec.startTime);
          const diffMinutes = (startDate - new Date()) / 60000;
          const isWarning = diffMinutes <= 5 && diffMinutes > 0;
          return (
            <div key={lec.id} className={`lecture-card ${isWarning ? 'warning' : ''}`}>
              <div className="lecture-title">
                <span><i className="fas fa-chalkboard"></i> {lec.title}</span>
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                <i className="far fa-clock"></i> {new Date(lec.startTime).toLocaleString()}
              </div>
              <div><i className="fas fa-door-open"></i> {lec.room}</div>
              <div className="countdown"><i className="fas fa-hourglass-half"></i> {getTimeRemaining(lec.startTime)}</div>
              {isWarning && <span style={{ background: '#e53e3e', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem' }}>⚠️ Starting soon!</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherDashboard;
