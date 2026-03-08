import React from 'react';

const Header = ({ sessionId, clearanceMode }) => {
  return (
    <header style={{ position: 'relative', width: '100%', marginBottom: '2rem', flexShrink: 0 }}>
      <h1>J A R V I T H</h1>
      <div className="subtitle">
        COGNITIVE INTERFACE v0.1 // RESTRICTED ACCESS
      </div>
      
      {/* Session ID */}
      <div style={{
        position: 'absolute',
        top: '0.2rem',
        left: '0',
        fontSize: '0.6rem',
        letterSpacing: '0.1rem',
        opacity: 0.5
      }}>
        SID: {sessionId}
      </div>

      {/* Clearance Level / Signal */}
      <div
        className="heartbeat"
        style={{
          position: 'absolute',
          top: '0.2rem',
          right: '0',
          fontSize: '0.6rem',
          letterSpacing: '0.1rem',
          color: 'var(--system-error)',
          display: 'flex',
          gap: '1rem'
        }}
      >
        <span>CLEARANCE: {clearanceMode}</span>
        <span>SIGNAL [OK]</span>
      </div>
    </header>
  );
};

export default Header;
