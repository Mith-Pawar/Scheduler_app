import React, { useEffect, useState } from 'react';
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

const TeacherDashBoard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const username = currentUser?.username;

  const [lectures, setLectures] = useState([]);
  const [alertedMap, setAlertedMap] = useState({});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveData, setLeaveData] = useState({ lectureId: '', reason: '', date: '' });
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapData, setSwapData] = useState({ lectureId: '', targetTeacher: '' });
  const [mySwapRequests, setMySwapRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (!username) return;
    const savedLectures = getLecturesForUser(username);
    setLectures(savedLectures);
    setAlertedMap(
      savedLectures.reduce((map, lecture) => {
        map[lecture.id] = Boolean(lecture.alerted);
        return map;
      }, {})
    );
  }, [username]);

  useEffect(() => {
    if (!username) return;

    const allLeaveRequests = getLeaveRequests();
    setMyLeaveRequests(allLeaveRequests.filter((request) => request.teacherUsername === username));

    const allSwapRequests = getSwapRequests();
    setMySwapRequests(allSwapRequests.filter((request) => request.requestingTeacher === username));
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const allUsers = getUsers();
    setTeachers(allUsers.filter((user) => user.role === 'teacher' && user.username !== username));
  }, [username]);

  useEffect(() => {
    if (!lectures.length) return undefined;

    const interval = setInterval(() => {
      const now = new Date();
      const nextAlerts = { ...alertedMap };
      let hasUpdates = false;

      const nextLectures = lectures.map((lecture) => {
        const startDate = new Date(lecture.startTime);
        const diffMinutes = (startDate - now) / 60000;
        const isWithinFiveMinutes = diffMinutes <= 5 && diffMinutes > 0;
        const alreadyAlerted = alertedMap[lecture.id] === true;

        if (isWithinFiveMinutes && !alreadyAlerted && startDate > now) {
          const minsLeft = Math.max(1, Math.floor(diffMinutes));
          toast.showToast(
            `Reminder: "${lecture.title}" starts in ${minsLeft} minute(s) in ${lecture.room || 'room TBA'}!`,
            'info'
          );

          if (typeof Notification !== 'undefined') {
            if (Notification.permission === 'granted') {
              new Notification(`SIMS Alert: ${lecture.title}`, {
                body: `Starts in ${minsLeft} minutes. Room: ${lecture.room || 'TBA'}`,
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
          }

          nextAlerts[lecture.id] = true;
          hasUpdates = true;
          return { ...lecture, alerted: true };
        }

        return lecture;
      });

      if (hasUpdates) {
        setLectures(nextLectures);
        setAlertedMap(nextAlerts);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [lectures, alertedMap, toast]);

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

  const getLectureById = (lectureId) =>
    lectures.find((lecture) => String(lecture.id) === String(lectureId));

  const resetLeaveForm = () => {
    setLeaveData({ lectureId: '', reason: '', date: '' });
    setShowLeaveForm(false);
  };

  const resetSwapForm = () => {
    setSwapData({ lectureId: '', targetTeacher: '' });
    setShowSwapForm(false);
  };

  const handleLeaveSubmit = (event) => {
    event.preventDefault();

    if (!leaveData.lectureId || !leaveData.reason.trim() || !leaveData.date) {
      toast.showToast('Please fill all fields', 'error');
      return;
    }

    const selectedLecture = getLectureById(leaveData.lectureId);
    if (!selectedLecture) {
      toast.showToast('Selected lecture was not found', 'error');
      return;
    }

    const existingPendingLeave = myLeaveRequests.find(
      (request) =>
        request.lectureId === selectedLecture.id &&
        request.date === leaveData.date &&
        request.status === 'pending'
    );

    if (existingPendingLeave) {
      toast.showToast('A leave request for this lecture and date is already pending', 'error');
      return;
    }

    const newLeave = {
      id: Date.now(),
      teacherUsername: username,
      lectureId: selectedLecture.id,
      lectureTitle: selectedLecture.title,
      reason: leaveData.reason.trim(),
      date: leaveData.date,
      status: 'pending',
    };

    const allLeaves = getLeaveRequests();
    const updatedLeaves = [...allLeaves, newLeave];
    saveLeaveRequests(updatedLeaves);
    setMyLeaveRequests(updatedLeaves.filter((request) => request.teacherUsername === username));
    resetLeaveForm();
    toast.showToast('Leave request submitted!', 'success');
  };

  const handleSwapSubmit = (event) => {
    event.preventDefault();

    if (!swapData.lectureId || !swapData.targetTeacher) {
      toast.showToast('Please select lecture and teacher', 'error');
      return;
    }

    const selectedLecture = getLectureById(swapData.lectureId);
    if (!selectedLecture) {
      toast.showToast('Selected lecture was not found', 'error');
      return;
    }

    if (swapData.targetTeacher === username) {
      toast.showToast('You cannot request a swap with yourself', 'error');
      return;
    }

    const existingPendingSwap = mySwapRequests.find(
      (request) =>
        request.lectureId === selectedLecture.id &&
        request.targetTeacher === swapData.targetTeacher &&
        request.status === 'pending'
    );

    if (existingPendingSwap) {
      toast.showToast('A swap request for this lecture and teacher is already pending', 'error');
      return;
    }

    const newSwap = {
      id: Date.now(),
      requestingTeacher: username,
      targetTeacher: swapData.targetTeacher,
      lectureId: selectedLecture.id,
      lectureTitle: selectedLecture.title,
      status: 'pending',
    };

    const allSwaps = getSwapRequests();
    const updatedSwaps = [...allSwaps, newSwap];
    saveSwapRequests(updatedSwaps);
    setMySwapRequests(updatedSwaps.filter((request) => request.requestingTeacher === username));
    resetSwapForm();
    toast.showToast('Swap request sent!', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.showToast('Logged out successfully', 'success');
  };

  return (
    <>
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="welcome-text">
            <span className="powered">
              <i className="fas fa-bell"></i> SIMS | Teacher Portal
            </span>
            <h2>👋 Welcome, {currentUser?.name || currentUser?.username}</h2>
            <p style={{ fontSize: '0.8rem', color: '#4a627a' }}>
              Request leaves/swaps + 5-min alerts
            </p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>

        <div className="alert-banner section-gap">
          <i className="fas fa-clock" style={{ fontSize: '1.4rem', color: '#f59e0b' }}></i>
          <span>Alerts active: Toast + browser notification 5 mins before lecture</span>
        </div>

        {lectures.length === 0 ? (
          <div className="no-lectures-warning section-gap">
            <h4>📚 No lectures assigned yet</h4>
            <p>Contact admin to schedule your timetable</p>
          </div>
        ) : (
          <div
            className="section-gap"
            style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button onClick={() => setShowLeaveForm(true)} className="btn-primary">
              <i className="fas fa-calendar-times"></i> Apply Leave
            </button>
            <button onClick={() => setShowSwapForm(true)} className="btn-primary">
              <i className="fas fa-exchange-alt"></i> Request Swap
            </button>
          </div>
        )}

        <h3 className="section-gap">My Leave Requests</h3>
        <div className="lecture-grid section-gap">
          {myLeaveRequests.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 2.5rem',
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '2rem',
                gridColumn: '1 / -1',
                border: '1px dashed rgba(239,68,68,0.3)',
              }}
            >
              <svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ margin: '0 auto 1.5rem' }}
              >
                <rect x="25" y="20" width="50" height="65" rx="4" fill="none" stroke="#ef4444" strokeWidth="2" />
                <line x1="35" y1="35" x2="65" y2="35" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
                <line x1="35" y1="45" x2="65" y2="45" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
                <line x1="35" y1="55" x2="55" y2="55" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
                <circle cx="72" cy="65" r="12" fill="#2e7d64" />
                <path
                  d="M68 65 L70.5 67.5 L75 63"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>No Leave Requests</h4>
              <p style={{ color: '#6b7280' }}>Create your first leave request above</p>
            </div>
          ) : (
            myLeaveRequests.map((request) => (
              <div key={request.id} className="lecture-card">
                <div>{request.lectureTitle || `Lecture ${request.lectureId}`} on {request.date}</div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{request.reason}</div>
                <span
                  className={`time-badge ${
                    request.status === 'pending'
                      ? 'pending'
                      : request.status === 'approved'
                        ? 'approved'
                        : 'rejected'
                  }`}
                >
                  {request.status.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>

        <h3 className="section-gap">My Swap Requests</h3>
        <div className="lecture-grid section-gap">
          {mySwapRequests.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 2.5rem',
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '2rem',
                gridColumn: '1 / -1',
                border: '1px dashed rgba(239,68,68,0.3)',
              }}
            >
              <svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ margin: '0 auto 1.5rem' }}
              >
                <rect x="15" y="30" width="35" height="40" rx="4" fill="none" stroke="#ef4444" strokeWidth="2" />
                <rect x="50" y="30" width="35" height="40" rx="4" fill="none" stroke="#ef4444" strokeWidth="2" />
                <path d="M52 55 L60 55" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path
                  d="M60 55 L56 51"
                  stroke="#dc2626"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M48 55 L40 55" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path
                  d="M40 55 L44 51"
                  stroke="#dc2626"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>No Swap Requests</h4>
              <p style={{ color: '#6b7280' }}>Request a swap with another teacher</p>
            </div>
          ) : (
            mySwapRequests.map((request) => (
              <div key={request.id} className="lecture-card">
                <div>
                  {request.lectureTitle || `Lecture ${request.lectureId}`} with{' '}
                  <span style={{ fontWeight: '600' }}>{request.targetTeacher}</span>
                </div>
                <span
                  className={`time-badge ${
                    request.status === 'pending'
                      ? 'pending'
                      : request.status === 'approved'
                        ? 'approved'
                        : 'rejected'
                  }`}
                >
                  {request.status.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>

        <h3 className="section-gap">
          <i className="fas fa-calendar-alt"></i> Your Timetable (Admin Assigned)
        </h3>
        <div className="lecture-grid">
          {lectures.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 3rem',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(239, 68, 68, 0.08))',
                borderRadius: '2.5rem',
                border: '2px dashed rgba(239, 68, 68, 0.3)',
                gridColumn: '1 / -1',
              }}
            >
              <svg
                width="160"
                height="160"
                viewBox="0 0 140 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ margin: '0 auto 2rem' }}
              >
                <rect x="20" y="30" width="100" height="90" rx="8" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                <rect x="20" y="30" width="100" height="20" rx="8" fill="#ef4444" opacity="0.1" />
                <circle cx="35" cy="40" r="3" fill="#ef4444" />
                <circle cx="50" cy="40" r="3" fill="#ef4444" />
                <circle cx="65" cy="40" r="3" fill="#ef4444" />
                <circle cx="80" cy="40" r="3" fill="#ef4444" />
                <circle cx="95" cy="40" r="3" fill="#ef4444" />
                <circle cx="110" cy="40" r="3" fill="#ef4444" />
                <line x1="20" y1="55" x2="120" y2="55" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
                <line x1="20" y1="70" x2="120" y2="70" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
                <line x1="20" y1="85" x2="120" y2="85" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
                <line x1="20" y1="100" x2="120" y2="100" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
                <circle cx="35" cy="62" r="2" fill="#ef4444" opacity="0.5" />
                <circle cx="50" cy="62" r="2" fill="#ef4444" opacity="0.5" />
                <circle cx="65" cy="62" r="2" fill="#ef4444" opacity="0.5" />
                <line x1="70" y1="115" x2="70" y2="125" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                <line x1="65" y1="120" x2="75" y2="120" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h4 style={{ color: '#b91c1c', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>
                No Lectures Assigned
              </h4>
              <p style={{ color: '#6b7280', fontSize: '1rem' }}>Contact admin to schedule your timetable</p>
            </div>
          ) : (
            lectures.map((lecture) => {
              const startDate = new Date(lecture.startTime);
              const diffMinutes = (startDate - new Date()) / 60000;
              const isWarning = diffMinutes <= 5 && diffMinutes > 0;
              const isPast = diffMinutes < 0;

              return (
                <div key={lecture.id} className={`lecture-card ${isWarning ? 'warning' : isPast ? 'past' : ''}`}>
                  <div className="lecture-title">
                    <span>
                      <i className={`fas fa-chalkboard ${isPast ? 'fa-slash' : ''}`}></i> {lecture.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', marginTop: '0.25rem', opacity: isPast ? 0.7 : 1 }}>
                    <i className={`far fa-clock ${isPast ? 'text-muted' : ''}`}></i>{' '}
                    {new Date(lecture.startTime).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                    <i className="fas fa-door-open"></i> {lecture.room || 'Room TBD'}
                  </div>
                  <div className={`countdown ${isPast ? 'past' : isWarning ? 'warning' : ''}`}>
                    <i className={`fas fa-hourglass-half ${isPast ? 'text-muted' : ''}`}></i>{' '}
                    {getTimeRemaining(lecture.startTime)}
                  </div>
                  {isWarning && <span className="warning-badge">⚠️ Starting soon!</span>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showLeaveForm && (
        <div className="modal-overlay" onClick={resetLeaveForm}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h2>
              <i className="fas fa-calendar-times"></i> Apply for Leave
            </h2>
            <form onSubmit={handleLeaveSubmit}>
              <div className="input-group">
                <label>Lecture</label>
                <select
                  className="input-field"
                  value={leaveData.lectureId}
                  onChange={(event) =>
                    setLeaveData({ ...leaveData, lectureId: event.target.value })
                  }
                  required
                >
                  <option value="">Select lecture</option>
                  {lectures.map((lecture) => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.title} ({lecture.room || 'Room TBD'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Date</label>
                <input
                  className="input-field"
                  type="date"
                  value={leaveData.date}
                  onChange={(event) => setLeaveData({ ...leaveData, date: event.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Reason</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Reason for leave..."
                  value={leaveData.reason}
                  onChange={(event) =>
                    setLeaveData({ ...leaveData, reason: event.target.value })
                  }
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Submit Leave Request
                </button>
                <button type="button" className="logout-btn" onClick={resetLeaveForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSwapForm && (
        <div className="modal-overlay" onClick={resetSwapForm}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h2>
              <i className="fas fa-exchange-alt"></i> Request Lecture Swap
            </h2>
            <form onSubmit={handleSwapSubmit}>
              <div className="input-group">
                <label>Your Lecture</label>
                <select
                  className="input-field"
                  value={swapData.lectureId}
                  onChange={(event) =>
                    setSwapData({ ...swapData, lectureId: event.target.value })
                  }
                  required
                >
                  <option value="">Select lecture to swap</option>
                  {lectures.map((lecture) => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.title} ({lecture.room || 'Room TBD'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Swap with Teacher</label>
                <select
                  className="input-field"
                  value={swapData.targetTeacher}
                  onChange={(event) =>
                    setSwapData({ ...swapData, targetTeacher: event.target.value })
                  }
                  required
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.username} value={teacher.username}>
                      {teacher.fullName} (@{teacher.username})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Send Swap Request
                </button>
                <button type="button" className="logout-btn" onClick={resetSwapForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherDashBoard;
