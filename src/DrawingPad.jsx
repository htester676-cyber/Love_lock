import { useState, useRef, useEffect, useCallback } from 'react';
import { sendStroke, onStrokes, clearDrawing } from './firebase';

const COLORS = ["#f06090", "#ff9ab0", "#a0b8f0", "#90e0a0", "#ffd700", "#fff", "#ff6b6b", "#c084fc"];

export function DrawingPad({ roomCode }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#f06090");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState("pen");
  const lastPos = useRef(null);
  const currentStroke = useRef([]);
  const renderedCount = useRef(0);

  const getCtx = () => canvasRef.current?.getContext("2d");

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    const ctx = getCtx();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#0d0509";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [initCanvas]);

  // Listen to remote strokes
  useEffect(() => {
    if (!roomCode) return;
    const unsub = onStrokes(roomCode, (strokes) => {
      const ctx = getCtx();
      if (!ctx) return;
      // Only render new strokes
      for (let i = renderedCount.current; i < strokes.length; i++) {
        const s = strokes[i];
        if (s.points && s.points.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = s.eraser ? "#0d0509" : s.color;
          ctx.lineWidth = s.eraser ? s.size * 3 : s.size;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.moveTo(s.points[0].x, s.points[0].y);
          for (let j = 1; j < s.points.length; j++) {
            ctx.lineTo(s.points[j].x, s.points[j].y);
          }
          ctx.stroke();
        }
      }
      renderedCount.current = strokes.length;
    });
    return () => unsub();
  }, [roomCode]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    currentStroke.current = [pos];
    const ctx = getCtx();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#0d0509" : color;
    ctx.fill();
  }, [color, brushSize, tool]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    currentStroke.current.push(pos);
    const ctx = getCtx();
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#0d0509" : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }, [isDrawing, color, brushSize, tool]);

  const stopDraw = useCallback(() => {
    if (isDrawing && currentStroke.current.length > 0 && roomCode) {
      sendStroke(roomCode, {
        points: currentStroke.current,
        color,
        size: brushSize,
        eraser: tool === "eraser",
        time: Date.now()
      });
    }
    setIsDrawing(false);
    lastPos.current = null;
    currentStroke.current = [];
  }, [isDrawing, color, brushSize, tool, roomCode]);

  const handleClear = () => {
    initCanvas();
    renderedCount.current = 0;
    if (roomCode) clearDrawing(roomCode);
  };

  const saveCanvas = () => {
    const link = document.createElement("a");
    link.download = "our-drawing-" + Date.now() + ".png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="draw-page">
      <p className="section-title" style={{ fontSize: "1.4rem", fontFamily: "Playfair Display, serif", fontStyle: "italic", color: "#fff", marginBottom: 4, textAlign: "center" }}>
        Draw Together 🎨
      </p>
      <p style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(245,230,234,0.4)", marginBottom: 8 }}>
        {roomCode ? "Drawing syncs live! ✨" : "Create something beautiful"}
      </p>

      <div className="draw-toolbar">
        <button className={`draw-tool-btn${tool === "pen" ? " active" : ""}`} onClick={() => setTool("pen")}>✏️</button>
        <button className={`draw-tool-btn${tool === "eraser" ? " active" : ""}`} onClick={() => setTool("eraser")}>🧹</button>
        <div style={{ width: 1, height: 24, background: "rgba(240,96,144,0.2)", margin: "0 4px" }} />
        <div className="color-picker-wrap">
          {COLORS.map(c => (
            <div key={c} className={`color-dot${color === c ? " active" : ""}`}
              style={{ background: c }} onClick={() => { setColor(c); setTool("pen"); }} />
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: "rgba(240,96,144,0.2)", margin: "0 4px" }} />
        <input type="range" className="brush-size" min="1" max="20" value={brushSize}
          onChange={e => setBrushSize(Number(e.target.value))} />
      </div>

      <div className="canvas-wrap">
        <canvas ref={canvasRef}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      </div>

      <div className="draw-actions">
        <button className="btn btn-ghost" onClick={handleClear}>🗑️ Clear</button>
        <button className="btn" onClick={saveCanvas}>💾 Save</button>
      </div>
    </div>
  );
}
