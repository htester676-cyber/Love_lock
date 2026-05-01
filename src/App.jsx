import { useState, useEffect, useCallback } from 'react';
import { TruthOrDare, WouldYouRather, MemoryGame, NeverHaveIEver, DateIdeas, CoupleQuiz, Confessions } from './Games';
import { MusicPlayer, Karaoke } from './Music';
import { Chat } from './Chat';
import { DrawingPad } from './DrawingPad';
import Login from './Login';
import { onRoomUsers, messaging, getToken, onMessage, db, ref, set } from './firebase';

const GAMES = [
  { id: "tod", icon: "🃏", name: "Truth or Dare", desc: "Spicy couples edition", wide: false },
  { id: "wyr", icon: "💬", name: "Would You Rather", desc: "Reveal your choices", wide: true },
  { id: "memo", icon: "🧠", name: "Memory Match", desc: "Find the pair", wide: false },
  { id: "nhie", icon: "🤭", name: "Never Have I Ever", desc: "Confess your secrets", wide: false },
  { id: "date", icon: "📅", name: "Date Ideas", desc: "Find something fun", wide: true },
  { id: "quiz", icon: "🎯", name: "Couple Quiz", desc: "How well do you know each other?", wide: false },
  { id: "confess", icon: "💌", name: "Confessions", desc: "Leave sweet notes", wide: false },
  { id: "karaoke", icon: "🎤", name: "Sing Together", desc: "Karaoke for two", wide: true },
];

const GAME_TITLES = {
  tod: ["Truth or Dare 🃏", "Spicy couples edition"],
  wyr: ["Would You Rather 💬", "Reveal your true choices"],
  memo: ["Memory Match 🧠", "Find all the pairs together"],
  nhie: ["Never Have I Ever 🤭", "Let's see what you've done"],
  date: ["Date Ideas 📅", "Inspiration for your next date"],
  quiz: ["Couple Quiz 🎯", "How well do you know each other?"],
  confess: ["Sweet Confessions 💌", "Drop a note for your love"],
  karaoke: ["Sing Together 🎤", "Duet karaoke for couples"],
};

