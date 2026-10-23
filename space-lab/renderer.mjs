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
        if(a_kind < -2.5 && a_kind > -3.5)gl_Position=vec4(a_position.xy,.99,1.);
        gl_PointSize=a_size*u_ratio; v_color=a_color;v_kind=a_kind;
      }
    `));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
      precision mediump float; varying vec4 v_color; varying float v_kind; uniform bool u_points; uniform float u_time;
      uniform sampler2D u_atlas; uniform sampler2D u_ring; uniform bool u_mapped; uniform vec2 u_rotation;
      void main(){
        float a=v_color.a;vec3 color=v_color.rgb;
        if(u_points){
          vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;
          if(v_kind < -3.5){
            float ringRadius=length(vec2(p.x,p.y/.38));
            if(ringRadius<.44 || ringRadius>1.)discard;
            if(v_kind > -4.5 && p.y>0.)discard;
            if(v_kind < -4.5 && p.y<0.)discard;
            if(u_mapped){vec4 ring=texture2D(u_ring,vec2((ringRadius-.44)/.56,.5));color=ring.rgb;a*=ring.a;}
            else {color=vec3(.72,.63,.46);a*=.55+.3*sin(ringRadius*170.);}
          }
          else if(v_kind < -1.5 && v_kind > -2.5){a*=smoothstep(.65,.8,r)*(1.-smoothstep(.87,1.,r));}
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
            if(u_mapped){
              float angle=u_rotation.x+u_time*.025;
              vec3 tilted=vec3(n.x,n.y*cos(u_rotation.y)-n.z*sin(u_rotation.y),n.y*sin(u_rotation.y)+n.z*cos(u_rotation.y));
              vec3 mapped=vec3(tilted.x*cos(angle)+tilted.z*sin(angle),tilted.y,-tilted.x*sin(angle)+tilted.z*cos(angle));
              vec2 uv=vec2(fract(atan(mapped.z,mapped.x)/6.2831853+.5),.5-asin(clamp(mapped.y,-1.,1.))/3.14159265);
              float tile=floor(v_kind-.5);
              vec2 cell=vec2(mod(tile,3.),floor(tile/3.));
              color=texture2D(u_atlas,(cell+clamp(uv,.001,.999))/3.).rgb;
            }
            if(v_kind<1.5){if(!u_mapped)color=mix(vec3(1.,.24,.025),vec3(1.,.94,.49),.6+.25*pattern);else color*=1.15;}
            else {float light=max(.09,dot(n,normalize(vec3(-.6,.55,1.))));color*=.25+.75*light;color+=vec3(.08,.18,.27)*pow(1.-n.z,3.);}
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
    for(const n of ['u_focus','u_view','u_ratio','u_points','u_time','u_atlas','u_ring','u_mapped','u_rotation'])this.locations[n]=gl.getUniformLocation(program,n);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    this.atlas=gl.createTexture();this.ring=gl.createTexture();this.mapped=false;
    for(const [unit,texture] of [[0,this.atlas],[1,this.ring]]){
      gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([220,198,149,255]));
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    }
    this.texturePromise=this.loadMaps().catch(()=>false);
  }
  async loadMaps(){
    const names=['sun','mercury','venus_atmosphere','earth_daymap','mars','jupiter','saturn','uranus','neptune'];
    const load=filename=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=new URL(`textures/2k_${filename}`,import.meta.url).href});
    const images=await Promise.all(names.map(name=>load(`${name}.jpg`)));
    const ring=await load('saturn_ring_alpha.png');
    const gl=this.gl,tile=gl.getParameter(gl.MAX_TEXTURE_SIZE)>=4096?1024:512;
    const atlas=document.createElement('canvas');atlas.width=tile*3;atlas.height=tile*1.5;
    const context=atlas.getContext('2d');
    images.forEach((image,i)=>context.drawImage(image,(i%3)*tile,Math.floor(i/3)*tile/2,tile,tile/2));
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.atlas);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.ring);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ring);
    this.mapped=true;return true;
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
  hitTest(x,y){
    return (this.pickTargets||[]).map(b=>({...b,distance:Math.hypot(x-b.x,y-b.y)}))
      .filter(b=>b.distance<=Math.max(18,b.radius+7))
      .sort((a,b)=>a.distance/Math.max(18,a.radius)-b.distance/Math.max(18,b.radius))[0]?.index??null;
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
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.atlas);gl.uniform1i(this.locations.u_atlas,0);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.ring);gl.uniform1i(this.locations.u_ring,1);
    gl.uniform1i(this.locations.u_mapped,this.mapped?1:0);gl.uniform2f(this.locations.u_rotation,this.yaw,this.pitch-.72);
    gl.drawArrays(points?gl.POINTS:gl.LINES,0,vertices.length/9);
  }
  draw(sim,{trails,orbits,alpha,selected}){
    if(!this.width||!this.height)return;
    if(this.gl)this.gl.clear(this.gl.COLOR_BUFFER_BIT);else this.ctx?.clearRect(0,0,this.canvas.width,this.canvas.height);
    const lines=[],dots=[],sky=[];
    this.pickTargets=[];
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
      const detail=index===selected;
      const rawSize=detail?Math.min(this.width*.37,180)*Math.min(1.8,Math.sqrt(this.zoom)):(index?(index>=5?25:17):48)*Math.min(3,Math.sqrt(this.zoom));
      const maxSprite=this.gl?this.gl.getParameter(this.gl.ALIASED_POINT_SIZE_RANGE)[1]/this.ratio:1000;
      const size=Math.min(rawSize,maxSprite/(index===6?2.45:index===0?3.8:2));
      const screen=this.project(body.p);this.pickTargets.push({index,x:screen[0],y:screen[1],radius:size/2});
      if(index===6)dots.push(...vertex(body.p,body.color,1,size*2.45,-4));
      dots.push(...vertex(body.p,body.color,index?.32:.8,size*(index?2:3.8),-1),...vertex(body.p,body.color,1,size,index+1));
      if(index===6)dots.push(...vertex(body.p,body.color,1,size*2.45,-5));
      if(index===selected)dots.push(...vertex(body.p,'#a6f9dd',.85,size+15,-2));
    });
    this.batch(lines);this.batch(dots,true);
  }
}
