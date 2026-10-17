import {mergeDocuments,sameDocument} from './progress-core.js';
export class SyncEngine{
 constructor(store,backend,onStatus=()=>{}){this.store=store;this.backend=backend;this.onStatus=onStatus;this.generation=0;this.pending=false;this.busy=false;this.unsubStore=store.subscribe(e=>{if(e.source==='local'||e.source==='tab')this.schedule()})}
 status(text){this.onStatus(text)}
 connect(uid){this.disconnect();this.uid=uid;this.store.switchOwner(uid);const generation=this.generation;this.status('正在合併雲端進度…');this.unsubRemote=this.backend.watch(uid,doc=>{if(generation!==this.generation)return;this.store.merge(doc);if(!sameDocument(doc,this.store.export())){if(!this.pending)this.schedule()}else if(!this.pending&&!this.busy)this.status('已同步')},error=>{if(generation!==this.generation)return;this.status(this.message(error))});this.schedule()}
 disconnect(){this.generation++;clearTimeout(this.timer);this.unsubRemote?.();this.unsubRemote=null;this.uid=null;this.pending=false;this.busy=false}
 schedule(){if(!this.uid)return;this.pending=true;clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),700)}
 message(error){if(error?.code?.includes('resource-exhausted'))return '雲端服務額度暫時不足，進度已保留本機，請稍後重試';if(error?.code?.includes('invalid-argument'))return '進度無法上傳，可能超出儲存大小限制；本機紀錄仍保留';return error?.code?.includes('permission-denied')?'尚無資料庫權限，請完成同步設定':'暫時無法同步，進度已保留在本機；連線恢復後重試'}
 async flush(){
  if(!this.uid)return;if(this.busy){this.pending=true;return}
  clearTimeout(this.timer);this.busy=true;this.pending=false;const uid=this.uid,generation=this.generation,local=this.store.export();let failed=false,retry=true;this.status('同步中…');
  try{const merged=await this.backend.transact(uid,remote=>mergeDocuments(remote,local));if(generation!==this.generation)return;this.store.merge(merged);if(!sameDocument(merged,this.store.export()))this.pending=true;this.status(this.pending?'等待同步…':'已同步')}
  catch(error){if(generation!==this.generation)return;failed=true;retry=!error?.code?.includes('permission-denied')&&!error?.code?.includes('invalid-argument');this.pending=true;this.status(this.message(error))}
  finally{if(generation===this.generation){this.busy=false;if(this.pending&&retry){clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),failed?15000:700)}}}
 }
 destroy(){this.disconnect();this.unsubStore()}
}
