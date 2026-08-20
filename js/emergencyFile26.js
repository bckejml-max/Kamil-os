const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const norm=v=>String(v||'').trim();

export const EMERGENCY_CONTACT_ROLES={
 FAMILY:'Rodina / blízký',
 INSURANCE:'Pojištění',
 HOME:'Dům / servis',
 VEHICLE:'Auto / asistence',
 BANK:'Banka / finance',
 UTILITY:'Energie / služby',
 OTHER:'Ostatní důležitý kontakt'
};

export const EMERGENCY_ASSET_KINDS={
 DOCUMENTS:'Důležité dokumenty',
 INSURANCE:'Pojistky',
 CONTRACTS:'Smlouvy',
 HOME:'Dům / nemovitost',
 VEHICLE:'Auto',
 KEYS:'Klíče / přístup',
 WARRANTIES:'Záruky / servis',
 FINANCE:'Finance – pouze kde hledat',
 OTHER:'Ostatní'
};

export const emergencyFileNote='Emergency File je pouze orientační index: co je důležité, kde to najít a komu zavolat. Neukládej sem hesla, PINy, CVV, recovery/seed fráze, privátní klíče ani jiné přístupové tajemství.';

const SECRET_RE=/(?:heslo|password|\bpin\b|\bcvv\b|seed(?: phrase)?|recovery phrase|mnemonic|private key|privátní klíč|2fa secret|otp secret)/i;
export function containsSecretLike(value){return SECRET_RE.test(String(value||''))}

function sourceCounts(s){
 const items=(s.personalAdmin?.items||[]).filter(active),count=cat=>items.filter(x=>String(x.category||'').toUpperCase()===cat).length;
 return {
  insurance:count('INSURANCE'),documents:count('DOCUMENT'),home:count('HOME'),vehicle:count('VEHICLE'),familyItems:count('FAMILY'),familyMembers:(s.familyHome?.members||[]).filter(active).length
 };
}

export function emergencyFile(s){
 const contacts=(s.emergencyFile?.contacts||[]).filter(active).map(x=>({...x,name:norm(x.name),phone:norm(x.phone),email:norm(x.email),role:String(x.role||'OTHER').toUpperCase(),notes:norm(x.notes)}));
 const assets=(s.emergencyFile?.assets||[]).filter(active).map(x=>({...x,title:norm(x.title),kind:String(x.kind||'OTHER').toUpperCase(),location:norm(x.location),contact:norm(x.contact),notes:norm(x.notes)}));
 const contactsWithoutChannel=contacts.filter(x=>!x.phone&&!x.email).length;
 const assetsWithoutLocation=assets.filter(x=>!x.location).length;
 const secretFlags=[...contacts.map(x=>`${x.name} ${x.notes}`),...assets.map(x=>`${x.title} ${x.location} ${x.contact} ${x.notes}`)].filter(containsSecretLike).length;
 const gaps=[];
 if(!contacts.length)gaps.push('Není uložený žádný nouzový kontakt.');
 if(!assets.length)gaps.push('Není uložený žádný orientační záznam, kde hledat důležité věci.');
 if(contactsWithoutChannel)gaps.push(`${contactsWithoutChannel} kontakt${contactsWithoutChannel===1?' nemá':'y nemají'} telefon ani e-mail.`);
 if(assetsWithoutLocation)gaps.push(`${assetsWithoutLocation} polož${assetsWithoutLocation===1?'ka nemá':'ky nemají'} uvedeno, kde ji najít.`);
 if(secretFlags)gaps.push('V některém záznamu může být přístupové tajemství. Odstraň hesla, PINy, seed/recovery fráze a privátní klíče.');
 let score=100;
 if(!contacts.length)score-=30;
 if(!assets.length)score-=30;
 score-=Math.min(20,contactsWithoutChannel*10);
 score-=Math.min(20,assetsWithoutLocation*10);
 if(secretFlags)score-=20;
 score=Math.max(0,score);
 const sources=sourceCounts(s);
 return {contacts,assets,totalContacts:contacts.length,totalAssets:assets.length,contactsWithoutChannel,assetsWithoutLocation,secretFlags,score,gaps,sources,note:emergencyFileNote};
}

export function emergencySnapshotText(s){
 const e=emergencyFile(s),role=k=>EMERGENCY_CONTACT_ROLES[k]||EMERGENCY_CONTACT_ROLES.OTHER,kind=k=>EMERGENCY_ASSET_KINDS[k]||EMERGENCY_ASSET_KINDS.OTHER;
 const lines=['KAMIL OS — NOUZOVÝ PŘEHLED',''];
 lines.push('KONTAKTY');
 if(!e.contacts.length)lines.push('— žádné uložené kontakty —');
 for(const x of e.contacts)lines.push(`• ${x.name||'Bez názvu'} — ${role(x.role)}${x.phone?` — tel. ${x.phone}`:''}${x.email?` — ${x.email}`:''}`);
 lines.push('','KDE CO NAJÍT');
 if(!e.assets.length)lines.push('— žádné uložené položky —');
 for(const x of e.assets)lines.push(`• ${x.title||'Bez názvu'} — ${kind(x.kind)}${x.location?` — ${x.location}`:''}${x.contact?` — kontakt: ${x.contact}`:''}`);
 lines.push('','EVIDOVANÉ ZDROJE');
 lines.push(`Pojistky: ${e.sources.insurance} · Doklady: ${e.sources.documents} · Dům: ${e.sources.home} · Auto: ${e.sources.vehicle} · Členové rodiny: ${e.sources.familyMembers}`);
 lines.push('',emergencyFileNote);
 return lines.join('\n');
}
