const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('Building a Website is first inside Learning on desktop and mobile', () => {
  assert.match(home, /id="coding-popover" hidden><p class="menu-label label-learning">Learning<\/p><a href="knowledge-base\/">Building a Website<\/a><a href="https:\/\/code.org\//);
  assert.match(home, /<summary>Coding <span>⌄<\/span><\/summary><p class="mobile-menu-label label-learning">Learning<\/p><a href="knowledge-base\/">Building a Website<\/a><a href="https:\/\/code.org\//);
});

test('Science and Competitions precede Blog and have matched desktop/mobile destinations', () => {
  const desktop = home.match(/<nav aria-label="Primary">(.*?)<\/nav>/s)[1];
  assert.match(desktop, /Science.*Competitions.*Blog/s);
  assert.equal((home.match(/NASA Eyes — Space Simulations/g) || []).length, 2);
  assert.equal((home.match(/CAP High School Prize Exam/g) || []).length, 2);
  for (const id of ['science', 'competitions']) {
    const menu = home.match(new RegExp('id="' + id + '-popover" hidden>(.*?)</div>', 's'))[1];
    const label = id === 'science' ? 'Science' : 'Competitions';
    const mobile = home.match(new RegExp('<summary>' + label + ' <span>⌄</span></summary>(.*?)</details>', 's'))[1];
    const urls = html => [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(urls(menu), urls(mobile));
    assert.ok(urls(menu).every(url => url.startsWith('https://')));
  }
});

test('Docusaurus chapters are rendered with valid local links and assets', () => {
  const files = fs.readdirSync(path.join(root, 'docs-site/docs')).filter(name => name.endsWith('.md'));
  assert.equal(files.length, 6);
  for (const name of ['index', 'accounts', 'build', 'deploy', 'domain', 'next-steps']) {
    const file = path.join(root, 'knowledge-base', name === 'index' ? '' : name, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /Docusaurus/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const match of html.matchAll(/(?:href|src)="(\/knowledge-base\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      let target = path.join(root, decodeURI(match[1]));
      if (match[1].endsWith('/')) target = path.join(target, 'index.html');
      assert.ok(fs.existsSync(target), `Missing ${target}`);
    }
  }
});

test('guide keeps accounts, production verification, and purchase boundaries explicit', () => {
  const read = name => fs.readFileSync(path.join(root, 'docs-site/docs', name + '.md'), 'utf8');
  assert.match(read('accounts'), /not creating a separate/);
  assert.match(read('deploy'), /Merge is not deployment/);
  assert.match(read('domain'), /Complete the purchase yourself/);
  assert.match(read('build'), /"directory": "\.\/public"/);
  const ignore = fs.readFileSync(path.join(root, '.assetsignore'), 'utf8');
  assert.match(ignore, /docs-site\//);
  const config = require('./docs-site/docusaurus.config.js');
  assert.equal(config.themeConfig.navbar.items.find(item => item.label === 'Home').href, 'https://leo.leolan.workers.dev/');
});
