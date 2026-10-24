/* Local, human-authored translations. No translation API, cookies, or network service. */
(() => {
  const pairs = window.LEO_TRANSLATIONS || [];
  const english = new Map(pairs), chinese = new Map(pairs.map(([en, zh]) => [zh, en]));
  const key = 'leo-lab-language';
  let locale = 'en';
  try { locale = new URLSearchParams(location.search).get('lang') || localStorage.getItem(key) || 'en'; } catch {}
  locale = locale === 'zh-CN' ? 'zh-CN' : 'en';
  const records = new WeakMap();
  const attributeRecords = new WeakMap();
  const t = value => {
    const text = String(value), trim = text.trim();
    const canonical = chinese.get(trim) || trim;
    let result = locale === 'zh-CN' ? english.get(canonical) || canonical : canonical;
    if (locale === 'en') {
      result = result.replace(/^AI · 业余$/, 'AI · Amateur').replace(/^AI · 入门$/, 'AI · Beginner').replace(/^AI · 高手$/, 'AI · Expert').replace(/^AI · 大师$/, 'AI · Master').replace(/^(\d+) 步$/, '$1 moves');
      result = result.replace(/^已回退至第 (\d+) 步$/, 'Returned to move $1').replace(/^建议走法：/, 'Suggested move: ').replace(/已达上限$/, ': maximum count reached').replace(/只能放在九宫内$/, ': must stay in the palace').replace(/只能放在九宫斜线可到达位置$/, ': must stay on palace diagonals').replace(/只能放在本方可到达的象位$/, ': must stay on its own elephant positions');
    }
    if (locale === 'zh-CN') {
      result = result.replace(/^Day ([\d.]+)$/, '第 $1 天').replace(/^([\d.]+) years$/, '$1 年').replace(/^([\d.]+) days\/s$/, '$1 天/秒').replace(/^([\d.]+) day$/, '$1 天');
      result = result.replace(/^([\d.]+) AU from Sun · ([\d.]+) km\/s$/, '距太阳 $1 AU · $2 km/s').replace(/^Central star · ([\d.]+) solar masses$/, '中心恒星 · $1 倍太阳质量');
      result = result.replace(/^Computer elo: (\d+)$/, '电脑等级分：$1');
    }
    return text.replace(trim, result);
  };
  function textNode(node) {
    if (!node.parentElement || node.parentElement.closest('script,style,code,pre,svg,[data-no-translate],.language-picker')) return;
    const current = node.nodeValue;
    const saved = records.get(node);
    const source = saved && current === saved.result ? saved.source : current;
    const result = t(source);
    records.set(node, {source, result});
    if (result !== current) node.nodeValue = result;
  }
  function translate(root = document.body) {
    if (root.nodeType === Node.TEXT_NODE) { textNode(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) textNode(walker.currentNode);
    for (const el of [root, ...root.querySelectorAll('[aria-label],[title],[placeholder],input[type=button]')]) {
      if (el.closest('.language-picker')) continue;
      let saved = attributeRecords.get(el);
      if (!saved) { saved = {}; attributeRecords.set(el, saved); }
      for (const attr of ['aria-label', 'title', 'placeholder', ...(el.matches('input[type=button]') ? ['value'] : [])]) {
        const value = el.getAttribute(attr); if (!value) continue;
        const old = saved[attr], source = old && value === old.result ? old.source : value;
        const result = t(source); saved[attr] = {source, result};
        if (result !== value) el.setAttribute(attr, result);
      }
    }
  }
  function syncLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === '/knowledge-base/' || url.pathname === '/knowledge-base/zh-CN/') {
        url.pathname = locale === 'zh-CN' ? '/knowledge-base/zh-CN/' : '/knowledge-base/';
        link.setAttribute('href', url.pathname + url.search + url.hash);
      }
    });
  }
  function apply() {
    document.documentElement.lang = locale;
    translate(); syncLinks();
    document.querySelectorAll('.language-current').forEach(el => { el.textContent = locale === 'en' ? 'EN' : '中文'; });
    document.querySelectorAll('[data-set-language]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.setLanguage === locale)));
    document.querySelectorAll('.language-picker summary').forEach(el => el.setAttribute('aria-label', locale === 'en' ? 'Choose language' : '选择语言'));
    document.title = t(document.title);
    window.dispatchEvent(new CustomEvent('leo-language-change', {detail: locale}));
  }
  function choose(next) {
    locale = next === 'zh-CN' ? 'zh-CN' : 'en';
    try { localStorage.setItem(key, locale); } catch {}
    const url = new URL(location.href); url.searchParams.set('lang', locale);
    history.replaceState(history.state, '', url);
    apply();
    document.querySelectorAll('.language-picker').forEach(el => { el.open = false; });
  }
  function mount() {
    if (location.pathname.startsWith('/games/') && !document.querySelector('[data-language-picker]')) {
      const picker = document.createElement('details');
      picker.dataset.languagePicker = '';
      picker.className = 'language-picker--game';
      document.body.append(picker);
    }
    document.querySelectorAll('[data-language-picker]').forEach(host => {
      host.classList.add('language-picker');
      host.innerHTML = '<summary aria-label="Choose language"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 5h12M9 2v3M5 5c1 5 4 8 9 10M13 5c-1 5-4 8-9 10M14 21l4-11 4 11M15 18h6"/></svg><span class="language-current">EN</span><span aria-hidden="true">⌄</span></summary><div class="language-picker-panel"><button type="button" data-set-language="en" lang="en">English</button><button type="button" data-set-language="zh-CN" lang="zh-CN">中文</button></div>';
    });
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-set-language]');
      if (button) choose(button.dataset.setLanguage);
      if (!event.target.closest('.language-picker')) document.querySelectorAll('.language-picker').forEach(el => { el.open = false; });
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.language-picker').forEach(el => { el.open = false; }); });
    apply();
    // Only game UIs need dynamic DOM localization; never observe the animated homepage.
    if (location.pathname.startsWith('/games/') && !document.body.hasAttribute('data-native-i18n')) {
      const observer = new MutationObserver(changes => {
        for (const change of changes) {
          if (change.type === 'characterData' || change.type === 'attributes') translate(change.target);
          else for (const node of change.addedNodes) translate(node);
        }
      });
      observer.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['value', 'placeholder', 'aria-label', 'title']});
    }
  }
  window.LeoI18n = {t, translate, get locale() { return locale; }};
  function ready() {
    // Next's server-rendered chess UI must hydrate before localized text is applied.
    if (location.pathname.startsWith('/games/international-chess/') && !document.body.hasAttribute('data-native-i18n') && !document.querySelector('[data-boardid]')) {
      const readyObserver = new MutationObserver(() => {
        if (document.querySelector('[data-boardid]')) { readyObserver.disconnect(); mount(); }
      });
      readyObserver.observe(document.body, {subtree:true, childList:true});
    } else mount();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true}); else ready();
})();
