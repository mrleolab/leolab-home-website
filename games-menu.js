(() => {
  const triggers = [...document.querySelectorAll('.menu-trigger')];
  const menus = triggers
    .map((trigger) => document.getElementById(trigger.dataset.menu))
    .filter(Boolean);

  if (!triggers.length || !menus.length) return;

  const closeAll = () => {
    menus.forEach((menu) => { menu.hidden = true; });
    triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
  };

  const positionMenu = (trigger, menu) => {
    const triggerRect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const viewportPadding = 14;
    const centeredLeft = triggerRect.left + triggerRect.width / 2;
    const boundedLeft = Math.min(
      Math.max(viewportPadding + menuWidth / 2, centeredLeft),
      window.innerWidth - viewportPadding - menuWidth / 2
    );

    menu.style.setProperty('--games-popover-left', `${boundedLeft}px`);
    menu.style.setProperty('--games-popover-top', `${triggerRect.bottom + 10}px`);
  };

  triggers.forEach((trigger) => {
    const menu = document.getElementById(trigger.dataset.menu);
    if (!menu) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpening = menu.hidden;
      closeAll();
      menu.hidden = !isOpening;
      trigger.setAttribute('aria-expanded', String(isOpening));
      if (isOpening) positionMenu(trigger, menu);
    });

    menu.addEventListener('click', (event) => event.stopPropagation());
  });

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
  window.addEventListener('resize', closeAll);
  window.addEventListener('scroll', closeAll, { passive: true });
})();
