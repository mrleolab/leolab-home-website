(() => {
  const trigger = document.querySelector('.games-trigger');
  const popover = document.querySelector('.games-popover');
  if (!trigger || !popover) return;

  const close = () => {
    popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = !popover.hidden;
    popover.hidden = isOpen;
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });

  popover.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
})();
