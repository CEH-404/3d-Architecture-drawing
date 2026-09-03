import * as THREE from 'three';

/**
 * Creates procedural Canvas textures for crisp architectural finishes
 * without relying on external image CDNs.
 */

// 1. Bare Concrete / Subfloor Texture
export function createConcreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base raw concrete tone
  ctx.fillStyle = '#b5b2ac';
  ctx.fillRect(0, 0, 512, 512);

  // Noise & screed variation
  for (let i = 0; i < 40000; i++) {
    const x依靠 = Math.random() * 512;
    const y = Math.random() * 512;
    const v = Math.floor(Math.random() * 40 - 20);
    const alpha = Math.random() * 0.15;
    ctx.fillStyle = v > 0 ? `rgba(240, 238, 230, ${alpha})` : `rgba(70, 68, 65, ${alpha})`;
    ctx.fillRect(x依靠, y, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }

  // Trowel / screed streaks
  ctx.strokeStyle = 'rgba(150, 145, 140, 0.15)';
  ctx.lineWidth = 12;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    const y = i * 55 + Math.random() * 20;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(150, y + 10, 350, y - 10, 512, y + 5);
    ctx.stroke();
  }

  // Subtle joint lines (4x4 concrete slabs)
  ctx.strokeStyle = 'rgba(90, 85, 80, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  const texture進 = new THREE.CanvasTexture(canvas);
  texture進.wrapS = THREE.RepeatWrapping;
  texture進.wrapT = THREE.RepeatWrapping;
  texture進.repeat.set(4, 4);
  return texture進;
}

