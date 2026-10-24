const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
const groups=['AI &amp; Machine Learning','Cloud Computing','Networking','Cybersecurity','Servers &amp; Linux','Databases &amp; Data','DevOps &amp; Kubernetes','Project Management'];
test('Resources opens a certification directory on desktop and mobile, retaining the old anchor',()=>{
  assert.match(html,/aria-controls="resources-popover" data-menu="resources-popover">Resources/);
  const desktop=html.match(/id="resources-popover" hidden>(.*?)<\/div>/)[1];
  const mobile=html.split('\n').find(l=>l.includes('data-resources-menu')).split('<details data-resources-menu>')[1];
  const links=s=>[...s.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(links(desktop),links(mobile));
  assert.ok(links(desktop).includes('knowledge-base/certifications/'));
  for(const menu of [desktop,mobile]){
    assert.match(menu,/href="#work">Projects &amp; Resources/);
    assert.match(menu,/href="knowledge-base\/certifications\/">Certifications/);
  }
});
test('Docusaurus certification guide has eight bilingual categories and all official links',()=>{
  const slugs=['ai','cloud','networking','cybersecurity','servers','databases','devops','project-management'];
  let count=0;
  for(const slug of slugs){
    const en=fs.readFileSync(`${__dirname}/docs-site/docs/certifications/${slug}.md`,'utf8');
    const zh=fs.readFileSync(`${__dirname}/docs-site/i18n/zh-CN/docusaurus-plugin-content-docs/current/certifications/${slug}.md`,'utf8');
    const links=s=>[...s.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(m=>m[1]);
    assert.deepEqual(links(en),links(zh));count+=links(en).length;
    for(const locale of ['', 'zh-CN/']){
      const html=fs.readFileSync(`${__dirname}/knowledge-base/${locale}certifications/${slug}/index.html`,'utf8');
      assert.match(html,/Docusaurus/);assert.equal((html.match(/<h1\b/g)||[]).length,1);
    }
  }
  assert.equal(count,21);
});
