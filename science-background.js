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
  const palette = [[100,255,132], [202,228,255], [100,235,255], [255,190,90], [64,190,255], [180,146,255]];
  const shell=[218,239,255], orange=[255,157,55], metal=[105,150,181], cyan=[75,255,239];
  // Original particle geometry, using Microduck's visible design as reference:
  // https://pollen-robotics.com/microduck/ (no photo or CAD files redistributed).
  // Parts: center, half-extents, color, sampling weight, optional ellipsoid.
  const robotParts=[
    [[0,-.48,0],[.39,.27,.24],shell,24], [[0,-.48,.25],[.31,.17,.01],metal,6],
    [[-.15,-.51,.28],[.065,.065,.015],cyan,5,true], [[.15,-.51,.28],[.065,.065,.015],cyan,5,true],
    [[0,-.37,.27],[.16,.018,.015],cyan,2], [[0,-.82,0],[.025,.1,.025],metal,2],
    [[0,-.93,0],[.06,.06,.06],orange,2,true], [[0,.04,0],[.29,.25,.19],shell,18],
    [[0,.02,.2],[.1,.1,.02],cyan,4,true], [[-.43,.03,0],[.075,.28,.08],metal,6],
    [[.43,.03,0],[.075,.28,.08],metal,6], [[-.17,.53,0],[.09,.25,.1],shell,7],
    [[.17,.53,0],[.09,.25,.1],shell,7], [[-.18,.84,.07],[.15,.08,.19],cyan,5],
    [[.18,.84,.07],[.15,.08,.19],cyan,5],
  ];
  const duckParts=[
    [[0,-.56,.02],[.44,.25,.25],shell,28,true], [[0,-.58,.23],[.32,.16,.035],metal,7],
    [[-.09,-.58,.28],[.12,.12,.025],orange,5,true], [[-.09,-.58,.31],[.065,.065,.02],cyan,4,true],
    [[0,-.34,.15],[.42,.045,.24],orange,9], [[0,-.12,0],[.065,.2,.065],metal,6],
    [[0,.14,-.03],[.26,.16,.19],shell,13,true], [[-.25,.3,0],[.1,.12,.12],shell,4,true],
    [[.25,.3,0],[.1,.12,.12],shell,4,true], [[-.25,.46,-.02],[.075,.18,.08],metal,6],
    [[.25,.46,-.02],[.075,.18,.08],metal,6], [[-.23,.65,.05],[.065,.13,.07],metal,5],
    [[.23,.65,.05],[.065,.13,.07],metal,5], [[-.25,.82,.13],[.17,.065,.25],orange,8],
    [[.25,.82,.13],[.17,.065,.25],orange,8],
  ];
  function sampleRobot(parts) {
    let ticket=random()*parts.reduce((sum,p)=>sum+p[3],0), part=parts[parts.length-1];
    for(const p of parts){ticket-=p[3];if(ticket<=0){part=p;break;}}
    const [center,radii,color,,round]=part;
    let local;
    if(round){const z=random()*2-1,a=random()*TAU,r=Math.sqrt(1-z*z);local=[Math.cos(a)*r,z,Math.sin(a)*r];}
    else {local=[random()*2-1,random()*2-1,random()*2-1];local[Math.floor(random()*3)]=random()<.5?-1:1;}
    return {position:local.map((v,k)=>center[k]+v*radii[k]),color};
  }
  const orbitColors = [[115,221,255],[130,155,255],[69,255,180],[255,112,151],[255,186,84],[234,148,255],[93,241,245],[131,158,255]];
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
    // Extra points are rendered only for robot scenes and their transitions.
    const count = mobile ? 6400 : 10000;
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
      const orbit = 1 + Math.floor(i / 8) % 8, angle = random() * TAU;
      const radius = .14 + orbit * .105;
      let solar = [Math.cos(angle) * radius, Math.sin(angle) * radius * .6, Math.sin(angle) * radius * .3];
      let solarColor = orbitColors[orbit - 1];
      if (i % 4 === 0) {
        const z = random() * 2 - 1, p = random() * TAU, r = Math.sqrt(1-z*z) * .15;
        solar = [Math.cos(p) * r, z * .15, Math.sin(p) * r];
        solarColor = [255,205 + random() * 50,65];
      } else if (i % 4 === 1 || i % 8 === 2) {
        const planet = Math.floor(i / 8) % 8, a = planet * 2.4, r = .23 + planet * .095;
        const p = random() * TAU, z = random() * 2 - 1, size = [.027,.04,.045,.035,.072,.065,.05,.048][planet];
        const rr=Math.sqrt(1-z*z), px=Math.cos(p)*rr, pz=Math.sin(p)*rr;
        solar = [Math.cos(a) * r + px * size, Math.sin(a) * r * .6 + z * size, pz * size];
        const colors=[[170,170,174],[239,195,128],[64,155,255],[239,103,63],[221,170,120],[239,209,149],[111,231,227],[74,115,250]];
        const light=.65+.35*Math.max(0,pz*.8-px*.6);
        solarColor=colors[planet].map(c=>Math.round(c*light));
        if(planet===2 && Math.sin(p*4+z*8)>.35)solarColor=[75,193,124].map(c=>Math.round(c*light));
        if(planet===5 && i%3===0){const ring=random()*TAU,ringR=size*(1.4+random()*.7);solar=[Math.cos(a)*r+Math.cos(ring)*ringR,Math.sin(a)*r*.6+Math.sin(ring)*ringR*.35,Math.sin(ring)*ringR];solarColor=[211,185,144];}
      }
      const robot=sampleRobot(robotParts),duck=sampleRobot(duckParts);
      return { shapes: [dna, scope, robot.position, duck.position, solar, molecule], robotColor:robot.color, duckColor:duck.color, solarColor, size: .75 + random() * .65, alpha: .65 + random() * .35 };
    });
    stars = Array.from({ length: mobile ? 140 : 340 }, () => ({ x: random(), y: random(), size: random() * 1.2 + .2, alpha: .1 + random() * .45 }));
  }
  function resize() {
    if (!hero.clientWidth || !hero.clientHeight) return;
    width = hero.clientWidth; height = hero.clientHeight; mobile = width <= 720;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    createPoints();
    if (reducedMotion.matches) render(0);
  }
  function render(time) {
    ctx.fillStyle = '#040610'; ctx.fillRect(0, 0, width, height);
    const cx = width * (mobile ? .5 : .64), cy = height * (mobile ? .4 : .5);
    // Fit the entire rotating cage/solar system inside narrow screens,
    // including perspective magnification and the morph between shapes.
    const scale = Math.min(width * (mobile ? .43 : .48), height * .57);
    const glow = ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.5);
    glow.addColorStop(0, '#0b1530'); glow.addColorStop(1, '#040610');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    for (const star of stars) {
      ctx.fillStyle = `rgba(174,205,240,${star.alpha * (.85 + .15 * Math.sin(time + star.x * 40))})`;
      ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
    }
    // Three-second scenes, including a smooth 0.84-second particle morph.
    const cycle = time / 3, scene = Math.floor(cycle) % palette.length;
    const blend = Math.max(0, Math.min(1, ((cycle % 1) - .72) / .28));
    const ease = blend * blend * (3 - 2 * blend), next = (scene + 1) % palette.length;
    const rotation = time * .32, cos = Math.cos(rotation), sin = Math.sin(rotation);
    const rotated=(v,kind)=> {
      if(kind===1)return [v[0]+v[2]*Math.sin(rotation)*.35,v[1],v[2]];
      if(kind===2||kind===3){const a=.4*Math.sin(time*.7),c=Math.cos(a),s=Math.sin(a);return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];}
      // Keep the orbital plane readable rather than turning it edge-on.
      if(kind===4){const a=time*.09,c=Math.cos(a),s=Math.sin(a);return [v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]];}
      const x=v[0]*cos+v[2]*sin,z=-v[0]*sin+v[2]*cos;
      return [x,v[1],z];
    };
    const robotScene=kind=>kind===2||kind===3;
    const detailWeight=(robotScene(scene)?1-ease:0)+(robotScene(next)?ease:0);
    const baseCount=mobile?3200:6000;
    for (let index=0;index<points.length;index++) {
      if(index>=baseCount&&detailWeight===0)continue;
      const point=points[index];
      const a = rotated(point.shapes[scene],scene), b = rotated(point.shapes[next],next);
      let x = a[0] + (b[0]-a[0])*ease, y = a[1] + (b[1]-a[1])*ease, z = a[2] + (b[2]-a[2])*ease;
      const depth = 1 / (1 - z * .24);
      const colorFor=kind=>kind===2?point.robotColor:kind===3?point.duckColor:kind===4?point.solarColor:palette[kind];
      const colorA = colorFor(scene), colorB = colorFor(next);
      const color = colorA.map((v,i) => Math.round(v + (colorB[i]-v)*ease));
      const densityAlpha=index>=baseCount?detailWeight:1;
      ctx.fillStyle = `rgba(${color.join(',')},${point.alpha * Math.min(1,depth) * densityAlpha})`;
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
