export function onRouteDidUpdate({location}) {
  const locale = location.pathname.startsWith('/knowledge-base/zh-CN/') ? 'zh-CN' : 'en';
  try { window.localStorage.setItem('leo-lab-language', locale); } catch {}
}
