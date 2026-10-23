const rgb = hex => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
export class Renderer {
  constructor(canvas) {
    this.canvas=canvas;this.yaw=-.25;this.pitch=.72;this.zoom=1;this.span=6.5;this.focus=[0,0,0];
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
    this.gl=gl;
    if(!gl){this.ctx=canvas.getContext('2d');return}
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec3 a_position; attribute vec4 a_color; attribute float a_size;
      uniform vec3 u_focus; uniform vec4 u_view; uniform float u_ratio;
      varying vec4 v_color;
      void main(){
        vec3 d=a_position-u_focus;
        float x=d.x*cos(u_view.x)-d.y*sin(u_view.x);
        float y=d.x*sin(u_view.x)+d.y*cos(u_view.x);
        float sy=y*cos(u_view.y)-d.z*sin(u_view.y);
        float depth=y*sin(u_view.y)+d.z*cos(u_view.y);
        gl_Position=vec4(x*u_view.z/u_view.w,sy*u_view.z,clamp(depth*u_view.z*.003,-.95,.95),1.);
        gl_PointSize=a_size*u_ratio; v_color=a_color;
      }
    `));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
      precision mediump float; varying vec4 v_color; uniform bool u_points;
      void main(){
        float a=v_color.a;
        if(u_points){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;a*=smoothstep(1.,.45,r);}
        gl_FragColor=vec4(v_color.rgb,a);
      }
    `));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    this.program=program;this.buffer=gl.createBuffer();
    this.locations={};
    for(const n of ['a_position','a_color','a_size'])this.locations[n]=gl.getAttribLocation(program,n);
    for(const n of ['u_focus','u_view','u_ratio','u_points'])this.locations[n]=gl.getUniformLocation(program,n);
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
    return [this.width/2+x*scale,this.height/2-(y*Math.cos(this.pitch)-d[2]*Math.sin(this.pitch))*scale];
  }
  batch(vertices,points=false){
    if(!vertices.length)return;
    const gl=this.gl;
    if(!gl){
      const ctx=this.ctx;if(!ctx)return;
      ctx.save();ctx.scale(this.ratio,this.ratio);
      for(let i=0;i<vertices.length;i+=8){
        const p=this.project(vertices.slice(i,i+3)),color=vertices.slice(i+3,i+6).map(x=>Math.round(x*255));
        ctx.strokeStyle=ctx.fillStyle=`rgba(${color.join(',')},${vertices[i+6]})`;
        if(points){ctx.beginPath();ctx.arc(p[0],p[1],vertices[i+7]/2,0,Math.PI*2);ctx.fill()}
        else if(i+8<vertices.length){const q=this.project(vertices.slice(i+8,i+11));ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.stroke();i+=8}
      }
      ctx.restore();return;
    }
    gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
    for(const [name,size,offset] of [['a_position',3,0],['a_color',4,12],['a_size',1,28]]){
      gl.enableVertexAttribArray(this.locations[name]);gl.vertexAttribPointer(this.locations[name],size,gl.FLOAT,false,32,offset);
    }
    gl.uniform3fv(this.locations.u_focus,this.focus);
    gl.uniform4f(this.locations.u_view,this.yaw,this.pitch,this.zoom/this.span,this.width/this.height);
    gl.uniform1f(this.locations.u_ratio,this.ratio);gl.uniform1i(this.locations.u_points,points?1:0);
    gl.drawArrays(points?gl.POINTS:gl.LINES,0,vertices.length/8);
  }
  draw(sim,{trails,orbits,alpha,selected}){
    if(!this.width||!this.height)return;
    if(this.gl)this.gl.clear(this.gl.COLOR_BUFFER_BIT);else this.ctx?.clearRect(0,0,this.canvas.width,this.canvas.height);
    const lines=[],dots=[];
    const vertex=(p,color,a=1,size=1)=>[...p,...rgb(color),a,size];
    sim.bodies.forEach((body,index)=>{
      if(index && orbits){
        const orbit=sim.orbit(index,128);
        for(let i=1;i<orbit.length;i++) lines.push(...vertex(orbit[i-1],body.color,alpha),...vertex(orbit[i],body.color,alpha));
      }
      if(trails && trails[index]){
        const trail=trails[index];
        for(let i=1;i<trail.length;i++)lines.push(...vertex(trail[i-1],body.color,.65*i/trail.length),...vertex(trail[i],body.color,.65*i/trail.length));
      }
      const size=index? (index>=5?13:9):36;
      dots.push(...vertex(body.p,body.color,.13,size*2.4),...vertex(body.p,body.color,1,size));
      if(index===selected)dots.push(...vertex(body.p,'#ffffff',.5,size+5));
    });
    this.batch(lines);this.batch(dots,true);
  }
}
