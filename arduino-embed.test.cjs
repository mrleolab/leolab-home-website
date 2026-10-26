const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
test('Arduino is section 02 after Starfield, with a lazy isolated external iframe',()=>{
  assert.ok(html.indexOf('id="arduino-lab"')>html.indexOf('id="space-lab"'));
  assert.ok(html.indexOf('id="arduino-lab"')<html.indexOf('class="learning-intro"'));
  assert.match(html,/02 \/ ARDUINO LABORATORY/);
  const frame=html.match(/<iframe id="arduino-frame"[^>]+>/)[0];
  for(const part of ['https://learn-arduino-red.vercel.app/zh/#board','loading="lazy"','referrerpolicy="no-referrer"','sandbox=','tabindex="-1"'])assert.ok(frame.includes(part));
  assert.doesNotMatch(frame,/allow-top-navigation|usb|serial|autoplay/);
  assert.match(html,/03 \/ LEARNING NOTES/);assert.match(html,/04 \/ games/);assert.match(html,/05 \/ things in progress/);
});
function runtime(){
  const handlers={},listeners={},classes=new Set();let focused=false;
  const frame={src:'https://learn-arduino-red.vercel.app/zh/#board',tabIndex:-1,getAttribute(){return this.src;}};
  const toggle={textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){handlers.toggle=fn;},focus(){focused=true;}};
  const start={addEventListener(k,fn){handlers.start=fn;}};
  const external={href:''};const preview={classList:{toggle(k,on){on?classes.add(k):classes.delete(k);}}};
  const nodes={'[data-arduino-preview]':preview,'[data-arduino-toggle]':toggle,'[data-arduino-start]':start,'[data-arduino-external]':external};
  const window={LeoI18n:{locale:'zh-CN',t:s=>s},addEventListener(k,fn){listeners[k]=fn;}};
  vm.runInNewContext(fs.readFileSync(`${__dirname}/arduino-embed.js`,'utf8'),{window,document:{readyState:'complete',documentElement:{lang:'zh-CN'},getElementById:()=>frame,querySelector:s=>nodes[s]}});
  return{frame,toggle,external,handlers,listeners,classes,window,focused:()=>focused};
}
test('interaction is opt-in and can restore normal scrolling without losing the frame',()=>{
  const r=runtime();assert.equal(r.frame.tabIndex,-1);assert.equal(r.classes.size,0);
  r.handlers.start();assert.equal(r.frame.tabIndex,0);assert.equal(r.toggle.attrs['aria-pressed'],'true');
  r.handlers.toggle();assert.equal(r.frame.tabIndex,-1);assert.equal(r.classes.size,0);assert.ok(r.focused());
});
test('language updates course and fallback together, resetting interaction safely',()=>{
  const r=runtime();r.handlers.start();r.window.LeoI18n.locale='en';r.listeners['leo-language-change']();
  assert.equal(r.frame.src,'https://learn-arduino-red.vercel.app/#board');assert.equal(r.external.href,r.frame.src);assert.equal(r.frame.tabIndex,-1);
});
