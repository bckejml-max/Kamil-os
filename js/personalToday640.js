import {store} from './state.js';
import {h,qs} from './utils.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {personalActions640} from './personalActions640.js';
import {answerPersonalQuestion640} from './personalAsk640.js';

const badge=x=>x.level==='critical'?'DŮLEŽITÉ':x.level==='high'?'BRZY':x.level==='medium'?'HLÍDAT':'POZDĚJI';
const go=route=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:route}));
const hour=()=>new Date().getHours();
const greeting=()=>hour()<11?'Dobré ráno.':hour()<18?'Dobré odpoledne.':'Dobrý večer.';
const actionHtml=(x,i)=>`<article class="ux64-action ux64-${h(x.level)}"><div class="ux64-action-top"><span class="ux64-rank">${i+1}</span><span class="ux64-badge">${badge(x)}</span><span class="ux64-time">${h(String(x.minutes))} min</span></div><h2>${h(x.title)}</h2><p>${h(x.why)}</p><div class="ux64-next">${h(x.next)}</div><button class="btn primary" data-ux64-go="${h(x.route)}">Otevřít</button></article>`;

export function renderPersonalToday640(){
 ensurePersonalVault640();
 const s=store.get(),vault=personalVault640(s),actions=personalActions640(s),host=qs('#todayView');if(!host)return;
 const top=actions.top3,askId='ux64AskInput';
 host.innerHTML=`<div class="ux64-page"><section class="ux64-hero"><div class="eyebrow">KAMIL OS 64.0 / DNES</div><h1>${greeting()}</h1><p>${top.length?`Máš ${top.length} ${top.length===1?'věc':'věci'}, které stojí za řešení.`:'Dnes nic osobního nehoří.'}</p></section>
 <section class="ux64-actions">${top.length?top.map(actionHtml).join(''):'<div class="card ux64-clear"><b>Všechno důležité je teď v pořádku.</b><p class="muted">Můžeš se podívat dopředu nebo se zeptat na osobní data.</p></div>'}</section>
 <section class="card ux64-ask"><div class="eyebrow">ZEPTEJ SE KAMIL OS</div><h2>Co chceš vědět o svých osobních věcech?</h2><div class="ux64-ask-row"><input id="${askId}" placeholder="Např. Kolik mě stojí pojistky ročně?"><button class="btn primary" id="ux64AskBtn">Zeptat se</button></div><div id="ux64AskResult" class="ux64-answer muted">Odpovídám jen z uložených osobních dat. Když něco nevím, řeknu to.</div></section>
 <section class="card ux64-data-health"><div><div class="eyebrow">OSOBNÍ DATA</div><h2>${vault.coverage}% pokrytí</h2><p class="muted">${vault.action.length?`${vault.action.length} údajů ještě stojí za ověření.`:'Základní osobní údaje jsou v pořádku.'}</p></div><div class="ux64-progress"><span style="width:${Math.max(0,Math.min(100,vault.coverage))}%"></span></div><button class="btn" data-ux64-go="more">Dokumenty a data</button></section></div>`;
 host.querySelectorAll('[data-ux64-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.ux64Go)));
 const input=host.querySelector(`#${askId}`),result=host.querySelector('#ux64AskResult');
 const run=()=>{const a=answerPersonalQuestion640(input.value,s);result.classList.remove('muted');result.innerHTML=`<b>${h(a.title)}</b>${a.body?`<p>${h(a.body)}</p>`:''}${a.lines?.length?`<ul>${a.lines.map(x=>`<li>${h(x)}</li>`).join('')}</ul>`:''}`};
 host.querySelector('#ux64AskBtn')?.addEventListener('click',run);input?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}});
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_640_LAST__={at:Date.now(),view:'today',top:top.map(x=>x.title),coverage:vault.coverage};
}
