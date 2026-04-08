import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSwapRequests, saveSwapRequests } from '../utils/Storage';

const SwapRequestPage = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    const allRequests = getSwapRequests();
    setRequests(allRequests.filter(r => r.status === 'pending'));
    setLoading(false);
  }, [currentUser]);

  const handleAction = (id, action) => {
    const allRequests = getSwapRequests();
    const updated = allRequests.map(req => 
      req.id === id ? { ...req, status: action } : req
    );
    saveSwapRequests(updated);
    setRequests(updated.filter(r => r.status === 'pending'));
    toast.showToast(`Swap request ${action}`, 'success');
  };

  if (currentUser?.role !== 'admin') {
    return <div className="dashboard-card">Admin only</div>;
  }

  return (
    <div className="dashboard-card">
      <h2>Swap Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="lecture-grid">
          {requests.map(req => (
            <div key={req.id} className="lecture-card">
              <div>{req.requestingTeacher} wants to swap lecture {req.lectureId} with {req.targetTeacher}</div>
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

export default SwapRequestPage;

