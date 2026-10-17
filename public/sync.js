import {progress} from './progress.js?v=4f56a25ec1a7';
import {SyncEngine} from './sync-engine.js?v=4f56a25ec1a7';
import {createFirebaseBackend} from './firebase-client.js?v=4f56a25ec1a7';
const host=document.querySelector('[data-sync]');
if(host){
 host.innerHTML='<div class="sync-controls"><span id="sync-user">本機模式</span><button id="sync-login" class="outline" disabled>準備 Google 登入…</button><button id="sync-retry" class="outline" hidden>立即同步</button><button id="sync-logout" class="outline" hidden>登出</button></div><p id="sync-status" role="status">未登入時仍可在此裝置練習。</p><a class="sync-help" href="sync-setup.html">同步設定與說明</a>';
 const $=id=>document.getElementById(id);let backend,engine,user=null,initializing=false;
 const status=text=>{$('sync-status').textContent=progress.persistent?text:'瀏覽器無法保存進度，請允許網站儲存資料。'+text};
 async function initialize(){
  if(initializing)return;initializing=true;$('sync-login').disabled=true;
  try{
   backend=await createFirebaseBackend();engine=new SyncEngine(progress,backend,status);
   backend.onAuth(next=>{user=next;engine.disconnect();
    $('sync-user').textContent=next?(next.displayName||next.email||'已登入 Google'):'本機模式';
    $('sync-login').hidden=!!next;$('sync-login').disabled=false;$('sync-login').textContent='Google 登入';
    $('sync-retry').hidden=!next;$('sync-logout').hidden=!next;
    if(next)engine.connect(next.uid);else{progress.switchOwner('guest');status('本機模式；登入後會將此裝置的紀錄合併至該帳號。')}
   });
  }catch{status('無法載入 Google 登入服務。本機練習仍可使用，請檢查網路後重試。');$('sync-login').disabled=false;$('sync-login').textContent='重新載入登入服務'}
  finally{initializing=false}
 }
 $('sync-login').onclick=async()=>{if(!backend){await initialize();return}try{await backend.login()}catch(error){const messages={'auth/popup-blocked':'瀏覽器阻擋了登入視窗，請允許彈出視窗後再試。','auth/popup-closed-by-user':'已取消登入，仍可使用本機練習。','auth/unauthorized-domain':'此網站尚未加入 Firebase 授權網域，請查看同步設定。','auth/operation-not-allowed':'Firebase 尚未啟用 Google 登入，請查看同步設定。'};status(messages[error.code]||'登入失敗，請檢查網路及 Firebase 設定後重試。')}};
 $('sync-retry').onclick=()=>{if(user){engine.connect(user.uid)}};
 $('sync-logout').onclick=async()=>{try{await backend.logout()}catch{status('目前無法登出，請檢查網路後重試。')}};
 addEventListener('online',()=>{if(user)engine.connect(user.uid)});
 addEventListener('offline',()=>{if(user)status('目前離線，進度會保存在本機，恢復連線後補傳。')});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&user)engine.flush()});
 initialize();
}
