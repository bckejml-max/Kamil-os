import {money,dayDiff} from './utils.js';

export const debtPaid=x=>(x.payments||[]).reduce((n,p)=>n+(Number(p.amount)||0),0);
export const debtRemaining=x=>Math.max(0,(Number(x.amount)||0)-debtPaid(x));

export function ticketStatus(x){
 const d=x.date?dayDiff(x.date):999,workflow=x.workflow||((Number(x.sell)||0)>0?'SOLD':'HOLD');
 if(workflow==='PAYOUT WAIT')return {label:'Čeká na výplatu',score:76};
 if(workflow==='SOLD')return {label:'Prodáno',score:20};
 if(d<=5&&workflow==='HOLD')return {label:'Dát do prodeje hned',score:96};
 if(d<=10&&workflow==='LISTED')return {label:'Zkontrolovat cenu',score:82};
 if(d<=21&&workflow==='HOLD')return {label:'Připravit prodej',score:68};
 return {label:'V klidu',score:25};
}

export function debtStatus(x){
 const rem=debtRemaining(x);if(rem<=0)return {label:'Zaplaceno',score:0};
 const now=Date.now(),prom=x.promisedAt?new Date(x.promisedAt).getTime():0,last=x.lastContactAt?new Date(x.lastContactAt).getTime():0;
 if(prom&&prom<now)return {label:'Po termínu',score:94};
 const days=last?Math.floor((now-last)/86400000):999;
 if(days>=14)return {label:'Urgovat',score:84};
 if(days>=7)return {label:'Připomenout',score:70};
 return {label:'Čekat',score:30};
}

export function signals(s){
 const out=[],add=(type,title,score,reason,target,id,impact='')=>out.push({type,title,score,reason,target,id,impact});
 const now=Date.now();
 for(const t of s.tasks||[]){
   if(t.status==='HOTOVO')continue;let score=28,reason=[];
   if(t.due){const d=dayDiff(t.due);if(d<0){score+=48;reason.push(`po termínu ${Math.abs(d)} dní`)}else if(d===0){score+=38;reason.push('termín dnes')}else if(d<=2){score+=22;reason.push(`termín za ${d} dny`)}}
   const touched=t.updatedAt||t.createdAt;if(touched){const age=Math.floor((now-new Date(touched))/86400000);if(age>=7){score+=Math.min(24,age);reason.push(`${age} dní bez pohybu`)}}
   if(String(t.priority).toUpperCase()==='HIGH'||Number(t.priority)>=90)score+=15;
   if(score>=55)add('Úkol',t.title,Math.min(100,score),reason.join(' · ')||'důležitý úkol','work',t.id,'Odkladem roste riziko skluzu.');
 }
 for(const x of s.delegations||[]){
   if((x.status||'WAITING')==='DONE')continue;
   const touched=x.lastContactAt||x.updatedAt||x.createdAt,age=touched?Math.max(0,Math.floor((now-new Date(touched))/86400000)):0;
   const follow=x.followUpAt?dayDiff(x.followUpAt):null;
   let score=age>=14?88:age>=7?74:age>=4?60:35,reason=age?`${age} dní čekání`:'čeká na reakci';
   if(follow!==null&&follow<=0){score=Math.max(score,82);reason+=follow<0?` · kontrola po termínu ${Math.abs(follow)} d`:' · kontrola dnes'}
   if(score>=55)add('Čekám',x.title||x.person||'Čekající položka',score,reason,'waiting',x.id,'Dlouhé čekání blokuje další krok.');
 }
 for(const x of s.debtBook?.items||[]){if(x.status==='PAID')continue;const st=debtStatus(x),rem=debtRemaining(x);if(st.score>=60)add('Dluh',`${x.person} · ${money(rem)}`,st.score,st.label,'debts',x.id,'Je vhodné udržet pohledávku aktivní.')}
 for(const x of s.ticketBook?.items||[]){const st=ticketStatus(x);if(st.score>=60)add('Vstupenky',x.name,st.score,st.label,'tickets',x.id,'Čas do akce ovlivňuje prodejní hodnotu.')}
 const learned=s.learning?.typeBias||{};
 return out.map(x=>({...x,score:Math.max(0,Math.min(100,x.score+(learned[x.type]||0)))})).sort((a,b)=>b.score-a.score);
}
export function recommendation(s){return signals(s)[0]||{type:'Klid',title:'Nic kritického. Drž fokus.',score:10,reason:'Bez významných výjimek.',impact:'Není potřeba nic hasit.',target:'work'}}
export function feedback(s,type,value){
 s.learning=s.learning||{typeBias:{},feedback:[]};s.learning.typeBias=s.learning.typeBias||{};
 s.learning.typeBias[type]=Math.max(-20,Math.min(20,(s.learning.typeBias[type]||0)+(value>0?4:-4)));
 s.learning.feedback.unshift({at:new Date().toISOString(),type,value});s.learning.feedback=s.learning.feedback.slice(0,100);
}
export function attentionCount(s){return signals(s).filter(x=>x.score>=70).length+(s.inbox||[]).filter(x=>x.status!=='DONE').length}
export function netWorth(s){
 const cash=Number(s.financePlan?.cashNow||0),fx=Number(s.xtbHub?.report?.fx?.EURCZK?.price||s.xtb?.marketEstimate?.fx?.EURCZK?.price||24.5),xtb=Number(s.xtbReport?.czkValue||0)+(Number(s.xtbReport?.eurValue||0)*fx);
 const tickets=(s.ticketBook?.items||[]).filter(x=>!['SOLD','PAYOUT RECEIVED'].includes(x.workflow)).reduce((n,x)=>n+(Number(x.buy)||0),0);
 const debts=(s.debtBook?.items||[]).filter(x=>x.status!=='PAID').reduce((n,x)=>n+debtRemaining(x),0);
 return {cash,xtb,tickets,debts,adjusted:cash+xtb+tickets*.65+debts*.8};
}
