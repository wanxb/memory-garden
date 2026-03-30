window.MemoryGardenScene = (() => {
  function createScene(canvas, quotes) {
    const ctx = canvas.getContext('2d');
    const seeds = [];
    const fireflies = [];
    const meteors = [];

    function resize() {
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function randomQuote() {
      return quotes[(Math.random() * quotes.length) | 0];
    }

    function launchMeteorBurst() {
      for (let i = 0; i < 9; i++) {
        meteors.push({
          x: Math.random() * innerWidth * 0.9,
          y: Math.random() * innerHeight * 0.3,
          vx: 6 + Math.random() * 6,
          vy: 2 + Math.random() * 4,
          life: 1,
          size: 60 + Math.random() * 80
        });
      }
    }

    function addSeed(x, y, text) {
      const hue = 170 + Math.random() * 70;
      seeds.push({
        x, y, text,
        age: 0,
        stem: 50 + Math.random() * 100,
        sway: Math.random() * Math.PI * 2,
        bloom: 12 + Math.random() * 20,
        hue
      });
      for (let i = 0; i < 12; i++) {
        fireflies.push({
          x, y,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -Math.random() * 1.9 - 0.4,
          size: 1 + Math.random() * 3,
          life: 1,
          hue
        });
      }
      return seeds.length;
    }

    function clearAll() {
      seeds.length = 0;
      fireflies.length = 0;
      meteors.length = 0;
    }

    function drawBackground(t) {
      const g = ctx.createLinearGradient(0, 0, 0, innerHeight);
      g.addColorStop(0, '#102845');
      g.addColorStop(.58, '#07111f');
      g.addColorStop(1, '#04070d');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, innerWidth, innerHeight);

      for (let i = 0; i < 120; i++) {
        const x = (i * 173) % innerWidth;
        const y = (i * 97) % (innerHeight * 0.72);
        const tw = 0.4 + 0.6 * Math.sin(t * 0.001 + i * 0.7);
        ctx.fillStyle = `rgba(255,255,255,${0.06 + tw * 0.28})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      ctx.fillStyle = 'rgba(15,35,30,.92)';
      ctx.beginPath();
      ctx.moveTo(0, innerHeight);
      ctx.lineTo(0, innerHeight * 0.72);
      ctx.quadraticCurveTo(innerWidth * 0.2, innerHeight * 0.64, innerWidth * 0.42, innerHeight * 0.77);
      ctx.quadraticCurveTo(innerWidth * 0.62, innerHeight * 0.87, innerWidth, innerHeight * 0.7);
      ctx.lineTo(innerWidth, innerHeight);
      ctx.closePath();
      ctx.fill();
    }

    function drawSeed(seed, t) {
      seed.age += 0.012;
      const growth = Math.min(seed.age, 1);
      const stemTopY = seed.y - seed.stem * growth;
      const sway = Math.sin(t * 0.0018 + seed.sway) * 12 * growth;

      ctx.strokeStyle = `hsla(${seed.hue}, 70%, 68%, .95)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(seed.x, seed.y);
      ctx.quadraticCurveTo(seed.x + sway * 0.35, seed.y - seed.stem * 0.45, seed.x + sway, stemTopY);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const p = (i + 1) / 4;
        const lx = seed.x + sway * p;
        const ly = seed.y - seed.stem * p;
        ctx.fillStyle = 'rgba(124,240,198,.28)';
        ctx.beginPath();
        ctx.ellipse(lx - 8, ly, 14 * growth, 7 * growth, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(lx + 8, ly, 14 * growth, 7 * growth, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const bloom = seed.bloom * (0.65 + 0.35 * Math.sin(t * 0.003 + seed.sway));
      ctx.shadowBlur = 24;
      ctx.shadowColor = `hsla(${seed.hue}, 95%, 70%, .8)`;
      ctx.fillStyle = `hsla(${seed.hue}, 95%, 75%, .95)`;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i + t * 0.0004;
        ctx.beginPath();
        ctx.ellipse(seed.x + sway + Math.cos(a) * bloom * 0.7, stemTopY + Math.sin(a) * bloom * 0.7, bloom * 0.7, bloom * 0.35, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,250,236,.96)';
      ctx.arc(seed.x + sway, stemTopY, bloom * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(236,247,255,.82)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(seed.text.slice(0, 20), seed.x + sway + 14, stemTopY - 10);
    }

    function drawFirefly(f) {
      f.x += f.vx;
      f.y += f.vy;
      f.life -= 0.015;
      ctx.fillStyle = `hsla(${f.hue}, 100%, 72%, ${Math.max(f.life,0)})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawMeteor(m) {
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 0.014;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.size, m.y - m.size * 0.35);
      grad.addColorStop(0, `rgba(255,240,210,${m.life})`);
      grad.addColorStop(1, 'rgba(255,240,210,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.size, m.y - m.size * 0.35);
      ctx.stroke();
    }

    function loop(t) {
      drawBackground(t);
      seeds.forEach(seed => drawSeed(seed, t));
      for (let i = fireflies.length - 1; i >= 0; i--) {
        drawFirefly(fireflies[i]);
        if (fireflies[i].life <= 0) fireflies.splice(i, 1);
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        drawMeteor(meteors[i]);
        if (meteors[i].life <= 0) meteors.splice(i, 1);
      }
      requestAnimationFrame(loop);
    }

    resize();
    requestAnimationFrame(loop);

    return {
      resize,
      randomQuote,
      addSeed,
      clearAll,
      launchMeteorBurst,
      getSeedCount: () => seeds.length
    };
  }

  return { createScene };
})();
