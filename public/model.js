export const key='ipma-lab-v1';
export function filterQuestions(bank,kind,filter,query,state){
 return bank.filter(q=>{
  const matchesFilter=filter==='all'||filter==='wrong'&&state[q.id]?.result===false||filter==='saved'&&state[q.id]?.saved||filter==='new'&&typeof state[q.id]?.result!=='boolean';
  const matchesQuery=!query||(/^\d+$/.test(query)?q.number===Number(query):q.text.toLowerCase().includes(query.toLowerCase())||q.options?.some(x=>x.toLowerCase().includes(query.toLowerCase())));
  return q.kind===kind&&matchesFilter&&matchesQuery;
 });
}
export function stats(bank,kind,state){const qs=bank.filter(q=>q.kind===kind),done=qs.filter(q=>typeof state[q.id]?.result==='boolean'),correct=done.filter(q=>state[q.id].result);return {total:qs.length,done:done.length,rate:done.length?Math.round(correct.length/done.length*100):null,wrong:done.length-correct.length,saved:qs.filter(q=>state[q.id]?.saved).length};}
export function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;}
