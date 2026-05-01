import { useState, useEffect } from 'react';
import { createRoom, joinRoom, generateRoomCode, auth, googleProvider, signInWithPopup } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState(null); // null, 'create', 'join'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [genCode, setGenCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      if (u && !name) setName(u.displayName || '');
      setAuthLoading(false);
    });
    return () => unsub();
  }, [name]);

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError('Google Sign-In failed.');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) { setError('Enter your name 💕'); return; }
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      await createRoom(roomCode, name.trim());
      setGenCode(roomCode);
      onLogin({ name: name.trim(), code: roomCode, role: 'host', uid: authUser?.uid });
    } catch (e) {
      setError('Could not create room. Check Firebase config.');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim()) { setError('Enter your name 💕'); return; }
    if (!code.trim() || code.length !== 6) { setError('Enter a valid 6-digit code'); return; }
    setLoading(true);
    try {
      const room = await joinRoom(code.trim(), name.trim());
      if (!room) { setError('Room not found! Check the code.'); setLoading(false); return; }
      onLogin({ name: name.trim(), code: code.trim(), role: 'guest', uid: authUser?.uid });
    } catch (e) {
      setError('Could not join room. Check your connection.');
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-glow" />
        <div className="login-card">
          <p style={{color: 'white'}}>Loading our memories... 💖</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-glow" />
      <div className="login-card">
        <div className="login-icon">💕</div>
        <h1 className="login-title">Love<span>Lock</span></h1>
        <p className="login-sub">Connect with your love</p>

        {!authUser ? (
          <div className="login-actions" style={{ marginTop: '20px' }}>
            {error && <p className="login-error">{error}</p>}
            <button className="btn login-btn" onClick={handleGoogleLogin}>
              Sign in with Google 🚀
            </button>
            <p style={{ color: 'rgba(245,230,234,0.5)', fontSize: '0.8rem', marginTop: '16px' }}>
              Sign in to save your memories and progress
            </p>
          </div>
        ) : (
          <>
            {!mode && (
              <div className="login-actions">
                <button className="btn login-btn" onClick={() => setMode('create')}>
                  ✨ Create Room
                </button>
                <button className="btn btn-ghost login-btn" onClick={() => setMode('join')}>
                  🔑 Join Room
                </button>
              </div>
            )}

            {mode && (
              <div className="login-form">
                <input
                  className="login-input"
                  placeholder="Your name..."
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  maxLength={20}
                />
                {mode === 'join' && (
                  <input
                    className="login-input"
                    placeholder="6-digit room code..."
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    maxLength={6}
                    inputMode="numeric"
                  />
                )}
                {error && <p className="login-error">{error}</p>}
                <button className="btn login-btn" onClick={mode === 'create' ? handleCreate : handleJoin} disabled={loading}>
                  {loading ? '⏳ Connecting...' : mode === 'create' ? '💫 Create & Share Code' : '💕 Join My Love'}
                </button>
                <button className="btn btn-ghost login-btn" onClick={() => { setMode(null); setError(''); }}>
                  ← Back
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
