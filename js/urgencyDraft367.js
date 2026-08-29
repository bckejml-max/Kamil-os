const VERSION=367;
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function topic(x){return clean(x?.title||x?.reason||'této věci')}
function tone(x){const days=Number(x?.waitingAgeDays||0);return days>=7?'firm':days>=4?'nudge':'soft'}
function draftFor(x){if(!x)return null;const who=clean(x.waitingFor),t=topic(x),mode=tone(x),hello=who?`Dobrý den, ${who},`:'Dobrý den,';let body='';if(mode==='firm')body=`připomínám prosím ${t}. Potřebuji se v této věci posunout dál, můžete mi prosím potvrdit aktuální stav nebo termín?`;else if(mode==='nudge')body=`vracím se prosím k ${t}. Můžete mi dát vědět, jaký je aktuální stav a kdy můžu čekat posun?`;else body=`vracím se prosím k ${t}. Můžete mi dát vědět aktuální stav?`;return{version:VERSION,executionId:x.executionId||'',waitingFor:who,topic:t,tone:mode,text:`${hello}\n\n${body}\n\nDěkuji.`,days:Number(x.waitingAgeDays||0),at:Date.now()}}
function find(executionId){return window.__KAMIL_EXECUTION_STATE364__?.model?.queue?.find(x=>x.executionId===executionId)||null}
function buildUrgencyDraft(executionId){return draftFor(find(executionId))}
function publish(){window.__KAMIL_URGENCY367__={version:VERSION,healthy:true,draftFor,buildUrgencyDraft,at:Date.now()}}
export function installUrgencyDraft367(){document.documentElement.dataset.urgency367='1';publish()}
