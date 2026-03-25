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
    const allRequests = getSwapRequests();
    setRequests(allRequests.filter(r => r.status === 'pending'));
    setLoading(false);
  }, []);

  const handleAction = (id, action) => {
    const updated = requests.map(req => 
      req.id === id ? { ...req, status: action } : req
    );
    saveSwapRequests(updated);
    setRequests(updated.filter(r => r.status === 'pending'));
    toast.showToast(`Swap request ${action}`, 'success');
  };

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

