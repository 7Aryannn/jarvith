import React, { useState, useEffect, useRef } from 'react';

const BootSequence = ({ onComplete, sessionId }) => {
  const [lines, setLines] = useState([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [authComplete, setAuthComplete] = useState(false);
  const inputRef = useRef(null);

  const initialBootText = [
    "BOOTING J A R V I T H...",
    "MEMORY INTEGRITY... OK",
    "NEURAL CORE... ONLINE",
    `SESSION ID: ${sessionId}`,
    "ENTER PASSPHRASE TO CONTINUE:"
  ];

  const authText = [
    "PASSPHRASE ACCEPTED.",
    "RESTRICTED ACCESS GRANTED.",
    "WELCOME."
  ];

  // Run initial boot
  useEffect(() => {
    let currentLine = 0;
    
    const interval = setInterval(() => {
      if (currentLine < initialBootText.length) {
        setLines(prev => [...prev, initialBootText[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setAwaitingInput(true);
      }
    }, 400); // slightly faster boot

    return () => clearInterval(interval);
  }, [sessionId]);

  // Focus input when waiting
  useEffect(() => {
    if (awaitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [awaitingInput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setAwaitingInput(false);
      
      // Store current lines, removing the "ENTER PASSPHRASE..." prompt to replace it with the user input
      const newLines = [...lines];
      const promptLine = newLines.pop(); // remove prompt
      newLines.push(`${promptLine} ${passphrase}`); // append input
      setLines(newLines);

      // Run auth sequence
      let currentAuthLine = 0;
      const authInterval = setInterval(() => {
        if (currentAuthLine < authText.length) {
          setLines(prev => [...prev, authText[currentAuthLine]]);
          currentAuthLine++;
        } else {
          clearInterval(authInterval);
          setAuthComplete(true);
          setTimeout(() => {
            onComplete();
          }, 800);
        }
      }, 500);
    }
  };

  return (
    <div style={{ marginBottom: '2rem', minHeight: '6rem' }}>
      {lines.map((line, index) => {
        // Render the last line dynamically with input if awaiting
        if (awaitingInput && index === lines.length - 1) {
          return (
            <div key={index} style={{ display: 'flex' }}>
              <span>{line}&nbsp;</span>
              <input 
                ref={inputRef}
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '200px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--user-text)',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  textSecurity: 'disc',
                  WebkitTextSecurity: 'disc'
                }}
              />
              <span className="blink">_</span>
            </div>
          );
        }
        return <div key={index}>{line}</div>;
      })}
      
      {/* Blinking cursor at the end when not waiting for specific input but sequence is active */}
      {(!awaitingInput && !authComplete) && <div className="blink">_</div>}
    </div>
  );
};

export default BootSequence;
