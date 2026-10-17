import {ProgressStore} from './progress-core.js?v=4f56a25ec1a7';
let storage;try{storage=localStorage}catch{storage={getItem(){return null},setItem(){throw Error('Storage unavailable')}}}
export const progress=new ProgressStore(storage,{device:globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)});
addEventListener('storage',event=>{if(event.key==='ipma-progress:'+progress.owner){try{progress.merge(JSON.parse(event.newValue),'tab')}catch{}}});
