export const VIEW_REGISTRY={
 today:{title:'Dnes',host:'todayView',quick:'Přidat',capture:'task',module:'./todayPage2000.js',renderer:'renderTodayPage2000',icon:'⌂',group:'Řízení',heavy:false,hint:'Co dnes hoří?'},
 inbox:{title:'Úkoly',host:'inboxView',quick:'Úkol',capture:'task',module:'./tasksOverview.js',renderer:'renderTasksOverview',icon:'✓',group:'Řízení',heavy:false,hint:'Hledej úkol, čekání nebo termín…'},
 work:{title:'Práce',host:'workView',quick:'Pracovní úkol',capture:'work-task',module:'./workPage1300.js',renderer:'renderWorkPage1300',icon:'W',group:'Řízení',heavy:false,hint:'Hledej zakázku nebo blokátor…'},
 tickets:{title:'Vstupenky',host:'ticketIntelView',quick:'Úkol k ticketům',capture:'ticket-task',module:'./ticketOverview.js',renderer:'renderTicketOverview',icon:'T',group:'Trh & peníze',heavy:true,hint:'Hledej event, transfer nebo payout…'},
 money:{title:'Peníze',host:'moneyView',quick:'Finanční úkol',capture:'money-task',module:'./moneyOverview.js',renderer:'renderMoneyOverview',icon:'Kč',group:'Trh & peníze',heavy:true,hint:'Hledej účet, platbu nebo pojistku…'},
 property:{title:'Reality',host:'propertyView',quick:'Úkol k realitě',capture:'property-task',module:'./propertyPage1300.js',renderer:'renderPropertyPage1300',icon:'R',group:'Trh & peníze',heavy:false,hint:'Hledej byt nebo lokalitu…'},
 betting:{title:'Sázení',host:'bettingView',quick:'Úkol k sázení',capture:'betting-task',module:'./bettingOverview.js',renderer:'renderBettingOverview',icon:'S',group:'Trh & peníze',heavy:true,hint:'Hledej tým, soutěž nebo sázku…'},
 family:{title:'Rodina',host:'familyView',quick:'Rodinný úkol',capture:'family-task',module:'./familyPage140.js',renderer:'renderFamilyPage140',icon:'F',group:'Osobní',heavy:false,hint:'Hledej rodinný termín…'},
 home:{title:'Domov',host:'homeView',quick:'Domácí úkol',capture:'home-task',module:'./homePage140.js',renderer:'renderHomePage140',icon:'D',group:'Osobní',heavy:false,hint:'Hledej servis, energii nebo dům…'},
 more:{title:'Dokumenty',host:'moreView',quick:'Dokument / zdroj',capture:'document-source',module:'./documentsPage141.js',renderer:'renderDocumentsPage141',icon:'▤',group:'Osobní',heavy:false,hint:'Hledej dokument, smlouvu nebo pojištění…'} 
};
export const VIEW_ORDER=Object.freeze(['today','inbox','work','tickets','money','property','betting','family','home','more']);
export const VALID_VIEWS=new Set(VIEW_ORDER);
export const viewMeta=view=>VIEW_REGISTRY[VALID_VIEWS.has(view)?view:'today'];
export const viewFromUrl=()=>{
 try{const v=new URL(location.href).searchParams.get('view');return VALID_VIEWS.has(v)?v:'today'}catch{return'today'}
};
export const writeViewToUrl=(view,{replace=false}={})=>{
 if(typeof history==='undefined'||typeof location==='undefined')return;
 const key=VALID_VIEWS.has(view)?view:'today',url=new URL(location.href);
 if(key==='today')url.searchParams.delete('view');else url.searchParams.set('view',key);
 const next=url.pathname+(url.search?url.search:'')+url.hash;
 if(replace)history.replaceState({...history.state,kamilView:key},'',next);else history.pushState({...history.state,kamilView:key},'',next);
};
