// Units: astronomical units, Julian years, and nominal solar masses.
// J2000 orbital elements: https://ssd.jpl.nasa.gov/planets/approx_pos.html
// GM ratios and unit conversions: https://ssd.jpl.nasa.gov/astro_par.html
export const AU_KM = 149597870.7;
export const YEAR_SECONDS = 365.25 * 86400;
export const GM_SUN = 1.32712440041279419e20 * YEAR_SECONDS ** 2 / (AU_KM * 1000) ** 3;
const TAU = 2 * Math.PI;
const rad = Math.PI / 180;
export const dot = (a,b) => a.reduce((s,v,i) => s + v*b[i],0);
export const norm = a => Math.hypot(...a);
export const sub = (a,b) => a.map((v,i) => v-b[i]);
export const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const CATALOG = [
  // name, a, e, inclination, mean longitude, perihelion longitude, node, GM (km³/s²), color
  ['Mercury',.38709927,.20563593,7.00497902,252.2503235,77.45779628,48.33076593,22031.868551,'#b6bcc7'],
  ['Venus',.72333566,.00677672,3.39467605,181.9790995,131.60246718,76.67984255,324858.592,'#f5cc8b'],
  ['Earth',1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0,403503.235625,'#65cfff'],
  ['Mars',1.52371034,.0933941,1.84969142,-4.55343205,-23.94362959,49.55953891,42828.375816,'#fa896e'],
  ['Jupiter',5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909,126712764.1,'#e3b990'],
  ['Saturn',9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448,37940584.8418,'#e9d4a4'],
  ['Uranus',19.18916464,.04725744,.77263783,313.23810451,170.9542763,74.01692503,5794556.4,'#8ee3dd'],
  ['Neptune',30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,6836527.10058,'#739bff'],
];
export function initialSystem() {
  const bodies = [{name:'Sun',mass:1,p:[0,0,0],v:[0,0,0],color:'#ffd68a'}];
  for (const [name,a,e,inc,L,peri,node,gm,color] of CATALOG) {
    const mass=gm/1.32712440041279419e11;
    const M=(L-peri)*rad;
    let E=M;
    for(let k=0;k<15;k++) E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
    const w=(peri-node)*rad, o=node*rad, i=inc*rad;
    const P=[Math.cos(w)*Math.cos(o)-Math.sin(w)*Math.sin(o)*Math.cos(i),Math.cos(w)*Math.sin(o)+Math.sin(w)*Math.cos(o)*Math.cos(i),Math.sin(w)*Math.sin(i)];
    const Q=[-Math.sin(w)*Math.cos(o)-Math.cos(w)*Math.sin(o)*Math.cos(i),-Math.sin(w)*Math.sin(o)+Math.cos(w)*Math.cos(o)*Math.cos(i),Math.cos(w)*Math.sin(i)];
    const n=Math.sqrt(GM_SUN*(1+mass)/a**3), den=1-e*Math.cos(E);
    const x=a*(Math.cos(E)-e), y=a*Math.sqrt(1-e*e)*Math.sin(E);
    const vx=-a*n*Math.sin(E)/den, vy=a*n*Math.sqrt(1-e*e)*Math.cos(E)/den;
    bodies.push({name,mass,color,p:P.map((p,j)=>p*x+Q[j]*y),v:P.map((p,j)=>p*vx+Q[j]*vy)});
  }
  // Start at the barycenter with zero total linear momentum.
  const total=bodies.reduce((s,b)=>s+b.mass,0);
  const center=[0,1,2].map(k=>bodies.reduce((s,b)=>s+b.mass*b.p[k],0)/total);
  const drift=[0,1,2].map(k=>bodies.reduce((s,b)=>s+b.mass*b.v[k],0)/total);
  bodies.forEach(b=>{b.p=sub(b.p,center);b.v=sub(b.v,drift)});
  return bodies;
}

export class Simulation {
  constructor() { this.g=1;this.starMass=1;this.reset(); }
  reset() {
    this.bodies=initialSystem(); this.bodies[0].mass=this.starMass;
    this.time=0; this.referenceEnergy=this.energy();
  }
  setParameters(g,starMass) {
    this.g=g;this.starMass=starMass;this.bodies[0].mass=starMass;
    // Parameter changes are an external intervention: rebase the drift monitor.
    this.referenceEnergy=this.energy();
  }
  accelerations() {
    const a=this.bodies.map(()=>[0,0,0]);
    for(let i=0;i<this.bodies.length;i++) for(let j=i+1;j<this.bodies.length;j++) {
      const d=sub(this.bodies[j].p,this.bodies[i].p), r=norm(d);
      if(r < 1e-7) throw new Error('Close encounter: reset or use a smaller integration step.');
      const f=GM_SUN*this.g/(r*r*r);
      for(let k=0;k<3;k++){ a[i][k]+=f*this.bodies[j].mass*d[k];a[j][k]-=f*this.bodies[i].mass*d[k]; }
    }
    return a;
  }
  step(dt) {
    const a=this.accelerations();
    this.bodies.forEach((b,i)=>{for(let k=0;k<3;k++){b.v[k]+=.5*dt*a[i][k];b.p[k]+=dt*b.v[k]}});
    const next=this.accelerations();
    this.bodies.forEach((b,i)=>{for(let k=0;k<3;k++) b.v[k]+=.5*dt*next[i][k]});
    this.time+=dt;
  }
  energy() {
    let energy=this.bodies.reduce((s,b)=>s+.5*b.mass*dot(b.v,b.v),0);
    for(let i=0;i<this.bodies.length;i++) for(let j=i+1;j<this.bodies.length;j++) energy-=GM_SUN*this.g*this.bodies[i].mass*this.bodies[j].mass/norm(sub(this.bodies[i].p,this.bodies[j].p));
    return energy;
  }
  orbital(index) {
    const b=this.bodies[index],sun=this.bodies[0];
    if(!index) return null;
    const r=sub(b.p,sun.p),v=sub(b.v,sun.v),distance=norm(r),mu=GM_SUN*this.g*(sun.mass+b.mass);
    const h=cross(r,v),specific=.5*dot(v,v)-mu/distance;
    const evec=cross(v,h).map((x,k)=>x/mu-r[k]/distance),e=norm(evec);
    const a=-mu/(2*specific), bound=specific<0 && e<1;
    const P=e>1e-8?evec.map(x=>x/e):r.map(x=>x/distance);
    const hn=norm(h),N=hn>1e-12?h.map(x=>x/hn):[0,0,1],Q=cross(N,P);
    return {distance,speed:norm(v)*AU_KM/YEAR_SECONDS,a,e,bound,P,Q,period:bound?TAU*Math.sqrt(a**3/mu):Infinity};
  }
  orbit(index,samples=160) {
    const o=this.orbital(index);
    if(!o?.bound) return [];
    return Array.from({length:samples+1},(_,i)=>{
      const t=i/samples*TAU,r=o.a*(1-o.e**2)/(1+o.e*Math.cos(t));
      return o.P.map((p,k)=>this.bodies[0].p[k]+r*(Math.cos(t)*p+Math.sin(t)*o.Q[k]));
    });
  }
}
