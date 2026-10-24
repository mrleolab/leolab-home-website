const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
test('daily Tools has a working desktop trigger and matching mobile links',()=>{
  assert.match(html,/aria-controls="tools-popover" data-menu="tools-popover">Tools/);
  const desktop=html.match(/<div class="resource-popover" id="tools-popover" hidden>(.*?)<\/div>/)[1];
  const mobile=html.match(/<details data-daily-tools>(.*?)<\/details>/)[1];
  const links=s=>[...s.matchAll(/href="([^"]+)" target="_blank" rel="noreferrer"/g)].map(m=>m[1]);
  assert.deepEqual(links(desktop),links(mobile));
  assert.equal(links(desktop).length,8);
  for(const name of ['Notion','Obsidian','Google Keep','Todoist','Excalidraw','DeepL Translator','Bitwarden','PDF24 Tools'])assert.ok(desktop.includes(`${name} ↗`));
  assert.equal((desktop.match(/class="menu-label /g)||[]).length,4);
});
