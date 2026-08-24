const personalScore=a=>a?.level==='critical'?110:a?.level==='high'?85:a?.level==='medium'?60:a?40:0;

export function rankOneBestMove673({personal=null,ticket=null,money=null}={}){
 const rows=[];
 if(personal)rows.push({kind:'personal',score:personalScore(personal),title:personal.title,label:'OSOBNÍ',reason:personal.why||personal.next||'',cta:personal.cta||'Vyřešit',source:personal});
 if(ticket)rows.push({...ticket,score:Number(ticket.priority||ticket.score||0),kind:'ticket'});
 if(money)rows.push(money);
 rows.sort((a,b)=>b.score-a.score||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 return{best:rows[0]||null,alternatives:rows.slice(1),all:rows};
}
