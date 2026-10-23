import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation, GM_SUN, norm, sub} from './physics.mjs';

test('J2000 initial Earth orbit matches its supplied semi-major axis and period',()=>{
  const s=new Simulation(),o=s.orbital(3);
  assert.ok(Math.abs(o.a-1.00000261)<1e-8);
  assert.ok(Math.abs(o.period-1)<.001);
  assert.ok(o.speed>29&&o.speed<31);
});
test('ten-year full N-body integration conserves energy and linear momentum',()=>{
  const s=new Simulation(),start=s.energy();
  for(let n=0;n<14610;n++)s.step(.25/365.25);
  const drift=Math.abs((s.energy()-start)/start);
  assert.ok(drift<1e-5,`Energy drift ${drift}`);
  const momentum=[0,1,2].map(k=>s.bodies.reduce((sum,b)=>sum+b.mass*b.v[k],0));
  assert.ok(norm(momentum)<1e-12);
  assert.ok(s.bodies.every(b=>b.p.every(Number.isFinite)&&b.v.every(Number.isFinite)));
});
test('changing mass preserves velocity and changes subsequent acceleration',()=>{
  const s=new Simulation(),v=[...s.bodies[3].v],a=norm(s.accelerations()[3]);
  s.setParameters(1,2);
  assert.deepEqual(s.bodies[3].v,v);
  assert.ok(norm(s.accelerations()[3])>a*1.9);
  s.step(.25/365.25);
  assert.ok(norm(sub(s.bodies[3].v,v))>0);
});
test('reducing gravity produces a physically unbound Earth orbit',()=>{
  const s=new Simulation();s.setParameters(.4,1);
  assert.equal(s.orbital(3).bound,false);
  assert.equal(s.orbital(3).period,Infinity);
  assert.deepEqual(s.orbit(3),[]);
});
test('circular two-body orbit closes after one year and obeys Kepler scaling',()=>{
  const s=new Simulation();s.bodies=[{mass:1,p:[0,0,0],v:[0,0,0]},{mass:1e-12,p:[1,0,0],v:[0,Math.sqrt(GM_SUN),0]}];
  const p=s.orbital(1).period,initial=[...s.bodies[1].p];
  for(let n=0;n<4000;n++)s.step(p/4000);
  assert.ok(norm(sub(s.bodies[1].p,initial))<1e-5);
  s.bodies[1].p=[4,0,0];s.bodies[1].v=[0,Math.sqrt(GM_SUN/4),0];
  assert.ok(Math.abs(s.orbital(1).period/p-8)<1e-8);
});
