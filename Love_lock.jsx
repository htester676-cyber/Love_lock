import { useState, useEffect, useRef, useCallback } from "react";
import { auth, googleProvider, signInWithPopup, signOut, messaging, getToken, onMessage, db, ref, set } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');`;

const style = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #1a0a0f; }

  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a0a0f 0%, #2d0f1e 50%, #1a0a0f 100%);
    color: #f5e6ea;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .app::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at 30% 20%, rgba(220, 80, 120, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(180, 60, 100, 0.06) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .hearts-bg {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .float-heart {
    position: absolute;
    opacity: 0.04;
    font-size: 2rem;
    animation: floatUp linear infinite;
  }

  @keyframes floatUp {
    0% { transform: translateY(100vh) rotate(0deg); opacity: 0.04; }
    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
  }

  .container {
    position: relative;
    z-index: 1;
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    padding-bottom: 80px;
  }

  /* HEADER */
  .header {
    text-align: center;
    padding: 40px 20px 20px;
    position: relative;
  }

  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }

  .header-title span {
    color: #f06090;
    font-style: italic;
  }

  .header-sub {
    font-size: 0.8rem;
    color: rgba(245, 230, 234, 0.5);
    margin-top: 6px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .couple-names {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 16px 0 0;
  }

  .name-badge {
    background: rgba(240, 96, 144, 0.15);
    border: 1px solid rgba(240, 96, 144, 0.3);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 0.85rem;
    color: #f5c0d0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .name-badge:hover { background: rgba(240,96,144,0.25); }

  .heart-divider { color: #f06090; font-size: 1.1rem; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }

  /* NAV */
  .nav {
    display: flex;
    gap: 8px;
    padding: 12px 20px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .nav::-webkit-scrollbar { display: none; }

  .nav-btn {
    flex-shrink: 0;
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid rgba(240, 96, 144, 0.2);
    background: transparent;
    color: rgba(245, 230, 234, 0.6);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .nav-btn.active {
    background: #f06090;
    border-color: #f06090;
    color: #fff;
    font-weight: 500;
  }

  .nav-btn:hover:not(.active) {
    border-color: rgba(240, 96, 144, 0.5);
    color: #f5e6ea;
  }

  /* CARDS */
  .section { padding: 0 20px; }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: #fff;
    margin-bottom: 14px;
    font-style: italic;
  }

  .game-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .game-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(240, 96, 144, 0.15);
    border-radius: 20px;
    padding: 20px 16px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
  }

  .game-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(135deg, rgba(240,96,144,0.1) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .game-card:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(240, 96, 144, 0.4);
    box-shadow: 0 12px 40px rgba(240, 96, 144, 0.15);
  }

  .game-card:hover::before { opacity: 1; }

  .game-card.wide {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .card-icon {
    font-size: 2.2rem;
    margin-bottom: 10px;
    display: block;
    position: relative;
    z-index: 1;
  }

  .game-card.wide .card-icon { margin-bottom: 0; font-size: 2.6rem; }

  .card-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: #fff;
    position: relative;
    z-index: 1;
  }

  .card-desc {
    font-size: 0.72rem;
    color: rgba(245, 230, 234, 0.45);
    margin-top: 4px;
    position: relative;
    z-index: 1;
  }

  /* GAME MODAL */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 3, 6, 0.85);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex;
    align-items: flex-end;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: linear-gradient(180deg, #2d0f1e 0%, #1e0a14 100%);
    border: 1px solid rgba(240, 96, 144, 0.2);
    border-radius: 28px 28px 0 0;
    width: 100%;
    max-height: 88vh;
    overflow-y: auto;
    padding: 28px 24px 40px;
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    scrollbar-width: none;
  }
  .modal::-webkit-scrollbar { display: none; }

  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  .modal-handle {
    width: 40px; height: 4px;
    background: rgba(240, 96, 144, 0.3);
    border-radius: 2px;
    margin: 0 auto 20px;
  }

  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    color: #fff;
    font-style: italic;
    margin-bottom: 6px;
  }

  .modal-sub {
    font-size: 0.78rem;
    color: rgba(245,230,234,0.4);
    margin-bottom: 24px;
  }

  .close-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: rgba(240,96,144,0.15);
    border: none;
    border-radius: 50%;
    width: 36px; height: 36px;
    color: #f06090;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* TRUTH OR DARE */
  .tod-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .tod-btn {
    padding: 14px;
    border-radius: 16px;
    border: 2px solid;
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-style: italic;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 700;
  }

  .tod-btn.truth {
    background: rgba(100, 150, 240, 0.1);
    border-color: rgba(100, 150, 240, 0.4);
    color: #a0b8f0;
  }

  .tod-btn.dare {
    background: rgba(240, 96, 144, 0.1);
    border-color: rgba(240, 96, 144, 0.4);
    color: #f06090;
  }

  .tod-btn:hover { transform: scale(1.03); filter: brightness(1.2); }

  .card-reveal {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(240,96,144,0.2);
    border-radius: 20px;
    padding: 24px;
    text-align: center;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
  }

  .card-reveal-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #f06090;
    font-weight: 500;
  }

  .card-reveal-text {
    font-size: 1rem;
    color: #fff;
    line-height: 1.6;
    font-family: 'Playfair Display', serif;
    font-style: italic;
  }

  /* LOVE METER */
  .lm-names {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .lm-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(240,96,144,0.2);
    border-radius: 12px;
    padding: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    text-align: center;
    outline: none;
    width: 100%;
    transition: border-color 0.2s;
  }

  .lm-input:focus { border-color: rgba(240,96,144,0.5); }
  .lm-input::placeholder { color: rgba(245,230,234,0.3); }

  .lm-result {
    text-align: center;
    padding: 24px;
    background: rgba(255,255,255,0.04);
    border-radius: 20px;
    border: 1px solid rgba(240,96,144,0.15);
  }

  .lm-percent {
    font-family: 'Playfair Display', serif;
    font-size: 4rem;
    font-weight: 700;
    color: #f06090;
    line-height: 1;
  }

  .lm-bar {
    height: 10px;
    background: rgba(255,255,255,0.08);
    border-radius: 5px;
    margin: 14px 0 12px;
    overflow: hidden;
  }

  .lm-fill {
    height: 100%;
    border-radius: 5px;
    background: linear-gradient(90deg, #f06090, #ff9ab0);
    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .lm-msg {
    font-size: 0.9rem;
    color: rgba(245,230,234,0.7);
    font-style: italic;
    font-family: 'Playfair Display', serif;
  }

  /* WOULD YOU RATHER */
  .wyr-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(240,96,144,0.15);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 14px;
  }

  .wyr-q {
    padding: 20px;
    text-align: center;
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-style: italic;
    color: #fff;
    border-bottom: 1px solid rgba(240,96,144,0.1);
  }

  .wyr-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .wyr-opt {
    padding: 16px;
    text-align: center;
    font-size: 0.82rem;
    color: rgba(245,230,234,0.7);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .wyr-opt:first-child { border-right: 1px solid rgba(240,96,144,0.1); }

  .wyr-opt:hover, .wyr-opt.chosen {
    background: rgba(240,96,144,0.12);
    color: #fff;
  }

  .wyr-opt.chosen::after {
    content: '✓';
    position: absolute;
    top: 4px; right: 8px;
    color: #f06090;
    font-size: 0.8rem;
  }

  /* MEMORY GAME */
  .memo-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .memo-card {
    aspect-ratio: 1;
    border-radius: 12px;
    border: 1px solid rgba(240,96,144,0.2);
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.25s;
    user-select: none;
  }

  .memo-card.flipped {
    background: rgba(240,96,144,0.15);
    border-color: rgba(240,96,144,0.5);
  }

  .memo-card.matched {
    background: rgba(100,200,120,0.15);
    border-color: rgba(100,200,120,0.5);
    cursor: default;
  }

  .memo-card:not(.flipped):not(.matched):hover {
    background: rgba(255,255,255,0.08);
    transform: scale(1.05);
  }

  /* NEVER HAVE I EVER */
  .nhie-wrap {
    text-align: center;
  }
  .nhie-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(240,96,144,0.2);
    border-radius: 20px;
    padding: 30px 20px;
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .nhie-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-style: italic;
    color: #fff;
  }
  /* TOAST & LOGIN */
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .toast {
    background: rgba(240,96,144,0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease-out;
    font-size: 0.9rem;
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .login-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    text-align: center;
    z-index: 10;
    position: relative;
  }

  /* DATE WHEEL */
  .date-item {
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid rgba(240,96,144,0.12);
    background: rgba(255,255,255,0.03);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .date-icon { font-size: 1.5rem; }
  .date-name { font-size: 0.9rem; color: #fff; }
  .date-sub { font-size: 0.72rem; color: rgba(245,230,234,0.4); margin-top: 2px; }

  /* CONFESS */
  .confess-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(240,96,144,0.2);
    border-radius: 16px;
    padding: 16px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    resize: none;
    outline: none;
    min-height: 100px;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .confess-input:focus { border-color: rgba(240,96,144,0.4); }

  .confess-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }

  .confess-item {
    background: rgba(255,255,255,0.04);
    border-radius: 14px;
    padding: 14px;
    border-left: 3px solid #f06090;
    font-size: 0.85rem;
    color: rgba(245,230,234,0.8);
    font-style: italic;
    font-family: 'Playfair Display', serif;
  }

  /* BUTTONS */
  .btn {
    background: linear-gradient(135deg, #f06090, #d04070);
    border: none;
    border-radius: 14px;
    padding: 13px 24px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(240,96,144,0.3); }
  .btn:active { transform: translateY(0); }

  .btn-ghost {
    background: transparent;
    border: 1px solid rgba(240,96,144,0.3);
    color: #f06090;
  }
  .btn-ghost:hover { background: rgba(240,96,144,0.1); box-shadow: none; }

  /* SCORE */
  .score-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255,255,255,0.04);
    border-radius: 14px;
    border: 1px solid rgba(240,96,144,0.12);
    margin-bottom: 16px;
    font-size: 0.82rem;
    color: rgba(245,230,234,0.6);
  }
  .score-num { color: #f06090; font-weight: 600; font-size: 1rem; }

  /* QUIZ */
  .quiz-opt {
    padding: 13px 16px;
    border-radius: 12px;
    border: 1px solid rgba(240,96,144,0.15);
    background: rgba(255,255,255,0.03);
    color: rgba(245,230,234,0.8);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 8px;
    width: 100%;
    text-align: left;
  }

  .quiz-opt:hover { border-color: rgba(240,96,144,0.4); background: rgba(240,96,144,0.08); color: #fff; }
  .quiz-opt.correct { background: rgba(100,200,120,0.15); border-color: rgba(100,200,120,0.5); color: #90e0a0; }
  .quiz-opt.wrong { background: rgba(240,80,80,0.1); border-color: rgba(240,80,80,0.4); color: rgba(245,230,234,0.5); }

  /* BOTTOM NAV */
  .bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(26, 10, 15, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(240,96,144,0.1);
    display: flex;
    padding: 12px 20px 20px;
    gap: 4px;
    z-index: 50;
    max-width: 430px;
    margin: 0 auto;
  }

  .bnav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    border-radius: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(245,230,234,0.4);
  }

  .bnav-btn.active { color: #f06090; background: rgba(240,96,144,0.1); }
  .bnav-btn .bnav-icon { font-size: 1.3rem; }
  .bnav-btn .bnav-label { font-size: 0.6rem; font-family: 'DM Sans'; letter-spacing: 0.5px; }

  /* DIARY */
  .diary-entry {
    background: rgba(255,255,255,0.04);
    border-radius: 16px;
    padding: 16px;
    border: 1px solid rgba(240,96,144,0.12);
    margin-bottom: 10px;
  }
  .diary-date { font-size: 0.7rem; color: rgba(245,230,234,0.35); margin-bottom: 6px; }
  .diary-text { font-size: 0.88rem; color: rgba(245,230,234,0.8); line-height: 1.6; font-style: italic; font-family: 'Playfair Display', serif; }
`;

// ——— DATA ———
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

const WYR = [
  { q: "Would you rather...", a: "Go on an adventure trip 🏔️", b: "Cozy staycation at home 🏠" },
  { q: "Would you rather...", a: "Read each other's minds 🧠", b: "Feel exactly what each other feels 💓" },
  { q: "Would you rather...", a: "Always laugh together 😂", b: "Always understand each other 🤝" },
  { q: "Would you rather...", a: "Meet in childhood 🧒", b: "Meet exactly when you did ✨" },
  { q: "Would you rather...", a: "Travel every month ✈️", b: "Build a dream home 🏡" },
  { q: "Would you rather...", a: "Never argue again 🕊️", b: "Always make up quickly 💋" },
];

const NEVER_HAVE_I_EVER = [
  "Never have I ever pretended to be asleep to avoid talking to you.",
  "Never have I ever secretly worn your clothes.",
  "Never have I ever been jealous of one of your friends.",
  "Never have I ever snooped through your phone.",
  "Never have I ever forgotten an important anniversary.",
  "Never have I ever lied about liking a gift you gave me.",
  "Never have I ever imagined what our kids would look like.",
];

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

const QUIZ_Q = [
  { q: "What's my favourite colour?", opts: ["Red", "Blue", "Pink", "Green"] },
  { q: "Where would I most love to travel?", opts: ["Paris", "Tokyo", "Maldives", "New York"] },
  { q: "What's my love language?", opts: ["Words of Affirmation", "Physical Touch", "Quality Time", "Acts of Service"] },
  { q: "What food could I eat every day?", opts: ["Pizza", "Sushi", "Biryani", "Pasta"] },
];

const MEMO_EMOJIS = ["🌹", "💌", "💍", "🦋", "🌙", "⭐", "💖", "🎁"];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ——— GAMES ———
function TruthOrDare({ names }) {
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
      {card && (
        <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => pick(type)}>
          Next Card ↻
        </button>
      )}
    </div>
  );
}

function LoveMeter() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [result, setResult] = useState(null);

  const calc = () => {
    if (!p1.trim() || !p2.trim()) return;
    const combined = (p1 + p2).toLowerCase();
    let hash = 0;
    for (let c of combined) hash = (hash * 31 + c.charCodeAt(0)) % 100;
    const score = 60 + (hash % 40);
    const msgs = ["Made for each other! 💫", "Pure magic ✨", "Absolutely soulmates 🌹", "Unstoppable together 💪💕"];
    setResult({ score, msg: msgs[Math.floor(score / 25)] });
  };

  return (
    <div>
      <div className="lm-names">
        <input className="lm-input" placeholder="Your name" value={p1} onChange={e => setP1(e.target.value)} />
        <input className="lm-input" placeholder="Their name" value={p2} onChange={e => setP2(e.target.value)} />
      </div>
      <button className="btn" onClick={calc}>Calculate Love 💖</button>
      {result && (
        <div className="lm-result" style={{ marginTop: 16 }}>
          <div className="lm-percent">{result.score}%</div>
          <div className="lm-bar"><div className="lm-fill" style={{ width: result.score + "%" }} /></div>
          <p className="lm-msg">{result.msg}</p>
        </div>
      )}
    </div>
  );
}

function WouldYouRather() {
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

function MemoryGame() {
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
          <div
            key={c.id}
            className={`memo-card${c.flipped || c.matched ? " flipped" : ""}${c.matched ? " matched" : ""}`}
            onClick={() => flip(c.id)}
          >
            {(c.flipped || c.matched) ? c.emoji : "💕"}
          </div>
        ))}
      </div>
      {matches === 8 && <p style={{ textAlign: "center", color: "#f06090", fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.1rem" }}>You're in sync! 💞</p>}
    </div>
  );
}

function NeverHaveIEver() {
  const [idx, setIdx] = useState(0);
  const q = NEVER_HAVE_I_EVER[idx % NEVER_HAVE_I_EVER.length];

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

function DateIdeas() {
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
          <div>
            <div className="date-name">{d.name}</div>
            <div className="date-sub">{d.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoupleQuiz({ names }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);

  const q = QUIZ_Q[qi];
  const answer = (opt) => {
    if (chosen) return;
    setChosen(opt);
    setScore(s => s + 1); // for fun, always score (it's about knowing each other)
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
      <p style={{ color: "rgba(245,230,234,0.5)", fontSize: "0.82rem", marginBottom: 16 }}>Compare answers and learn more about each other!</p>
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
        <button
          key={i}
          className={`quiz-opt${chosen === o ? " correct" : chosen && chosen !== o ? " wrong" : ""}`}
          onClick={() => answer(o)}
        >{o}</button>
      ))}
    </div>
  );
}

function Confessions() {
  const [text, setText] = useState("");
  const [list, setList] = useState([
    "I smile every time I see your name on my phone 📱",
    "I saved our first chat screenshot still 💌",
  ]);

  const add = () => {
    if (!text.trim()) return;
    setList(l => [text.trim(), ...l]);
    setText("");
  };

  return (
    <div>
      <textarea
        className="confess-input"
        placeholder="Write a sweet confession or memory... 💕"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
      />
      <button className="btn" onClick={add}>Drop a Confession 💌</button>
      <div className="confess-list">
        {list.map((c, i) => <div key={i} className="confess-item">"{c}"</div>)}
      </div>
    </div>
  );
}

// ——— MAIN APP ———
export default function App() {
  const [tab, setTab] = useState("games");
  const [activeGame, setActiveGame] = useState(null);
  const [names, setNames] = useState(["You", "Them"]);
  
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        showToast(`Welcome back, ${u.displayName || 'Love'}! 💕`);
        requestPushPermission(u.uid);
      }
    });
    return () => unsub();
  }, [showToast]);

  useEffect(() => {
    if (messaging) {
      const unsub = onMessage(messaging, (payload) => {
        showToast(`💌 ${payload.notification.title}: ${payload.notification.body}`);
      });
      return () => unsub();
    }
  }, [showToast]);

  const requestPushPermission = async (uid) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && messaging) {
        const token = await getToken(messaging);
        if (token) await set(ref(db, `users/${uid}/fcmToken`), token);
      }
    } catch (e) {
      console.log('Push notification skipped:', e);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      showToast("Login failed. Please try again.");
    }
  };

  const GAMES = [
    { id: "tod", icon: "🃏", name: "Truth or Dare", desc: "Spicy couples edition", wide: false },
    { id: "love", icon: "💘", name: "Love Meter", desc: "Calculate your vibe", wide: false },
    { id: "wyr", icon: "💬", name: "Would You Rather", desc: "Reveal your choices", wide: true },
    { id: "memo", icon: "🧠", name: "Memory Match", desc: "Find the pair", wide: false },
    { id: "nhie", icon: "🤭", name: "Never Have I Ever", desc: "Confess your secrets", wide: false },
    { id: "date", icon: "📅", name: "Date Ideas", desc: "Find something fun", wide: true },
    { id: "quiz", icon: "🎯", name: "Couple Quiz", desc: "How well do you know each other?", wide: false },
    { id: "confess", icon: "💌", name: "Confessions", desc: "Leave sweet notes", wide: false },
  ];

  const GAME_TITLES = {
    tod: ["Truth or Dare 🃏", "Spicy couples edition"],
    love: ["Love Meter 💘", "How strong is your bond?"],
    wyr: ["Would You Rather 💬", "Reveal your true choices"],
    memo: ["Memory Match 🧠", "Find all the pairs together"],
    nhie: ["Never Have I Ever 🤭", "Let's see what you've done"],
    date: ["Date Ideas 📅", "Inspiration for your next date"],
    quiz: ["Couple Quiz 🎯", "How well do you know each other?"],
    confess: ["Sweet Confessions 💌", "Drop a note for your love"],
  };

  const renderGame = () => {
    switch (activeGame) {
      case "tod": return <TruthOrDare names={names} />;
      case "love": return <LoveMeter />;
      case "wyr": return <WouldYouRather />;
      case "memo": return <MemoryGame />;
      case "nhie": return <NeverHaveIEver />;
      case "date": return <DateIdeas />;
      case "quiz": return <CoupleQuiz names={names} />;
      case "confess": return <Confessions />;
      default: return null;
    }
  };

  const floatHearts = Array.from({ length: 10 }, (_, i) => ({
    left: (i * 11 + 5) + "%",
    delay: (i * 1.3) + "s",
    duration: (8 + i * 1.1) + "s",
  }));

  if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px', fontFamily: 'DM Sans, sans-serif'}}>Loading our memories... 💖</div>;

  if (!user) {
    return (
      <div className="app">
        <style>{style}</style>
        <div className="toast-container">
          {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
        </div>
        <div className="login-screen">
          <div style={{ fontSize: "5rem", marginBottom: "20px" }}>💑</div>
          <h1 className="header-title" style={{ fontSize: '3rem', marginBottom: '10px' }}>Love<span>Play</span></h1>
          <p className="header-sub" style={{ marginBottom: '40px', fontSize: '0.9rem' }}>Sign in to save your memories and connect with your partner</p>
          <button className="btn" onClick={handleLogin} style={{ maxWidth: '300px', fontSize: '1.1rem', padding: '16px' }}>Sign in with Google 🚀</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <div className="toast-container">
          {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
        </div>
        <div className="hearts-bg">
          {floatHearts.map((h, i) => (
            <div key={i} className="float-heart" style={{
              left: h.left,
              bottom: "-40px",
              animationDelay: h.delay,
              animationDuration: h.duration,
            }}>❤️</div>
          ))}
        </div>

        <div className="container">
          {tab === "games" && (
            <>
              <div className="header">
                <h1 className="header-title">Love<span>Play</span></h1>
                <p className="header-sub">Games for two hearts</p>
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
                    <div
                      key={g.id}
                      className={`game-card${g.wide ? " wide" : ""}`}
                      onClick={() => setActiveGame(g.id)}
                    >
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

          {tab === "diary" && (
            <div style={{ padding: "40px 20px 20px" }}>
              <p className="section-title" style={{ fontSize: "1.6rem", fontFamily: "Playfair Display, serif", fontStyle: "italic", color: "#fff", marginBottom: 20 }}>Our Diary 📖</p>
              {[
                { date: "Today", text: "Started playing LovePlay together 💕" },
                { date: "Last week", text: "We stayed up talking till 3am and I didn't want it to end 🌙" },
                { date: "A month ago", text: "The day everything changed and I knew you were the one 🌹" },
              ].map((e, i) => (
                <div key={i} className="diary-entry">
                  <div className="diary-date">{e.date}</div>
                  <div className="diary-text">{e.text}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "profile" && (
            <div style={{ padding: "40px 20px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "5rem", marginBottom: 16 }}>💑</div>
              <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "#fff", fontStyle: "italic" }}>
                {names[0]} <span style={{ color: "#f06090" }}>♥</span> {names[1]}
              </p>
              <p style={{ color: "rgba(245,230,234,0.4)", fontSize: "0.8rem", marginTop: 8 }}>Together & in sync</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
                {[
                  ["🎮", "Games Played", "12"],
                  ["💌", "Confessions", "5"],
                  ["🎯", "Quiz Score", "8/10"],
                  ["🌹", "Days Together", "∞"],
                ].map(([icon, label, val], i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(240,96,144,0.12)", padding: "16px 12px" }}>
                    <div style={{ fontSize: "1.5rem" }}>{icon}</div>
                    <div style={{ fontSize: "1.4rem", color: "#f06090", fontWeight: 700, margin: "4px 0" }}>{val}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(245,230,234,0.4)" }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {["Your Name", "Their Name"].map((pl, i) => (
                  <input
                    key={i}
                    className="lm-input"
                    placeholder={pl}
                    value={names[i]}
                    onChange={e => { const n = [...names]; n[i] = e.target.value; setNames(n); }}
                    style={{ maxWidth: "100%" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
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
          {[
            ["🎮", "Games", "games"],
            ["📖", "Diary", "diary"],
            ["💑", "Us", "profile"],
          ].map(([icon, label, id]) => (
            <button key={id} className={`bnav-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
              <span className="bnav-icon">{icon}</span>
              <span className="bnav-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

