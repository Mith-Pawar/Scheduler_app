import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getLeaveRequests, saveLeaveRequests } from '../utils/Storage';

const LeaveRequestsPage = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    const allRequests = getLeaveRequests();
    setRequests(allRequests);
    setLoading(false);
  }, [currentUser]);

  const handleAction = (id, action) => {
    const updated = requests.map(req => 
      req.id === id ? { ...req, status: action } : req
    );
    saveLeaveRequests(updated);
    setRequests(updated);
    toast.showToast(`Leave request ${action}`, 'success');
  };

  if (currentUser?.role !== 'admin') {
    return <div className="dashboard-card">Admin only</div>;
  }

  return (
    <div className="dashboard-card">
      <h2>Leave Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="lecture-grid">
          {requests.map(req => (
            <div key={req.id} className="lecture-card">
              <div>{req.teacherUsername} - Lecture {req.lectureId}</div>
              <div>{req.date}: {req.reason}</div>
              <div>Status: {req.status}</div>
              {req.status === 'pending' && (
                <div>
                  <button onClick={() => handleAction(req.id, 'approved')}>Approve</button>
                  <button onClick={() => handleAction(req.id, 'rejected')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestsPage;
</xai:function_call >

<xai:function_call name="create_file">
<parameter name="absolute_path">Scheduler/src/pages/AdminRequest.jsx
