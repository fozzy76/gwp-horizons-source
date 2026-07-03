import React, { useEffect, useRef } from 'react';

const API_BASE = 'https://api.greatwildlifephotos.com';

function parseSizeRatio(sizeName) {
  const match = String(sizeName || '').match(/(\d+(?:\.\d+)?)\s*["']?\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  const width = parseFloat(match[1]);
  const height = parseFloat(match[2]);
  return width > 0 && height > 0 ? width / height : null;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const MaterialMockup = ({ material, imageUrl, variant }) => {
  const canvasRef = useRef(null);
  const normalizedMaterial = String(material || 'canvas').toLowerCase();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = `${API_BASE}/image-proxy?url=${encodeURIComponent(imageUrl)}`;

    img.onload = () => {
      const width = canvas.width;
      const height = canvas.height;
      const ratio = parseSizeRatio(variant?.name) || (img.width / img.height);
      const maxPrintWidth = 470;
      const maxPrintHeight = 315;
      const printWidth = ratio >= maxPrintWidth / maxPrintHeight ? maxPrintWidth : maxPrintHeight * ratio;
      const printHeight = ratio >= maxPrintWidth / maxPrintHeight ? maxPrintWidth / ratio : maxPrintHeight;
      const depth = normalizedMaterial === 'canvas' ? 26 : normalizedMaterial === 'acrylic' ? 18 : 8;
      const x = (width - printWidth - depth) / 2;
      const y = 92;

      ctx.clearRect(0, 0, width, height);

      const wall = ctx.createLinearGradient(0, 0, 0, height);
      wall.addColorStop(0, '#27211d');
      wall.addColorStop(0.62, '#151313');
      wall.addColorStop(1, '#0b0b0b');
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255,255,255,0.035)';
      ctx.fillRect(0, 360, width, 1);
      const floor = ctx.createLinearGradient(0, 360, 0, height);
      floor.addColorStop(0, 'rgba(255,255,255,0.035)');
      floor.addColorStop(1, 'rgba(0,0,0,0.32)');
      ctx.fillStyle = floor;
      ctx.fillRect(0, 361, width, height - 361);

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.72)';
      ctx.shadowBlur = normalizedMaterial === 'acrylic' ? 34 : 26;
      ctx.shadowOffsetX = depth + 8;
      ctx.shadowOffsetY = depth + 14;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      drawRoundedRect(ctx, x, y, printWidth, printHeight, normalizedMaterial === 'canvas' ? 2 : 5);
      ctx.fill();
      ctx.restore();

      if (normalizedMaterial === 'canvas') {
        ctx.fillStyle = '#3a3028';
        ctx.beginPath();
        ctx.moveTo(x + printWidth, y);
        ctx.lineTo(x + printWidth + depth, y + depth * 0.38);
        ctx.lineTo(x + printWidth + depth, y + printHeight + depth * 0.38);
        ctx.lineTo(x + printWidth, y + printHeight);
        ctx.fill();
        ctx.fillStyle = '#211b17';
        ctx.beginPath();
        ctx.moveTo(x, y + printHeight);
        ctx.lineTo(x + printWidth, y + printHeight);
        ctx.lineTo(x + printWidth + depth, y + printHeight + depth * 0.38);
        ctx.lineTo(x + depth, y + printHeight + depth * 0.38);
        ctx.fill();
      } else if (normalizedMaterial === 'acrylic') {
        ctx.fillStyle = 'rgba(230,245,255,0.44)';
        ctx.beginPath();
        ctx.moveTo(x + printWidth, y);
        ctx.lineTo(x + printWidth + depth, y - depth * 0.55);
        ctx.lineTo(x + printWidth + depth, y + printHeight - depth * 0.55);
        ctx.lineTo(x + printWidth, y + printHeight);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + depth, y - depth * 0.55);
        ctx.lineTo(x + printWidth + depth, y - depth * 0.55);
        ctx.lineTo(x + printWidth, y);
        ctx.fill();
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(x + printWidth, y);
        ctx.lineTo(x + printWidth + depth, y + depth * 0.25);
        ctx.lineTo(x + printWidth + depth, y + printHeight + depth * 0.25);
        ctx.lineTo(x + printWidth, y + printHeight);
        ctx.fill();
      }

      ctx.save();
      drawRoundedRect(ctx, x, y, printWidth, printHeight, normalizedMaterial === 'canvas' ? 2 : 5);
      ctx.clip();
      ctx.drawImage(img, x, y, printWidth, printHeight);

      if (normalizedMaterial === 'canvas') {
        ctx.globalCompositeOperation = 'overlay';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (let i = x; i < x + printWidth; i += 5) {
          ctx.beginPath();
          ctx.moveTo(i, y);
          ctx.lineTo(i, y + printHeight);
          ctx.stroke();
        }
        for (let j = y; j < y + printHeight; j += 5) {
          ctx.beginPath();
          ctx.moveTo(x, j);
          ctx.lineTo(x + printWidth, j);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(20,12,6,0.12)';
        ctx.fillRect(x, y, printWidth, printHeight);
      } else if (normalizedMaterial === 'metal') {
        const sheen = ctx.createLinearGradient(x, y, x + printWidth, y + printHeight);
        sheen.addColorStop(0, 'rgba(255,255,255,0.18)');
        sheen.addColorStop(0.34, 'rgba(255,255,255,0.03)');
        sheen.addColorStop(0.58, 'rgba(0,0,0,0)');
        sheen.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.fillStyle = sheen;
        ctx.fillRect(x, y, printWidth, printHeight);
        ctx.strokeStyle = 'rgba(255,255,255,0.075)';
        ctx.lineWidth = 1;
        for (let j = y + 2; j < y + printHeight; j += 7) {
          ctx.beginPath();
          ctx.moveTo(x, j);
          ctx.lineTo(x + printWidth, j);
          ctx.stroke();
        }
      } else if (normalizedMaterial === 'acrylic') {
        const gloss = ctx.createLinearGradient(x, y, x + printWidth * 0.62, y + printHeight);
        gloss.addColorStop(0, 'rgba(255,255,255,0.55)');
        gloss.addColorStop(0.18, 'rgba(255,255,255,0.12)');
        gloss.addColorStop(0.24, 'rgba(255,255,255,0)');
        gloss.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gloss;
        ctx.fillRect(x, y, printWidth, printHeight);
        ctx.fillStyle = 'rgba(255,255,255,0.24)';
        ctx.beginPath();
        ctx.moveTo(x + printWidth * 0.08, y);
        ctx.lineTo(x + printWidth * 0.28, y);
        ctx.lineTo(x + printWidth * 0.12, y + printHeight);
        ctx.lineTo(x, y + printHeight);
        ctx.fill();
      }
      ctx.restore();

      ctx.strokeStyle = normalizedMaterial === 'metal' ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.22)';
      ctx.lineWidth = normalizedMaterial === 'canvas' ? 2 : 1;
      drawRoundedRect(ctx, x, y, printWidth, printHeight, normalizedMaterial === 'canvas' ? 2 : 5);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,0.26)';
      ctx.beginPath();
      ctx.ellipse(width / 2 + depth, y + printHeight + depth + 34, printWidth * 0.48, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    };
  }, [normalizedMaterial, imageUrl, variant]);

  const label = `${normalizedMaterial.charAt(0).toUpperCase() + normalizedMaterial.slice(1)}${variant?.name ? ` - ${variant.name}` : ''}`;

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950 border border-border flex flex-col items-center justify-center p-3 mt-4" style={{ borderRadius: '12px' }}>
      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider z-10 shadow-sm">
        {label}
      </div>
      <canvas
        ref={canvasRef}
        width={720}
        height={520}
        className="w-full h-auto max-w-[720px]"
      />
    </div>
  );
};

export default MaterialMockup;
