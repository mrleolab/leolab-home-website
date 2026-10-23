import { Simulation, sub, norm } from './physics.mjs';
import { Renderer } from './renderer.mjs';

const root=document.querySelector('#space-lab');
if(root) init();
function init(){
  const get=name=>root.querySelector(`[data-lab="${name}"]`);
  const controls=Object.fromEntries([...root.querySelectorAll('[data-lab-control]')].map(el=>[el.dataset.labControl,el]));
  const sim=new Simulation(), canvas=get('canvas');
  const epochLabel=document.createElement('p');epochLabel.className='lab-measure-note';epochLabel.textContent='Solar system / J2000 initial conditions';root.querySelector('.lab-readings').append(epochLabel);
  const popup=document.createElement('div');popup.className='lab-planet-popover';popup.hidden=true;popup.setAttribute('role','region');popup.setAttribute('aria-label','Selected planet details');
  const closePopup=document.createElement('button');closePopup.type='button';closePopup.className='lab-planet-close';closePopup.textContent='×';closePopup.setAttribute('aria-label','Close planet details');
  const popupName=document.createElement('strong'),popupType=document.createElement('small'),popupData=document.createElement('p');
  popup.append(closePopup,popupName,popupType,popupData);canvas.parentElement.append(popup);closePopup.addEventListener('click',()=>{popup.hidden=true});
  const descriptions=['Sun · 太阳 / Star','Mercury · 水星 / Rocky planet','Venus · 金星 / Cloud-covered planet','Earth · 地球 / Ocean planet','Mars · 火星 / Rocky planet','Jupiter · 木星 / Gas giant','Saturn · 土星 / Ringed gas giant','Uranus · 天王星 / Ice giant','Neptune · 海王星 / Ice giant'];
  let renderer;
  try { renderer=new Renderer(canvas); } catch { get('status').textContent='3D view unavailable';get('notice').textContent='The 3D view could not start. Try enabling hardware acceleration or reopening this page.';return; }
  if(!renderer.gl&&!renderer.ctx){get('status').textContent='Graphics unavailable';return}
  get('renderer').textContent=renderer.gl?'WEBGL / 3D':'2D PROJECTED VIEW';
  renderer.texturePromise?.then(ready=>{get('renderer').textContent=ready?'WEBGL / PLANET SURFACE MAPS':'WEBGL / MAPS UNAVAILABLE';});
  let selected=3,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible=false,raf=0,last=null,accumulator=0,lastData=0,lastTrail=0;
  let rotating=false,drag=null,history=sim.bodies.map(()=>[]);
  let autoOrbit=false,expanded=false,pinch=null,touchBeforeImmersive=true;
  const pointers=new Map(),stage=canvas.parentElement;
  const touchButton=root.querySelector('[data-lab-action="rotate"]');
  const expandButton=root.querySelector('[data-lab-action="immersive"]');
  const gestureLabel=get('scene-gesture');
  function touchMode(enabled){
    rotating=enabled;canvas.classList.toggle('is-interactive',enabled);
    touchButton.setAttribute('aria-pressed',String(enabled));
    get('hint').textContent=enabled?'One finger rotates; two fingers pinch to zoom. Disable Touch controls to scroll from the scene.':'Swipe to scroll. Enable Touch controls for rotation and two-finger zoom.';
    gestureLabel.textContent=enabled?'Drag to orbit · Pinch to zoom':'Drag to orbit · Scroll to zoom';
    pointers.clear();drag=null;pinch=null;
  }
  function immersive(enabled){
    if(enabled)touchBeforeImmersive=rotating;
    expanded=enabled;stage.classList.toggle('is-expanded',enabled);document.body.classList.toggle('lab-immersive-open',enabled);
    expandButton.setAttribute('aria-pressed',String(enabled));expandButton.textContent=enabled?'Exit universe ×':'Expand universe ↗';
    touchMode(enabled||touchBeforeImmersive);renderer.resize();
    if(enabled)canvas.focus({preventScroll:true});else expandButton.focus({preventScroll:true});
  }
  const formats={rate:v=>`${v} days/s`,dt:v=>`${v.toFixed(2)} day`,mass:v=>`${v.toFixed(2)} M☉`,gravity:v=>`${v.toFixed(2)} G₀`,alpha:v=>`${Math.round(v*100)}%`};
  const value=name=>Number(controls[name].value);
  const pauseButton=root.querySelector('[data-lab-action="pause"]');
  const clearTrails=()=>{history=sim.bodies.map(()=>[]);lastTrail=sim.time;};
  function status(){get('status').textContent=paused?'Paused':'Running';pauseButton.textContent=paused?'Play':'Pause';}
  function readings(){
    get('clock').textContent=`Day ${(sim.time*365.25).toFixed(1)}`;
    get('body-name').textContent=selected===null?'Solar system':sim.bodies[selected].name;
    get('scene-focus').textContent=selected===null?'Solar system':sim.bodies[selected].name;
    const o=sim.orbital(selected??0);
    for(const name of ['distance','velocity','axis','eccentricity','period'])get(name).textContent='—';
    if(o){
      get('distance').textContent=`${o.distance.toFixed(4)} AU`;
      get('velocity').textContent=`${o.speed.toFixed(3)} km/s`;
      get('axis').textContent=o.bound?`${o.a.toFixed(4)} AU`:'Unbound';
      get('eccentricity').textContent=o.e.toFixed(5);
      get('period').textContent=o.bound?`${o.period.toFixed(3)} years`:'Escape trajectory';
    }
    if(!popup.hidden && selected!==null){
      popupName.textContent=sim.bodies[selected].name;popupType.textContent=descriptions[selected];
      popupData.textContent=o?`${o.distance.toFixed(3)} AU from Sun · ${o.speed.toFixed(2)} km/s`:`Central star · ${sim.starMass.toFixed(2)} solar masses`;
    }
    const drift=Math.abs((sim.energy()-sim.referenceEnergy)/sim.referenceEnergy)*100;
    get('energy').textContent=`${drift.toFixed(5)}%`;
    if(drift>.5){paused=true;status();get('notice').textContent='Numerical accuracy limit reached (energy drift > 0.5%). Reduce the integration step and reset the experiment.';}
  }
  function integrate(){
    try {
      sim.step(value('dt')/365.25);
      if(sim.bodies.some((b,i)=>i && norm(sub(b.p,sim.bodies[0].p))<.00465*Math.cbrt(sim.starMass))) throw new Error('A body reached the stellar surface. Collision dynamics are outside this model; reset the experiment.');
    } catch(error){paused=true;accumulator=0;status();get('notice').textContent=error.message;return false;}
    if(sim.time-lastTrail>=.5/365.25){
      sim.bodies.forEach((b,i)=>{history[i].push([...b.p]);if(history[i].length>600)history[i].shift()});lastTrail=sim.time;
    }
    return true;
  }
  function render(){
    const target=selected===null?[0,0,0]:sim.bodies[selected].p;
    renderer.focus=renderer.focus.map((x,k)=>x+(target[k]-x)*.12);
    renderer.draw(sim,{selected,trails:get('trails').checked?history:null,orbits:get('orbits').checked,alpha:value('alpha')});
  }
  function frame(now){
    raf=0;
    if(!visible||document.hidden){last=null;return;}
    const delta=last===null?0:Math.min((now-last)/1000,.06);last=now;
    if(!paused){
      accumulator+=delta*value('rate');let steps=0;
      while(accumulator>=value('dt')&&steps<160){if(!integrate())break;accumulator-=value('dt');steps++;}
      // Drop excess wall-clock demand, never enlarge a physical integration step.
      accumulator=Math.min(accumulator,value('dt')*160);
    }
    renderer.time=now/1000;
    if(autoOrbit&&!drag)renderer.yaw+=delta*.07;
    render();if(now-lastData>150){readings();lastData=now;}
    raf=requestAnimationFrame(frame);
  }
  function resume(){if(raf)cancelAnimationFrame(raf);raf=0;last=null;if(visible&&!document.hidden)raf=requestAnimationFrame(frame)}
  function updateOutputs(){for(const [name,control] of Object.entries(controls))root.querySelector(`[data-lab-output="${name}"]`).textContent=formats[name](Number(control.value));}
  for(const [name,control] of Object.entries(controls))control.addEventListener('input',()=>{
    updateOutputs();
    if(name==='mass'||name==='gravity'){
      sim.setParameters(value('gravity'),value('mass'));clearTrails();
      get('notice').textContent='Mass / G changed at the current position and velocity. Energy drift is now measured from this intervention.';
    }
    if(name==='dt'||name==='rate')accumulator=0;
    root.querySelectorAll('[data-lab-preset]').forEach(b=>b.classList.remove('is-active'));
    readings();
  });
  function focusBody(index,showPopup=false){
    selected=index;get('focus').value=index===null?'system':String(index);
    if(selected===null){renderer.span=35;renderer.zoom=1;}
    else {renderer.span=Math.max(.25,Math.min(4,selected?norm(sub(sim.bodies[selected].p,sim.bodies[0].p))*.35:2.1));renderer.zoom=1;}
    popup.hidden=!showPopup||selected===null;readings();
  }
  get('focus').addEventListener('change',()=>focusBody(get('focus').value==='system'?null:Number(get('focus').value),true));
  function preset(name){
    controls.rate.value=30;controls.dt.value=.25;controls.mass.value=name==='gravity'?2:1;
    controls.gravity.value=name==='escape'?.4:1;controls.alpha.value=.35;
    sim.setParameters(value('gravity'),value('mass'));sim.reset();clearTrails();accumulator=0;
    renderer.span=2.1;renderer.zoom=1;renderer.pitch=.72;renderer.focus=[0,0,0];
    selected=3;get('focus').value='3';paused=false;status();updateOutputs();readings();
    popup.hidden=true;
    get('notice').textContent=name==='gravity'?'Experiment: solar mass doubled with the original velocities. Watch the orbits become more eccentric.':name==='escape'?'Experiment: G reduced to 0.4 G₀ with the original velocities. Watch Earth transition to an unbound trajectory.':'Experiment: change solar mass while running and observe the orbit respond over time.';
    root.querySelectorAll('[data-lab-preset]').forEach(b=>b.classList.toggle('is-active',b.dataset.labPreset===name));
  }
  root.querySelectorAll('[data-lab-preset]').forEach(button=>button.addEventListener('click',()=>preset(button.dataset.labPreset)));
  root.querySelectorAll('[data-lab-action]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.labAction;
    if(action==='pause'){paused=!paused;accumulator=0;status()}
    if(action==='step'){paused=true;accumulator=0;integrate();status();readings()}
    if(action==='reset'){preset('solar')}
    if(action==='inner'||action==='all'){selected=null;popup.hidden=true;get('focus').value='system';renderer.span=action==='all'?35:2.1;renderer.zoom=1;readings()}
    if(action==='top'){renderer.pitch=0;renderer.yaw=0}
    if(action==='zoom-in')renderer.zoom=Math.min(20,renderer.zoom*1.25);
    if(action==='zoom-out')renderer.zoom=Math.max(.1,renderer.zoom/1.25);
    if(action==='rotate')touchMode(!rotating);
    if(action==='auto'){autoOrbit=!autoOrbit;button.setAttribute('aria-pressed',String(autoOrbit))}
    if(action==='immersive')immersive(!expanded);
    if(action==='exit-immersive')immersive(false);
  }));
  let tap=null;
  canvas.addEventListener('pointerdown',e=>{
    tap=pointers.size?null:{id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
    if(e.pointerType!=='mouse'&&!rotating)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
    if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:renderer.zoom};}
  });
  canvas.addEventListener('pointermove',e=>{
    if(tap&&tap.id===e.pointerId&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>8)tap.moved=true;
    if(!pointers.has(e.pointerId))return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size>=2&&pinch){const [a,b]=[...pointers.values()];renderer.zoom=Math.max(.1,Math.min(20,pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance)));return;}
    if(!drag||e.pointerId!==drag.id)return;
    renderer.yaw+=(e.clientX-drag.x)*.006;renderer.pitch=Math.max(-1.5,Math.min(1.5,renderer.pitch+(e.clientY-drag.y)*.006));
    drag.x=e.clientX;drag.y=e.clientY;
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{
    if(name==='pointerup'&&tap?.id===e.pointerId&&!tap.moved){
      const rect=canvas.getBoundingClientRect(),hit=renderer.hitTest(e.clientX-rect.left,e.clientY-rect.top);
      if(hit!==null)focusBody(hit,true);else popup.hidden=true;
    }
    tap=null;
    pointers.delete(e.pointerId);pinch=null;
    const remaining=pointers.entries().next().value;
    drag=remaining?{id:remaining[0],x:remaining[1].x,y:remaining[1].y}:null;
  });
  canvas.addEventListener('wheel',e=>{e.preventDefault();renderer.zoom=Math.max(.1,Math.min(20,renderer.zoom*Math.exp(-e.deltaY*.0012)))},{passive:false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(expanded)immersive(false);else if(rotating)touchMode(false)}});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;
    e.preventDefault();
    if(e.key==='ArrowLeft')renderer.yaw-=.1;if(e.key==='ArrowRight')renderer.yaw+=.1;
    if(e.key==='ArrowUp')renderer.pitch=Math.max(-1.5,renderer.pitch-.1);if(e.key==='ArrowDown')renderer.pitch=Math.min(1.5,renderer.pitch+.1);
    if(e.key==='+')renderer.zoom=Math.min(20,renderer.zoom*1.2);if(e.key==='-')renderer.zoom=Math.max(.1,renderer.zoom/1.2);
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;status();get('notice').textContent='Graphics paused by the browser. Reload to restore the 3D view.'});
  new ResizeObserver(()=>{renderer.resize();render()}).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume()},{rootMargin:'40px'}).observe(root);
  document.addEventListener('visibilitychange',resume);
  touchMode(true);
  renderer.span=2.1;renderer.resize();updateOutputs();status();readings();render();
}
