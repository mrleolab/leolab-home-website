const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');

test('homepage learning sections replace unrelated template copy',()=>{
  for(const old of ['Part studio.','big curiosities.','Why friendly software feels more useful','Make room for an unfinished thought','A tiny manifesto for better tools'])assert(!html.includes(old),old);
  assert(html.includes('id="learning-title"'));assert(html.includes('id="notes-title"'));
  assert.equal((html.match(/class="learning-note"/g)||[]).length,3);
  assert.equal((html.match(/class="cycle-number"/g)||[]).length,3);
  assert(fs.existsSync(`${__dirname}/learning-sections.css`));
});

test('learning section links have real local destinations, not contact placeholders',()=>{
  const content=html.split('<div class="learning-intro"')[1].split('<section class="games section"')[0];
  for(const [,href] of content.matchAll(/href="([^"]+)"/g)){
    assert.notEqual(href,'#contact');
    if(href.startsWith('https:'))continue;
    const [route,anchor]=href.split('#');let target=path.resolve(__dirname,route||'index.html');
    if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');
    assert(fs.existsSync(target),href);
    if(anchor)assert(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`),href);
  }
});
