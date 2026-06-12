/**
 * animator.js v3 — Fixed swap animation, dramatic match effects
 * KEY FIX: animateSwapFromOldPos (data-first approach = no flash)
 */

// ─── Confetti ─────────────────────────────────────────────────────────────────
class ConfettiSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.particles = [];
    this.running   = false;
    this.raf       = null;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }
  _resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }

  _spawn(count=15) {
    const colors = ['#ff6eb4','#ffde59','#7ef9ff','#a855f7','#ff9500','#86efac','#f0abfc'];
    const shapes = ['rect','circle','star'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width, y: -15,
        vx: (Math.random()-0.5)*7, vy: 2.5+Math.random()*5,
        rot: Math.random()*Math.PI*2, rotV: (Math.random()-0.5)*0.25,
        w: 7+Math.random()*12, h: 4+Math.random()*8,
        color: colors[Math.floor(Math.random()*colors.length)],
        shape: shapes[Math.floor(Math.random()*shapes.length)],
        life: 1, decay: 0.004+Math.random()*0.007,
        wobble: Math.random()*Math.PI*2, wobbleV: 0.05+Math.random()*0.08
      });
    }
  }
  _drawStar(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i=0;i<5;i++) {
      const a1=(i*4*Math.PI)/5-Math.PI/2, a2=((i*4+2)*Math.PI)/5-Math.PI/2;
      i===0 ? ctx.moveTo(cx+r*Math.cos(a1),cy+r*Math.sin(a1)) : ctx.lineTo(cx+r*Math.cos(a1),cy+r*Math.sin(a1));
      ctx.lineTo(cx+(r/2)*Math.cos(a2),cy+(r/2)*Math.sin(a2));
    }
    ctx.closePath(); ctx.fill();
  }
  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    for (let i=this.particles.length-1; i>=0; i--) {
      const p = this.particles[i];
      p.wobble+=p.wobbleV; p.x+=p.vx+Math.sin(p.wobble)*1.5; p.y+=p.vy; p.rot+=p.rotV; p.life-=p.decay;
      if (p.y>this.canvas.height+20||p.life<=0) { this.particles.splice(i,1); continue; }
      ctx.save(); ctx.globalAlpha=Math.max(0,p.life); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color;
      if (p.shape==='circle') { ctx.beginPath(); ctx.arc(0,0,p.w/2,0,Math.PI*2); ctx.fill(); }
      else if (p.shape==='star') { this._drawStar(ctx,0,0,p.w/2); }
      else ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    }
  }
  _loop() {
    this._draw();
    if (this.running||this.particles.length>0) this.raf=requestAnimationFrame(()=>this._loop());
    else { this.canvas.classList.remove('active'); this.raf=null; }
  }
  start() {
    this.running=true; this.canvas.classList.add('active'); this._spawn(25);
    clearInterval(this._int);
    this._int=setInterval(()=>{ if(this.running) this._spawn(12); },300);
    if(!this.raf) this._loop();
  }
  stop() {
    this.running=false; clearInterval(this._int);
    setTimeout(()=>{ this.particles=[]; this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); this.canvas.classList.remove('active'); if(this.raf){cancelAnimationFrame(this.raf);this.raf=null;} },2500);
  }
  burst(x,y,count=14) {
    const colors=['#ff6eb4','#ffde59','#7ef9ff','#a855f7','#ff9500'];
    for(let i=0;i<count;i++){
      const angle=(Math.PI*2*i)/count+Math.random()*0.6, speed=4+Math.random()*6;
      this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-3,rot:Math.random()*Math.PI*2,rotV:(Math.random()-0.5)*0.4,w:5+Math.random()*9,h:4+Math.random()*7,color:colors[Math.floor(Math.random()*colors.length)],shape:Math.random()>0.5?'rect':'circle',life:1,decay:0.02+Math.random()*0.025,wobble:0,wobbleV:0});
    }
    if(!this.raf){this.canvas.classList.add('active');this._loop();}
  }
}

// ─── KEY FIX: Swap from old positions (data-first approach) ──────────────────
/**
 * After grid data is already swapped and DOM updated:
 * el1 at pos (r1,c1) already has cell2 content → should APPEAR to come from rect2
 * el2 at pos (r2,c2) already has cell1 content → should APPEAR to come from rect1
 * rect1 = old position of el1, rect2 = old position of el2
 */
