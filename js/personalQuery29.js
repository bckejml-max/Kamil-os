import {personalQuery as baseQuery} from './autopilot28.js';
import {goalPlan,priceHistory,changeFeed,reminderEscalation,onboardingWizard} from './personalPlus29.js';
import {personalCopilot30} from './personalCopilot30.js';

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').trim();
const money=(v,c)=>`${Math.round(Number(v)||0).toLocaleString('cs-CZ')} ${c}`;

export function personalQuery(raw,s={},meta={},now=new Date()){
 const q=norm(raw);if(!q)return null;
 const copilot=personalCopilot30(raw,s,meta,now);if(copilot)return copilot;
 if(q.includes('cil')||q.includes('fond')){
  const g=goalPlan(s,now);return {title:'Cíle a fondy',lines:g.items.slice(0,10).map(x=>`${x.title} — ${x.remaining===null?'chybí cílová částka':`zbývá ${money(x.remaining,x.currency)}`}${x.requiredMonthly!==null?` · potřebné tempo ${money(x.requiredMonthly,x.currency)}/měs`:''}`),note:g.note};
 }
 if(q.includes('zdrazil')||q.includes('zdrazilo')||q.includes('zlevnil')||q.includes('zlevnilo')||q.includes('historie cen')){
  const p=priceHistory(s);return {title:'Skutečné změny uložených cen',lines:p.top.map(x=>`${x.title} — ${x.previous===null?'bez srovnání':`${money(x.previous,x.currency)} → ${money(x.current,x.currency)} (${x.deltaPct>0?'+':''}${Number(x.deltaPct||0).toFixed(1)} %)`}`),note:p.note};
 }
 if(q.includes('co se zmenilo')||q.includes('zmeny za')||q.includes('change feed')){
  const f=changeFeed(s,now,30);return {title:'Co se změnilo za 30 dní',lines:f.items.slice(0,12).map(x=>`${x.title} — ${new Date(x.at).toLocaleDateString('cs-CZ')}`),note:f.note};
 }
 if(q.includes('pripom')||q.includes('eskalac')||q.includes('po terminu')){
  const r=reminderEscalation(s,now);return {title:'Eskalace osobních termínů',lines:r.top.map(x=>`${x.label}: ${x.title} — ${x.detail}`),note:r.note};
 }
 if(q.includes('onboarding')||q.includes('co doplnit dnes')||q.includes('co chybi nejvic')){
  const o=onboardingWizard(s,meta,now);return {title:'Co doplnit jako první',lines:o.steps.map(x=>`${x.rank}. ${x.title} — ${x.detail}`),note:o.note};
 }
 return baseQuery(raw,s,meta,now);
}
