const n=v=>Number(v||0);
const qty=x=>Math.max(1,n(x.qty)||1);
const realized=x=>Number.isFinite(Number(x.sell))&&Number(x.sell)!==0;
const profit=x=>n(x.sell)-n(x.buy)-n(x.fees);
const roi=x=>n(x.buy)>0?profit(x)/n(x.buy)*100:null;

function category(name=''){
 const s=String(name).toLocaleLowerCase('cs-CZ');
 if(/sparta|slavia|fotbal|fc |fk |ac |vs |liga|champions|euro|world cup|česko|cesko/.test(s))return 'Fotbal';
 if(/festival|concert|koncert|music|mars|bad bunny|elán|elan|asap|o2/.test(s))return 'Koncerty';
 if(/clash|mma|ufc|box|fight/.test(s))return 'Combat';
 return 'Ostatní';
}

function tradeRows(s){
 const all=[...(s.ticketBook?.history||[]),...(s.ticketBook?.items||[])];
 const seen=new Set();
 return all.filter(realized).filter(x=>{
   const key=x.id||`${x.name}|${x.date}|${x.buy}|${x.sell}|${x.qty}`;
   if(seen.has(key))return false;seen.add(key);return true;
 }).map(x=>({...x,lessonProfit:profit(x),lessonRoi:roi(x),lessonCategory:category(x.name)}));
}

function byCategory(trades){
 const m=new Map();
 for(const t of trades){
   const k=t.lessonCategory;
   if(!m.has(k))m.set(k,{category:k,trades:0,profit:0,buy:0,wins:0,qty:0});
   const g=m.get(k);g.trades++;g.profit+=t.lessonProfit;g.buy+=n(t.buy);g.qty+=qty(t);if(t.lessonProfit>0)g.wins++;
 }
 return [...m.values()].map(g=>({...g,roi:g.buy>0?g.profit/g.buy*100:null,hitRate:g.trades?g.wins/g.trades*100:0,avgQty:g.trades?g.qty/g.trades:0})).sort((a,b)=>b.profit-a.profit);
}

function lessonText(trades,categories){
 if(!trades.length)return ['Zatím není dost realizovaných obchodů na spolehlivé poučení.'];
 const out=[];
 const best=categories[0],worst=[...categories].sort((a,b)=>a.profit-b.profit)[0];
 if(best?.profit>0)out.push(`${best.category}: zatím nejsilnější realizovaná kategorie (${Math.round(best.hitRate)} % ziskových obchodů).`);
 if(worst?.profit<0)out.push(`${worst.category}: zatím nejslabší realizovaná kategorie; další nákup držet menší, dokud se výsledek nezlepší.`);
 const big=trades.filter(t=>qty(t)>=4),small=trades.filter(t=>qty(t)<=2);
 const avg=a=>a.length?a.reduce((z,x)=>z+x.lessonProfit,0)/a.length:0;
 if(big.length>=2&&small.length>=2&&avg(big)<avg(small))out.push('Větší balíky mají horší průměrný realizovaný výsledek než malé pozice; preferuj menší počáteční zásobu a dokupuj až po potvrzení poptávky.');
 const losses=trades.filter(t=>t.lessonProfit<0),lossShare=losses.length/trades.length*100;
 if(lossShare>=40)out.push(`Ztrátových je ${Math.round(lossShare)} % realizovaných obchodů; BUY radar má být selektivnější než agresivnější.`);
 if(!out.length)out.push('Historie zatím neukazuje výrazný strukturální problém; drž disciplínu velikosti pozice a floor ceny.');
 return out.slice(0,3);
}

export function ticketLessons(s){
 const trades=tradeRows(s),categories=byCategory(trades);
 const totalBuy=trades.reduce((z,x)=>z+n(x.buy),0),totalProfit=trades.reduce((z,x)=>z+x.lessonProfit,0),wins=trades.filter(x=>x.lessonProfit>0).length;
 const best=[...trades].sort((a,b)=>b.lessonProfit-a.lessonProfit)[0]||null,worst=[...trades].sort((a,b)=>a.lessonProfit-b.lessonProfit)[0]||null;
 return {
   trades:trades.length,totalBuy,totalProfit,roi:totalBuy>0?totalProfit/totalBuy*100:null,hitRate:trades.length?wins/trades.length*100:null,
   best,worst,categories,lessons:lessonText(trades,categories),
   evidence:'Pouze realizované obchody s nenulovou hodnotou sell; neprodané a otevřené pozice nejsou do lessons započítané.'
 };
}
