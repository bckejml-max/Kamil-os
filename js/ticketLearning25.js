import {ticketLessons} from './ticketLessons25.js';

const n=v=>Number(v||0);
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));

function category(name=''){
 const s=String(name).toLocaleLowerCase('cs-CZ');
 if(/sparta|slavia|fotbal|fc |fk |ac |vs |liga|champions|euro|world cup|česko|cesko/.test(s))return 'Fotbal';
 if(/festival|concert|koncert|music|mars|bad bunny|elán|elan|asap|o2/.test(s))return 'Koncerty';
 if(/clash|mma|ufc|box|fight/.test(s))return 'Combat';
 return 'Ostatní';
}

const evidenceLabel=(globalTrades,categoryTrades)=>{
 if(globalTrades<4)return `málo historie (${globalTrades}/4 realizované obchody)`;
 if(categoryTrades<3)return `málo historie v kategorii (${categoryTrades}/3)`;
 return `${categoryTrades} realizované obchody v kategorii`;
};

export function ticketLearningAdvice(opportunity,s={}){
 const lessons=ticketLessons(s),cat=category(opportunity?.name),group=lessons.categories.find(x=>x.category===cat)||null;
 const globalReady=lessons.trades>=4,categoryReady=(group?.trades||0)>=3;
 let recommendedQty=null,risk='neutral',note='Historie zatím není dost silná, aby měnila nákupní rozhodnutí.';
 if(globalReady){
   recommendedQty=lessons.roi!==null&&lessons.roi<0?2:3;
   if(lessons.trades>=8&&Number(lessons.roi||0)>=15&&Number(lessons.hitRate||0)>=60)recommendedQty=4;
 }
 if(categoryReady){
   if(group.roi<0||group.hitRate<45){recommendedQty=Math.min(recommendedQty||2,2);risk='high';note=`${cat} má v realizované historii slabší výsledek (${group.roi.toFixed(1)} % ROI, ${Math.round(group.hitRate)} % win rate).`}
   else if(group.trades>=4&&group.roi>=20&&group.hitRate>=60){recommendedQty=Math.max(recommendedQty||3,3);risk='low';note=`${cat} má zatím silnější realizovanou historii (${group.roi.toFixed(1)} % ROI, ${Math.round(group.hitRate)} % win rate).`}
   else{risk='medium';note=`${cat} má dost vzorků pro opatrné použití historie (${group.roi.toFixed(1)} % ROI, ${Math.round(group.hitRate)} % win rate).`}
 }
 return {category:cat,globalTrades:lessons.trades,categoryTrades:group?.trades||0,globalReady,categoryReady,recommendedQty,risk,note,evidence:evidenceLabel(lessons.trades,group?.trades||0)};
}

export function applyTicketLearning(opportunity,s={},decision={}){
 const a=ticketLearningAdvice(opportunity,s);
 if(!a.globalReady)return {...decision,learning:a};
 const qtyText=a.recommendedQty?` Doporučený první nákup: max ${a.recommendedQty} ks.`:'';
 const learnedReason=`${decision.reason||''}${decision.reason?' ':''}${a.note}${qtyText}`.trim();
 let action=decision.action,priority=n(decision.priority),tone=decision.tone;
 if(!decision.live&&a.categoryReady&&a.risk==='high'&&action==='BUY'){
   action='REVIEW';priority=Math.max(priority,84);tone='warn';
 }
 return {...decision,action,priority:clamp(priority),tone,reason:learnedReason,recommendedQty:a.recommendedQty,learning:a,source:decision.source||'HISTORIE'};
}
