import { useState, useRef, useEffect } from 'react';
import { setMusic, onMusic } from './firebase';

// Curated Tamil + Hindi + English love songs (YouTube video IDs)
const PLAYLISTS = {
  tamil: [
    { title: "Kannazhaga", artist: "Dhanush - 3 Movie", videoId: "HpJEWpXsqOs" },
    { title: "Ennai Nokki Paayum Thotta", artist: "Dhanush", videoId: "jqMGYH5jKhI" },
    { title: "Moongil Thottam", artist: "Kadal - AR Rahman", videoId: "tVS2XDkw_5M" },
    { title: "Nenjukkul Peidhidum", artist: "Vaaranam Aayiram - Harris Jayaraj", videoId: "EhfRsx3tXFw" },
    { title: "Munbe Vaa", artist: "Sillunu Oru Kaadhal - AR Rahman", videoId: "gMZ_wGaRbXE" },
    { title: "Idhazhin Oram", artist: "3 Movie - Anirudh", videoId: "wmq5gFEbquo" },
    { title: "Kaatru Veliyidai", artist: "AR Rahman", videoId: "3PsAIlmNdag" },
    { title: "Un Mela", artist: "VTV - AR Rahman", videoId: "n0h7gA2TR9o" },
    { title: "Oru Naal Koothu Paatu", artist: "Tamil Melody", videoId: "9rGYk1IQ8SE" },
    { title: "Thaeme Thaeme", artist: "Mersal - AR Rahman", videoId: "NqM9KfCBBHQ" },
  ],
  hindi: [
    { title: "Tum Hi Ho", artist: "Aashiqui 2 - Arijit Singh", videoId: "IJq0yyWug1k" },
    { title: "Raabta", artist: "Agent Vinod - Arijit Singh", videoId: "m-44zjh0cPw" },
    { title: "Tera Ban Jaunga", artist: "Kabir Singh - Akhil Sachdeva", videoId: "93vW1uaEYgE" },
    { title: "Hawayein", artist: "Jab Harry Met Sejal - Arijit", videoId: "cYOB941gyXI" },
    { title: "Channa Mereya", artist: "ADHM - Arijit Singh", videoId: "284Ov7ysmfA" },
  ],
  english: [
    { title: "Perfect", artist: "Ed Sheeran", videoId: "2Vv-BfVoq4g" },
    { title: "All of Me", artist: "John Legend", videoId: "450p7goxZqg" },
    { title: "A Thousand Years", artist: "Christina Perri", videoId: "rtOvBOTyX00" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", videoId: "lp-EO5I60KA" },
    { title: "Say You Won't Let Go", artist: "James Arthur", videoId: "0yW7w8F2TVA" },
  ]
};

export function MusicPlayer({ roomCode }) {
  const [activeTab, setActiveTab] = useState('tamil');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localFile, setLocalFile] = useState(null);
  const [localUrl, setLocalUrl] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) { setYtReady(true); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  // Listen for synced music from partner
  useEffect(() => {
    if (!roomCode) return;
    const unsub = onMusic(roomCode, (data) => {
      if (data && data.videoId && data.videoId !== currentVideo?.videoId) {
        playYouTube({ videoId: data.videoId, title: data.title, artist: data.artist }, false);
      }
    });
    return () => unsub();
  }, [roomCode]);

  const playYouTube = (song, broadcast = true) => {
    setCurrentVideo(song);
    setIsPlaying(true);
    setLocalUrl(null);
    if (audioRef.current) { audioRef.current.pause(); }

    if (playerRef.current) {
      playerRef.current.loadVideoById(song.videoId);
    }

    if (broadcast && roomCode) {
      setMusic(roomCode, { videoId: song.videoId, title: song.title, artist: song.artist });
    }
  };

  const handleLocalFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLocalFile(file);
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    setCurrentVideo({ title: file.name.replace(/\.[^.]+$/, ''), artist: 'Local Device', videoId: null });
    setIsPlaying(true);
    if (playerRef.current) playerRef.current.stopVideo?.();
  };

  const handleCustomUrl = () => {
    if (!customUrl.trim()) return;
    // Extract YouTube video ID from URL
    const match = customUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      playYouTube({ videoId: match[1], title: 'Custom Song', artist: 'YouTube' });
      setCustomUrl('');
    }
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  useEffect(() => {
    if (!ytReady) return;
    const container = document.getElementById('yt-player');
    if (!container) return;
    new window.YT.Player('yt-player', {
      height: '0',
      width: '0',
      playerVars: { autoplay: 0, controls: 0 },
      events: { onReady: onPlayerReady }
    });
  }, [ytReady]);

  const tabs = Object.keys(PLAYLISTS);

  return (
    <div className="music-page">
      <p className="section-title" style={{ fontSize: "1.6rem", fontFamily: "Playfair Display, serif", fontStyle: "italic", color: "#fff", marginBottom: 4, textAlign: "center" }}>
        Our Music 🎵
      </p>
      <p style={{ textAlign: "center", fontSize: "0.78rem", color: "rgba(245,230,234,0.4)", marginBottom: 16 }}>
        {roomCode ? "Synced live! 🔴" : "Listen together"}
      </p>

      {/* Now Playing */}
      {currentVideo && (
        <div className="music-player-card">
          <div className="music-visualizer">
            {[20, 35, 25, 45, 30, 40, 22, 38, 28, 42, 32, 36].map((h, i) => (
              <div key={i} className={`music-bar${isPlaying ? " playing" : ""}`}
                style={{ height: isPlaying ? undefined : "6px", "--bar-h": h + "px", animationDelay: (i * 0.08) + "s" }} />
            ))}
          </div>
          <div className="music-title">{currentVideo.title}</div>
          <div className="music-artist">{currentVideo.artist}</div>
          <div className="music-controls">
            <button className="music-ctrl-btn play-btn" onClick={() => {
              if (localUrl && audioRef.current) {
                isPlaying ? audioRef.current.pause() : audioRef.current.play();
              } else if (playerRef.current) {
                isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
              }
              setIsPlaying(!isPlaying);
            }}>
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>
        </div>
      )}

      {/* Local audio element */}
      {localUrl && <audio ref={audioRef} src={localUrl} autoPlay onEnded={() => setIsPlaying(false)} />}

      {/* Hidden YT Player */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        <div id="yt-player" />
      </div>

      {/* Custom YouTube URL */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input className="chat-text-input" placeholder="Paste YouTube URL..."
          value={customUrl} onChange={e => setCustomUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCustomUrl()}
          style={{ flex: 1 }} />
        <button className="btn" style={{ width: 'auto', padding: '10px 16px' }} onClick={handleCustomUrl}>▶</button>
      </div>

      {/* Local File Upload */}
      <label className="btn btn-ghost" style={{ display: 'block', textAlign: 'center', marginBottom: 16, cursor: 'pointer' }}>
        📱 Play from Device
        <input type="file" accept="audio/*" onChange={handleLocalFile} style={{ display: 'none' }} />
      </label>

      {/* Language Tabs */}
      <div className="nav" style={{ padding: '0 0 12px' }}>
        {tabs.map(t => (
          <button key={t} className={`nav-btn${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t === 'tamil' ? '🎵 Tamil' : t === 'hindi' ? '🎶 Hindi' : '🎧 English'}
          </button>
        ))}
      </div>

      {/* Playlist */}
      <div className="playlist">
        {PLAYLISTS[activeTab].map((s, i) => (
          <div key={i} className={`playlist-item${currentVideo?.videoId === s.videoId ? " active" : ""}`}
            onClick={() => playYouTube(s)}>
            <span className="pl-num">{currentVideo?.videoId === s.videoId && isPlaying ? "♫" : i + 1}</span>
            <div style={{ flex: 1 }}>
              <div className="pl-name">{s.title}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(245,230,234,0.35)" }}>{s.artist}</div>
            </div>
            <span style={{ color: '#f06090' }}>▶</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Karaoke component (kept from before)
const KARAOKE_SONGS = [
  {
    title: "Kannazhaga - 3 Movie 🎵",
    icon: "💕",
    lyrics: [
      { text: "Kannazhaga Kaadhal Seidhaai", turn: 1 },
      { text: "Kannukulle Nee Pugundhaai", turn: 2 },
      { text: "Ennai Marandhu Pogavillai", turn: 1 },
      { text: "Unnai Pirindhaal Thaazhvillai", turn: 2 },
      { text: "Pookal Ellaam Nee Thaanaa", turn: 1 },
      { text: "Kaatru Koodha Nee Thaanaa", turn: 2 },
      { text: "Kannazhaga Kaadhal Seidhaai", turn: 1 },
      { text: "En Kannukulle Nee Pugundhaai", turn: 2 },
    ],
  },
  {
    title: "Perfect - Ed Sheeran 🌹",
    icon: "🌹",
    lyrics: [
      { text: "I found a love, for me", turn: 1 },
      { text: "Darling, just dive right in", turn: 2 },
      { text: "And follow my lead", turn: 1 },
      { text: "Well, I found a girl", turn: 2 },
      { text: "Beautiful and sweet", turn: 1 },
      { text: "Oh, I never knew you were", turn: 2 },
      { text: "The someone waiting for me", turn: 1 },
      { text: "Baby, I'm dancing in the dark", turn: 2 },
      { text: "With you between my arms", turn: 1 },
      { text: "Barefoot on the grass", turn: 2 },
    ],
  },
  {
    title: "Tum Hi Ho - Aashiqui 2 💗",
    icon: "💗",
    lyrics: [
      { text: "Hum tere bin ab reh nahi sakte", turn: 1 },
      { text: "Tere bina kya wajood mera", turn: 2 },
      { text: "Tujhse juda agar ho jaayenge", turn: 1 },
      { text: "Toh khud se hi ho jaayenge judaa", turn: 2 },
      { text: "Kyunki tum hi ho", turn: 1 },
      { text: "Ab tum hi ho", turn: 2 },
      { text: "Zindagi ab tum hi ho", turn: 1 },
      { text: "Chain bhi mera tum hi ho", turn: 2 },
    ],
  },
];

export function Karaoke({ names }) {
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef(null);

  const startSinging = (songIdx) => {
    setSelectedSong(songIdx);
    setCurrentLine(0);
    setStarted(true);
  };

  useEffect(() => {
    if (started && selectedSong !== null) {
      intervalRef.current = setInterval(() => {
        setCurrentLine(l => {
          if (l >= KARAOKE_SONGS[selectedSong].lyrics.length - 1) {
            clearInterval(intervalRef.current);
            return l;
          }
          return l + 1;
        });
      }, 3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [started, selectedSong]);

  const reset = () => { setSelectedSong(null); setCurrentLine(0); setStarted(false); clearInterval(intervalRef.current); };

  if (selectedSong !== null && started) {
    const song = KARAOKE_SONGS[selectedSong];
    const line = song.lyrics[currentLine];
    return (
      <div className="karaoke-wrap">
        <div className="turn-indicator" style={{ background: line.turn === 1 ? "rgba(240,96,144,0.15)" : "rgba(100,150,240,0.15)", color: line.turn === 1 ? "#f06090" : "#a0b8f0" }}>
          🎤 {line.turn === 1 ? names[0] : names[1]}'s turn
        </div>
        <div className="lyrics-display">
          {song.lyrics.map((l, i) => (
            <div key={i} className={`lyric-line${i === currentLine ? " active" : i < currentLine ? " sung" : ""}`}>
              {l.text}
            </div>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={reset}>← Pick Another Song</button>
      </div>
    );
  }

  return (
    <div>
      <div className="karaoke-song-list">
        {KARAOKE_SONGS.map((s, i) => (
          <div key={i} className="karaoke-song-item" onClick={() => startSinging(i)}>
            <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: "0.9rem" }}>{s.title}</div>
              <div style={{ color: "rgba(245,230,234,0.4)", fontSize: "0.72rem", marginTop: 2 }}>Tap to sing together</div>
            </div>
            <span style={{ color: "#f06090" }}>🎤</span>
          </div>
        ))}
      </div>
    </div>
  );
}
