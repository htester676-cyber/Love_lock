import { useState, useEffect } from 'react';
import { createRoom, joinRoom, generateRoomCode, auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState(null); // null, 'create', 'join'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      setError(e.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMode(null);
      setError('');
    } catch (e) {
      setError('Could not sign out.');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) { setError('Enter your name 💕'); return; }
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      await createRoom(roomCode, name.trim());
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
            <form onSubmit={handleEmailAuth} className="login-form">
              <input
                type="email"
                className="login-input"
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
              />
              <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
              {error && <p className="login-error" style={{ fontSize: '0.8rem' }}>{error}</p>}
              
              <button type="submit" className="btn login-btn" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? '⏳ Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <p style={{ color: 'rgba(245,230,234,0.7)', fontSize: '0.9rem', marginTop: '16px', cursor: 'pointer' }} onClick={() => {setIsSignUp(!isSignUp); setError('');}}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </p>

            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(245,230,234,0.2)' }}></div>
              <span style={{ padding: '0 10px', color: 'rgba(245,230,234,0.5)', fontSize: '0.8rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(245,230,234,0.2)' }}></div>
            </div>

            <button type="button" className="btn btn-ghost login-btn" onClick={handleGoogleLogin}>
              <span style={{ marginRight: '8px' }}>🚀</span> Continue with Google
            </button>
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
                <p style={{ color: 'rgba(245,230,234,0.5)', fontSize: '0.8rem', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }} onClick={handleSignOut}>
                  Sign Out ({authUser.email || authUser.displayName || 'User'})
                </p>
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
