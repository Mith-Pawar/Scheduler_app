import React from 'react';

const LeaveRequestCard = ({ request, onApprove, onReject }) => {
  return (
    <div className="lecture-card">
      <div className="lecture-title">
        <span><i className="fas fa-calendar-times"></i> {request.teacherUsername} - Lecture {request.lectureId}</span>
        <span className="time-badge pending">{request.status}</span>
      </div>
      <div>Date: {request.date}</div>
      <div>Reason: {request.reason}</div>
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onApprove(request.id)} className="btn-primary" style={{ background: '#2e7d64' }}>Approve</button>
        <button onClick={() => onReject(request.id)} className="btn-primary" style={{ background: '#b91c1c' }}>Reject</button>
      </div>
    </div>
  );
};

export default LeaveRequestCard;