async function animateSwapFromOldPos(el1, el2, rect1, rect2) {
  const cur1 = el1.getBoundingClientRect();
  const cur2 = el2.getBoundingClientRect();

  // el1 should start visually at rect2 (where el2 used to be)
  const dx1 = rect2.left - cur1.left;
  const dy1 = rect2.top  - cur1.top;

  // el2 should start visually at rect1 (where el1 used to be)
  const dx2 = rect1.left - cur2.left;
  const dy2 = rect1.top  - cur2.top;

  const dur  = 260;
  const ease = 'cubic-bezier(0.34,1.56,0.64,1)';

  // Instantly move to "old" visual positions
  el1.style.transition = 'none';
  el2.style.transition = 'none';
  el1.style.zIndex = '20';
  el2.style.zIndex = '20';
  el1.style.transform = `translate(${dx1}px,${dy1}px) scale(1.08)`;
  el2.style.transform = `translate(${dx2}px,${dy2}px) scale(1.08)`;

  void el1.offsetWidth; // force reflow to apply instant state

  // Animate to actual positions (transform = 0)
  el1.style.transition = `transform ${dur}ms ${ease}`;
  el2.style.transition = `transform ${dur}ms ${ease}`;
  el1.style.transform  = 'scale(1)';
  el2.style.transform  = 'scale(1)';

  await new Promise(r => setTimeout(r, dur + 20));

  el1.style.transition = '';
  el2.style.transition = '';
  el1.style.transform  = '';
  el2.style.transform  = '';
  el1.style.zIndex     = '';
  el2.style.zIndex     = '';
}

// ─── Invalid swap: bump toward each other then spring back ───────────────────
async function animateInvalidBump(el1, el2) {
  const r1  = el1.getBoundingClientRect();
  const r2  = el2.getBoundingClientRect();
  const dx  = r2.left - r1.left;
  const dy  = r2.top  - r1.top;
  const mag = Math.sqrt(dx*dx + dy*dy) || 1;
  const bx  = (dx/mag) * 14;
  const by  = (dy/mag) * 14;

  const dur1 = 130, dur2 = 180;

  // Bump toward each other
  el1.style.transition = `transform ${dur1}ms ease-out`;
  el2.style.transition = `transform ${dur1}ms ease-out`;
  el1.style.transform  = `translate(${bx}px,${by}px) scale(0.92)`;
  el2.style.transform  = `translate(${-bx}px,${-by}px) scale(0.92)`;

  await new Promise(r => setTimeout(r, dur1));

  // Spring back with overshoot
  el1.style.transition = `transform ${dur2}ms cubic-bezier(0.34,1.56,0.64,1)`;
  el2.style.transition = `transform ${dur2}ms cubic-bezier(0.34,1.56,0.64,1)`;
  el1.style.transform  = '';
  el2.style.transform  = '';

  await new Promise(r => setTimeout(r, dur2));
  el1.style.transition = '';
  el2.style.transition = '';

  // Shake wobble
  el1.classList.add('invalid-swap');
  el2.classList.add('invalid-swap');
  setTimeout(() => { el1?.classList.remove('invalid-swap'); el2?.classList.remove('invalid-swap'); }, 450);
}

// ─── Match Pop Animation ──────────────────────────────────────────────────────
function popTiles(elements) {
  if (!elements || elements.length === 0) return Promise.resolve();

  const validEls  = elements.filter(Boolean);
  const maxStagger = Math.min(validEls.length * 40, 180);

  return new Promise(resolve => {
    validEls.forEach((el, i) => {
      const delay = (i / Math.max(validEls.length - 1, 1)) * maxStagger;
      setTimeout(() => {
        if (!el || !el.isConnected) return;
        // Phase 1: Scale up + brighten
        el.style.transition = 'transform 0.12s ease-out, filter 0.12s';
        el.style.transform  = 'scale(1.4)';
        el.style.filter     = 'brightness(2) saturate(2) drop-shadow(0 0 8px gold)';
        el.style.zIndex     = '20';

        // Spawn sparkles right away
        spawnMatchSparkles(el);

        // Phase 2: Pop to zero
        setTimeout(() => {
          if (!el || !el.isConnected) return;
          el.style.transition = 'transform 0.18s cubic-bezier(0.55,0,1,0.45), opacity 0.18s ease-in, filter 0.1s';
          el.style.transform  = 'scale(0) rotate(25deg)';
          el.style.opacity    = '0';
          el.style.filter     = '';
        }, 120);
      }, delay);
    });

    // Resolve after all animations done
    const totalTime = maxStagger + 120 + 200;
    setTimeout(() => {
      validEls.forEach(el => {
        if (!el) return;
        el.style.transition = '';
        el.style.transform  = '';
        el.style.opacity    = '';
        el.style.filter     = '';
        el.style.zIndex     = '';
      });
      resolve();
    }, totalTime);
  });
}

// ─── Sparkle burst on match ───────────────────────────────────────────────────
function spawnMatchSparkles(tileEl) {
  const rect   = tileEl.getBoundingClientRect();
  const cx     = rect.left + rect.width / 2;
  const cy     = rect.top  + rect.height / 2;
  const colors = ['#ffde59','#ff6eb4','#7ef9ff','#a855f7','#ffffff','#ff9500'];

  for (let i = 0; i < 7; i++) {
    const star = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 7;
    const dist  = 18 + Math.random() * 24;
    star.style.cssText = `
      position:fixed; pointer-events:none; z-index:100;
      left:${cx}px; top:${cy}px;
      width:${4+Math.random()*5}px; height:${4+Math.random()*5}px;
      border-radius:50%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      box-shadow:0 0 6px currentColor;
      transform:translate(-50%,-50%);
      animation:sparkle-pop ${0.4+Math.random()*0.25}s ease-out ${Math.random()*60}ms forwards;
      --tx:${Math.cos(angle)*dist}px; --ty:${Math.sin(angle)*dist}px;
    `;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 800);
  }
}

