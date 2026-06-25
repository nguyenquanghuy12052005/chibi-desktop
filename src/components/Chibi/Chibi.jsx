// apps/renderer/components/Chibi/Chibi.jsx
import { useEffect, useRef, useState } from 'react';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import { loadSkin } from '../../../utils/sprite-extractor';
import skinConfig from '../../assets/skins/skin.json';
import { CHIBI_ANIM_BY_STATE } from '../../config/chibiAnim'

const DISPLAY_SIZE = 150;




function removeOutline(srcCanvas, passes = 2) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  ctx.drawImage(srcCanvas, 0, 0);

  for (let pass = 0; pass < passes; pass++) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const alpha = (x, y) => {
      if (x < 0 || x >= w || y < 0 || y >= h) return 0;
      return data[(y * w + x) * 4 + 3];
    };

    const isDark = (x, y) => {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
      if (a < 10) return false;
      return (r + g + b) / 3 < 80;
    };

    const touchesTransparent = (x, y) => (
      alpha(x - 1, y) < 10 || alpha(x + 1, y) < 10 ||
      alpha(x, y - 1) < 10 || alpha(x, y + 1) < 10
    );

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (isDark(x, y) && touchesTransparent(x, y)) {
          data[(y * w + x) * 4 + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return out;
}

export default function Chibi({ state, send, onMouseEnter, onMouseLeave }) {
  const canvasRef = useRef(null);
  const [framesMap, setFramesMap] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameTimer = useRef(null);

  // 1. Load tất cả sprite / ảnh tĩnh
  useEffect(() => {
    async function load() {
      try {
        const anims = await loadSkin(skinConfig);

        // Xử lý xóa outline cho từng frame
        const processed = {};
        for (const [animName, frames] of Object.entries(anims)) {
          processed[animName] = frames.map(removeOutline);
        }

        setFramesMap(processed);
      } catch (err) {
        console.error('Lỗi load skin:', err);
      }
    }
    load();
  }, []);

  // 2. Điều khiển animation theo state
  useEffect(() => {
    if (!framesMap) return;

    const animName = CHIBI_ANIM_BY_STATE[state] ?? 'idle';
    const frames = framesMap[animName];
    if (!frames || frames.length === 0) return;

    setCurrentFrame(0);

    if (frameTimer.current) clearInterval(frameTimer.current);

    const speed = skinConfig.animations[animName]?.speed ?? 150;
    if (speed > 0 && frames.length > 1) {
      frameTimer.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, speed);
    }

    return () => clearInterval(frameTimer.current);
  }, [state, framesMap]);

  // 3. Vẽ frame hiện tại lên canvas, scale vừa DISPLAY_SIZE
  useEffect(() => {
    if (!canvasRef.current || !framesMap) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const animName = CHIBI_ANIM_BY_STATE[state] ?? 'idle';
    const frames = framesMap[animName];
    if (!frames || frames.length === 0) return;

    const frameCanvas = frames[currentFrame];
    if (!frameCanvas) return;

    const srcW = frameCanvas.width;
    const srcH = frameCanvas.height;

    // Scale giữ tỷ lệ, vừa với DISPLAY_SIZE
    const scale = Math.min(DISPLAY_SIZE / srcW, DISPLAY_SIZE / srcH);
    const drawW = Math.round(srcW * scale);
    const drawH = Math.round(srcH * scale);

    // Canvas nội tại = kích thước thực cần vẽ (không phải CSS size)
    canvas.width = DISPLAY_SIZE;
    canvas.height = DISPLAY_SIZE;

    // Căn giữa trong canvas 150x150
    const offsetX = Math.round((DISPLAY_SIZE - drawW) / 2);
    const offsetY = Math.round((DISPLAY_SIZE - drawH) / 2);

    ctx.clearRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(frameCanvas, offsetX, offsetY, drawW, drawH);
  }, [framesMap, currentFrame, state]);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative',
        width: DISPLAY_SIZE,
        height: DISPLAY_SIZE,
        cursor: 'pointer',
        WebkitAppRegion: 'drag',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: DISPLAY_SIZE,
          height: DISPLAY_SIZE,
          display: 'block',
        }}
      />
      {/* <SpeechBubble state={state} send={send} /> */}
    </div>
  );
}