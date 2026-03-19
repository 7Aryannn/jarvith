import React, { useState, useEffect, useRef } from 'react';

let audioCtx = null;
const playClick = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.025);
  } catch (e) {
    // Ignore audio errors
  }
};

const ChatInput = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const hasSpeechSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (hasSpeechSupport && !recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toUpperCase();
        setInput(transcript);
        onSendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [hasSpeechSupport, onSendMessage]);

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };


  const handleKeyDown = (e) => {
    // Only Send on Ctrl + Enter
    if (e.key === 'Enter' && e.ctrlKey && input.trim()) {
      e.preventDefault();
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value.toUpperCase()); // Force uppercase input
    playClick();
  };

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div style={{
      marginBottom: '2rem',
      position: 'relative',
      borderBottom: '1px solid currentColor',
      paddingBottom: '0.5rem',
      opacity: disabled ? 0.3 : 1,
      pointerEvents: disabled ? 'none' : 'auto'
    }}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "" : "AWAITING INPUT..."}
        rows={1}
        disabled={disabled}
        spellCheck="false"
        style={{
          overflow: 'hidden',
          display: 'block',
          width: hasSpeechSupport ? 'calc(100% - 60px)' : 'calc(100% - 20px)' /* reserving space for the cursor or mic */
        }}
      />
      {/* Blinking cursor effect linked to input box area */}
      {(!disabled && !input) && (
        <span 
          className="blink" 
          style={{ 
            position: 'absolute', 
            left: 0, 
            top: 2, /* visual centering alignment */
            pointerEvents: 'none' 
          }}
        >
          _
        </span>
      )}
      {hasSpeechSupport && (
        <button
          onClick={toggleListen}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: 0,
            bottom: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'currentColor',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            cursor: disabled ? 'default' : 'pointer',
            padding: 0,
            opacity: disabled ? 0 : 1
          }}
        >
          {isListening ? '[LIVE]' : '[MIC]'}
        </button>
      )}
    </div>
  );
};

export default ChatInput;