// ─── Bomb shockwave ───────────────────────────────────────────────────────────
function spawnBombRing(x, y) {
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.style.cssText = `
      position:fixed; pointer-events:none; z-index:80;
      left:${x}px; top:${y}px;
      width:60px; height:60px;
      border:${3-i}px solid rgba(${i===0?'255,107,107':i===1?'255,222,89':'168,85,247'},${0.9-i*0.2});
      border-radius:50%; transform:translate(-50%,-50%);
      animation:bomb-ring ${0.45+i*0.1}s ease-out ${i*80}ms forwards;
    `;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 800);
  }
  screenShake();
}

// ─── Rocket trail ─────────────────────────────────────────────────────────────
function spawnRocketTrail(x1, y1, x2, y2, isRow) {
  const trail = document.createElement('div');
  const w  = Math.abs(x2-x1);
  const h  = Math.abs(y2-y1);
  trail.style.cssText = `
    position:fixed; pointer-events:none; z-index:80;
    left:${Math.min(x1,x2)}px; top:${Math.min(y1,y2)-1}px;
    width:${isRow?w:4}px; height:${isRow?4:h}px;
    background:linear-gradient(${isRow?'90deg':'180deg'}, transparent, #ff9500, #ffde59, transparent);
    border-radius:2px;
    animation:rocket-sweep 0.4s ease-out forwards;
    transform-origin:${isRow?'left':'top'} center;
  `;
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 500);
}

// ─── Rainbow flash ────────────────────────────────────────────────────────────
function spawnRainbowFlash() {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; inset:0; pointer-events:none; z-index:70;
    background:linear-gradient(135deg,rgba(255,110,180,.3),rgba(168,85,247,.3),rgba(126,249,255,.3),rgba(255,222,89,.3));
    animation:rainbow-wave-flash 0.7s ease forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

// ─── Screen shake ─────────────────────────────────────────────────────────────
function screenShake() {
  const el = document.getElementById('game-screen') || document.body;
  el.classList.remove('screen-shake');
  void el.offsetWidth;
  el.classList.add('screen-shake');
  setTimeout(() => el.classList.remove('screen-shake'), 450);
}

// ─── Tile bounce-in ───────────────────────────────────────────────────────────
function bounceIn(el, delay=0) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!el || !el.isConnected) { resolve(); return; }
      el.style.animation = '';
      void el.offsetWidth;
      el.style.animation = 'tile-bounce-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both';
      setTimeout(() => { if (el) el.style.animation = ''; resolve(); }, 500);
    }, delay);
  });
}

// ─── Tile fall-in ─────────────────────────────────────────────────────────────
function fallIn(el, delay=0) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (!el || !el.isConnected) { resolve(); return; }
      el.style.animation = '';
      void el.offsetWidth;
      el.style.animation = 'tile-fall-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both';
      setTimeout(() => { if (el) el.style.animation = ''; resolve(); }, 420);
    }, delay);
  });
}

// ─── Floating score ───────────────────────────────────────────────────────────
function showFloatingScore(x, y, text, color='#ffde59', isBig=false) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; pointer-events:none; z-index:90;
    left:${x}px; top:${y}px;
    font-family:'Nunito',sans-serif;
    font-size:${isBig?'1.5':'1.05'}rem; font-weight:900; color:${color};
    text-shadow:0 0 12px ${color}, 0 2px 8px rgba(0,0,0,.6);
    transform:translateX(-50%);
    animation:float-up ${isBig?'1.3':'1.0'}s ease forwards;
    white-space:nowrap;
  `;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ─── Idle wiggle ──────────────────────────────────────────────────────────────
function setupWiggle(el, delay=0) {
  const dur = 2.2 + Math.random() * 2.5;
  el.style.setProperty('--wiggle-d',     `${dur}s`);
  el.style.setProperty('--wiggle-delay', `${delay}s`);
  el.classList.add('wiggle-idle');
}

// ─── Hint ─────────────────────────────────────────────────────────────────────
function showHint(elements) { elements.forEach(el => el?.classList.add('hint')); }
function clearHints(elements) { elements.forEach(el => el?.classList.remove('hint')); }

export {
  ConfettiSystem,
  animateSwapFromOldPos,
  animateInvalidBump,
  popTiles,
  bounceIn,
  fallIn,
  spawnMatchSparkles,
  spawnBombRing,
  spawnRocketTrail,
  spawnRainbowFlash,
  screenShake,
  showFloatingScore,
  setupWiggle,
  showHint,
  clearHints
};
