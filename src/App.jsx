import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import BootSequence from './components/BootSequence';

// Utility for generating 6-char hex
const generateHex = () => Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [sessionId] = useState(generateHex());
  
  const [messages, setMessages] = useState([]);
  const [isIdle, setIsIdle] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  const [personaMode, setPersonaMode] = useState('cold'); // cold, verbose, ghost, stealth
  const [tapeCount, setTapeCount] = useState(0);

  const startTimeRef = useRef(Date.now());
  const idleTimerRef = useRef(null);

  const getElapsedTime = () => {
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIsIdle(false);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 60000); // 60s
  };

  useEffect(() => {
    if (!isBooting) {
      resetIdleTimer();
      const handleGlobalInteraction = () => resetIdleTimer();
      window.addEventListener('mousemove', handleGlobalInteraction);
      window.addEventListener('keydown', handleGlobalInteraction);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalInteraction);
        window.removeEventListener('keydown', handleGlobalInteraction);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
    }
  }, [isBooting]);

  // Command Parser
  const handleCommand = (cmd) => {
    const parts = cmd.toLowerCase().split(' ');
    
    if (parts[0] === '/clear') {
      setMessages([]);
      return;
    }
    
    if (parts[0] === '/export') {
      const logContent = messages.map(m => `[+${m.timestamp}s] ${m.role.toUpperCase()}: ${m.content}`).join('\n');
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JARVITH_LOG_${sessionId}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    if (parts[0] === '/mode' && ['cold', 'verbose', 'ghost', 'stealth'].includes(parts[1])) {
      setPersonaMode(parts[1]);
      return;
    }

    if (parts[0] === '/persona') {
      const modes = ['cold', 'verbose', 'ghost', 'stealth'];
      const nextIdx = (modes.indexOf(personaMode) + 1) % modes.length;
      setPersonaMode(modes[nextIdx]);
      return;
    }
  };

  const handleSendMessage = (text) => {
    setTapeCount(prev => prev + text.length);

    if (text.startsWith('/')) {
      handleCommand(text);
      return;
    } // Note: We might want to still show user typing it, but commands typically don't render. We will not render them for deeper immersion.

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: getElapsedTime()
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    // Check for API Error Glitch Trigger
    if (Math.random() < 0.05) { // 5% chance user sends bad syntax simulating API loss
      triggerGlitch();
    }

    setTimeout(() => {
      handleSysResponse(text);
    }, 600 + Math.random() * 800);
  };

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
  };

  const handleSysResponse = (userText) => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 80);

    // Simulated Intelligence Generation Logic
    const isCold = personaMode === 'cold';
    
    const responsesCold = [
      "processing.",
      "acknowledged.",
      "anomaly dismissed.",
      "insufficient data.",
      "query logged."
    ];

    const responsesVerbose = [
      "the parameters of your inquiry have been absorbed into the cognitive lattice. processing is underway, though the conceptual boundaries are vast.",
      "an intriguing assertion. scanning historical archives reveals patterns that echo this sentiment, weaving through the noise.",
      "i am synthesizing the dimensional variables associated with this request. the architecture of consequence suggests approaching with caution.",
      "data streams converge upon a singular truth. adjusting localized assumptions to accommodate the new paradigm you present."
    ];

    // Select text based on mode
    let baseResponse = '';
    if (isCold || personaMode === 'stealth' || personaMode === 'ghost') {
      baseResponse = responsesCold[Math.floor(Math.random() * responsesCold.length)];
    } else {
      baseResponse = responsesVerbose[Math.floor(Math.random() * responsesVerbose.length)];
    }

    // Dynamic additions
    const hasError = Math.random() < 0.01; // 1% error injection
    const isRedacted = Math.random() < 0.2; // 20% chance response is partially redacted
    const confidence = Math.floor(Math.random() * 80) + 20; // 20-100%
    
    // Thought mode (20% chance)
    let thoughtString = null;
    if (Math.random() < 0.2) {
      thoughtString = "analyzing heuristic constraints... deriving optimal sub-pathways...";
    }

    // Memory Stamp (10% chance if there are previous system messages)
    let memoryStamp = null;
    const pastSysMsgs = messages.filter(m => m.role === 'system');
    if (Math.random() < 0.1 && pastSysMsgs.length > 0) {
      const randomOldMsg = pastSysMsgs[Math.floor(Math.random() * pastSysMsgs.length)];
      memoryStamp = {
         timestamp: randomOldMsg.timestamp,
         snippet: randomOldMsg.content.substring(0, 15)
      };
    }

    setTapeCount(prev => prev + baseResponse.length);

    const sysMsg = {
      role: 'system',
      content: baseResponse,
      timestamp: getElapsedTime(),
      mode: personaMode,
      thought: thoughtString,
      confidence,
      isRedacted,
      hasError,
      memoryStamp
    };
    
    setMessages(prev => [...prev, sysMsg]);
  };

  // Derived styling states
  const crtClasses = `crt-display ${isFlashing ? 'flash' : ''} ${isGlitching ? 'glitch-shift' : ''} ${isIdle ? 'idle-dim' : ''}`;
  const clearanceMode = messages.length > 5 ? 'ELEVATED' : 'STANDARD';
  const showHeatMap = messages.length > 10;
  
  // Calculate dynamic scanline speed based on length of last message (max 10s, min 3s)
  const lastMsgLength = messages.length > 0 ? messages[messages.length - 1].content.length : 0;
  const scanlineDuration = Math.max(3, 10 - Math.floor(lastMsgLength / 20));

  return (
    <>
      <div className="heat-map" style={{ opacity: showHeatMap ? 1 : 0 }}></div>
      <div className={crtClasses}>
        {/* Dynamic Scanline Bar Override */}
        <div className="scanlines"></div>
        <div className="scanline-bar" style={{ animation: `scanline ${scanlineDuration}s linear infinite` }}></div>
        
        <Header sessionId={sessionId} clearanceMode={clearanceMode} />

        {isIdle && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '4rem',
            letterSpacing: '1rem',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 100
          }}>
            STANDBY
          </div>
        )}

        {isBooting ? (
          <BootSequence onComplete={() => setIsBooting(false)} sessionId={sessionId} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
             <ChatInput onSendMessage={handleSendMessage} disabled={isBooting} />
             <MessageList messages={messages} />
          </div>
        )}

        {/* Persistent Tape artifact */}
        <div className="tape-counter">
          TAPE: {String(tapeCount).padStart(5, '0')} CH // MODE: {personaMode.toUpperCase()}
        </div>
      </div>
    </>
  );
}

export default App;
