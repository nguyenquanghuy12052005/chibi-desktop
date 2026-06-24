/**
 * Load skin từ config.
 *
 * Hỗ trợ 2 chế độ:
 *
 * 1. staticImages: true — mỗi animation là danh sách ảnh PNG riêng lẻ
 *    { folder, frames: [...], speed }
 *
 * 2. staticImages: false (mặc định) — spritesheet nằm ngang
 *    { folder, file, frameCount, speed }
 *    Sprite sheet: [frame0][frame1]...[frameN-1]
 *    Kích thước mỗi frame = cellW x cellH
 */
export async function loadSkin(config) {
  const { animations } = config;
  const basePath = '/skins/hero/';
  const result = {};

  if (config.staticImages) {
    // --- Chế độ ảnh tĩnh riêng lẻ ---
    for (const [animName, animConfig] of Object.entries(animations)) {
      const { folder, frames } = animConfig;
      const loadedFrames = [];

      for (const filename of frames) {
        const src = `${basePath}${folder}/${filename}`;
        const img = await loadImage(src);

        // Tạo canvas từ ảnh gốc (giữ nguyên kích thước)
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        loadedFrames.push(canvas);
      }

      result[animName] = loadedFrames;
    }
  } else {
    // --- Chế độ spritesheet ---
    const { cellW, cellH } = config;
    for (const [animName, animConfig] of Object.entries(animations)) {
      const { folder, file, frameCount } = animConfig;
      const src = `${basePath}${folder}/${file}`;
      const sheetImg = await loadImage(src);

      const frames = [];
      for (let i = 0; i < frameCount; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = cellW;
        canvas.height = cellH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          sheetImg,
          i * cellW, 0,   // sx, sy
          cellW, cellH,   // sWidth, sHeight
          0, 0,           // dx, dy
          cellW, cellH    // dWidth, dHeight
        );
        frames.push(canvas);
      }
      result[animName] = frames;
    }
  }

  return result;
}

/**
 * Helper: load một ảnh, trả về Promise<HTMLImageElement>
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Không load được ảnh: ${src}`));
    img.src = src;
  });
}