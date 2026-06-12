/**
 * share.js — Share Score Card Generator 📤
 * Creates a beautiful PNG card using Canvas API
 */

export async function generateShareCard({ score, stars, level, levelName = '' }) {
  const canvas = document.createElement('canvas');
  canvas.width  = 1080;
  canvas.height = 1080;
  const ctx     = canvas.getContext('2d');

  // Background gradient — Sakura
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0,   '#2d0b42');
  bg.addColorStop(0.4, '#4a1560');
  bg.addColorStop(1,   '#1a0428');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pink orb top-left
  const orb1 = ctx.createRadialGradient(150,150,0, 150,150,320);
  orb1.addColorStop(0, 'rgba(253,164,207,0.4)');
  orb1.addColorStop(1, 'transparent');
  ctx.fillStyle = orb1; ctx.fillRect(0,0,canvas.width,canvas.height);

  // Purple orb bottom-right
  const orb2 = ctx.createRadialGradient(930,930,0, 930,930,350);
  orb2.addColorStop(0, 'rgba(192,132,252,0.35)');
  orb2.addColorStop(1, 'transparent');
  ctx.fillStyle = orb2; ctx.fillRect(0,0,canvas.width,canvas.height);

  // Decorative circles
  ctx.strokeStyle = 'rgba(255,110,180,0.12)';
  ctx.lineWidth = 2;
  for (let i=0;i<5;i++) {
    ctx.beginPath();
    ctx.arc(540,540,(i+1)*90,0,Math.PI*2);
    ctx.stroke();
  }

  // Scatter flower emojis as decoration
  const decorEmojis = ['🌸','✨','💕','🌟','🎀','💫','🌺'];
  ctx.font = '48px serif';
  const positions = [[100,120],[980,80],[60,960],[1010,940],[160,540],[950,540],[540,80],[540,980]];
  positions.forEach(([x,y], i) => {
    ctx.globalAlpha = 0.4;
    ctx.fillText(decorEmojis[i % decorEmojis.length], x-24, y+16);
  });
  ctx.globalAlpha = 1;

  // Game name
  ctx.textAlign = 'center';
  ctx.font = 'bold 52px Nunito, sans-serif';
  const grad1 = ctx.createLinearGradient(300,200,780,200);
  grad1.addColorStop(0,'#ff6eb4');
  grad1.addColorStop(0.5,'#fda4cf');
  grad1.addColorStop(1,'#c084fc');
  ctx.fillStyle = grad1;
  ctx.fillText('🎉 Emoji Party Match', 540, 200);

  // Level
  ctx.font = '600 34px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(240,171,252,0.7)';
  ctx.fillText(`Level ${level}${levelName ? ` — ${levelName}` : ''}`, 540, 260);

  // Main card background
  const cardRadius = 40;
  const cardX = 140, cardY = 300, cardW = 800, cardH = 440;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,110,180,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Score label
  ctx.font = '700 36px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(240,171,252,0.6)';
  ctx.fillText('SCORE', 540, 380);

  // Score number
  const scoreGrad = ctx.createLinearGradient(300,400,780,530);
  scoreGrad.addColorStop(0,'#fbbf24');
  scoreGrad.addColorStop(0.5,'#fef08a');
  scoreGrad.addColorStop(1,'#fda4cf');
  ctx.font = 'bold 130px Nunito, sans-serif';
  ctx.fillStyle = scoreGrad;
  ctx.shadowColor = 'rgba(251,191,36,0.5)';
  ctx.shadowBlur  = 40;
  ctx.fillText(score.toLocaleString(), 540, 510);
  ctx.shadowBlur = 0;

  // Stars
  const starCount = 3;
  const starSpacing = 80;
  const starX = 540 - ((starCount-1)/2) * starSpacing;
  ctx.font = '60px serif';
  for (let i = 0; i < starCount; i++) {
    ctx.globalAlpha = i < stars ? 1 : 0.2;
    ctx.fillText('⭐', starX + i*starSpacing - 30, 620);
  }
  ctx.globalAlpha = 1;

  // Divider line
  ctx.strokeStyle = 'rgba(255,110,180,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(200,680); ctx.lineTo(880,680); ctx.stroke();

  // "Aku dapat skor ini di" text
  ctx.font = '600 30px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('✨ Aku dapat skor ini di Emoji Party Match! ✨', 540, 740);

  // Call to action
  ctx.font = 'bold 28px Nunito, sans-serif';
  const ctaGrad = ctx.createLinearGradient(300,770,780,800);
  ctaGrad.addColorStop(0,'#ff6eb4');
  ctaGrad.addColorStop(1,'#c084fc');
  ctx.fillStyle = ctaGrad;
  ctx.fillText('🐱 Yuk main bareng! 🐱', 540, 800);

  // Mascot emoji
  ctx.font = '100px serif';
  ctx.fillText('🐱', 540, 940);

  // Corner decoration
  ctx.font = '900 22px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(255,110,180,0.4)';
  ctx.textAlign = 'right';
  ctx.fillText('🎀 Emoji Party Match', 1020, 1050);

  return canvas;
}

export async function shareScore(data) {
  const canvas = await generateShareCard(data);

  // Try Web Share API first
  if (navigator.share && navigator.canShare) {
    try {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'emoji-party-match-score.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Emoji Party Match',
            text: `🎉 Aku dapat skor ${data.score.toLocaleString()} di Level ${data.level}! Yuk main bareng! 🐱`,
            files: [file]
          });
          return;
        }
      });
      return;
    } catch {}
  }

  // Fallback: download PNG
  const link = document.createElement('a');
  link.download = 'emoji-party-match-score.png';
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

export default { generateShareCard, shareScore };
