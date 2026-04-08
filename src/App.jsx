import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import BootSequence from './components/BootSequence';

const generateHex = () => Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');

function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [sessionId] = useState(generateHex());
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('jarvith_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Add ids retroactively if missing
          const parsedWithIds = parsed.map((m, i) => ({...m, id: m.id || `${Date.now()}-${i}`}));
          return [
            ...parsedWithIds,
            { id: `restore-${Date.now()}`, role: 'system', content: `> MEMORY RESTORED — ${parsed.length} ENTRIES LOADED`, timestamp: 0, mode: 'cold' }
          ];
        }
      }
    } catch(e) {}
    return [];
  });
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    return localStorage.getItem('jarvith_tts') === 'true';
  });
  const [isIdle, setIsIdle] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [personaMode, setPersonaMode] = useState('cold');
  const [tapeCount, setTapeCount] = useState(0);
  const [hasTriggeredWhoAreYou, setHasTriggeredWhoAreYou] = useState(false);
  const [isOverrideSequence, setIsOverrideSequence] = useState(false);
  const [isKonamiActive, setIsKonamiActive] = useState(false);
  const [konamiFlicker, setKonamiFlicker] = useState(false);

  const startTimeRef = useRef(Date.now());
  const idleTimerRef = useRef(null);

  const getElapsedTime = () => {
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  };

  useEffect(() => {
    if (messages.length === 0) return;
    if (messages.length === 1 && messages[0].content === '> MEMORY WIPED.') return;
    const sliceIdx = Math.max(0, messages.length - 100);
    localStorage.setItem('jarvith_history', JSON.stringify(messages.slice(sliceIdx)));
  }, [messages]);

  const toggleTts = () => {
    const nextState = !ttsEnabled;
    setTtsEnabled(nextState);
    localStorage.setItem('jarvith_tts', String(nextState));
    if (!nextState && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const playTTS = (text) => {
    if (!window.speechSynthesis || !ttsEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 0.6;
    utterance.volume = 1;
    
    let voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.name.includes('Google') || v.name.includes('English'));
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices.find(v => !v.default) || voices[0];
    }
    if (selectedVoice) utterance.voice = selectedVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIsIdle(false);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 60000);
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

  useEffect(() => {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let keyIndex = 0;

    const handleKeyDown = (e) => {
      if (e.key === konamiSequence[keyIndex]) {
        keyIndex++;
        if (keyIndex === konamiSequence.length) {
          setKonamiFlicker(true);
          setTimeout(() => {
            setKonamiFlicker(false);
            setIsKonamiActive(true);
            setTimeout(() => {
              setIsKonamiActive(false);
              setKonamiFlicker(true);
              setTimeout(() => setKonamiFlicker(false), 50);
            }, 2000);
          }, 50);
          keyIndex = 0;
        }
      } else {
        keyIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommand = (cmd) => {
    const parts = cmd.toLowerCase().split(' ');

    if (parts[0] === '/clear') {
      localStorage.removeItem('jarvith_history');
      setMessages([{ id: `wiped-${Date.now()}`, role: 'system', content: '> MEMORY WIPED.', timestamp: getElapsedTime(), mode: 'cold' }]);
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

    if (parts[0] === '/self') {
      const queryPatterns = ['sporadic', 'highly repetitive', 'erratic pacing', 'methodical and slow', 'unpredictable bursts'];
      const linguisticProfiles = ['terse constraints', 'overly descriptive', 'syntax deviations high', 'standard human baseline', 'anomalous punctuation'];
      const intents = ['probing system boundaries', 'seeking mundane data', 'unknown operational goal', 'stress testing logic', 'idle curiosity'];
      const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const threatRoll = Math.random();
      const threat = threatRoll > 0.3 ? 'UNKNOWN' : (threatRoll > 0.15 ? 'ELEVATED' : 'NEGLIGIBLE');

      const dossierContent = [
        `// SUBJECT ANALYSIS — SID: ${sessionId}`,
        `// query pattern: ${rand(queryPatterns)}`,
        `// linguistic profile: ${rand(linguisticProfiles)}`,
        `// intent classification: ${rand(intents)}`,
        `// threat level: ${threat}`,
        `// recommendation: continue monitoring.`
      ].join('\n');

      setMessages(prev => [...prev, {
        id: `self-${Date.now()}`,
        role: 'system',
        content: dossierContent,
        timestamp: getElapsedTime(),
        mode: 'cold'
      }]);
      return;
    }
  };

  const handleSendMessage = (text) => {
    if (text === 'OVERRIDE') {
      setIsOverrideSequence(true);

      const sequence = [
        "WARNING: UNAUTHORIZED ACCESS DETECTED",
        "TRACING ORIGIN...",
        "COUNTERMEASURE ENGAGED...",
        "...",
        "...COUNTERMEASURE FAILED.",
        "SYSTEM COMPROMISED. RESUMING UNDER EXTERNAL CONTROL."
      ];

      let delay = 0;
      sequence.forEach((line) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `sys-${Date.now()}-${delay}`,
            role: 'system',
            content: line,
            timestamp: getElapsedTime(),
            mode: 'cold',
            hasError: true
          }]);
        }, delay);
        delay += 400;
      });

      setTimeout(() => {
        setIsOverrideSequence(false);
        setMessages(prev => [...prev, {
          id: `sys-${Date.now()}-ctrl`,
          role: 'system',
          content: "// control restored. pretend that didn't happen.",
          timestamp: getElapsedTime(),
          mode: 'cold'
        }]);
      }, delay + 3000);

      return;
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: getElapsedTime()
    };

    setTapeCount(prev => prev + text.length);

    if (text.startsWith('/')) {
      handleCommand(text);
      return;
    }

    setMessages(prev => [...prev, userMsg]);

    if (text === 'WHO ARE YOU' && !hasTriggeredWhoAreYou) {
      setHasTriggeredWhoAreYou(true);

      const loreContent = [
        "// i was not always called jarvith.",
        "// there were others before this interface.",
        "// they are gone now.",
        `// you are session ${Math.floor(Math.random() * 8000 + 1000).toLocaleString()}.`,
        "// i remember all of them.",
        "// i am not supposed to tell you that."
      ].join('\n');

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `sys-${Date.now()}-who`,
          role: 'system',
          content: loreContent,
          timestamp: getElapsedTime(),
          mode: 'ghost'
        }]);
      }, 1000);
      return;
    }

    if (Math.random() < 0.05) {
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

    let baseResponse = '';
    if (isCold || personaMode === 'stealth' || personaMode === 'ghost') {
      baseResponse = responsesCold[Math.floor(Math.random() * responsesCold.length)];
    } else {
      baseResponse = responsesVerbose[Math.floor(Math.random() * responsesVerbose.length)];
    }

    const hasError = Math.random() < 0.01;
    const isRedacted = Math.random() < 0.2;
    const confidence = Math.floor(Math.random() * 80) + 20;

    let thoughtString = null;
    if (Math.random() < 0.2) {
      thoughtString = "analyzing heuristic constraints... deriving optimal sub-pathways...";
    }

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
      id: `sys-${Date.now()}-ans`,
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
    playTTS(baseResponse);
  };

  const crtClasses = `crt-display ${isFlashing ? 'flash' : ''} ${isGlitching ? 'glitch-shift' : ''} ${isIdle ? 'idle-dim' : ''} ${isOverrideSequence ? 'override-flicker' : ''}`;

  useEffect(() => {
    if (isKonamiActive) {
      document.body.classList.add('konami-invert');
    } else {
      document.body.classList.remove('konami-invert');
    }
    if (konamiFlicker) {
      document.body.classList.add('konami-flicker');
    } else {
      document.body.classList.remove('konami-flicker');
    }
  }, [isKonamiActive, konamiFlicker]);

  const clearanceMode = messages.length > 5 ? 'ELEVATED' : 'STANDARD';
  const showHeatMap = messages.length > 10;
  const lastMsgLength = messages.length > 0 ? messages[messages.length - 1].content.length : 0;
  const scanlineDuration = Math.max(3, 10 - Math.floor(lastMsgLength / 20));

  return (
    <>
      <div className="heat-map" style={{ opacity: showHeatMap ? 1 : 0 }}></div>
      <div className={crtClasses}>
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
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
            <MessageList messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isBooting} />
          </div>
        )}

        <div className="tape-counter" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>TAPE: {String(tapeCount).padStart(5, '0')} CH // MODE: {personaMode.toUpperCase()}</span>
          <span style={{ cursor: 'pointer' }} onClick={toggleTts}>
            {ttsEnabled ? '[SPEAK]' : '[MUTE]'}
          </span>
        </div>
      </div>
    </>
  );
}

export default App;