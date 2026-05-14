import React, { useRef, useEffect } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'mentor' | 'apprentice';
  r: number;
  labelHe: string;
  labelEn: string;
  alpha: number;
  paired: boolean;
  pairTimer: number;
  // for the lift-off animation
  liftVy: number;
}

interface Spark {
  x: number;
  y: number;
  r: number;
  alpha: number;
  maxR: number;
}

const TRADES_HE = ['נגרות', 'חשמל', 'ריתוך', 'שרברב', 'מכונאי', 'ספר'];
const TRADES_EN = ['Carpentry', 'Electric', 'Welding', 'Plumbing', 'Mechanic', 'Barber'];

export default function NetworkAnimation({ isRtl }: { isRtl: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    const nodes: Node[] = [];
    const sparks: Spark[] = [];
    let raf: number;
    let floatingLabels: { x: number; y: number; text: string; vy: number; alpha: number }[] = [];

    function resize() {
      W = container.clientWidth;
      H = container.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(DPR, DPR);
    }

    function spawnNode(type: 'mentor' | 'apprentice'): Node {
      const side = type === 'mentor';
      return {
        x: side ? Math.random() * W * 0.42 + 20 : W * 0.58 + Math.random() * W * 0.38,
        y: Math.random() * (H - 60) + 30,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        type,
        r: type === 'mentor' ? 20 : 17,
        labelHe: type === 'mentor' ? 'מנטור' : 'חניך',
        labelEn: type === 'mentor' ? 'Mentor' : 'Apprentice',
        alpha: 0,
        paired: false,
        pairTimer: 0,
        liftVy: 0,
      };
    }

    // Spawn initial nodes with stagger
    const MENTOR_COUNT = 3;
    const APPRENTICE_COUNT = 3;
    for (let i = 0; i < MENTOR_COUNT; i++) nodes.push(spawnNode('mentor'));
    for (let i = 0; i < APPRENTICE_COUNT; i++) nodes.push(spawnNode('apprentice'));

    // Floating trade labels
    function spawnLabel() {
      const idx = Math.floor(Math.random() * 6);
      floatingLabels.push({
        x: Math.random() * W,
        y: H + 20,
        text: isRtl ? TRADES_HE[idx] : TRADES_EN[idx],
        vy: -(Math.random() * 0.35 + 0.18),
        alpha: 0,
      });
    }
    let labelTimer = 0;

    function draw(ts: number) {
      ctx.clearRect(0, 0, W, H);

      // ── Background ──
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0b1120');
      bg.addColorStop(1, '#0f1730');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // subtle grid
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      for (let gx = 0; gx < W; gx += 36) {
        for (let gy = 0; gy < H; gy += 36) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // central divider glow
      const div = ctx.createLinearGradient(W / 2 - 1, 0, W / 2 + 1, 0);
      div.addColorStop(0, 'rgba(59,130,246,0)');
      div.addColorStop(0.5, 'rgba(59,130,246,0.18)');
      div.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.fillStyle = div;
      ctx.fillRect(W / 2 - 1, 0, 2, H);

      // ── Floating trade labels ──
      labelTimer += 1;
      if (labelTimer > 90) { spawnLabel(); labelTimer = 0; }

      floatingLabels = floatingLabels.filter(l => l.alpha > -0.05);
      for (const l of floatingLabels) {
        l.y += l.vy;
        if (l.y < H * 0.7 && l.alpha < 0.22) l.alpha += 0.008;
        if (l.y < H * 0.25) l.alpha -= 0.007;
        if (l.alpha <= 0 && l.y < H * 0.1) { l.alpha = -1; continue; }
        ctx.font = '600 10px system-ui';
        ctx.fillStyle = `rgba(148,163,184,${Math.max(0, l.alpha)})`;
        ctx.textAlign = 'center';
        ctx.fillText(l.text, l.x, l.y);
      }

      // ── Connection lines ──
      const mentors = nodes.filter(n => n.type === 'mentor' && !n.paired && n.alpha > 0.5);
      const apprentices = nodes.filter(n => n.type === 'apprentice' && !n.paired && n.alpha > 0.5);

      for (const m of mentors) {
        for (const a of apprentices) {
          const dx = m.x - a.x;
          const dy = m.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const MAX_DIST = 160;
          if (dist < MAX_DIST) {
            const t = 1 - dist / MAX_DIST;

            // gradient line
            const grad = ctx.createLinearGradient(m.x, m.y, a.x, a.y);
            grad.addColorStop(0, `rgba(59,130,246,${t * 0.7})`);
            grad.addColorStop(0.5, `rgba(147,197,253,${t})`);
            grad.addColorStop(1, `rgba(100,116,139,${t * 0.7})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = t * 2;
            ctx.shadowBlur = 10 * t;
            ctx.shadowColor = 'rgba(96,165,250,0.6)';
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(a.x, a.y);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // travelling dot along the line
            const progress = (Math.sin(ts / 900 + m.x) + 1) / 2;
            const dotX = m.x + (a.x - m.x) * progress;
            const dotY = m.y + (a.y - m.y) * progress;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2.5 * t, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${t * 0.9})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(147,197,253,1)';
            ctx.fill();
            ctx.shadowBlur = 0;

            // pair them when very close
            if (dist < 48 && !m.paired && !a.paired) {
              m.paired = true;
              a.paired = true;
              m.pairTimer = 0;
              a.pairTimer = 0;
              // spark
              sparks.push({ x: (m.x + a.x) / 2, y: (m.y + a.y) / 2, r: 0, alpha: 1, maxR: 55 });
            }
          }
        }
      }

      // ── Sparks ──
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.r += 2.2;
        s.alpha -= 0.038;
        if (s.alpha <= 0) { sparks.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(147,197,253,${s.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(96,165,250,0.8)';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // inner spark
        if (s.r < s.maxR * 0.4) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${s.alpha * 0.6})`;
          ctx.fill();
        }
      }

      // ── Nodes ──
      for (const n of nodes) {
        // fade in
        if (!n.paired && n.alpha < 1) n.alpha = Math.min(1, n.alpha + 0.012);

        if (n.paired) {
          n.pairTimer += 1;
          // lift off after spark
          if (n.pairTimer > 20) {
            n.liftVy -= 0.04;
            n.y += n.liftVy;
            n.alpha = Math.max(0, n.alpha - 0.025);
          }
          // respawn
          if (n.alpha <= 0) {
            Object.assign(n, spawnNode(n.type));
          }
        } else {
          // wander
          n.x += n.vx;
          n.y += n.vy;
          // soft boundary
          const pad = n.r + 12;
          const boundary = n.type === 'mentor' ? [pad, W * 0.52] : [W * 0.48, W - pad];
          if (n.x < boundary[0]) { n.vx += 0.03; }
          if (n.x > boundary[1]) { n.vx -= 0.03; }
          if (n.y < pad) { n.vy += 0.03; }
          if (n.y > H - pad) { n.vy -= 0.03; }
          n.vx *= 0.995;
          n.vy *= 0.995;
          // random nudge
          if (Math.random() < 0.004) n.vx += (Math.random() - 0.5) * 0.3;
          if (Math.random() < 0.004) n.vy += (Math.random() - 0.5) * 0.3;
        }

        if (n.alpha <= 0.02) continue;

        const isM = n.type === 'mentor';
        const baseColor = isM ? '59,130,246' : '100,116,139';
        const ringColor = isM ? '147,197,253' : '148,163,184';

        // outer glow ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor},${n.alpha * 0.10})`;
        ctx.fill();

        // pulsing ring (mentor only)
        if (isM) {
          const pulse = (Math.sin(ts / 700 + n.x) + 1) / 2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 14 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(96,165,250,${n.alpha * 0.18 * pulse})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // filled circle
        const circleGrad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, n.r * 0.1, n.x, n.y, n.r);
        circleGrad.addColorStop(0, isM ? `rgba(96,165,250,${n.alpha})` : `rgba(148,163,184,${n.alpha})`);
        circleGrad.addColorStop(1, isM ? `rgba(29,78,216,${n.alpha})` : `rgba(51,65,85,${n.alpha})`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = circleGrad;
        ctx.shadowBlur = isM ? 18 : 8;
        ctx.shadowColor = isM ? 'rgba(59,130,246,0.5)' : 'rgba(100,116,139,0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // border
        ctx.strokeStyle = `rgba(${ringColor},${n.alpha * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // label text
        ctx.fillStyle = `rgba(255,255,255,${n.alpha * 0.92})`;
        ctx.font = `bold ${isM ? 7.5 : 7}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isRtl ? n.labelHe : n.labelEn, n.x, n.y);

        // match badge when paired and lifting
        if (n.paired && n.pairTimer > 20 && n.type === 'mentor') {
          const badgeAlpha = Math.min(1, (n.pairTimer - 20) / 15) * n.alpha;
          ctx.fillStyle = `rgba(255,255,255,${badgeAlpha})`;
          ctx.font = `bold 8px system-ui`;
          ctx.fillText(isRtl ? '✓ התאמה!' : '✓ Match!', n.x, n.y - n.r - 14);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isRtl]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: 200 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* overlay text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[.28em] mb-1">
          {isRtl ? 'רשת חיה' : 'Live Network'}
        </p>
        <h3 className="text-white text-lg font-black tracking-tight">
          {isRtl ? 'מנטורים מוצאים חניכים · בזמן אמת' : 'Mentors finding apprentices · live'}
        </h3>
      </div>

      {/* left/right labels */}
      <div className="absolute bottom-3 left-4 text-[10px] font-black text-blue-400/70 uppercase tracking-widest">
        {isRtl ? 'מנטורים' : 'Mentors'}
      </div>
      <div className="absolute bottom-3 right-4 text-[10px] font-black text-slate-500/70 uppercase tracking-widest">
        {isRtl ? 'חניכים' : 'Apprentices'}
      </div>
    </div>
  );
}
