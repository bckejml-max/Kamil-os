import {dayDiff} from './utils.js';

const n=v=>Number(v||0);
const upper=v=>String(v||'').toUpperCase();
const pct=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));

export const actionTone=action=>({BUY:'good',HOLD:'',TRIM:'warn',SELL:'bad',REVIEW:'warn',LIST:'warn',REPRICE:'warn',WAIT:'',SKIP:'bad'}[action]||'');
export const actionLabel=action=>({BUY:'PŘIKOUPIT',HOLD:'DRŽET',TRIM:'REDUKOVAT',SELL:'PRODAT',REVIEW:'PROVĚŘIT',LIST:'VYSTAVIT',REPRICE:'UPRAVIT CENU',WAIT:'ČEKAT',SKIP:'NEKUPOVAT'}[action]||action||'DRŽET');

export function xtbDataAge(s){
 const raw=s.xtbHub?.asOf||s.xtbReport?.asOf||s.xtbHub?.updatedAt;
 if(!raw)return {days:null,label:'bez data',stale:true,raw:null};
 const ms=Date.now()-new Date(raw).getTime();
 const days=Math.max(0,Math.floor(ms/86400000));
 return {days,label:days===0?'dnes':days===1?'1 den':`${days} dní`,stale:days>=2,raw};
}

export function xtbPositions(s){
 const accounts=s.xtbHub?.accounts||s.xtbHub?.report?.accounts||{};
 const out=[];
 for(const [accountId,a] of Object.entries(accounts)){
  for(const p of a?.positions||[]){
   out.push({...p,accountId,accountCurrency:a.currency||p.currency||'',accountValue:n(a.value),weightPct:n(a.value)>0?n(p.value)/n(a.value)*100:0});
  }
 }
 return out;
}

function xtbAutoDecision(p){
 const gain=pct(p.net_profit_pct),weight=pct(p.weightPct),category=upper(p.category),isEtf=category==='ETF';
 const broadEtf=isEtf&&!/HEALTH|SECTOR|TECH|ENERGY|FINANC/i.test(String(p.name||''));
 let action='HOLD',priority=35,when='Teď nic neměnit',reason='',buyRule='',sellRule='';
 if(isEtf){
   if(weight>=35){action='TRIM';priority=72;when='Při dalším rebalancování';reason='ETF tvoří příliš velkou část účtu.';buyRule='Nepřikupovat, dokud váha neklesne pod plán.';sellRule='Snížit při váze nad 35 % účtu.'}
   else if(gain<=-8){action='BUY';priority=66;when='Po částech, ne jedním nákupem';reason=broadEtf?'Široký ETF je v drawdownu; vhodnější je pravidelné přikupování než panický prodej.':'ETF je v poklesu; přikupovat jen pokud stále sedí jeho role v portfoliu.';buyRule='1/3 plánované částky nyní, další část až při dalším poklesu přibližně o 5 %.';sellRule='Prodávat hlavně při změně alokace nebo investičního plánu.'}
   else{action='HOLD';priority=38;when='Držet a přikupovat podle měsíčního plánu';reason=broadEtf?'Jádrový ETF není potřeba časovat podle malého krátkodobého P/L.':'Pozice je bez extrémního signálu.';buyRule='Pravidelný nákup; větší přikoupení až při výraznějším poklesu.';sellRule='Prodat jen při změně alokace, cíle nebo dlouhodobé teze.'}
  }else{
   if(gain>=40){action='TRIM';priority=90;when='Zvážit částečný výběr zisku už teď';reason=`Pozice je přibližně +${gain.toFixed(1)} %. U jednotlivé akcie roste riziko vrácení části zisku.`;buyRule='Nepřikupovat po prudkém růstu; čekat na konsolidaci nebo lepší vstup.';sellRule='Odprodat část při +40 % a více, případně dřív pokud pozice překročí 10–12 % účtu.'}
   else if(gain>=25){action='TRIM';priority=76;when='Držet jádro, připravit částečný prodej';reason=`Zisk +${gain.toFixed(1)} % už stojí za ochranu.`;buyRule='Nový nákup až po smysluplném pullbacku a potvrzení teze.';sellRule='Částečně redukovat při +30 až +40 % nebo při příliš vysoké váze.'}
   else if(gain<=-15){action='REVIEW';priority=88;when='Nejdřív prověřit tezi, až potom cokoli dokupovat';reason=`Ztráta ${gain.toFixed(1)} % je už dost velká na nové vyhodnocení firmy.`;buyRule='Nepřikupovat jen proto, že je pozice levnější. Přikoupit až po potvrzení fundamentu/katalyzátoru.';sellRule='Prodat, pokud se zhoršil důvod nákupu nebo riziko překročilo původní plán.'}
   else if(gain<=-8){action='REVIEW';priority=69;when='Držet bez automatického průměrování';reason=`Pozice je ${gain.toFixed(1)} % pod nákupem.`;buyRule='Přikoupit jen po potvrzení, že investiční teze stále platí.';sellRule='Exit při porušení teze; ne podle samotného procenta ztráty.'}
   else if(weight>=12){action='TRIM';priority=79;when='Při nejbližší vhodné likviditě snížit koncentraci';reason=`Pozice tvoří ${weight.toFixed(1)} % účtu.`;buyRule='Další nákup až po snížení váhy.';sellRule='Redukovat nad 10–12 % účtu, pokud nejde o záměrně koncentrovanou pozici.'}
   else if(gain<=-3){action='HOLD';priority=46;when='Držet, sledovat další výsledky';reason='Běžný pokles sám o sobě není důvod prodávat ani bezhlavě přikupovat.';buyRule='Přikupovat až při lepším poměru cena/riziko a potvrzení teze.';sellRule='Prodat při zhoršení teze, ne kvůli malému mínusu.'}
   else{action='HOLD';priority=40;when='Držet';reason='Pozice nemá podle aktuálního importu extrémní P/L ani koncentraci.';buyRule='Přikoupit při lepším vstupu nebo po pozitivním potvrzení fundamentu.';sellRule='Redukovat při +30 až +40 %, vysoké koncentraci nebo změně teze.'}
  }
 return {action,priority:clamp(priority),when,reason,buyRule,sellRule,source:'AUTO'};
}

