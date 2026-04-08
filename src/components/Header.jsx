import React from 'react';

const Header = ({ sessionId, clearanceMode }) => {
  return (
    <header style={{ width: '100%', marginBottom: '2rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', letterSpacing: '0.1rem', opacity: 0.5, flexWrap: 'wrap' }}>
        <div>SID: {sessionId}</div>
        <div className="heartbeat" style={{ color: 'var(--system-error)', display: 'flex', gap: '1rem' }}>
          <span>CLEARANCE: {clearanceMode}</span>
          <span>SIGNAL [OK]</span>
        </div>
      </div>
      
      <h1 style={{ margin: '0.5rem 0', whiteSpace: 'normal', wordBreak: 'break-word' }}>J A R V I T H</h1>
      <div className="subtitle" style={{ margin: 0 }}>
        COGNITIVE INTERFACE v0.1 // RESTRICTED ACCESS
      </div>
    </header>
  );
};

export default Header;
