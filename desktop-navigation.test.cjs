const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync(`${__dirname}/nav.css`,'utf8');
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
test('desktop navigation wraps compact labels rather than hiding them in a scroller',()=>{
  const nav=css.match(/\.nav nav\s*\{([^}]+)\}/)[1];
  assert.match(nav,/font-size:\s*14px/);assert.match(nav,/flex-wrap:\s*wrap/);assert.match(nav,/overflow:\s*visible/);
  assert.doesNotMatch(css,/overflow-x:\s*auto/);
  assert.match(css,/@media \(min-width: 721px\) and \(max-width: 1280px\)/);
  assert.match(css,/flex-basis:100%/);
});
test('all twelve desktop categories remain, Blog is last, and mobile toggle is preserved',()=>{
  const nav=html.match(/<nav aria-label="Primary">(.*?)<\/nav>/s)[1];
  assert.equal((nav.match(/<(?:a|button)\b/g)||[]).length,12);
  assert.match(nav,/<a href="#notes">Blog<\/a>$/);
  assert.match(css,/@media \(max-width: 720px\)/);
  assert.match(html,/class="mobile-menu-toggle"/);
});
