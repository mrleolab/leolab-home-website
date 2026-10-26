(() => {
  const frame=document.getElementById('arduino-frame');
  if(!frame)return;
  const preview=document.querySelector('[data-arduino-preview]');
  const toggle=document.querySelector('[data-arduino-toggle]');
  const external=document.querySelector('[data-arduino-external]');
  const demo=document.querySelector('[data-motor-demo]');
  const demoToggle=document.querySelector('[data-motor-toggle]');
  let active=true;
  let paused=false;
  const translated=text=>window.LeoI18n?.t(text)||text;
  const updateLabel=()=>{
    toggle.textContent=translated(active?'Return to page scrolling':'Enable interaction');
    demoToggle.textContent=translated(paused?'Resume preview':'Pause preview');
  };
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
    const src=`https://learn-arduino-red.vercel.app/${locale==='zh-CN'?'zh/':''}#motor`;
    if(frame.getAttribute('src')!==src)frame.src=src;
    external.href=src;
    updateLabel();
  };
  toggle.addEventListener('click',()=>setActive(!active));
  demoToggle.addEventListener('click',()=>{
    paused=!paused;
    demo.classList.toggle('is-paused',paused);
    demoToggle.setAttribute('aria-pressed',String(paused));
    updateLabel();
  });
  window.addEventListener('leo-language-change',syncLanguage);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncLanguage,{once:true});
  else syncLanguage();
})();
