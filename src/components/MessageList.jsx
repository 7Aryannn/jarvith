import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list-container">
      {/* Reverse order since it pushes from top conceptually but renders downward normally */}
      <div style={{ paddingBottom: '140px' }}> {/* Space for fade out zone */}
        {messages.map((msg, index) => (
          <MessageItem 
            key={msg.id || `${msg.timestamp}-${index}`}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            mode={msg.mode}
            thought={msg.thought}
            confidence={msg.confidence}
            isRedacted={msg.isRedacted}
            hasError={msg.hasError}
            memoryStamp={msg.memoryStamp}
          />
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      <div className="static-fade"></div>
    </div>
  );
};

export default MessageList;
