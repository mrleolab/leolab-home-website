const rgb = hex => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
export class Renderer {
  constructor(canvas) {
    this.canvas=canvas;this.yaw=-.25;this.pitch=.95;this.zoom=1;this.span=6.5;this.focus=[0,0,0];this.time=0;
    let seed=91;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    this.stars=Array.from({length:500},()=>[random()*2-1,random()*2-1,random(),.6+random()*1.6]);
    this.belt=Array.from({length:900},()=>{const angle=random()*Math.PI*2,r=2.2+random()*1.05;return [Math.cos(angle)*r,Math.sin(angle)*r,(random()-.5)*.13]});
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
    this.gl=gl;
    if(!gl){this.ctx=canvas.getContext('2d');return}
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec3 a_position; attribute vec4 a_color; attribute float a_size; attribute float a_kind;
      uniform vec3 u_focus; uniform vec4 u_view; uniform float u_ratio;
      varying vec4 v_color; varying float v_kind;
      void main(){
        vec3 d=a_position-u_focus;
        float x=d.x*cos(u_view.x)-d.y*sin(u_view.x);
        float y=d.x*sin(u_view.x)+d.y*cos(u_view.x);
        float sy=y*cos(u_view.y)-d.z*sin(u_view.y);
        float depth=y*sin(u_view.y)+d.z*cos(u_view.y);
        float perspective=1./max(.55,1.-depth*u_view.z*.12);
        gl_Position=vec4(x*u_view.z/u_view.w*perspective,sy*u_view.z*perspective,clamp(depth*u_view.z*.003,-.95,.95),1.);
        if(a_kind < -2.5)gl_Position=vec4(a_position.xy,.99,1.);
        gl_PointSize=a_size*u_ratio; v_color=a_color;v_kind=a_kind;
      }
    `));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
      precision mediump float; varying vec4 v_color; varying float v_kind; uniform bool u_points; uniform float u_time;
      void main(){
        float a=v_color.a;vec3 color=v_color.rgb;
        if(u_points){
          vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;
          if(v_kind < -1.5 && v_kind > -2.5){a*=smoothstep(.65,.8,r)*(1.-smoothstep(.87,1.,r));}
          else if(v_kind < -.5 && v_kind > -1.5){a*=pow(1.-sqrt(r),2.);}
          else if(v_kind >= 1.){
            vec3 n=vec3(p.x,-p.y,sqrt(max(0.,1.-r)));
            float lon=atan(n.z,n.x)+u_time*.08,lat=asin(n.y);
            float pattern=sin(lon*5.+sin(lat*9.))*sin(lat*12.+sin(lon*7.));
            if(v_kind>3.5 && v_kind<4.5){
              color=mix(vec3(.04,.24,.57),vec3(.18,.52,.32),smoothstep(.05,.22,pattern));
              color=mix(color,vec3(.85,.94,1.),smoothstep(.58,.79,sin(lon*13.+lat*17.)*.5+.5)*.65);
              color=mix(color,vec3(.86,.96,1.),smoothstep(1.12,1.5,abs(lat)));
            }
            if(v_kind>5.5 && v_kind<7.5)color*=.78+.22*sin(lat*34.+sin(lon*4.)*.4);
            if(v_kind<1.5){color=mix(vec3(1.,.24,.025),vec3(1.,.94,.49),.6+.25*pattern);}
            else {float light=max(.09,dot(n,normalize(vec3(-.6,.55,1.))));color*=.15+.85*light;color+=vec3(.13,.27,.4)*pow(1.-n.z,3.);}
            a*=1.-smoothstep(.94,1.,r);
          }else a*=smoothstep(1.,.15,r);
        }
        gl_FragColor=vec4(color,a);
      }
    `));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    this.program=program;this.buffer=gl.createBuffer();
    this.locations={};
    for(const n of ['a_position','a_color','a_size','a_kind'])this.locations[n]=gl.getAttribLocation(program,n);
    for(const n of ['u_focus','u_view','u_ratio','u_points','u_time'])this.locations[n]=gl.getUniformLocation(program,n);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  }
  resize(){
    const rect=this.canvas.getBoundingClientRect();
    this.width=rect.width;this.height=rect.height;this.ratio=Math.min(devicePixelRatio||1,1.75);
    this.canvas.width=Math.round(rect.width*this.ratio);this.canvas.height=Math.round(rect.height*this.ratio);
    if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
  }
  project(p){
    const d=p.map((x,k)=>x-this.focus[k]),c=Math.cos(this.yaw),s=Math.sin(this.yaw);
    const x=d[0]*c-d[1]*s,y=d[0]*s+d[1]*c;
    const scale=this.height*this.zoom/(this.span*2);
    const depth=y*Math.sin(this.pitch)+d[2]*Math.cos(this.pitch);
    const perspective=1/Math.max(.55,1-depth*this.zoom/this.span*.12);
    return [this.width/2+x*scale*perspective,this.height/2-(y*Math.cos(this.pitch)-d[2]*Math.sin(this.pitch))*scale*perspective];
  }
  batch(vertices,points=false){
    if(!vertices.length)return;
    const gl=this.gl;
    if(!gl){
      const ctx=this.ctx;if(!ctx)return;
      ctx.save();ctx.scale(this.ratio,this.ratio);
      for(let i=0;i<vertices.length;i+=9){
        if(vertices[i+8]<-2.5)continue;
        const p=this.project(vertices.slice(i,i+3)),color=vertices.slice(i+3,i+6).map(x=>Math.round(x*255));
        ctx.strokeStyle=ctx.fillStyle=`rgba(${color.join(',')},${vertices[i+6]})`;
        if(points){ctx.beginPath();ctx.arc(p[0],p[1],vertices[i+7]/2,0,Math.PI*2);ctx.fill()}
        else if(i+9<vertices.length){const q=this.project(vertices.slice(i+9,i+12));ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.stroke();i+=9}
      }
      ctx.restore();return;
    }
    gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
    for(const [name,size,offset] of [['a_position',3,0],['a_color',4,12],['a_size',1,28],['a_kind',1,32]]){
      gl.enableVertexAttribArray(this.locations[name]);gl.vertexAttribPointer(this.locations[name],size,gl.FLOAT,false,36,offset);
    }
    gl.uniform3fv(this.locations.u_focus,this.focus);
    gl.uniform4f(this.locations.u_view,this.yaw,this.pitch,this.zoom/this.span,this.width/this.height);
    gl.uniform1f(this.locations.u_ratio,this.ratio);gl.uniform1i(this.locations.u_points,points?1:0);
    gl.uniform1f(this.locations.u_time,this.time);
    gl.drawArrays(points?gl.POINTS:gl.LINES,0,vertices.length/9);
  }
  draw(sim,{trails,orbits,alpha,selected}){
    if(!this.width||!this.height)return;
    if(this.gl)this.gl.clear(this.gl.COLOR_BUFFER_BIT);else this.ctx?.clearRect(0,0,this.canvas.width,this.canvas.height);
    const lines=[],dots=[],sky=[];
    const vertex=(p,color,a=1,size=1,kind=0)=>[...p,...rgb(color),a,size,kind];
    for(const [x,y,z,size] of this.stars)sky.push(...vertex([x,y,z],'#b5d9ff',.35+z*.5,size,-3));
    this.batch(sky,true);
    for(const p of this.belt)dots.push(...vertex(p,'#a8b6d6',.3,1.15));
    sim.bodies.forEach((body,index)=>{
      if(index && orbits){
        const orbit=sim.orbit(index,128);
        for(let i=1;i<orbit.length;i++) lines.push(...vertex(orbit[i-1],body.color,alpha),...vertex(orbit[i],body.color,alpha));
      }
      if(trails && trails[index]){
        const trail=trails[index];
        for(let i=1;i<trail.length;i++)lines.push(...vertex(trail[i-1],body.color,.65*i/trail.length),...vertex(trail[i],body.color,.65*i/trail.length));
      }
      const size=(index?(index>=5?25:17):48)*Math.min(3,Math.sqrt(this.zoom));
      dots.push(...vertex(body.p,body.color,index?.32:.8,size*(index?2:3.8),-1),...vertex(body.p,body.color,1,size,index+1));
      if(index===6){
        for(let n=0;n<100;n++){const t=n/100*Math.PI*2;const radius=.13;
          const p=body.p.map((v,k)=>v+(k===0?Math.cos(t)*radius:k===1?Math.sin(t)*radius:0));dots.push(...vertex(p,'#c9b28e',.75,2));}
      }
      if(index===selected)dots.push(...vertex(body.p,'#a6f9dd',.85,size+15,-2));
    });
    this.batch(lines);this.batch(dots,true);
  }
}
