const DAY=86400000;
const dayNumber=d=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/DAY;
export function personalDaysTo650(value,now=new Date()){
 const t=Date.parse(value||'');if(!Number.isFinite(t))return null;
 return Math.round(dayNumber(new Date(t))-dayNumber(now));
}
export function personalIsToday650(value,now=new Date()){return personalDaysTo650(value,now)===0;}
