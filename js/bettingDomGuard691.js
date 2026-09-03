export const BETTING_DOM_GUARD_VERSION='691.0.0';

const SOURCE_SELECTOR='.bet144,.bet144-metrics,.bet144-scanner,.bet144-scanbody,.bet144-pick';

function touchesSource(node){
 if(!node||node.nodeType!==1)return false;
 return !!(node.matches?.(SOURCE_SELECTOR)||node.querySelector?.(SOURCE_SELECTOR));
}

export function bettingSourceMutation691(records){
 for(const record of Array.from(records||[])){
  for(const node of Array.from(record?.addedNodes||[]))if(touchesSource(node))return true;
  for(const node of Array.from(record?.removedNodes||[]))if(touchesSource(node))return true;
 }
 return false;
}
