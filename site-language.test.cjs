const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = __dirname;
const data = fs.readFileSync(path.join(root,'site-language-strings.js'),'utf8');
const code = fs.readFileSync(path.join(root,'site-language.js'),'utf8');
function runtime(search='',saved=null,blocked=false) {
  const context = {window:{}, document:{readyState:'loading',addEventListener(){}}, location:{search}, URLSearchParams, Map, WeakMap,
    localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;}}};
  vm.createContext(context); vm.runInContext(data,context); vm.runInContext(code,context);
  return context.window.LeoI18n;
}
test('English defaults safely, explicit language overrides memory, blocked storage is safe',()=>{
  assert.equal(runtime().locale,'en');
  assert.equal(runtime('', 'zh-CN').locale,'zh-CN');
  assert.equal(runtime('?lang=en','zh-CN').locale,'en');
  assert.equal(runtime('?lang=zh-CN',null,true).locale,'zh-CN');
  assert.equal(runtime('',null,true).locale,'en');
});
test('translations cover pages, navigation, experiment and both game interfaces',()=>{
  const zh=runtime('?lang=zh-CN'),en=runtime();
  for(const text of ['About Me','Learning','Resources','Building a Website','Track a body','Play vs. computer','Settings','View controls']) assert.notEqual(zh.t(text),text);
  assert.equal(zh.t('Day 12.5'),'第 12.5 天');
  assert.equal(zh.t('1.000 years'),'1.000 年');
  assert.equal(en.t('设置'),'Settings');
  assert.equal(en.t('AI · 业余'),'AI · Amateur');
  assert.equal(en.t('0 步'),'0 moves');
  assert.equal(zh.t('PostgreSQL'),'PostgreSQL');
});
test('all owned pages load shared switching without duplicating large assets',()=>{
  for(const file of ['index.html','about-me/index.html','k12-education/index.html','games/international-chess/index.html','games/chinese-chess/index.html']){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(html,/site-language-strings.js/);assert.match(html,/site-language.js/);assert.match(html,/site-language.css/);
  }
  assert.match(code,/Only game UIs need dynamic DOM localization/);
  assert.match(code,/\[data-boardid\]/);
  assert.match(code,/location.pathname.startsWith\('\/games\/'\)/);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html, /Resources<\/a>\s*<details data-language-picker>/);
});
test('all translated documentation routes and assets exist',()=>{
  const config=require('./docs-site/docusaurus.config.js');
  assert.deepEqual(config.i18n.locales,['en','zh-CN']);
  assert.equal(config.themeConfig.navbar.items.at(-1).type,'localeDropdown');
  for(const chapter of ['','accounts','build','deploy','domain','next-steps']){
    const file=path.join(root,'knowledge-base/zh-CN',chapter,'index.html');
    const html=fs.readFileSync(file,'utf8');
    assert.match(html,/<html[^>]*lang="zh-CN"/);
    assert.match(html,/[\u4e00-\u9fff]/);
    for(const match of html.matchAll(/(?:href|src)="(\/knowledge-base\/[^"#?]*)(?:[?#][^"]*)?"/g)){
      let target=path.join(root,decodeURI(match[1])); if(match[1].endsWith('/'))target=path.join(target,'index.html');
      assert.ok(fs.existsSync(target),target);
    }
  }
});
