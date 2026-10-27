const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('Minecraft development appears in both game menus without changing chess routes',()=>{
  const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
  assert.equal((html.match(/href="knowledge-base\/minecraft\/">Minecraft Development/g)||[]).length,2);
  assert.equal((html.match(/>Games &amp; Development <span/g)||[]).length,2);
  for(const route of ['international-chess','chinese-chess'])assert.ok(html.includes(`games/${route}/`));
});
test('guide includes the version baseline, recovery, JAR selection and troubleshooting',()=>{
  for(const locale of ['', 'zh-CN/']){
    const file=locale?'docs-site/i18n/zh-CN/docusaurus-plugin-content-docs/current/minecraft/index.md':'docs-site/docs/minecraft/index.md';
    const text=fs.readFileSync(`${__dirname}/${file}`,'utf8');
    for(const value of ['26.1.2','JDK 25','level.dat','run/saves','-sources.jar','chmod u+x gradlew','logs/latest.log']) assert.ok(text.includes(value),value);
    assert.doesNotMatch(text,/https:\/\/docs\.fabricmc\.net\/(?:develop|players)\//);
  }
});
test('macOS beginner guide has matching bilingual official links and build output',()=>{
  const en=fs.readFileSync(`${__dirname}/docs-site/docs/minecraft/index.md`,'utf8');
  const zh=fs.readFileSync(`${__dirname}/docs-site/i18n/zh-CN/docusaurus-plugin-content-docs/current/minecraft/index.md`,'utf8');
  const links=s=>[...s.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(m=>m[1]);
  assert.deepEqual(links(en),links(zh));
  for(const s of [en,zh])for(const v of ['macOS','JDK','IntelliJ','ARM64','/fill','training_sword','./gradlew build'])assert.ok(s.includes(v),v);
  for(const locale of ['', 'zh-CN/']){
    const html=fs.readFileSync(`${__dirname}/knowledge-base/${locale}minecraft/index.html`,'utf8');
    assert.match(html,/Docusaurus/);
    assert.equal((html.match(/<h1\b/g)||[]).length,1);
  }
});