export function xtbDecision(p,s){
 const auto=xtbAutoDecision(p),o=s.xtbStrategy?.overrides?.[p.ticker];
 if(!o?.action)return {...auto,tone:actionTone(auto.action)};
 const action=upper(o.action);
 return {action,priority:clamp(n(o.priority)||85),when:o.when||auto.when,reason:o.reason||auto.reason,buyRule:o.buyRule||auto.buyRule,sellRule:o.sellRule||auto.sellRule,source:'RUČNĚ',tone:actionTone(action)};
}

export function xtbBoard(s){
 return xtbPositions(s).map(p=>({p,d:xtbDecision(p,s)})).sort((a,b)=>b.d.priority-a.d.priority);
}

export function ticketDecision(x){
 const days=x.date?dayDiff(x.date):999,flow=upper(x.workflow||'HOLD'),qty=Math.max(1,n(x.qty)||1),buyPer=n(x.buy)/qty,list=n(x.listPrice),market=n(x.marketPrice),floor=n(x.floorPrice)||buyPer,maxBuy=n(x.maxBuyPrice),sellBy=x.sellBy?dayDiff(x.sellBy):null;
 let action='HOLD',priority=35,when='Držet',reason='',buyRule='',sellRule='';
 if(['SOLD','PAYOUT WAIT','PAYOUT RECEIVED'].includes(flow)){
  action='WAIT';priority=flow==='PAYOUT WAIT'?76:20;when=flow==='PAYOUT WAIT'?'Hlídát výplatu':'Obchod už je uzavřený';reason=flow==='PAYOUT WAIT'?'Prodej je hotový, riziko je už jen výplata.':'Pozice není určena k dalšímu prodeji.';buyRule='—';sellRule='—';
 }else if(flow==='LISTED'){
  if(days<=3){action='SELL';priority=98;when='Prodat teď';reason='Do akce zbývají maximálně 3 dny. Priorita je likvidita, ne maximální marže.';buyRule='Další kusy už nekupovat.';sellRule=`Jít postupně k floor ceně${floor?` ${Math.round(floor).toLocaleString('cs-CZ')} Kč/ks`:''}.`}
  else if(days<=7){action='REPRICE';priority=90;when='Zkontrolovat a případně zlevnit dnes';reason='Čas do akce se krátí a riziko neprodaných kusů rychle roste.';buyRule='Nepřikupovat bez jasného arbitrážního rozdílu.';sellRule='Být mezi nejlevnějšími relevantními nabídkami; nenechat listing bez kontroly déle než 24 h.'}
  else if(market&&list&&list>market*1.10){action='REPRICE';priority=82;when='Srovnat cenu s trhem';reason='Listing je více než 10 % nad zadanou tržní cenou.';buyRule='Nepřikupovat, dokud se nepotvrdí poptávka.';sellRule='Snížit směrem k trhu, pokud není důvod čekat na růst poptávky.'}
  else if(sellBy!==null&&sellBy<=0){action='SELL';priority=92;when='Dosáhl jsi vlastního sell-by termínu';reason='Strategický termín pro výstup už nastal.';buyRule='Nenavyšovat pozici.';sellRule='Priorita je prodat alespoň nad floor cenou.'}
  else{action='HOLD';priority=55;when='Držet listing, kontrola každé 1–2 dny';reason='Je dost času a cena nemá podle zadaných dat zjevný problém.';buyRule=maxBuy?`Přikoupit jen pod ${Math.round(maxBuy).toLocaleString('cs-CZ')} Kč/ks.`:'Přikoupit jen při výrazně lepší ceně než stávající nákup.';sellRule=days<=14?'Začít postupně chránit prodejní cenu.':'Držet cílovou cenu, ale sledovat srovnatelné nabídky.'}
 }else{
  if(days<=5){action='SELL';priority=97;when='Vystavit / prodat okamžitě';reason='Pozice je stále HOLD těsně před akcí.';buyRule='Už nepřikupovat.';sellRule='Vystavit dnes a každý den kontrolovat cenu.'}
  else if(days<=14){action='LIST';priority=86;when='Vystavit do prodeje teď';reason='Ideální okno na čekání už se zkracuje.';buyRule='Další nákup jen s okamžitou marží a jasnou poptávkou.';sellRule='Začít výše, ale mít připravenou floor cenu pro poslední týden.'}
  else if(days<=30){action='LIST';priority=70;when='Připravit listing během několika dnů';reason='Akce se blíží do měsíce; je čas začít testovat poptávku.';buyRule=maxBuy?`Přikoupit pouze do ${Math.round(maxBuy).toLocaleString('cs-CZ')} Kč/ks.`:'Přikoupit jen při ceně výrazně pod očekávaným resale.';sellRule='Vystavit s cílovou marží a kontrolovat trh alespoň 2× týdně.'}
  else if(market&&maxBuy&&market<=maxBuy){action='BUY';priority=74;when='Přikoupit pouze pokud máš stále volný kapitál';reason='Zadaná tržní cena je pod tvým maximem pro nákup.';buyRule=`Max ${Math.round(maxBuy).toLocaleString('cs-CZ')} Kč/ks; aktuálně zadaný trh ${Math.round(market).toLocaleString('cs-CZ')} Kč/ks.`;sellRule='Po nákupu nastavit listing a sell-by termín.'}
  else{action='HOLD';priority=42;when='Držet a sledovat poptávku';reason='Do akce je zatím dost času.';buyRule=maxBuy?`Další kusy jen do ${Math.round(maxBuy).toLocaleString('cs-CZ')} Kč/ks.`:'Stanovit maximální nákupní cenu před dalším nákupem.';sellRule='Začít aktivně prodávat přibližně 3–4 týdny před akcí.'}
 }
 return {action,priority:clamp(priority),when,reason,buyRule,sellRule,tone:actionTone(action),days,market,buyPer,list,floor};
}

