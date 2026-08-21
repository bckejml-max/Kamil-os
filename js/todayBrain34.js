import {buildPersonalToday} from './personalToday26.js';
import {directorBriefing34} from './director34.js';
import {ticketMarketBrain34} from './ticketBrain34.js';
import {totalInvestmentPortfolio34,monthlyInvestmentPlan34} from './totalPortfolio34.js';
import {waitingFor35} from './followUp35.js';

const tone=p=>Number(p)>=90?'bad':Number(p)>=75?'warn':'good';
const item=(title,reason,priority,target,kind,extra={})=>({title,reason,priority:Number(priority||0),target,kind,tone:tone(priority),...extra});

export function todayBrain34(state={},now=new Date()){
 const out=[],director=directorBriefing34(state,now),tickets=ticketMarketBrain34(state,now),waiting=waitingFor35(state,now),portfolio=totalInvestmentPortfolio34(state),budget=Number(state.financePlan?.plannedInvestment||0),plan=monthlyInvestmentPlan34(state,budget||25000);
 for(const x of waiting.rows.slice(0,4)){if(x.priority<78)continue;out.push(item(x.action==='REPLY_DETECTED'?`Přišla odpověď · ${x.title}`:`Follow-up · ${x.title}`,x.reason,x.priority,'waiting','Waiting For',{id:x.id}))}
 for(const x of director.top.slice(0,5)){if(x.priority<72)continue;out.push(item(x.title,x.detail+(x.days!==null?` · ${x.days<0?`${Math.abs(x.days)} dní po termínu`:x.days===0?'dnes':`za ${x.days} dní`}`:''),x.priority,'director','Ředitel',{id:x.id}))}
 for(const x of tickets.rows.slice(0,5)){if(x.priority<80)continue;out.push(item(`${x.eventName} · ${x.action==='VERIFY_DATA'?'opravit data':x.action==='SELL_NOW'?'prodat teď':x.action==='REPRICE'?'zlevnit':x.action==='LIST_NOW'?'vystavit':'zkontrolovat'}`,x.reason,x.priority,'tickets','Vstupenky',{id:x.ticketId}))}
 if(!plan.ok&&budget>0)out.push(item('Investiční vklad je blokovaný',plan.message||plan.routing?.reason,96,'money','Peníze'));
 else if(portfolio.complete&&portfolio.buckets?.broad&&budget>0){const b=portfolio.buckets.broad,t=Number(b.targetPct||55);if(b.pct<t-5)out.push(item('Další vklad: dorovnat široké ETF',`Celé portfolio má ${b.pct.toFixed(1)} % širokých ETF proti cíli ${t.toFixed(1)} %. Efekta je už započítaná.`,78,'money','Investice'));else if(plan.ok)out.push(item('Měsíční investiční plán je připravený',`Rozpočet ${Math.round(plan.budget).toLocaleString('cs-CZ')} Kč je rozdělený podle celého portfolia; odchylka klesne z ${Number(plan.beforeDriftPct||0).toFixed(1)} % na ${Number(plan.afterDriftPct||0).toFixed(1)} %.`,62,'money','Investice'))}
 for(const x of buildPersonalToday(state,now)){if(x.priority<72)continue;out.push(item(x.title,x.reason,x.priority,x.target||x.domain||'today',x.kind||'Osobní',{id:x.id}))}
 const seen=new Set(),rows=out.sort((a,b)=>b.priority-a.priority||a.title.localeCompare(b.title,'cs-CZ')).filter(x=>{const key=`${x.target}|${String(x.id||x.title).toLowerCase()}`;if(seen.has(key))return false;seen.add(key);return true}).slice(0,5).map((x,i)=>({...x,rank:i+1}));
 return {rows,top:rows[0]||null,critical:rows.filter(x=>x.priority>=90).length,director,tickets,waiting,portfolio,plan,note:'Jeden společný žebříček přes práci, follow-upy, vstupenky, investice a osobní termíny. Priorita neznamená automatické provedení; jen pořadí, co má největší smysl řešit.'};
}
