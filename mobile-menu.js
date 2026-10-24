(() => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const closeButton = document.querySelector('.mobile-menu-close');
  if (!toggle || !menu || !closeButton) return;
  let savedScrollY = 0;
  let isOpen = false;
  const mobileViewport = window.matchMedia('(max-width: 720px)');

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;
    document.body.classList.remove('mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', window.LeoI18n?.t('Open menu') || 'Open menu');
    menu.setAttribute('aria-hidden', 'true');
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
  };

  const openMenu = () => {
    savedScrollY = window.scrollY;
    isOpen = true;
    document.body.classList.add('mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', window.LeoI18n?.t('Close menu') || 'Close menu');
    menu.setAttribute('aria-hidden', 'false');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  toggle.addEventListener('click', () => {
    document.body.classList.contains('mobile-menu-open') ? closeMenu() : openMenu();
  });
  closeButton.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      closeMenu();
      toggle.focus({ preventScroll: true });
    }
  });
  mobileViewport.addEventListener('change', () => {
    if (!mobileViewport.matches) closeMenu();
  });
})();