export function ticketOpportunityDecision(x){
 const sale=x.saleAt?dayDiff(x.saleAt):null,event=x.date?dayDiff(x.date):null,maxBuy=n(x.maxBuyPrice),target=n(x.targetResale),margin=maxBuy>0&&target>0?(target-maxBuy)/maxBuy*100:null;
 if(upper(x.status)==='BOUGHT')return {action:'HOLD',priority:20,when:'Už nakoupeno',reason:'Příležitost je převedená do pozice.',tone:''};
 if(margin!==null&&margin<15)return {action:'SKIP',priority:75,when:'Nekupovat za zadané maximum',reason:`Potenciální hrubá marže je jen ${margin.toFixed(1)} %.`,tone:'bad'};
 if(sale!==null&&sale<0)return {action:'REVIEW',priority:80,when:'Prodej už začal',reason:'Presale/on-sale termín je v minulosti. Zkontroluj dostupnost a sekundární trh.',tone:'warn'};
 if(sale!==null&&sale<=1)return {action:'BUY',priority:92,when:sale===0?'Nákupní okno je dnes':'Nákupní okno je zítra',reason:margin===null?'Je potřeba rychle ověřit cenu a poptávku.':`Plánovaná hrubá marže při max nákupu je ${margin.toFixed(1)} %.`,tone:'good'};
 if(sale!==null&&sale<=7)return {action:'WAIT',priority:66,when:`Připravit se – prodej za ${sale} d`,reason:margin===null?'Doplň max nákup a cílový resale.':`Cíl: nekoupit nad ${Math.round(maxBuy).toLocaleString('cs-CZ')} Kč.`,tone:''};
 return {action:'WAIT',priority:40,when:sale===null?'Čeká na termín prodeje':`Prodej za ${sale} d`,reason:event!==null?`Akce je za ${event} d.`:'Sleduj oficiální on-sale/presale.',tone:''};
}
