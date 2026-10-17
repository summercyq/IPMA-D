export const localKey='ipma-lab-v1';
export const emptyDocument=()=>({version:1,clearedAt:[0,''],records:{}});
const fields={result:v=>typeof v==='boolean',selected:v=>typeof v==='string'&&/^[ABCD]$/.test(v),saved:v=>typeof v==='boolean',notes:v=>typeof v==='string'};
const validId=id=>/^(choice|calc)-[1-9]\d*$/.test(id)&&Number(id.split('-')[1])<=(id.startsWith('choice-')?313:30);
const stamp=s=>Array.isArray(s)&&s.length===2&&Number.isSafeInteger(s[0])&&s[0]>=0&&typeof s[1]==='string'?s:[0,''];
export function compare(a,b){a=stamp(a);b=stamp(b);return a[0]-b[0]||(a[1]>b[1]?1:a[1]<b[1]?-1:0)}
export function normalize(data){
 const out=emptyDocument();if(!data||data.version!==1)return out;
 out.clearedAt=stamp(data.clearedAt);
 for(const [id,record] of Object.entries(data.records||{}).sort()){
  if(!validId(id)||!record||typeof record!=='object')continue;
  for(const field of Object.keys(fields).sort()){
   const entry=record[field];if(!entry||!fields[field](entry.value)||compare(entry.stamp,out.clearedAt)<=0)continue;
   (out.records[id]??={})[field]={value:entry.value,stamp:stamp(entry.stamp)};
  }
 }
 return out;
}
export function mergeDocuments(left,right){
 left=normalize(left);right=normalize(right);const out=emptyDocument();out.clearedAt=compare(left.clearedAt,right.clearedAt)>=0?left.clearedAt:right.clearedAt;
 for(const doc of [left,right])for(const [id,record] of Object.entries(doc.records))for(const [field,entry] of Object.entries(record)){
  if(compare(entry.stamp,out.clearedAt)<=0)continue;
  const old=out.records[id]?.[field];const order=old?compare(entry.stamp,old.stamp):1;
  if(!old||order>0||order===0&&JSON.stringify(entry.value)>JSON.stringify(old.value))(out.records[id]??={})[field]=entry;
 }
 return normalize(out);
}
export function materialize(doc){return Object.fromEntries(Object.entries(normalize(doc).records).map(([id,record])=>[id,Object.fromEntries(Object.entries(record).map(([f,e])=>[f,e.value]))]))}
export function migrateLegacy(state){const doc=emptyDocument();for(const [id,record] of Object.entries(state||{})){if(!validId(id)||!record)continue;for(const [field,valid] of Object.entries(fields))if(valid(record[field]))(doc.records[id]??={})[field]={value:record[field],stamp:[1,'legacy']}}return normalize(doc)}
export function sameDocument(a,b){return JSON.stringify(normalize(a))===JSON.stringify(normalize(b))}
export class ProgressStore{
 constructor(storage,{now=()=>Date.now(),device='device'}={}){
  this.storage=storage;this.now=now;this.device=device;this.listeners=new Set();this.persistent=true;
  this.owner=this.get('ipma-owner')||'guest';this.doc=this.load(this.owner);this.persist();
 }
 get(key){try{return this.storage.getItem(key)}catch{this.persistent=false;return null}}
 put(key,value){try{this.storage.setItem(key,value)}catch{this.persistent=false}}
 parse(key){try{return JSON.parse(this.get(key)||'null')}catch{return null}}
 load(owner){const saved=this.parse('ipma-progress:'+owner);if(saved)return normalize(saved);return owner==='guest'&&!this.get('ipma-legacy-migrated')?migrateLegacy(this.parse(localKey)):emptyDocument()}
 persist(){this.put('ipma-progress:'+this.owner,JSON.stringify(this.doc));this.put(localKey,JSON.stringify(this.read()));this.put('ipma-owner',this.owner);this.put('ipma-legacy-migrated','1')}
 read(){return materialize(this.doc)}
 export(){return normalize(this.doc)}
 tick(){let latest=this.doc.clearedAt[0];for(const record of Object.values(this.doc.records))for(const e of Object.values(record))latest=Math.max(latest,e.stamp[0]);return [Math.max(this.now(),latest+1),this.device]}
 notify(source){for(const fn of this.listeners)fn({source,owner:this.owner})}
 subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 patch(id,changes){if(!validId(id))throw Error('Invalid question');const time=this.tick();for(const [f,v] of Object.entries(changes)){if(!Object.hasOwn(fields,f)||!fields[f](v))throw Error('Invalid progress value');(this.doc.records[id]??={})[f]={value:v,stamp:time}}this.persist();this.notify('local')}
 clear(){this.doc={version:1,clearedAt:this.tick(),records:{}};this.persist();this.notify('local')}
 merge(doc,source='remote'){const next=mergeDocuments(this.doc,doc);if(sameDocument(next,this.doc))return false;this.doc=next;this.persist();this.notify(source);return true}
 switchOwner(owner){
  if(owner===this.owner)return;
  const guest=this.owner==='guest'?{...this.doc,clearedAt:[0,'']}:null;this.owner=owner;this.doc=this.load(owner);
  if(guest&&owner!=='guest'){this.doc=mergeDocuments(this.doc,guest);this.put('ipma-progress:guest',JSON.stringify(emptyDocument()))}
  this.persist();this.notify('account');
 }
}
