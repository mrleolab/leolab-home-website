(() => {
  const modal = document.querySelector('.community-modal');
  const open = document.querySelector('[data-community-open]');
  const closeButtons = document.querySelectorAll('[data-community-close]');
  if (!modal || !open) return;

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    open.focus();
  };
  open.addEventListener('click', () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.community-close').focus();
  });
  closeButtons.forEach((button) => button.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();
