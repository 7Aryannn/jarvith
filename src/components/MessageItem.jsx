import React, { useState, useEffect } from 'react';

// Specialized logic to render text character by character for GHOST mode or ERROR simulation
const StreamedText = ({ content, speed = 30, onComplete, mode }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    // For GHOST mode, occasionally inject long eerie pauses
    const stream = () => {
      if (i < content.length) {
        setDisplayedText(prev => prev + content.charAt(i));
        i++;
        
        let delay = speed;
        if (mode === 'ghost' && Math.random() < 0.05) {
          delay += 600; // eerie pause
        }
        
        setTimeout(stream, delay);
      } else if (onComplete) {
        onComplete();
      }
    };
    
    stream();
  }, [content, speed, mode, onComplete]);

  return <span>{displayedText}</span>;
};

// Main Message Component
const MessageItem = ({ 
  role, 
  content, 
  timestamp, 
  mode, 
  thought, 
  confidence, 
  isRedacted,
  hasError,
  memoryStamp
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [fadeStealth, setFadeStealth] = useState(false);
  const [errorCorrected, setErrorCorrected] = useState(false);
  const [showMainText, setShowMainText] = useState(!hasError && mode !== 'ghost');
  
  const tokenCount = Math.ceil(content.length / 4);
  const isUser = role === 'user';
  const prefix = isUser ? '' : '// ';

  // COLD mode specific terse formatting (trimming) handled upstream, mainly visual here
  const textColor = isUser ? 'var(--user-text)' : 'inherit';
  
  // Format timestamp +00:00
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    const remainingSecs = (secs % 60).toString().padStart(2, '0');
    return `+${mins}:${remainingSecs}`;
  };

  // Stealth mode logic
  useEffect(() => {
    if (!isUser && mode === 'stealth' && showMainText) {
      const timer = setTimeout(() => {
        setFadeStealth(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mode, isUser, showMainText]);

  // Error simulation logic
  useEffect(() => {
    if (!isUser && hasError) {
      const timer = setTimeout(() => {
        setErrorCorrected(true);
        // Add artificial delay before showing the real text
        setTimeout(() => setShowMainText(true), 100);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasError, isUser]);

  return (
    <div 
      style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        color: textColor,
        textTransform: isUser ? 'uppercase' : 'lowercase',
        position: 'relative',
        paddingLeft: isUser ? '0' : '1.5rem',
        opacity: fadeStealth ? 0.2 : 1,
        transition: 'opacity 2s ease-out'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ opacity: 0.5, flexShrink: 0, fontSize: '0.85rem' }}>
        {formatTime(timestamp)}
      </div>
      
      <div style={{ flexGrow: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        
        {/* Memory Stamp Injection */}
        {!isUser && memoryStamp && (
          <div style={{ opacity: 0.5, marginBottom: '0.5rem', fontSize: '0.8rem' }}>
            [RECALL: {formatTime(memoryStamp.timestamp)}] {memoryStamp.snippet}...
          </div>
        )}

        {/* Thought / Internal Monologue Mode */}
        {!isUser && thought && (
          <div style={{ color: 'var(--system-error)', opacity: 0.6, marginBottom: '0.5rem', fontStyle: 'italic' }}>
            &gt;&gt; {thought}
          </div>
        )}

        {/* Normal Content or Error Glitch */}
        {!isUser && hasError && !errorCorrected && (
          <div style={{ color: 'var(--system-error)', filter: 'blur(1px)' }}>
            $0xFF_FATAL_I/O_ERROR... // DATA CORRUPT [RETRYING]
          </div>
        )}

        {(showMainText || mode === 'ghost') && (
          <div>
            {content.split('\n').map((line, idx) => (
              <div key={idx} style={{ minHeight: '1.5em' }}>
                {prefix}
                
                {/* Mode handling: Ghost character streaming vs Normal */}
                {!isUser && mode === 'ghost' ? (
                  <StreamedText content={line} mode={mode} />
                ) : (
                  /* Redacted logic mapping */
                  !isUser && isRedacted ? (
                    line.split(' ').map((word, wIdx) => {
                      // Fake redact every 5th word if > 4 chars
                      const shouldRedact = word.length > 4 && wIdx % 5 === 0;
                      return (
                        <React.Fragment key={wIdx}>
                          {shouldRedact ? <span className="redacted">{word.replace(/./g, '█')}</span> : word}
                          {' '}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    line
                  )
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confidence Meter */}
        {!isUser && confidence !== undefined && (showMainText || mode === 'ghost') && (
          <div style={{
            marginTop: '0.5rem',
            height: '2px',
            width: '100px',
            background: `linear-gradient(90deg, var(--text-color) ${confidence}%, rgba(0,0,0,0) ${confidence}%)`,
            opacity: confidence < 40 ? (Math.random() > 0.5 ? 0.8 : 0.2) : 0.5, // glitch flicker if low confidence
            transition: 'opacity 0.1s'
          }} />
        )}
      </div>
      
      {/* Token count stamp */}
      {isHovered && !isUser && (
        <div style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          opacity: 0.2,
          fontSize: '0.7rem',
          border: '1px solid currentColor',
          padding: '2px 4px',
          pointerEvents: 'none'
        }}>
          TOKENS: {tokenCount}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
