const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');

test('desktop and mobile combine Security into Cybersecurity without changing Networking', () => {
  const menus = html.split('\n').filter(line => line.includes('label-networking'));
  assert.equal(menus.length, 2);
  for (const menu of menus) {
    assert.doesNotMatch(menu, /label-security"/);
    assert.equal((menu.match(/label-cybersecurity"/g) || []).length, 1);
    assert.match(menu, /label-networking">Networking/);
    const security = menu.split('label-cybersecurity">Cybersecurity</p>')[1].split('<p')[0];
    assert.equal((security.match(/<a /g) || []).length, 10);
    for (const name of ['Palo Alto Networks', 'Fortinet', 'Zscaler', 'Cloudflare Security', 'Cisco Security', 'CrowdStrike', 'Microsoft Security', 'SentinelOne', 'Okta', 'Snyk']) {
      assert.ok(security.includes(`${name} ↗`), name);
    }
  }
});
