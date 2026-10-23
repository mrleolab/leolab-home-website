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
  const palette = [[115,243,170], [166,204,255], [64,167,244], [153,128,255]];
  // Truncated icosahedron: 60 atoms and 90 bonds, the C60 cage geometry.
  const phi = (1 + Math.sqrt(5)) / 2, atoms = [];
  for (const base of [[0,1,3*phi],[1,2+phi,2*phi],[phi,2,2*phi+1]]) {
    for (let turn=0;turn<3;turn++) {
      for (const sx of [-1,1]) for (const sy of [-1,1]) for (const sz of [-1,1]) {
        const v=[base[0]*sx,base[1]*sy,base[2]*sz];
        const p=[v[turn],v[(turn+1)%3],v[(turn+2)%3]];
        if (!atoms.some(a=>a.every((x,k)=>Math.abs(x-p[k])<.001))) atoms.push(p);
      }
    }
  }
  const bonds=[];
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++) {
    if(Math.abs(Math.hypot(...atoms[i].map((x,k)=>x-atoms[j][k]))-2)<.001)bonds.push([atoms[i],atoms[j]]);
  }
  function createPoints() {
    seed = 23917;
    const count = mobile ? 2200 : 4800;
    points = Array.from({ length: count }, (_, i) => {
      const t = random(), phase = t * TAU * 2.3, strand = i % 2 ? Math.PI : 0;
      const jitter = (random() - .5) * .045;
      let dna = [Math.cos(phase + strand) * .43 + jitter, (t - .5) * 2, Math.sin(phase + strand) * .43];
      if (i % 5 === 0) {
        const row = Math.floor(t * 20) / 20, angle = row * TAU * 2.3;
        const across = random() * 2 - 1;
        dna = [Math.cos(angle) * .43 * across, (row - .5) * 2 + jitter * .2, Math.sin(angle) * .43 * across];
      }
      const segment = microscope[i % microscope.length];
      const scope = line(segment[0], segment[1], random(), jitter);
      scope[1] += (random() - .5) * .035;
      scope[2] = (random() - .5) * .16;
      const bond=bonds[i % bonds.length], u=random();
      const molecule=bond[0].map((v,k)=>(v+(bond[1][k]-v)*u)/5.1+(random()-.5)*.018);
      if(i%3===0) {
        const atom=atoms[i%atoms.length], az=random()*TAU, zz=random()*2-1, rr=.045*Math.sqrt(1-zz*zz);
        molecule[0]=atom[0]/5.1+rr*Math.cos(az);molecule[1]=atom[1]/5.1+zz*.045;molecule[2]=atom[2]/5.1+rr*Math.sin(az);
      }
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
      return { shapes: [dna, scope, solar, molecule], solarColor, size: .5 + random() * .85, alpha: .4 + random() * .6 };
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
    const cx = width * (mobile ? .5 : .64), cy = height * .5;
    // Fit the entire rotating cage/solar system inside narrow screens,
    // including perspective magnification and the morph between shapes.
    const scale = Math.min(width * (mobile ? .39 : .48), height * .57);
    const glow = ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.5);
    glow.addColorStop(0, '#0b1530'); glow.addColorStop(1, '#040610');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    for (const star of stars) {
      ctx.fillStyle = `rgba(174,205,240,${star.alpha * (.85 + .15 * Math.sin(time + star.x * 40))})`;
      ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
    }
    // Five-second scenes, including a 1.4-second particle morph.
    const cycle = time / 5, scene = Math.floor(cycle) % 4;
    const blend = Math.max(0, Math.min(1, ((cycle % 1) - .72) / .28));
    const ease = blend * blend * (3 - 2 * blend), next = (scene + 1) % 4;
    const rotation = time * .32, cos = Math.cos(rotation), sin = Math.sin(rotation);
    const rotated=(v,kind)=> {
      if(kind===1)return [v[0]+v[2]*Math.sin(rotation)*.35,v[1],v[2]];
      const x=v[0]*cos+v[2]*sin,z=-v[0]*sin+v[2]*cos;
      return [x,v[1],z];
    };
    for (const point of points) {
      const a = rotated(point.shapes[scene],scene), b = rotated(point.shapes[next],next);
      let x = a[0] + (b[0]-a[0])*ease, y = a[1] + (b[1]-a[1])*ease, z = a[2] + (b[2]-a[2])*ease;
      const depth = 1 / (1 - z * .24);
      const colorA = scene === 2 ? point.solarColor : palette[scene];
      const colorB = next === 2 ? point.solarColor : palette[next];
      const color = colorA.map((v,i) => Math.round(v + (colorB[i]-v)*ease));
      ctx.fillStyle = `rgba(${color.join(',')},${point.alpha * Math.min(1,depth*.85)})`;
      const size = point.size * depth;
      ctx.fillRect(cx + x * scale * depth, cy + y * scale * depth, size, size);
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