// 2. Bare Drywall / Plaster with Joint Tape Lines
export function createDrywallTexture(): THREE.CanvasTexture {
  const canvas進 = document.createElement('canvas');
  canvas進.width = 512;
  canvas進.height = 512;
  const ctx = canvas進.getContext('2d')!;

  // Drywall paper board tone (warm gray-white)
  ctx.fillStyle = '#e8e5dc';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle paper grain
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(180,175,165,${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Taped drywall seam (vertical sheet seam)
  const grad = ctx.createLinearGradient(240, 0, 272, 0);
  grad.addColorStop(0, 'rgba(235, 232, 222, 0)');
  grad.addColorStop(0.3, 'rgba(250, 248, 243, 0.8)');
  grad.addColorStop(0.5, 'rgba(215, 210, 200, 0.7)'); // slight joint groove
  grad.addColorStop(0.7, 'rgba(250, 248, 243, 0.8)');
  grad.addColorStop(1, 'rgba(235, 232, 222, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(240, 0, 32, 512);

  // Screw/fastener mud patches every 16"
  for (let y = 30; y < 512; y += 80) {
    ctx.beginPath();
    ctx.arc(256, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 252, 248, 0.75)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(256, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(190, 185, 175, 0.4)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas進);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// 3. Raw Timber 2x4 Wood Stud Texture
export function createTimberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Raw pine/fir timber color
  ctx.fillStyle = '#d4ad78';
  ctx.fillRect(0, 0, 256, 512);

  // Wood grain lines
  for (let i倍 = 0; i倍 < 60; i倍++) {
    const x = Math.random() * 256;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(160, 115, 65, 0.3)' : 'rgba(220, 185, 140, 0.3)';
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 10, 150, x - 10, 350, x + 5, 512);
    ctx.stroke();
  }

  // Timber stamp / grade mark
  ctx.fillStyle = 'rgba(80, 50, 25, 0.35)';
  ctx.font = 'bold 16px monospace';
  ctx.save();
  ctx.translate(30, 200);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('STUD KD-HT 2X4 #2', 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 4. Blueprint Grid Texture
export function createBlueprintGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f1f38';
  ctx.fillRect(0, 0, 512, 512);

  // Fine 1-inch minor grid
  ctx.strokeStyle = 'rgba(64, 140, 220, 0.25)';
  ctx.lineWidth = 1;
  const stepSmall = 16;
  for (let i = 0; i <= 512; i += stepSmall) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, 512);
    ctx.moveTo(0, i); ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Major 1-foot grid
  ctx.strokeStyle = 'rgba(90, 190, 255, 0.6)';
  ctx.lineWidth = 1.5;
  const stepMajor = 64;
  for (let i = 0; i <= 512; i += stepMajor) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, 512);
    ctx.moveTo(0, i); ctx.lineTo(512, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 5. Warm Oak Hardwood Plank Texture
export function createHardwoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm natural oak background
  ctx.fillStyle = '#C89D66';
  ctx.fillRect(0, 0, 512, 512);

  // Draw 8 horizontal planks
  const plankHeight = 64;
  const plankColors = ['#C2955E', '#CE9F6A', '#BA8E58', '#D4A874', '#C79A63'];

  for (let row = 0; row < 8; row++) {
    const y = row * plankHeight;
    ctx.fillStyle = plankColors[row % plankColors.length];
    ctx.fillRect(0, y, 512, plankHeight - 2);

    // Plank seam / groove
    ctx.fillStyle = '#6E4E2C';
    ctx.fillRect(0, y + plankHeight - 2, 512, 2);

    // Staggered vertical end joints
    const stagger = (row % 2) * 200 + 100;
    ctx.fillRect(stagger, y, 2, plankHeight - 2);
    if (stagger + 250 < 512) {
      ctx.fillRect(stagger + 250, y, 2, plankHeight - 2);
    }

    // Wood grain lines
    for (let g = 0; g < 15; g++) {
      const gy = y + Math.random() * (plankHeight - 4);
      ctx.strokeStyle = 'rgba(110, 78, 44, 0.15)';
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(150, gy + 3, 350, gy - 3, 512, gy + 1);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// 6. Carrara Marble Texture
export function createMarbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Soft pristine off-white
  ctx.fillStyle = '#F4F4F2';
  ctx.fillRect(0, 0, 512, 512);

  // Soft grey organic veins
  for (let v = 0; v < 8; v++) {
    ctx.strokeStyle = 'rgba(160, 160, 165, 0.22)';
    ctx.lineWidth = Math.random() * 4 + 1;
    ctx.beginPath();
    let cx = Math.random() * 512;
    let cy = 0;
    ctx.moveTo(cx, cy);
    while (cy < 512) {
      cx += (Math.random() - 0.5) * 80;
      cy += Math.random() * 60 + 20;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Large 24"x24" tile seams
  ctx.strokeStyle = 'rgba(190, 190, 195, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// 7. Terrazzo Stone Texture
export function createTerrazzoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Light cement base
  ctx.fillStyle = '#E8E5DF';
  ctx.fillRect(0, 0, 512, 512);

  // Composite chips (warm ochre, terracotta, charcoal, white)
  const chipColors = [
    'rgba(180, 83, 9, 0.7)',
    'rgba(67, 56, 202, 0.5)',
    'rgba(30, 41, 59, 0.75)',
    'rgba(255, 255, 255, 0.9)',
    'rgba(217, 119, 6, 0.65)',
    'rgba(100, 116, 139, 0.6)'
  ];

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 8 + 2;
    ctx.fillStyle = chipColors[Math.floor(Math.random() * chipColors.length)];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y + (Math.random() - 0.5) * size);
    ctx.lineTo(x + size * 0.7, y + size);
    ctx.lineTo(x - size * 0.3, y + size * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// 8. Plush Woven Carpet Texture
export function createCarpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#64748B';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const alpha = Math.random() * 0.18;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${alpha})` : `rgba(15, 23, 42, ${alpha})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 9. Islamic Mashrabiya Geometric Lattice Texture (Alpha cutout)
export function createMashrabiyaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Transparent background
  ctx.clearRect(0, 0, 512, 512);

  // Geometric Lattice Pattern in Warm Teak / Walnut Wood
  ctx.fillStyle = '#6E4522';
  ctx.strokeStyle = '#6E4522';
  ctx.lineWidth = 6;

  const step = 64;
  for (let x = 0; x < 512; x += step) {
    for (let y = 0; y < 512; y += step) {
      // Outer diamond border
      ctx.beginPath();
      ctx.moveTo(x + step / 2, y);
      ctx.lineTo(x + step, y + step / 2);
      ctx.lineTo(x + step / 2, y + step);
      ctx.lineTo(x, y + step / 2);
      ctx.closePath();
      ctx.stroke();

      // Inner 8-point star hub
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Radial spokes
      ctx.beginPath();
      ctx.moveTo(x + step / 2, y + 8);
      ctx.lineTo(x + step / 2, y + step - 8);
      ctx.moveTo(x + 8, y + step / 2);
      ctx.lineTo(x + step - 8, y + step / 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  return texture;
}

// 10. Ornate Velvet Prayer Rug (Sajjadah) Texture
export function createPrayerRugTexture(
  pattern: 'classic_emerald' | 'gold_arch' | 'modern_slate' | 'terracotta' = 'classic_emerald'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  let primary = '#065F46'; // Emerald
  let accent = '#D97706';  // Gold
  let secondary = '#047857';

  if (pattern === 'gold_arch') {
    primary = '#B45309';
    accent = '#FDE68A';
    secondary = '#92400E';
  } else if (pattern === 'modern_slate') {
    primary = '#334155';
    accent = '#94A3B8';
    secondary = '#1E293B';
  } else if (pattern === 'terracotta') {
    primary = '#9A3412';
    accent = '#FDBA74';
    secondary = '#7C2D12';
  }

  // Base velvet color
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, 512, 1024);

  // Outer Border
  ctx.strokeStyle = accent;
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 472, 984);

  ctx.strokeStyle = secondary;
  ctx.lineWidth = 8;
  ctx.strokeRect(34, 34, 444, 956);

  // Mihrab Arch (Pointing towards Qibla)
  ctx.strokeStyle = accent;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(70, 750);
  ctx.lineTo(70, 320);
  ctx.bezierCurveTo(70, 100, 442, 100, 442, 320);
  ctx.lineTo(442, 750);
  ctx.stroke();

  // Pointed arch peak (apex)
  ctx.beginPath();
  ctx.moveTo(256, 120);
  ctx.lineTo(256, 220);
  ctx.stroke();

  // Central Hanging Mosque Lamp / Medallion Motif
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(256, 260, 24, 0, Math.PI * 2);
  ctx.fill();

  // Center geometric floral rosette
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 520, 70, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.arc(256 + Math.cos(ang) * 45, 520 + Math.sin(ang) * 45, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  // White fringe at top and bottom ends
  ctx.fillStyle = '#F5F5F0';
  for (let x = 16; x < 496; x += 6) {
    ctx.fillRect(x, 4, 3, 14);
    ctx.fillRect(x, 1006, 3, 14);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 11. 3D Architectural Text Sprite Generator
export interface TextSpriteOptions {
  fontSize?: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  padding?: number;
  subtext?: string;
}

export function createTextSprite(
  text: string,
  subtextOrOptions?: string | TextSpriteOptions,
  highlight = false
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;

  const options: TextSpriteOptions =
    typeof subtextOrOptions === 'object' && subtextOrOptions !== null
      ? subtextOrOptions
      : { subtext: typeof subtextOrOptions === 'string' ? subtextOrOptions : undefined };

  const bgColor = options.bgColor || (highlight ? 'rgba(26, 43, 76, 0.92)' : 'rgba(23, 23, 23, 0.88)');
  const borderColor = options.borderColor || (highlight ? '#38bdf8' : '#737373');
  const textColor = options.color || (highlight ? '#38bdf8' : '#ffffff');
  const fontSize = options.fontSize || 32;

  // Background badge
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;

  // Rounded rect
  const r = 18;
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 180, r);
  ctx.fill();
  ctx.stroke();

  // Primary text lines (support multi-line string with \n)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  if (options.subtext) {
    lines.push(options.subtext);
  }

  if (lines.length === 1) {
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText(lines[0], 256, 100);
  } else if (lines.length === 2) {
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText(lines[0], 256, 70);

    ctx.font = `500 ${Math.round(fontSize * 0.75)}px monospace`;
    ctx.fillStyle = options.color ? options.color : '#94a3b8';
    ctx.fillText(lines[1], 256, 130);
  } else {
    const lineHeight = 160 / lines.length;
    lines.forEach((line, i) => {
      ctx.font = i === 0 ? `bold ${fontSize}px sans-serif` : `500 ${Math.round(fontSize * 0.75)}px monospace`;
      ctx.fillStyle = i === 0 ? textColor : '#94a3b8';
      ctx.fillText(line, 256, 40 + i * lineHeight);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.5, 0.6, 1);
  return sprite;
}

