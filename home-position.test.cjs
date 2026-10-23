const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(`${__dirname}/home-position.js`,'utf8');
function run(type,hash=''){
  const events={},scrolls=[],replaced=[];
  const history={scrollRestoration:'auto',state:{kept:true},replaceState(...args){replaced.push(args)}};
  vm.runInNewContext(source,{
    performance:{getEntriesByType:()=>[{type}]},history,
    location:{hash,pathname:'/',search:'?test=1'},
    window:{addEventListener:(name,fn)=>{events[name]=fn},scrollTo:position=>scrolls.push(position)},
  });
  return {events,scrolls,replaced,history};
}
test('reload starts at top without restoring a laboratory fragment',()=>{
  const page=run('reload','#space-lab');
  assert.equal(page.history.scrollRestoration,'manual');
  assert.equal(page.replaced[0][2],'/?test=1');
  page.events.pageshow();assert.equal(page.scrolls[0].top,0);
  assert.equal(page.scrolls[0].behavior,'instant');
  page.events.pagehide();assert.equal(page.history.scrollRestoration,'auto');
});
test('reload without a fragment also resets scroll position',()=>{
  const page=run('reload');page.events.pageshow();
  assert.equal(page.scrolls[0].top,0);assert.equal(page.replaced.length,0);
});
test('normal deep links and back/forward navigation are untouched',()=>{
  for(const type of ['navigate','back_forward']){
    const page=run(type,'#space-lab');
    assert.equal(page.history.scrollRestoration,'auto');
    assert.equal(page.replaced.length,0);assert.equal(page.scrolls.length,0);
    assert.equal(Object.keys(page.events).length,0);
  }
});
