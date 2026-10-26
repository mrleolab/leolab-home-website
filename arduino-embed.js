(() => {
  const frame=document.getElementById('arduino-frame');
  if(!frame)return;
  const preview=document.querySelector('[data-arduino-preview]');
  const toggle=document.querySelector('[data-arduino-toggle]');
  const start=document.querySelector('[data-arduino-start]');
  const external=document.querySelector('[data-arduino-external]');
  let active=false;
  const updateLabel=()=>{toggle.textContent=window.LeoI18n?.t(active?'Return to page scrolling':'Enable interaction')||(active?'Return to page scrolling':'Enable interaction');};
  const setActive=value=>{
    active=value;
    preview.classList.toggle('is-interactive',active);
    toggle.setAttribute('aria-pressed',String(active));
    frame.tabIndex=active?0:-1;
    updateLabel();
    if(!active)toggle.focus({preventScroll:true});
  };
  const syncLanguage=()=>{
    const locale=window.LeoI18n?.locale||document.documentElement.lang;
    const src=`https://learn-arduino-red.vercel.app/${locale==='zh-CN'?'zh/':''}#board`;
    if(frame.getAttribute('src')!==src){frame.src=src;if(active)setActive(false);}
    external.href=src;
    updateLabel();
  };
  toggle.addEventListener('click',()=>setActive(!active));
  start.addEventListener('click',()=>setActive(true));
  window.addEventListener('leo-language-change',syncLanguage);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncLanguage,{once:true});
  else syncLanguage();
})();
