const RESULT_BASELINE={HOME:0.44,DRAW:0.28,AWAY:0.28};
const RESULT_WEIGHT=0.50;
const OUTLIER_WEIGHT=0.25;
const BINARY_WEIGHT=0.10;
const OUTLIER_ADJUSTMENT=0.12;

function clamp(value,min=0.01,max=0.99){return Math.max(min,Math.min(max,value))}

function baselineFor(market,selection){
 const type=String(market?.type||'').toUpperCase();
 const outcome=String(selection?.outcome||'').toUpperCase();
 if(type==='MATCH_RESULT')return RESULT_BASELINE[outcome]??null;
 if(type==='BOTH_TEAMS_TO_SCORE')return ['YES','NO'].includes(outcome)?0.5:null;
 if(['OVER_UNDER','HOME_OVER_UNDER','AWAY_OVER_UNDER'].includes(type))return ['OVER','UNDER'].includes(outcome)?0.5:null;
 return null;
}

function weightFor(market){
 return String(market?.type||'').toUpperCase()==='MATCH_RESULT'?RESULT_WEIGHT:BINARY_WEIGHT;
}

export function calibratePoissonProbability(raw,market,selection){
 const p=Number(raw);
 const baseline=baselineFor(market,selection);
 if(!Number.isFinite(p)||p<=0||p>=1||!Number.isFinite(baseline))return null;
 const weight=weightFor(market);
 let calibrated=baseline+weight*(p-baseline);
 const normalAdjustment=Math.abs(p-calibrated);
 let outlier=false;
 if(String(market?.type||'').toUpperCase()==='MATCH_RESULT'&&normalAdjustment>OUTLIER_ADJUSTMENT){
  calibrated=baseline+OUTLIER_WEIGHT*(p-baseline);
  outlier=true;
 }
 return {
  probability:clamp(calibrated),
  rawProbability:p,
  baseline,
  weight:outlier?OUTLIER_WEIGHT:weight,
  adjustment:Math.abs(p-calibrated),
  outlier
 };
}

export function calibratePoissonModels(events,probabilities,sources){
 const calibrated=new Map(probabilities||[]);
 const calibratedSources=new Map(sources||[]);
 const diagnostics=[];
 let calibratedSelections=0;
 let outlierSelections=0;
 for(const event of Array.isArray(events)?events:[]){
  for(const market of Array.isArray(event?.markets)?event.markets:[]){
   for(const selection of Array.isArray(market?.selections)?market.selections:[]){
    const id=String(selection?.id??'');
    if(!id||calibratedSources.get(id)!=='football-data-poisson')continue;
    const result=calibratePoissonProbability(calibrated.get(id),market,selection);
    if(!result)continue;
    calibrated.set(id,result.probability);
    calibratedSources.set(id,'football-data-poisson-calibrated');
    calibratedSelections+=1;
    if(result.outlier)outlierSelections+=1;
    diagnostics.push({
     selectionId:id,
     eventId:event?.id??null,
     market:String(market?.type||''),
     outcome:String(selection?.outcome||''),
     rawProbability:Number(result.rawProbability.toFixed(4)),
     calibratedProbability:Number(result.probability.toFixed(4)),
     adjustmentPp:Number((result.adjustment*100).toFixed(2)),
     baseline:Number(result.baseline.toFixed(4)),
     weight:result.weight,
     outlier:result.outlier
    });
   }
  }
 }
 return {
  probabilities:calibrated,
  sources:calibratedSources,
  meta:{
   strategy:'league-neutral-shrinkage',
   resultBaseline:RESULT_BASELINE,
   resultWeight:RESULT_WEIGHT,
   resultOutlierWeight:OUTLIER_WEIGHT,
   binaryWeight:BINARY_WEIGHT,
   outlierAdjustmentPp:OUTLIER_ADJUSTMENT*100,
   calibratedSelections,
   outlierSelections,
   diagnostics
  }
 };
}
