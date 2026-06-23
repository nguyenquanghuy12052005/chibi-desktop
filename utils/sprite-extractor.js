/**
 * Load một sprite sheet nằm ngang và cắt thành các frame riêng lẻ.
 *
 * Mỗi animation trong config có dạng:
 * {
 *   folder: "1_Pink_Monster",
 *   file: "Pink_Monster_Idle_4.png",
 *   frameCount: 4,
 *   speed: 150
 * }
 *
 * Sprite sheet là horizontal strip: [frame0][frame1]...[frameN-1]
 * Kích thước mỗi frame = cellW x cellH (lấy từ config gốc)
 */
export async function loadSkin(config) {
  const { cellW, cellH, animations } = config;
  const basePath = '/skins/hero/';
  const result = {};

  for (const [animName, animConfig] of Object.entries(animations)) {
    const { folder, file, frameCount } = animConfig;
    const src = `${basePath}${folder}/${file}`;

    // Load sprite sheet
    const sheetImg = await loadImage(src);

    // Cắt từng frame bằng OffscreenCanvas hoặc canvas thông thường
    const frames = [];
    for (let i = 0; i < frameCount; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = cellW;
      canvas.height = cellH;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      // Vẽ đúng frame từ sprite sheet nằm ngang
      ctx.drawImage(
        sheetImg,
        i * cellW, 0,   // sx, sy (vị trí trong sheet)
        cellW, cellH,   // sWidth, sHeight
        0, 0,           // dx, dy (vị trí trên canvas)
        cellW, cellH    // dWidth, dHeight
      );
      frames.push(canvas);
    }
    result[animName] = frames;
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