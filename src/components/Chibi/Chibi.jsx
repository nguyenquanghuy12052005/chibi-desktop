// apps/renderer/components/Chibi/Chibi.jsx
import { useEffect, useRef, useState } from 'react';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import { loadSkin } from '../../../utils/sprite-extractor';
import skinConfig from '../../assets/skins/skin.json';

// Map trạng thái máy → tên animation trong skin.json
const STATE_TO_ANIM = {
  IDLE:     'idle',
  ALERT:    'attack',
  THINKING: 'idle',
  SUCCESS:  'run',
  FAILED:   'hurt',
};

export default function Chibi({ state, send, onMouseEnter, onMouseLeave }) {
  const canvasRef = useRef(null);
  const [framesMap, setFramesMap] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameTimer = useRef(null);

  // 1. Load tất cả sprite sheets
  useEffect(() => {
    async function load() {
      try {
        const anims = await loadSkin(skinConfig);
        setFramesMap(anims);
      } catch (err) {
        console.error('Lỗi load skin:', err);
      }
    }
    load();
  }, []);

  // 2. Điều khiển animation theo state
  useEffect(() => {
    if (!framesMap) return;

    const animName = STATE_TO_ANIM[state] || 'idle';
    const frames = framesMap[animName];
    if (!frames || frames.length === 0) return;

    setCurrentFrame(0);

    // Xóa timer cũ
    if (frameTimer.current) clearInterval(frameTimer.current);

    const speed = skinConfig.animations[animName]?.speed ?? 150;
    if (speed > 0) {
      frameTimer.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, speed);
    }

    return () => clearInterval(frameTimer.current);
  }, [state, framesMap]);

  // 3. Vẽ frame hiện tại lên canvas
  useEffect(() => {
    if (!canvasRef.current || !framesMap) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const animName = STATE_TO_ANIM[state] || 'idle';
    const frames = framesMap[animName];
    if (!frames || frames.length === 0) return;

    const frameCanvas = frames[currentFrame];
    if (!frameCanvas) return;

    const scale = 4; // Scale lên 4x cho pixel art rõ nét
    const w = skinConfig.cellW * scale;
    const h = skinConfig.cellH * scale;

    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(frameCanvas, 0, 0, w, h);
  }, [framesMap, currentFrame, state]);

  const scale = 4;
  const displayW = skinConfig.cellW * scale;
  const displayH = skinConfig.cellH * scale;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative',
        width: displayW,
        height: displayH,
        cursor: 'pointer',
        WebkitAppRegion: 'drag',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: displayW,
          height: displayH,
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />
      <SpeechBubble state={state} send={send} />
    </div>
  );
}