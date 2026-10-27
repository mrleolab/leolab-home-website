const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('all nine competition entries point to bilingual guides with valid anchors',()=>{
  const home=fs.readFileSync(`${__dirname}/index.html`,'utf8');
  const desktop=home.match(/id="competitions-popover" hidden>(.*?)<\/div>/s)[1];
  const links=[...desktop.matchAll(/href="(knowledge-base\/competitions\/([^#]+)#([^"]+))"/g)];
  assert.equal(links.length,9);
  for(const [,url,route,anchor] of links)for(const locale of ['', 'zh-CN/']){
    const page=fs.readFileSync(`${__dirname}/knowledge-base/${locale}competitions/${route}index.html`,'utf8');
    assert.ok(page.includes(`id="${anchor}"`),url);
    assert.ok(page.includes('2026'));
    assert.match(page,/https:\/\//);
  }
});
test('robotics guide and homepage entry exist in both languages',()=>{
  const home=fs.readFileSync(`${__dirname}/index.html`,'utf8');
  assert.equal((home.match(/href="knowledge-base\/robotics\/">Robotics Programming/g)||[]).length,2);
  for(const locale of ['', 'zh-CN/']){
    const page=fs.readFileSync(`${__dirname}/knowledge-base/${locale}robotics/index.html`,'utf8');
    assert.ok(page.includes('github.com/pollen-robotics/microduck'));
    assert.ok(page.includes('huggingface.co/docs/lerobot/'));
  }
});
