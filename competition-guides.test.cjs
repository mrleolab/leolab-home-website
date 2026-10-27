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
test('expanded robotics guide has bilingual primary sources and clear hardware boundaries',()=>{
  const read=p=>fs.readFileSync(`${__dirname}/${p}`,'utf8');
  const en=read('docs-site/docs/robotics/index.md');
  const zh=read('docs-site/i18n/zh-CN/docusaurus-plugin-content-docs/current/robotics/index.md');
  const links=s=>[...s.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(m=>m[1]);
  assert.deepEqual(links(en),links(zh));
  for(const s of [en,zh])for(const v of ['microduck-simulator','microduck_rl','CUDA','hardware_guide','envhub','cheatsheet.md','python3 --version'])assert.ok(s.includes(v),v);
});
