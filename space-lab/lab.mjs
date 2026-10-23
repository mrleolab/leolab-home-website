import { Simulation, sub, norm } from './physics.mjs';
import { Renderer } from './renderer.mjs';

const root=document.querySelector('#space-lab');
if(root) init();
function init(){
  const get=name=>root.querySelector(`[data-lab="${name}"]`);
  const controls=Object.fromEntries([...root.querySelectorAll('[data-lab-control]')].map(el=>[el.dataset.labControl,el]));
  const sim=new Simulation(), canvas=get('canvas');
  let renderer;
  try { renderer=new Renderer(canvas); } catch { get('status').textContent='3D view unavailable';get('notice').textContent='The 3D view could not start. Try enabling hardware acceleration or reopening this page.';return; }
  if(!renderer.gl&&!renderer.ctx){get('status').textContent='Graphics unavailable';return}
  get('renderer').textContent=renderer.gl?'WEBGL / 3D':'2D PROJECTED VIEW';
  let selected=3,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible=false,raf=0,last=null,accumulator=0,lastData=0,lastTrail=0;
  let rotating=false,drag=null,history=sim.bodies.map(()=>[]);
  const formats={rate:v=>`${v} days/s`,dt:v=>`${v.toFixed(2)} day`,mass:v=>`${v.toFixed(2)} M☉`,gravity:v=>`${v.toFixed(2)} G₀`,alpha:v=>`${Math.round(v*100)}%`};
  const value=name=>Number(controls[name].value);
  const pauseButton=root.querySelector('[data-lab-action="pause"]');
  const clearTrails=()=>{history=sim.bodies.map(()=>[]);lastTrail=sim.time;};
  function status(){get('status').textContent=paused?'Paused':'Running';pauseButton.textContent=paused?'Play':'Pause';}
  function readings(){
    get('clock').textContent=`Day ${(sim.time*365.25).toFixed(1)}`;
    get('body-name').textContent=selected===null?'Solar system':sim.bodies[selected].name;
    const o=sim.orbital(selected??0);
    for(const name of ['distance','velocity','axis','eccentricity','period'])get(name).textContent='—';
    if(o){
      get('distance').textContent=`${o.distance.toFixed(4)} AU`;
      get('velocity').textContent=`${o.speed.toFixed(3)} km/s`;
      get('axis').textContent=o.bound?`${o.a.toFixed(4)} AU`:'Unbound';
      get('eccentricity').textContent=o.e.toFixed(5);
      get('period').textContent=o.bound?`${o.period.toFixed(3)} years`:'Escape trajectory';
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
  get('focus').addEventListener('change',()=>{
    selected=get('focus').value==='system'?null:Number(get('focus').value);
    if(selected===null){renderer.span=35;renderer.zoom=1;}
    else {renderer.span=Math.max(1.5,Math.min(35,selected?norm(sub(sim.bodies[selected].p,sim.bodies[0].p))*1.3:6.5));renderer.zoom=1;}
    readings();
  });
  function preset(name){
    controls.rate.value=30;controls.dt.value=.25;controls.mass.value=name==='gravity'?2:1;
    controls.gravity.value=name==='escape'?.4:1;controls.alpha.value=.35;
    sim.setParameters(value('gravity'),value('mass'));sim.reset();clearTrails();accumulator=0;
    renderer.span=2.1;renderer.zoom=1;renderer.pitch=.72;renderer.focus=[0,0,0];
    selected=3;get('focus').value='3';paused=false;status();updateOutputs();readings();
    get('notice').textContent=name==='gravity'?'Experiment: solar mass doubled with the original velocities. Watch the orbits become more eccentric.':name==='escape'?'Experiment: G reduced to 0.4 G₀ with the original velocities. Watch Earth transition to an unbound trajectory.':'Experiment: change solar mass while running and observe the orbit respond over time.';
    root.querySelectorAll('[data-lab-preset]').forEach(b=>b.classList.toggle('is-active',b.dataset.labPreset===name));
  }
  root.querySelectorAll('[data-lab-preset]').forEach(button=>button.addEventListener('click',()=>preset(button.dataset.labPreset)));
  root.querySelectorAll('[data-lab-action]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.labAction;
    if(action==='pause'){paused=!paused;accumulator=0;status()}
    if(action==='step'){paused=true;accumulator=0;integrate();status();readings()}
    if(action==='reset'){preset('solar')}
    if(action==='inner'||action==='all'){selected=null;get('focus').value='system';renderer.span=action==='all'?35:2.1;renderer.zoom=1;readings()}
    if(action==='top'){renderer.pitch=0;renderer.yaw=0}
    if(action==='zoom-in')renderer.zoom=Math.min(20,renderer.zoom*1.25);
    if(action==='zoom-out')renderer.zoom=Math.max(.1,renderer.zoom/1.25);
    if(action==='rotate'){
      rotating=!rotating;canvas.classList.toggle('is-interactive',rotating);button.setAttribute('aria-pressed',String(rotating));
      get('hint').textContent=rotating?'Drag the scene to rotate. Turn Rotate view off to scroll from the canvas.':'Swipe to scroll. Enable Rotate view to drag the scene.';
    }
  }));
  canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='mouse'&&!rotating)return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    renderer.yaw+=(e.clientX-drag.x)*.006;renderer.pitch=Math.max(-1.5,Math.min(1.5,renderer.pitch+(e.clientY-drag.y)*.006));
    drag.x=e.clientX;drag.y=e.clientY;
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{drag=null});
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
  renderer.span=2.1;renderer.resize();updateOutputs();status();readings();render();
}
