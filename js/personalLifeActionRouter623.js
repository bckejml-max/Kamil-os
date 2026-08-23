import {store} from './state.js';
import {personalLifeSuite626,openPersonalLifeFeature626} from './personalLifeSuite626.js';

const ORDER=['today','waiting','expiry','renewals','maintenance','admin','familyCalendar','familyTodos','documents','finance','subscriptions','purchases','homeProjects','inbox','healthAdmin','weekend','wishlist','scoreboard','sunday'];

export function personalLifeActionRouter623(s=store.get()){
 const x=personalLifeSuite626(s),rows=ORDER.map(key=>({key,...x.features[key]})).filter(v=>v&&v.name).sort((a,b)=>Number(b.count||0)-Number(a.count||0));
 const main={key:x.commander.feature,title:x.commander.title,reason:x.commander.reason};
 return{main,rows,top:rows.slice(0,6),recovery:x.recovery,confidence:x.confidence,summary:`${main.title} · ${main.reason}`};
}

export function openPersonalLifeRoute623(key){
 return openPersonalLifeFeature626(key);
}
