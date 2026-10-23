(() => {
  const canvas = document.querySelector('.science-background');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const hero = canvas.parentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, mobile = false, points = [], stars = [];
  let frame = 0, lastFrame = 0, elapsed = 0, previousTime = null;
  let visible = true;
  const TAU = Math.PI * 2;
  // A seeded generator keeps the particle shapes stable across frames.
  let seed = 23917;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const line = (a, b, t, jitter) => [a[0] + (b[0] - a[0]) * t + jitter, a[1] + (b[1] - a[1]) * t, 0];
  const microscope = [
    [[-.03,-.78],[.28,-.68]], [[.28,-.68],[.13,-.27]],
    [[.13,-.27],[.02,-.3]], [[.02,-.3],[.13,-.73]],
    [[.27,-.57],[.43,-.36]], [[.43,-.36],[.43,.29]],
    [[.43,.29],[.22,.52]], [[.22,.52],[-.09,.52]],
    [[-.3,.03],[.26,.03]], [[-.3,.07],[.26,.07]],
    [[-.04,.1],[-.04,.38]], [[-.04,.38],[-.23,.61]],
    [[-.43,.65],[.44,.65]], [[-.43,.7],[.44,.7]],
    [[.04,-.3],[-.02,-.17]], [[.12,-.29],[.14,-.14]],
  ];
  const palette = [[115,243,170], [166,204,255], [64,167,244]];
  function createPoints() {
    seed = 23917;
    const count = mobile ? 1000 : 2600;
    points = Array.from({ length: count }, (_, i) => {
      const t = random(), phase = t * TAU * 2.3, strand = i % 2 ? Math.PI : 0;
      const jitter = (random() - .5) * .065;
      let dna = [Math.cos(phase + strand) * .43 + jitter, (t - .5) * 2, Math.sin(phase + strand) * .43];
      if (i % 5 === 0) {
        const row = Math.floor(t * 20) / 20, angle = row * TAU * 2.3;
        const across = random() * 2 - 1;
        dna = [Math.cos(angle) * .43 * across, (row - .5) * 2 + jitter * .2, Math.sin(angle) * .43 * across];
      }
      const segment = microscope[i % microscope.length];
      const scope = line(segment[0], segment[1], random(), jitter);
      scope[2] = (random() - .5) * .16;
      const orbit = 1 + i % 8, angle = random() * TAU;
      const radius = .14 + orbit * .105;
      let solar = [Math.cos(angle) * radius, Math.sin(angle) * radius * .6, Math.sin(angle) * radius * .3];
      let solarColor = [55,147,224];
      if (i % 4 === 0) {
        const z = random() * 2 - 1, p = random() * TAU, r = Math.sqrt(1-z*z) * .15;
        solar = [Math.cos(p) * r, z * .15, Math.sin(p) * r];
        solarColor = [255,180 + random() * 65,55];
      } else if (i % 4 === 1) {
        const planet = i % 7, a = planet * 2.4, r = .26 + planet * .1;
        const p = random() * TAU, z = random() * 2 - 1, size = .025 + planet * .004;
        solar = [Math.cos(a) * r + Math.cos(p) * size, Math.sin(a) * r * .6 + z * size, Math.sin(p) * size];
        solarColor = planet % 2 ? [242,157,86] : [107,222,232];
      }
      return { shapes: [dna, scope, solar], solarColor, size: .45 + random() * .9, alpha: .3 + random() * .65 };
    });
    stars = Array.from({ length: mobile ? 140 : 340 }, () => ({ x: random(), y: random(), size: random() * 1.2 + .2, alpha: .1 + random() * .45 }));
  }
  function resize() {
    if (!hero.clientWidth || !hero.clientHeight) return;
    width = hero.clientWidth; height = hero.clientHeight; mobile = width <= 720;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    createPoints();
    if (reducedMotion.matches) render(0);
  }
  function render(time) {
    ctx.fillStyle = '#040610'; ctx.fillRect(0, 0, width, height);
    const cx = width * (mobile ? .5 : .73), cy = height * (mobile ? .78 : .53);
    const scale = Math.min(width * (mobile ? .7 : .33), height * (mobile ? .25 : .44));
    const glow = ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.5);
    glow.addColorStop(0, '#0b1530'); glow.addColorStop(1, '#040610');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    for (const star of stars) {
      ctx.fillStyle = `rgba(174,205,240,${star.alpha * (.85 + .15 * Math.sin(time + star.x * 40))})`;
      ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
    }
    const cycle = time / 12, scene = Math.floor(cycle) % 3;
    const blend = Math.max(0, Math.min(1, ((cycle % 1) - .72) / .28));
    const ease = blend * blend * (3 - 2 * blend), next = (scene + 1) % 3;
    const rotation = time * .17, cos = Math.cos(rotation), sin = Math.sin(rotation);
    for (const point of points) {
      const a = point.shapes[scene], b = point.shapes[next];
      let x = a[0] + (b[0]-a[0])*ease, y = a[1] + (b[1]-a[1])*ease, z = a[2] + (b[2]-a[2])*ease;
      // Rotate the helix fully; keep the microscope profile legible.
      const spin = scene === 0 && blend === 0 ? 1 : .12;
      const rx = x * (1-spin + cos*spin) + z * sin*spin;
      const depth = 1 + z * .15;
      const colorA = scene === 2 ? point.solarColor : palette[scene];
      const colorB = next === 2 ? point.solarColor : palette[next];
      const color = colorA.map((v,i) => Math.round(v + (colorB[i]-v)*ease));
      ctx.fillStyle = `rgba(${color.join(',')},${point.alpha})`;
      const size = point.size * depth;
      ctx.fillRect(cx + rx * scale, cy + y * scale, size, size);
    }
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || reducedMotion.matches) { previousTime = null; return; }
    if (previousTime !== null) elapsed += Math.min((now - previousTime) / 1000, .1);
    previousTime = now;
    if (now-lastFrame >= (mobile ? 60 : 40)) { render(elapsed); lastFrame = now; }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previousTime = null;
    if (reducedMotion.matches) render(0);
    else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }).observe(hero);
  document.addEventListener('visibilitychange', resume);
  reducedMotion.addEventListener('change', resume);
  resize(); render(0); resume();
})();
