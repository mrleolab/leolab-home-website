const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
const desktop=html.match(/<div class="k12-education-popover"[^>]*>(.*?)<\/div>/s)[1];
const mobile=html.match(/<details><summary>K–12 Education.*?<\/summary>(.*?)<\/details>/s)[1];
const links=markup=>Array.from(markup.matchAll(/<a\s+([^>]+)>(.*?)<\/a>/gs),match=>({attributes:match[1],label:match[2],href:match[1].match(/href="([^"]+)"/)[1]}));
test('K12 desktop and mobile menus contain identical resource destinations',()=>{
  const d=links(desktop),m=links(mobile);
  assert.deepEqual(d,m);assert.equal(d.length,6);
  for(const [label,href] of [
    ['语文 ↗','https://basic.smartedu.cn/syncClassroom'],
    ['人教版数学 ↗','https://www.pep.com.cn/'],
    ['IB Information ↗','https://www.ibo.org/programmes/'],
    ['BC Curriculum ↗','https://curriculum.gov.bc.ca/'],
  ]){
    const link=d.find(x=>x.label===label);assert(link,label);assert.equal(link.href,href);
    assert(link.attributes.includes('target="_blank"'));assert(link.attributes.includes('rel="noreferrer"'));
  }
});
test('existing K12 introduction and school information are preserved',()=>{
  for(const markup of [desktop,mobile]){
    const items=links(markup);assert.equal(items[0].href,'k12-education/');
    assert.equal(items[1].href,'https://ibo.org/programmes/primary-years-programme/');
  }
});
