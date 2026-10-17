// Catch module-loading failures too, before the practice module can run.
const script=document.currentScript;
const base=new URL(script.src);
const page=script.dataset.page;
function reload(){const url=new URL(location.href);url.searchParams.set('reload',Date.now());location.replace(url)}
function practiceError(){
 const card=document.getElementById('card');
 if(card)card.innerHTML='<div class="empty">題庫載入失敗，請重新載入後再試。<p><button class="primary" id="practice-reload">重新載入題庫</button></p></div>';
 const hint=document.getElementById('random-hint');if(hint)hint.textContent='題庫尚未載入，請按下方「重新載入題庫」。';
 const button=document.getElementById('random-start');if(button){button.disabled=true;button.textContent='尚未載入'}
 document.getElementById('practice-reload')?.addEventListener('click',reload);
 const review=document.getElementById('review-list');if(review){review.innerHTML='<div class="empty">解答載入失敗。<button class="outline" id="review-reload">重新載入</button></div>';document.getElementById('review-reload').onclick=reload}
 const setup=document.getElementById('copy-status');if(setup)setup.textContent='自動複製暫時無法使用，仍可手動選取下方規則。';
}
if(['app','answers','setup'].includes(page))import(new URL('./'+page+'.js'+base.search,base).href).catch(practiceError);
if(['home','app','answers'].includes(page))import(new URL('./sync.js?v=4f56a25ec1a7'+base.search,base).href).catch(()=>{const panel=document.querySelector('[data-sync]');if(panel)panel.textContent='同步服務暫時無法載入，仍可使用本機練習。'});
