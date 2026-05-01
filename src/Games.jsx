import { useState } from 'react';

const TRUTHS = [
  "What's the most romantic thing you've ever done for someone?",
  "What's one thing about me you've never told me?",
  "What's your love language and why?",
  "When did you first realize you had feelings for me?",
  "What's your biggest relationship fear?",
  "What's a dream date you've imagined but never told me?",
  "What quality in me do you love most?",
  "What's one memory of us you'll never forget?",
  "What's something you wish I did more often?",
  "Describe your perfect morning with me.",
];
const DARES = [
  "Sing 10 seconds of a love song for me 🎵",
  "Write me a haiku right now ✍️",
  "Give me a 30-second massage 💆",
  "Say 5 things you love about me out loud",
  "Do your best impression of me!",
  "Send a sweet message to each other's parents 📱",
  "Slow dance together for 60 seconds 💃",
  "Take a cute photo together 📸",
  "Make a promise you'll keep for a week",
  "Cook or order my favorite meal tonight 🍜",
];

export function TruthOrDare() {
  const [card, setCard] = useState(null);
  const [type, setType] = useState(null);
  const pick = (t) => {
    const list = t === "truth" ? TRUTHS : DARES;
    setType(t);
    setCard(list[Math.floor(Math.random() * list.length)]);
  };
  return (
    <div>
      <div className="tod-btns">
        <button className="tod-btn truth" onClick={() => pick("truth")}>✨ Truth</button>
        <button className="tod-btn dare" onClick={() => pick("dare")}>🔥 Dare</button>
      </div>
      <div className="card-reveal">
        {card ? (
          <>
            <span className="card-reveal-label">{type === "truth" ? "✨ Truth" : "🔥 Dare"}</span>
            <p className="card-reveal-text">{card}</p>
          </>
        ) : (
          <p style={{ color: "rgba(245,230,234,0.3)", fontSize: "0.85rem" }}>Pick Truth or Dare to begin 💕</p>
        )}
      </div>
      {card && <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => pick(type)}>Next Card ↻</button>}
    </div>
  );
}

const WYR = [
  { q: "Would you rather...", a: "Go on an adventure trip 🏔️", b: "Cozy staycation at home 🏠" },
  { q: "Would you rather...", a: "Read each other's minds 🧠", b: "Feel exactly what each other feels 💓" },
  { q: "Would you rather...", a: "Always laugh together 😂", b: "Always understand each other 🤝" },
  { q: "Would you rather...", a: "Meet in childhood 🧒", b: "Meet exactly when you did ✨" },
  { q: "Would you rather...", a: "Travel every month ✈️", b: "Build a dream home 🏡" },
  { q: "Would you rather...", a: "Never argue again 🕊️", b: "Always make up quickly 💋" },
];

export function WouldYouRather() {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState({ a: false, b: false });
  const q = WYR[idx % WYR.length];
  const next = () => { setIdx(i => i + 1); setChosen({ a: false, b: false }); };
  return (
    <div>
      <div className="wyr-card">
        <div className="wyr-q">{q.q}</div>
        <div className="wyr-options">
          <div className={`wyr-opt${chosen.a ? " chosen" : ""}`} onClick={() => setChosen(c => ({ ...c, a: true }))}>{q.a}</div>
          <div className={`wyr-opt${chosen.b ? " chosen" : ""}`} onClick={() => setChosen(c => ({ ...c, b: true }))}>{q.b}</div>
        </div>
      </div>
      <button className="btn" onClick={next}>Next Question →</button>
    </div>
  );
}

