export const TICKET_MARKET_DESK_VERSION_190=190;
const n=x=>Number(x||0)||0;
const pct=(a,b)=>b>0?(a/b-1)*100:null;
const status=x=>String(x?.market_status||x?.marketStatus||'').toUpperCase();
const name=x=>String(x?.event_name||x?.eventName||x?.name||x?.id||'Vstupenka');
const section=x=>String(x?.section||'—');

export function ticketSwapPlan190(row,{sellerFeeRate=.05,maxMarkupRate=.20}={}){
 const face=n(row?.buy_each_czk??row?.buyEachCzk),qty=Math.max(1,n(row?.qty)||1);
 if(!face)return{market:'TicketSwap',eligible:false,reason:'Chybí nominální/nákupní cena.',feeRate:sellerFeeRate,maxAskEach:null,netEach:null,netTotal:null};
 const maxAskEach=Math.round(face*(1+maxMarkupRate)*100)/100,netEach=Math.round(maxAskEach*(1-sellerFeeRate)*100)/100;
 return{market:'TicketSwap',eligible:true,feeRate:sellerFeeRate,maxMarkupRate,maxAskEach,netEach,netTotal:Math.round(netEach*qty*100)/100,roiPct:pct(netEach,face),reason:'Standardní plánovací strop: max. 120 % nominálu; seller fee 5 %. Ověř konkrétní event před listingem.'};
}

export function buildTicketMarketDeskRow190(row,source={}){
 const ask=n(row?.ask_each_czk??row?.askEachCzk)||null,buy=n(row?.buy_each_czk??row?.buyEachCzk),qty=Math.max(1,n(row?.qty)||1);
 const viagogoPrice=n(source?.consensus?.viagogo_price_czk??source?.viagogo?.market_price_czk)||null;
 const stubhubPrice=n(source?.consensus?.stubhub_price_czk??source?.stubhub?.market_price_czk)||null;
 const ts=ticketSwapPlan190(row);
 const viagogo={market:'Viagogo',listed:status(row)==='LISTED'&&!!(row?.viagogo_url||row?.viagogoUrl),url:row?.viagogo_url||row?.viagogoUrl||null,askEach:ask,marketEach:viagogoPrice,netEach:null,netTotal:null,feeKnown:false};
 const stubhub={market:'StubHub',listed:false,url:row?.stubhub_url||row?.stubhubUrl||source?.consensus?.stubhub_url||null,askEach:null,marketEach:stubhubPrice,netEach:null,netTotal:null,feeKnown:false};
 const ticketSwap={...ts,listed:false,url:null,askEach:ts.maxAskEach,marketEach:null,feeKnown:true};
 let recommendation='HOLD';let reason='Nejdřív ověř druhý resale market.';
 if(viagogo.listed&&stubhub.url){recommendation='CROSS-CHECK STUBHUB';reason='Viagogo už běží; StubHub má známý event URL, takže má smysl porovnat cenu a možnost mobilního transferu.';}
 else if(viagogo.listed){recommendation='KEEP VIAGOGO';reason='Aktivní listing existuje. TicketSwap může být cenově omezený a StubHub zatím nemá ověřený event URL.';}
 else if(stubhub.url){recommendation='CHECK STUBHUB';reason='StubHub event je známý; ověř možnost listingu a transferu.';}
 if(ask&&ts.maxAskEach&&ask>ts.maxAskEach){reason+=` TicketSwap standardní strop ${Math.round(ts.maxAskEach)} Kč je pod aktuálním ask ${Math.round(ask)} Kč.`;}
 return{id:row?.id||'',name:name(row),section:section(row),qty,buyEach:buy,buyTotal:n(row?.buy_total_czk??row?.buyTotalCzk),status:status(row),askEach:ask,markets:[viagogo,stubhub,ticketSwap],recommendation,reason};
}

export function buildTicketMarketDesk190(inventory=[],sources=new Map()){
 const active=(inventory||[]).filter(x=>['LISTED','NOT_LISTED'].includes(status(x)));
 const rows=active.map(row=>buildTicketMarketDeskRow190(row,sources?.get?.(row.id)||{}));
 const coverage={active:rows.length,viagogo:rows.filter(x=>x.markets[0].listed).length,stubhubKnown:rows.filter(x=>!!x.markets[1].url).length,ticketSwapEligible:rows.filter(x=>x.markets[2].eligible).length};
 return{version:190,rows,coverage};
}
