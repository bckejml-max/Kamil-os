const N=v=>v===undefined||v===null||v===''?null:Number.isFinite(Number(v))?Number(v):null;
const first=(x,keys)=>{for(const k of keys)if(x?.[k]!==undefined&&x?.[k]!==null&&x?.[k]!=='')return x[k];return null};
export function adaptTicketMarket(ticket={}){
 const market=N(first(ticket,['marketPrice','currentPrice','askPrice','listPrice'])),buy=N(first(ticket,['buyPrice','purchasePrice','cost','pricePaid'])),rawFees=N(first(ticket,['fees','fee','platformFee'])),fees=rawFees??0,observedAt=first(ticket,['marketObservedAt','priceObservedAt','marketUpdatedAt','updatedAt']),source=String(first(ticket,['marketSource','priceSource','source'])||'manual/unknown'),error=first(ticket,['marketError','priceError']);
 const expectedNet=market===null||buy===null?null:market-fees-buy,marginPct=expectedNet===null||!buy?null:expectedNet/buy*100,confidence=error?'LOW':market!==null&&observedAt?'HIGH':market!==null?'MEDIUM':'LOW';
 return{ticketId:ticket.id||null,market,buy,fees,feesKnown:rawFees!==null,expectedNet,marginPct,source,observedAt:observedAt||null,confidence,error:error?String(error):null,complete:market!==null&&buy!==null};
}
export function ticketMarketContract(){return{fields:['market','buy','fees','feesKnown','expectedNet','marginPct','source','observedAt','confidence','error'],noInventedMarketPrice:true,noInventedFees:true,missingIsNull:true}}