const MEMO_EMOJIS = ["🌹", "💌", "💍", "🦋", "🌙", "⭐", "💖", "🎁"];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export function MemoryGame() {
  const [cards, setCards] = useState(() => shuffle([...MEMO_EMOJIS, ...MEMO_EMOJIS]).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })));
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const flip = (id) => {
    if (selected.length === 2) return;
    const card = cards.find(c => c.id === id);
    if (card.flipped || card.matched) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);
    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected.map(i => newCards.find(c => c.id === i));
      if (a.emoji === b.emoji) {
        setCards(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, matched: true } : c));
        setMatches(m => m + 1);
        setSelected([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 800);
      }
    }
  };
  const reset = () => {
    setCards(shuffle([...MEMO_EMOJIS, ...MEMO_EMOJIS]).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })));
    setSelected([]); setMoves(0); setMatches(0);
  };
  return (
    <div>
      <div className="score-bar">
        <span>Moves: <span className="score-num">{moves}</span></span>
        <span>Matched: <span className="score-num">{matches}/8</span></span>
        <button className="btn" style={{ width: "auto", padding: "6px 14px", fontSize: "0.78rem" }} onClick={reset}>Reset</button>
      </div>
      <div className="memo-grid">
        {cards.map(c => (
          <div key={c.id} className={`memo-card${c.flipped || c.matched ? " flipped" : ""}${c.matched ? " matched" : ""}`} onClick={() => flip(c.id)}>
            {(c.flipped || c.matched) ? c.emoji : "💕"}
          </div>
        ))}
      </div>
      {matches === 8 && <p style={{ textAlign: "center", color: "#f06090", fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.1rem" }}>You're in sync! 💞</p>}
    </div>
  );
}

const SPIN_DARES = ["Kiss 💋", "Hug 🤗", "Compliment 💬", "Massage 💆", "Cook for me 🍳", "Love note 💌", "Dance 💃", "Sing 🎵"];

export function SpinBottle() {
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [result, setResult] = useState(null);
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const extra = 1440 + Math.floor(Math.random() * 360);
    const newDeg = deg + extra;
    setDeg(newDeg);
    // Needle is at top (0°). Wheel rotates clockwise by newDeg.
    // The segment at the top after rotation is at angle (360 - newDeg % 360) % 360
    const segmentAngle = 360 / SPIN_DARES.length; // 45° per segment
    const pointerAngle = ((360 - (newDeg % 360)) % 360 + segmentAngle / 2) % 360;
    const idx = Math.floor(pointerAngle / segmentAngle);
    setTimeout(() => { setResult(SPIN_DARES[idx % SPIN_DARES.length]); setSpinning(false); }, 2500);
  };
  return (
    <div className="spin-wrap">
      <div className="spin-wheel" onClick={spin}>
        <div className="spin-needle">💘</div>
        <div className="spin-circle" style={{ transform: `rotate(${deg}deg)`, transition: spinning ? "transform 2.5s cubic-bezier(0.17,0.67,0.3,1)" : "none" }}>
          {SPIN_DARES.map((d, i) => (
            <div key={i} style={{ position: "absolute", transform: `rotate(${(i / SPIN_DARES.length) * 360}deg) translate(60px)`, fontSize: "0.65rem", color: "rgba(245,230,234,0.6)", whiteSpace: "nowrap" }}>{d}</div>
          ))}
          <div style={{ fontSize: "2rem" }}>🍾</div>
        </div>
      </div>
      <button className="btn" onClick={spin} disabled={spinning}>{spinning ? "Spinning... 🌀" : "Spin! 💫"}</button>
      {result && !spinning && (
        <div className="spin-result">
          <p style={{ color: "rgba(245,230,234,0.5)", fontSize: "0.75rem", marginBottom: 6 }}>Your challenge:</p>
          <p style={{ fontSize: "1.2rem", color: "#fff", fontFamily: "Playfair Display, serif", fontStyle: "italic" }}>{result}</p>
        </div>
      )}
    </div>
  );
}

const DATE_IDEAS = [
  { icon: "🌅", name: "Sunrise Picnic", sub: "Pack breakfast & watch sunrise" },
  { icon: "🎨", name: "Paint Night", sub: "Paint each other's portraits" },
  { icon: "🎬", name: "Movie Marathon", sub: "Old favourites & blankets" },
  { icon: "🍳", name: "Cooking Challenge", sub: "Cook a new cuisine together" },
  { icon: "⭐", name: "Stargazing", sub: "Night sky & hot chocolate" },
  { icon: "📸", name: "Photo Walk", sub: "Capture a day in your city" },
  { icon: "🎮", name: "Game Night", sub: "Board games or video games" },
  { icon: "💌", name: "Letter Exchange", sub: "Write letters, swap & read" },
];

export function DateIdeas() {
  const [picked, setPicked] = useState(null);
  const random = () => setPicked(DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)]);
  return (
    <div>
      <button className="btn" style={{ marginBottom: 16 }} onClick={random}>🎲 Surprise Me!</button>
      {picked && (
        <div style={{ textAlign: "center", padding: "20px", background: "rgba(240,96,144,0.1)", borderRadius: 20, border: "1px solid rgba(240,96,144,0.3)", marginBottom: 16 }}>
          <div style={{ fontSize: "3rem" }}>{picked.icon}</div>
          <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "#fff", margin: "8px 0 4px", fontStyle: "italic" }}>{picked.name}</p>
          <p style={{ fontSize: "0.8rem", color: "rgba(245,230,234,0.5)" }}>{picked.sub}</p>
        </div>
      )}
      {DATE_IDEAS.map((d, i) => (
        <div key={i} className="date-item">
          <span className="date-icon">{d.icon}</span>
          <div><div className="date-name">{d.name}</div><div className="date-sub">{d.sub}</div></div>
        </div>
      ))}
    </div>
  );
}

