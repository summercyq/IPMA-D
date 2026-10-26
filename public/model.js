export const key='ipma-lab-v1';
export function filterQuestions(bank,kind,filter,query,state,range=null){
 return bank.filter(q=>{
  const matchesFilter=filter==='all'||filter==='wrong'&&state[q.id]?.result===false||filter==='saved'&&state[q.id]?.saved||filter==='new'&&typeof state[q.id]?.result!=='boolean';
  const matchesQuery=!query||(/^\d+$/.test(query)?q.number===Number(query):q.text.toLowerCase().includes(query.toLowerCase())||q.options?.some(x=>x.toLowerCase().includes(query.toLowerCase())));
  return q.kind===kind&&matchesFilter&&matchesQuery&&(!range||q.number>=range.start&&q.number<=range.end);
 });
}
export function stats(bank,kind,state){const qs=bank.filter(q=>q.kind===kind),done=qs.filter(q=>typeof state[q.id]?.result==='boolean'),correct=done.filter(q=>state[q.id].result);return {total:qs.length,done:done.length,rate:done.length?Math.round(correct.length/done.length*100):null,wrong:done.length-correct.length,saved:qs.filter(q=>state[q.id]?.saved).length};}
export function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;}

export function randomQuestions(pool,count){if(!Number.isSafeInteger(count)||count<1||count>pool.length)throw new RangeError('請輸入範圍內的整數題數');return shuffle(pool).slice(0,count)}

export function parseQuestionRange(first,last,total){
 if(!Number.isSafeInteger(total)||total<1)throw new RangeError('題庫尚未載入，請稍候再試。');
 const a=String(first).normalize('NFKC').trim(),b=String(last).normalize('NFKC').trim();
 const start=a===''?1:Number(a),end=b===''?total:Number(b);
 if(a!==''&&!/^[0-9]+$/.test(a)||b!==''&&!/^[0-9]+$/.test(b)||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||end<1||start>total||end>total)throw new RangeError(`請輸入 1–${total} 的整數題號。`);
 if(start>end)throw new RangeError('起始題號不能大於結束題號。');
 return {start,end};
}
