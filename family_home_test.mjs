import {familyHome,nextAnnualDate} from './js/familyHome25.js';
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const now=new Date('2026-08-20T12:00:00+02:00');
const leap=nextAnnualDate('2024-02-29',new Date('2027-03-01T12:00:00+01:00'));
assert(leap?.slice(0,10)==='2028-02-29','leap-day annual date must recover on leap year');
const s={
 familyHome:{members:[
  {id:'m1',name:'Mia',relation:'CHILD',birthday:'2026-09-01',status:'ACTIVE'},
  {id:'m2',name:'Archiv',relation:'OTHER',birthday:'2026-08-25',status:'ARCHIVED'}
 ]},
 personalAdmin:{items:[
  {id:'h1',title:'Revize domu',category:'HOME',nextDue:'2026-08-25',status:'ACTIVE'},
  {id:'h2',title:'Rodinná administrativa',category:'FAMILY',status:'ACTIVE'},
  {id:'p1',title:'Pojistka dítěte',category:'INSURANCE',insurance:{insured:'Mia'},status:'ACTIVE'}
 ]}
};
const a=familyHome(s,now);
assert(a.totalMembers===1,'archived family member must stay out');
assert(a.upcoming.length===1&&a.upcoming[0].name==='Mia','birthday inside 60 days must surface');
assert(a.due30===1,'home deadline inside 30 days must surface');
assert(a.withoutTerm===1,'missing home date must remain explicitly unknown');
assert(a.linkedMembers===1,'exact stored subject match may be counted as linked evidence');
assert(a.obligations[0].title==='Revize domu','urgent household obligation should rank first');
console.log('FAMILY HOME OK');