export default function App() {
  const [user, setUser] = useState(null); // { name, code, role, uid }
  const [tab, setTab] = useState("games");
  const [activeGame, setActiveGame] = useState(null);
  const [partner, setPartner] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Listen for partner joining
  useEffect(() => {
    if (!user) return;
    const unsub = onRoomUsers(user.code, (users) => {
      if (user.role === 'host' && users.guest && partner !== users.guest) {
        setPartner(users.guest);
        showToast(`${users.guest} joined the room! 💕`);
      }
      if (user.role === 'guest' && users.host && partner !== users.host) {
        setPartner(users.host);
      }
    });
    return () => unsub();
  }, [user, partner, showToast]);

  useEffect(() => {
    if (user && user.uid && messaging) {
      const requestPushPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging);
            if (token) await set(ref(db, `users/${user.uid}/fcmToken`), token);
          }
        } catch (e) {
          console.log('Push notification skipped:', e);
        }
      };
      requestPushPermission();

      const unsub = onMessage(messaging, (payload) => {
        showToast(`💌 ${payload.notification?.title}: ${payload.notification?.body}`);
      });
      return () => unsub();
    }
  }, [user, showToast]);

  const names = user ? (
    user.role === 'host'
      ? [user.name, partner || 'Waiting...']
      : [partner || 'Partner', user.name]
  ) : ['You', 'Them'];

  const handleLogin = (data) => setUser(data);
  const handleLogout = () => { setUser(null); setPartner(null); setTab('games'); };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderGame = () => {
    switch (activeGame) {
      case "tod": return <TruthOrDare />;
      case "wyr": return <WouldYouRather />;
      case "memo": return <MemoryGame />;
      case "nhie": return <NeverHaveIEver />;
      case "date": return <DateIdeas />;
      case "quiz": return <CoupleQuiz />;
      case "confess": return <Confessions />;
      case "karaoke": return <Karaoke names={names} />;
      default: return null;
    }
  };

  const floatHearts = Array.from({ length: 10 }, (_, i) => ({
    left: (i * 11 + 5) + "%",
    delay: (i * 1.3) + "s",
    duration: (8 + i * 1.1) + "s",
  }));

  const TABS = [
    ["🎮", "Games", "games"],
    ["🎵", "Music", "music"],
    ["💬", "Chat", "chat"],
    ["🎨", "Draw", "draw"],
    ["💑", "Us", "profile"],
  ];

  return (
    <div className="app">
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>
      <div className="hearts-bg">
        {floatHearts.map((h, i) => (
          <div key={i} className="float-heart" style={{ left: h.left, bottom: "-40px", animationDelay: h.delay, animationDuration: h.duration }}>❤️</div>
        ))}
      </div>

      <div className="container">
        {/* Room Status Bar */}
        <div className="room-bar">
          <div className="room-status">
            <span className={`status-dot${partner ? ' online' : ''}`} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(245,230,234,0.5)' }}>
              Room: <strong style={{ color: '#f06090' }}>{user.code}</strong>
              {partner ? ` • ${partner} is here 💕` : ' • Share code with your love'}
            </span>
          </div>
        </div>

        {tab === "games" && (
          <>
            <div className="header">
              <h1 className="header-title">Love<span>Lock</span></h1>
              <p className="header-sub">Made for two hearts</p>
              <div className="couple-names">
                <span className="name-badge">💛 {names[0]}</span>
                <span className="heart-divider">♥</span>
                <span className="name-badge">💛 {names[1]}</span>
              </div>
            </div>
            <div className="section">
              <p className="section-title">Choose a game, love ✨</p>
              <div className="game-grid">
                {GAMES.map(g => (
                  <div key={g.id} className={`game-card${g.wide ? " wide" : ""}`} onClick={() => setActiveGame(g.id)}>
                    <span className="card-icon">{g.icon}</span>
                    <div>
                      <div className="card-name">{g.name}</div>
                      <div className="card-desc">{g.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "music" && <MusicPlayer roomCode={user.code} />}
        {tab === "chat" && <Chat names={names} roomCode={user.code} myName={user.name} />}
        {tab === "draw" && <DrawingPad roomCode={user.code} />}

        {tab === "profile" && (
          <div style={{ padding: "30px 20px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "5rem", marginBottom: 16 }}>💑</div>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "#fff", fontStyle: "italic" }}>
              {names[0]} <span style={{ color: "#f06090" }}>♥</span> {names[1]}
            </p>
            <p style={{ color: "rgba(245,230,234,0.4)", fontSize: "0.8rem", marginTop: 8 }}>
              {partner ? '🔴 Both online!' : 'Waiting for partner to join...'}
            </p>

            {/* Room Code Display */}
            <div className="room-code-display">
              <p style={{ fontSize: '0.72rem', color: 'rgba(245,230,234,0.4)', marginBottom: 8 }}>Share this code with your love</p>
              <div className="room-code-big">{user.code}</div>
              <button className="btn" style={{ marginTop: 12, fontSize: '0.82rem' }} onClick={() => {
                navigator.clipboard?.writeText(user.code);
              }}>📋 Copy Code</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
              {[
                ["🎮", "Games", "8"],
                ["💌", "Songs", "25+"],
                ["🎯", "Room", user.code],
                ["🌹", "Status", partner ? "Live" : "Solo"],
              ].map(([icon, label, val], i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(240,96,144,0.12)", padding: "16px 12px" }}>
                  <div style={{ fontSize: "1.5rem" }}>{icon}</div>
                  <div style={{ fontSize: "1.2rem", color: "#f06090", fontWeight: 700, margin: "4px 0" }}>{val}</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(245,230,234,0.4)" }}>{label}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={handleLogout}>
              🚪 Leave Room
            </button>
          </div>
        )}
      </div>

      {/* GAME MODAL */}
      {activeGame && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveGame(null)}>
          <div className="modal" style={{ position: "relative" }}>
            <div className="modal-handle" />
            <button className="close-btn" onClick={() => setActiveGame(null)}>×</button>
            <h2 className="modal-title">{GAME_TITLES[activeGame]?.[0]}</h2>
            <p className="modal-sub">{GAME_TITLES[activeGame]?.[1]}</p>
            {renderGame()}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        {TABS.map(([icon, label, id]) => (
          <button key={id} className={`bnav-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
            <span className="bnav-icon">{icon}</span>
            <span className="bnav-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
