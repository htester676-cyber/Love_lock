import { useState, useRef, useEffect } from 'react';
import { sendMessage, onMessages } from './firebase';

export function Chat({ names, roomCode, myName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    if (!roomCode) return;
    const unsub = onMessages(roomCode, (msgs) => setMessages(msgs));
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    sendMessage(roomCode, { sender: myName, text: input.trim() });
    setInput('');
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "#fff", fontStyle: "italic" }}>
          {names[0]} 💕 {names[1]}
        </p>
        <p style={{ fontSize: "0.72rem", color: "rgba(245,230,234,0.4)", marginTop: 4 }}>
          Live Chat • Room {roomCode}
        </p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(245,230,234,0.3)', fontSize: '0.85rem', marginTop: 40 }}>
            Say something sweet 💕
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender === myName ? 'p1' : 'p2'}`}>
            <div className="chat-name">{msg.sender}</div>
            {msg.text}
            <div className="chat-time">{formatTime(msg.time)}</div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-text-input"
          placeholder={`Type a message...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="chat-send-btn" onClick={send}>💌</button>
      </div>
    </div>
  );
}
