import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getLeaveRequests, getSwapRequests, saveLeaveRequests, saveSwapRequests } from '../utils/Storage';

const AdminRequest = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    setLeaveRequests(getLeaveRequests().filter(r => r.status === 'pending'));
    setSwapRequests(getSwapRequests().filter(r => r.status === 'pending'));
    setLoading(false);
  }, [currentUser]);

  const handleLeaveAction = (id, action) => {
    const updated = leaveRequests.map(req => 
      req.id === id ? { ...req, status: action } : req
    );
    saveLeaveRequests(updated);
    setLeaveRequests(updated.filter(r => r.status === 'pending'));
    toast.showToast(`Leave ${action}`, 'success');
  };

  const handleSwapAction = (id, action) => {
    const updated = swapRequests.map(req => 
      req.id === id ? { ...req, status: action } : req
    );
    saveSwapRequests(updated);
    setSwapRequests(updated.filter(r => r.status === 'pending'));
    toast.showToast(`Swap ${action}`, 'success');
  };

  if (currentUser?.role !== 'admin') {
    return <div className="dashboard-card">Admin only</div>;
  }

  return (
    <div className="dashboard-card">
      <h2>Pending Requests</h2>
      <h3>Leave Requests</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="lecture-grid">
          {leaveRequests.map(req => (
            <div key={req.id} className="lecture-card">
              <div>{req.teacherUsername} - {req.reason}</div>
              <div>Date: {req.date}</div>
              <div>
                <button onClick={() => handleLeaveAction(req.id, 'approved')}>Approve</button>
                <button onClick={() => handleLeaveAction(req.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <h3>Swap Requests</h3>
      <div className="lecture-grid">
        {swapRequests.map(req => (
          <div key={req.id} className="lecture-card">
            <div>{req.requestingTeacher} → {req.targetTeacher} (Lecture {req.lectureId})</div>
            <div>
              <button onClick={() => handleSwapAction(req.id, 'approved')}>Approve</button>
              <button onClick={() => handleSwapAction(req.id, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRequest;

