import {key,filterQuestions} from './model.js';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pageSize=20;
let bank=[],explanations={},state={},list=[],page=0;
try{state=JSON.parse(localStorage.getItem(key)||'{}');if(!state||typeof state!=='object'||Array.isArray(state))state={}}catch{state={}}
function rebuild(){const kind=$('#review-kind').value,filter=$('#review-filter').value,query=$('#review-search').value.trim();list=bank.filter(q=>(kind==='all'||q.kind===kind)&&filterQuestions([q],q.kind,filter,query,state).length);page=0;render()}
function render(){
 const pages=Math.ceil(list.length/pageSize),start=page*pageSize;
 $('#review-prev').disabled=page===0;$('#review-next').disabled=page>=pages-1;
 $('#review-position').textContent=list.length?`${start+1}–${Math.min(start+pageSize,list.length)} / ${list.length} 題 · 第 ${page+1} / ${pages} 頁`:'沒有符合條件的題目';
 if(!list.length){$('#review-list').innerHTML='<div class="empty">沒有符合條件的題目，請試試其他篩選。</div>';return}
 const full=$('#review-mode').value==='full';
 $('#review-list').innerHTML=list.slice(start,start+pageSize).map(q=>{
  const type=q.kind==='choice'?'選擇題':'計算題',url=`${q.kind}.html?question=${q.number}`;
  const heading=`<div class="q-head"><span class="tag">${type} · 第 ${q.number} 題</span><a class="practice-link" href="${url}">練習這題 →</a></div>`;
  let body;
  if(q.kind==='choice'){
   const e=explanations[q.id];
   const options=full?`<ul class="review-options">${q.options.map((o,i)=>`<li class="${'ABCD'[i]===q.answer?'review-correct':''}"><span>${'ABCD'[i]}</span> ${escape(o)}${'ABCD'[i]===q.answer?' <small>題庫答案</small>':''}</li>`).join('')}</ul>`:'';
   body=`<h2>${escape(q.text)}</h2>${options}<div class="review-answer"><strong>題庫答案：${q.answer}</strong><span>${escape(q.options['ABCD'.indexOf(q.answer)])}</span></div><div class="review-explanation"><h3>知識解析</h3><p>${escape(e.text)}</p></div>${e.note?`<div class="knowledge-note"><strong>題意／答案提醒</strong><p>${escape(e.note)}</p></div>`:''}`;
  }else{
   body=`<h2>計算題 · 第 ${q.number} 題</h2><h3 class="image-heading">題目</h3>${q.images.map(p=>`<img class="calc-image" src="${p}" loading="lazy" alt="計算題第 ${q.number} 題原始題目">`).join('')}<div class="review-calculation"><h3 class="image-heading">原題庫解答</h3>${q.solutions.map(p=>`<img class="calc-image" src="${p}" loading="lazy" alt="計算題第 ${q.number} 題原始解答">`).join('')}</div>`;
  }
  return `<article class="review-card" id="${q.id}">${heading}${body}<div class="review-source"><a href="${q.kind}.pdf#page=${q.page}" target="_blank" rel="noopener">原題庫第 ${q.page} 頁</a></div></article>`;
 }).join('');
}
for(const id of ['review-kind','review-filter'])$('#'+id).onchange=rebuild;
$('#review-search').oninput=rebuild;$('#review-mode').onchange=render;
function move(delta){page=Math.max(0,Math.min(Math.ceil(list.length/pageSize)-1,page+delta));render();$('.review-pagination').scrollIntoView({block:'start'})}
$('#review-prev').onclick=()=>move(-1);$('#review-next').onclick=()=>move(1);
try{const [questions,answers]=await Promise.all([fetch('questions.json'),fetch('explanations.json')]);if(!questions.ok||!answers.ok)throw Error();bank=await questions.json();explanations=await answers.json();if(bank.some(q=>q.kind==='choice'&&!explanations[q.id]?.text))throw Error();rebuild()}catch{$('#review-list').innerHTML='<div class="empty">解答載入失敗，請重新整理頁面。</div>';$('#review-prev').disabled=true;$('#review-next').disabled=true}
