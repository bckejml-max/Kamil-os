import {decisionNext30} from './js/decisionNext30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};

const source={action:'TRIM',when:'Zvážit částečný výběr zisku už teď',buyRule:'Nepřikupovat po prudkém růstu.',sellRule:'Odprodat část při +40 % a více.'};
const before=JSON.stringify(source),out=decisionNext30(source);
assert(JSON.stringify(source)===before,'30.4 Next Trigger must not mutate source decision');
assert(out.action==='TRIM','real action preserved');
assert(out.hasStructuredTrigger===true&&out.rows.length===3,'all real timing rules exposed');
assert(out.rows[0].label==='Co dělat teď'&&out.rows[0].value===source.when,'when rule preserved verbatim');
assert(out.rows[1].label==='Kdy koupit / přikoupit'&&out.rows[1].value===source.buyRule,'buy rule preserved verbatim');
assert(out.rows[2].label==='Kdy prodat / snížit'&&out.rows[2].value===source.sellRule,'sell rule preserved verbatim');

const empty=decisionNext30({action:'HOLD',reason:'Jen důvod bez triggerů'});
assert(empty.hasStructuredTrigger===false&&empty.rows.length===0,'missing rules must not be invented');
assert(empty.note.includes('nedoplňuje odhadem'),'empty fallback explicitly refuses invented trigger');

const dash=decisionNext30({when:'—',buyRule:' — ',sellRule:''});
assert(dash.rows.length===0,'placeholder dashes must not become triggers');
console.log('NEXT TRIGGER 30.4 TEST PASS');
