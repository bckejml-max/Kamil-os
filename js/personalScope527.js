const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|projektov[aá] karta|pracovn|xtb|ticket|vstupenk/i;
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const PERSONAL_AREAS=new Set(['osobni','personal','rodina','domov','home','money','penize','documents','dokumenty']);

export function personalScopeText527(x={}){
 return `${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.summary||''} ${x?.category||''} ${x?.area||''} ${x?.project||''} ${x?.reason||''} ${x?.action||''}`;
}

export function isExplicitPersonal527(x={}){
 const area=norm(x?.area),category=norm(x?.category);
 if(PERSONAL_AREAS.has(area))return true;
 if(category.startsWith('osobni '))return true;
 return ['rodina','domov','dokumenty'].includes(category);
}

export function isPersonalScope527(x={}){
 if(isExplicitPersonal527(x))return true;
 return !WORK_RE.test(personalScopeText527(x));
}

export {WORK_RE as PERSONAL_WORK_RE527};
