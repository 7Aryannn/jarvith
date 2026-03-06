import React, { useState, useEffect, useRef } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

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
          width: 'calc(100% - 20px)' /* reserving space for the cursor */
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
    </div>
  );
};

export default ChatInput;