const QUIZ_Q = [
  { q: "What's my favourite colour?", opts: ["Red", "Blue", "Pink", "Green"] },
  { q: "Where would I most love to travel?", opts: ["Paris", "Tokyo", "Maldives", "New York"] },
  { q: "What's my love language?", opts: ["Words of Affirmation", "Physical Touch", "Quality Time", "Acts of Service"] },
  { q: "What food could I eat every day?", opts: ["Pizza", "Sushi", "Biryani", "Pasta"] },
];

export function CoupleQuiz() {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  const q = QUIZ_Q[qi];
  const answer = (opt) => {
    if (chosen) return;
    setChosen(opt);
    setScore(s => s + 1);
    setTimeout(() => {
      if (qi + 1 >= QUIZ_Q.length) setDone(true);
      else { setQi(i => i + 1); setChosen(null); }
    }, 800);
  };
  const reset = () => { setQi(0); setScore(0); setChosen(null); setDone(false); };
  if (done) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏆</div>
      <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "#fff", fontStyle: "italic" }}>How well do you know each other?</p>
      <div style={{ fontSize: "2.5rem", color: "#f06090", fontFamily: "Playfair Display, serif", margin: "12px 0" }}>{score}/{QUIZ_Q.length}</div>
      <button className="btn" onClick={reset}>Play Again 🔁</button>
    </div>
  );
  return (
    <div>
      <div className="score-bar">
        <span>Question {qi + 1} of {QUIZ_Q.length}</span>
        <span>Score: <span className="score-num">{score}</span></span>
      </div>
      <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.05rem", color: "#fff", fontStyle: "italic", marginBottom: 16, lineHeight: 1.5 }}>{q.q}</div>
      {q.opts.map((o, i) => (
        <button key={i} className={`quiz-opt${chosen === o ? " correct" : chosen && chosen !== o ? " wrong" : ""}`} onClick={() => answer(o)}>{o}</button>
      ))}
    </div>
  );
}

export function Confessions() {
  const [text, setText] = useState("");
  const [list, setList] = useState(["I smile every time I see your name on my phone 📱", "I saved our first chat screenshot still 💌"]);
  const add = () => { if (!text.trim()) return; setList(l => [text.trim(), ...l]); setText(""); };
  return (
    <div>
      <textarea className="confess-input" placeholder="Write a sweet confession or memory... 💕" value={text} onChange={e => setText(e.target.value)} rows={3} />
      <button className="btn" onClick={add}>Drop a Confession 💌</button>
      <div className="confess-list">
        {list.map((c, i) => <div key={i} className="confess-item">"{c}"</div>)}
      </div>
    </div>
  );
}
