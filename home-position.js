(() => {
  // A reload starts at the home cover, not at the previously used laboratory.
  // Ordinary anchor navigation and back/forward visits keep native behavior.
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type !== 'reload') return;
  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  const home = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.addEventListener('pageshow', home, { once: true });
  window.addEventListener('pagehide', () => {
    history.scrollRestoration = previousRestoration;
  }, { once: true });
})();
