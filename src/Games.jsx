import { useState } from 'react';

const TRUTHS = [];
const DARES = [];

export function TruthOrDare() {
  const [card, setCard] = useState(null);
  const [type, setType] = useState(null);
  const pick = (t) => {
    const list = t === "truth" ? TRUTHS : DARES;
    setType(t);
    if (list.length === 0) {
      setCard("No cards added yet.");
      return;
    }
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

const WYR = [];

export function WouldYouRather() {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState({ a: false, b: false });
  const q = WYR.length > 0 ? WYR[idx % WYR.length] : { q: "No questions added", a: "-", b: "-" };
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

const NEVER_HAVE_I_EVER = [];

export function NeverHaveIEver() {
  const [idx, setIdx] = useState(0);
  const q = NEVER_HAVE_I_EVER.length > 0 ? NEVER_HAVE_I_EVER[idx % NEVER_HAVE_I_EVER.length] : "No questions added";

  const next = () => { setIdx(i => i + 1); };

  return (
    <div className="nhie-wrap">
      <div className="nhie-card">
        <p className="nhie-text">"{q}"</p>
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
        <button className="btn" style={{ background: "rgba(100,200,120,0.2)", border: "1px solid rgba(100,200,120,0.5)", color: "#90e0a0" }} onClick={next}>I Have 🙋</button>
        <button className="btn" style={{ background: "rgba(240,80,80,0.2)", border: "1px solid rgba(240,80,80,0.5)", color: "#f08080" }} onClick={next}>I Haven't 🙅</button>
      </div>
      <button className="btn btn-ghost" onClick={next}>Next Question →</button>
    </div>
  );
}

const DATE_IDEAS = [];

export function DateIdeas() {
  const [picked, setPicked] = useState(null);
  const random = () => {
    if (DATE_IDEAS.length > 0) {
      setPicked(DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)]);
    }
  };
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

const QUIZ_Q = [];

export function CoupleQuiz() {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  const q = QUIZ_Q.length > 0 ? QUIZ_Q[qi] : { q: "No questions added", opts: [] };
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
  const [list, setList] = useState([]);
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
