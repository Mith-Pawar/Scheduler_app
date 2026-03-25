import React from 'react';

const SwapRequestCard = ({ request, onApprove, onReject }) => {
  return (
    <div className="lecture-card">
      <div className="lecture-title">
        <span><i className="fas fa-exchange-alt"></i> {request.requestingTeacher} → {request.targetTeacher}</span>
        <span className="time-badge pending">{request.status}</span>
      </div>
      <div>Lecture ID: {request.lectureId}</div>
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onApprove(request.id)} className="btn-primary" style={{ background: '#2e7d64' }}>Approve</button>
        <button onClick={() => onReject(request.id)} className="btn-primary" style={{ background: '#b91c1c' }}>Reject</button>
      </div>
    </div>
  );
};

export default SwapRequestCard;
