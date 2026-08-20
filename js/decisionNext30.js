const clean=(v,max=700)=>String(v??'').trim().slice(0,max);
const keep=v=>{const x=clean(v);return x&&x!=='—'?x:null};

export function decisionNext30(decision={}){
 const rows=[];
 const add=(label,value,kind)=>{const text=keep(value);if(text&&!rows.some(x=>x.label===label&&x.value===text))rows.push({label,value:text,kind})};
 add('Co dělat teď',decision.when,'NOW');
 add('Kdy koupit / přikoupit',decision.buyRule,'BUY');
 add('Kdy prodat / snížit',decision.sellRule,'SELL');
 const action=clean(decision.action,40)||null;
 return {
  action,
  rows:rows.slice(0,4),
  hasStructuredTrigger:rows.length>0,
  note:rows.length
   ?'Next Trigger pouze zobrazuje skutečná pravidla, která už poskytl původní XTB / ticket engine. Nic neobchoduje a nevymýšlí cenu ani termín.'
   :'Původní rozhodnutí neposkytuje strukturované pravidlo pro další nákup nebo prodej. Kamil OS 30.4 ho nedoplňuje odhadem.'
 };
}

export const decisionNext30Note='„Kdy změnit názor?“ je read-only vrstva nad existujícími pravidly buyRule / sellRule / when. Bez těchto polí nevyrábí vlastní trigger.';
