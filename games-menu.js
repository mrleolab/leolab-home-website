(() => {
  const trigger = document.querySelector('.games-trigger');
  const popover = document.querySelector('.games-popover');
  if (!trigger || !popover) return;

  const close = () => {
    popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  const positionPopover = () => {
    const triggerRect = trigger.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const viewportPadding = 14;
    const centeredLeft = triggerRect.left + triggerRect.width / 2;
    const boundedLeft = Math.min(
      Math.max(viewportPadding + popoverWidth / 2, centeredLeft),
      window.innerWidth - viewportPadding - popoverWidth / 2
    );

    popover.style.setProperty('--games-popover-left', `${boundedLeft}px`);
    popover.style.setProperty('--games-popover-top', `${triggerRect.bottom + 10}px`);
  };

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpening = popover.hidden;
    popover.hidden = !isOpening;
    trigger.setAttribute('aria-expanded', String(isOpening));
    if (isOpening) positionPopover();
  });

  popover.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  window.addEventListener('resize', close);
  window.addEventListener('scroll', close, { passive: true });
})();
