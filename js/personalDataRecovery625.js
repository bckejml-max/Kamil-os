const A=v=>Array.isArray(v)?v:[];

export function personalDataRecovery625(s={}){
 const admin=A(s.personalAdmin?.items),assets=A(s.assetBook?.items),gaps=A(s.personalRecovery625?.gaps);
 return {
  admin:[...admin],assets:[...assets],gaps:gaps.map(x=>({...x})),
  recovered:{admin:0,assets:0,gaps:0},
  summary:'Veřejný kód neobsahuje žádná osobní recovery data.'
 };
}

export function mergeRecoveredPersonalData625(s={}){
 return {...s};
}
