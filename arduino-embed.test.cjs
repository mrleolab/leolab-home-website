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
  for(const part of ['https://learn-arduino-red.vercel.app/zh/#motor','loading="lazy"','referrerpolicy="no-referrer"','sandbox=','tabindex="0"'])assert.ok(frame.includes(part));
  assert.match(html,/class="arduino-preview is-interactive"/);
  assert.doesNotMatch(html,/data-arduino-start|class="arduino-cover"/);
  assert.match(html,/Local illustration only/);
  assert.doesNotMatch(frame,/allow-top-navigation|usb|serial|autoplay/);
  assert.match(html,/03 \/ LEARNING NOTES/);assert.match(html,/04 \/ games/);assert.match(html,/05 \/ things in progress/);
});
function runtime(){
  const handlers={},listeners={},classes=new Set(['is-interactive']),demoClasses=new Set();let focused=false;
  const frame={src:'https://learn-arduino-red.vercel.app/zh/#motor',tabIndex:0,getAttribute(){return this.src;}};
  const toggle={textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){handlers.toggle=fn;},focus(){focused=true;}};
  const demoToggle={textContent:'',attrs:{},addEventListener(k,fn){handlers.demo=fn;},setAttribute(k,v){this.attrs[k]=v;}};
  const demo={classList:{toggle(k,on){on?demoClasses.add(k):demoClasses.delete(k);}}};
  const external={href:''};const preview={classList:{toggle(k,on){on?classes.add(k):classes.delete(k);}}};
  const nodes={'[data-arduino-preview]':preview,'[data-arduino-toggle]':toggle,'[data-arduino-external]':external,'[data-motor-demo]':demo,'[data-motor-toggle]':demoToggle};
  const window={LeoI18n:{locale:'zh-CN',t:s=>s},addEventListener(k,fn){listeners[k]=fn;}};
  vm.runInNewContext(fs.readFileSync(`${__dirname}/arduino-embed.js`,'utf8'),{window,document:{readyState:'complete',documentElement:{lang:'zh-CN'},getElementById:()=>frame,querySelector:s=>nodes[s]}});
  return{frame,toggle,external,handlers,listeners,classes,demoClasses,demoToggle,window,focused:()=>focused};
}
test('interaction is on by default and can restore normal scrolling without losing the frame',()=>{
  const r=runtime();assert.equal(r.frame.tabIndex,0);assert.ok(r.classes.has('is-interactive'));
  r.handlers.toggle();assert.equal(r.frame.tabIndex,-1);assert.equal(r.classes.size,0);assert.ok(r.focused());
  r.handlers.toggle();assert.equal(r.frame.tabIndex,0);assert.equal(r.toggle.attrs['aria-pressed'],'true');
});
test('language keeps the motor lesson and current interaction preference',()=>{
  const r=runtime();r.window.LeoI18n.locale='en';r.listeners['leo-language-change']();
  assert.equal(r.frame.src,'https://learn-arduino-red.vercel.app/#motor');assert.equal(r.external.href,r.frame.src);assert.equal(r.frame.tabIndex,0);
  r.handlers.toggle();r.window.LeoI18n.locale='zh-CN';r.listeners['leo-language-change']();assert.equal(r.frame.tabIndex,-1);
});
test('the explicitly labeled local motor illustration can pause and resume',()=>{
  const r=runtime();assert.equal(r.demoClasses.size,0);r.handlers.demo();assert.ok(r.demoClasses.has('is-paused'));assert.equal(r.demoToggle.textContent,'Resume preview');
  r.handlers.demo();assert.equal(r.demoClasses.size,0);assert.equal(r.demoToggle.textContent,'Pause preview');
});
