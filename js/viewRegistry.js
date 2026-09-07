export const VIEW_REGISTRY=Object.freeze({
 today:{title:'DNES',host:'todayView',renderer:['./todayPage101.js','renderTodayPage101'],quickLabel:'Osobní úkol',captureType:'task',mobile:true},
 inbox:{title:'INBOX',host:'inboxView',renderer:['./inboxPage141.js','renderInboxPage141'],quickLabel:'Úkol',captureType:'task',mobile:false},
 tickets:{title:'VSTUPENKY',host:'ticketIntelView',renderer:['./ticketPage100.js','renderTicketPage100'],quickLabel:'Úkol k ticketům',captureType:'ticket-task',mobile:true},
 betting:{title:'SÁZENÍ',host:'bettingView',renderer:['./bettingPage527.js','renderBettingPage527'],quickLabel:null,captureType:null,mobile:false},
 family:{title:'RODINA',host:'familyView',legacyHost:'ticketsView',renderer:['./familyPage140.js','renderFamilyPage140'],quickLabel:'Rodinný úkol',captureType:'family-task',mobile:true},
 home:{title:'DOMOV',host:'homeView',renderer:['./homePage140.js','renderHomePage140'],quickLabel:'Domácí úkol',captureType:'home-task',mobile:true},
 money:{title:'PENÍZE',host:'moneyView',renderer:['./moneyPage100.js','renderMoneyPage100'],quickLabel:'Finanční úkol',captureType:'money-task',mobile:true},
 more:{title:'DOKUMENTY',host:'moreView',renderer:['./documentsPage141.js','renderDocumentsPage141'],quickLabel:'Dokument / zdroj',captureType:'document-source',mobile:false}
});

export const validViews41=new Set(Object.keys(VIEW_REGISTRY));
export const viewDefinition41=name=>VIEW_REGISTRY[validViews41.has(name)?name:'today'];
export const viewTitle41=name=>viewDefinition41(name).title;
export const viewHost41=name=>viewDefinition41(name).host;
export const viewQuick41=name=>({label:viewDefinition41(name).quickLabel,type:viewDefinition41(name).captureType});
export const mobileViews41=()=>Object.entries(VIEW_REGISTRY).filter(([,v])=>v.mobile).map(([k])=>k);
