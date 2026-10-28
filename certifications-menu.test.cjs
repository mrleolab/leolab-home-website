const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
const groups=['AI &amp; Machine Learning','Cloud Computing','Networking','Cybersecurity','Servers &amp; Linux','Databases &amp; Data','DevOps &amp; Kubernetes','Project Management'];
test('Resources has matching certification and learning material links on desktop and mobile',()=>{
  assert.match(html,/aria-controls="resources-popover" data-menu="resources-popover">Resources/);
  const desktop=html.match(/id="resources-popover" hidden>(.*?)<\/div>/)[1];
  const mobile=html.split('\n').find(l=>l.includes('data-resources-menu')).split('<details data-resources-menu>')[1].split('</details>')[0];
  const links=s=>[...s.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(links(desktop),links(mobile));
  assert.ok(links(desktop).includes('knowledge-base/certifications/'));
  for(const menu of [desktop,mobile]){
    assert.doesNotMatch(menu,/Projects &amp; Resources|href="#work"/);
    assert.match(menu,/href="knowledge-base\/certifications\/">Certifications/);
    assert.match(menu,/href="https:\/\/velxio\.dev\/" target="_blank" rel="noopener noreferrer">Hardware &amp; Electronics Engineering ↗/);
    assert.match(menu,/href="https:\/\/drive.google.com\/drive\/folders\/12iHPPOLp1CZ3WUG6SZLDwFpVRFlTtwWx\?usp=sharing" target="_blank" rel="noreferrer">Chinese Learning Materials ↗/);
  }
});
test('hardware electronics resource has a Chinese menu label',()=>{
  const strings=fs.readFileSync(`${__dirname}/site-language-strings.js`,'utf8');
  assert.ok(strings.includes("['Hardware & Electronics Engineering ↗','硬件电子工程 ↗']"));
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
  assert.ok(count>21);
});
test('AI guide separates credentials from technical learning in both locales',()=>{
  for(const locale of ['', 'zh-CN/']){
    const page=fs.readFileSync(`${__dirname}/knowledge-base/${locale}certifications/ai/index.html`,'utf8');
    for(const name of ['Anthropic','OpenAI','Hugging Face','PyTorch','vLLM','SGLang']) assert.ok(page.includes(name));
    for(const host of ['academy.claude.com','learn.chatgpt.com','pytorch.org/pytorch-certification/','docs.vllm.ai','docs.sglang.io']) assert.ok(page.includes(host));
    assert.ok(page.includes(locale?'不是已核实的认证项目':'not verified certification programs'));
  }
});
