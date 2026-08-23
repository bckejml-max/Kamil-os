import {store} from './state.js';
import {personalLifeActionRouter623} from './personalLifeActionRouter623.js';

const copy={
 today:['Má termín dnes nebo už je po termínu.','Odklad zvyšuje počet restů a může vytlačit důležitější osobní věci z dalších dnů.','Po vyřešení se uvolní dnešní kapacita a klesne tlak v Personal Today.'],
 waiting:['Čekání už je dost staré nebo má follow-up termín.','Bez připomenutí se může věc zbytečně táhnout a blokovat další kroky.','Po follow-upu se věc buď posune, nebo dostane nový jasný termín.'],
 expiry:['Platnost se blíží ke konci.','Může vzniknout mezera v platnosti nebo nutnost řešit věc narychlo.','Po vyřešení zmizí riziko expirace a oblast se vrátí do klidu.'],
 renewals:['Blíží se platba, obnova nebo možnost něco zrušit.','Odklad může znamenat zbytečnou platbu, propadnutí termínu nebo automatické prodloužení.','Po vyřešení bude jasné, co se platí, ruší nebo obnovuje.'],
 maintenance:['Servis nebo údržba jsou blízko termínu nebo po termínu.','Odklad může zvýšit riziko poruchy, horšího stavu nebo dražší opravy.','Po vyřešení se sníží technické riziko domácnosti nebo auta.'],
 admin:['Je tu otevřená osobní administrativa s termínem nebo dopadem.','Může se nabalovat další administrativa nebo vzniknout zbytečné omezení.','Po vyřízení bude daná administrativa uzavřená a nebude zabírat mentální kapacitu.'],
 familyCalendar:['Blíží se rodinný termín, který vyžaduje přípravu nebo koordinaci.','Bez přípravy může vzniknout kolize, stres nebo zapomenutí důležité rodinné věci.','Po přípravě bude rodinný plán jasný a bez překvapení.'],
 familyTodos:['Je tu otevřený rodinný nebo domácí úkol.','Odklad přesouvá zátěž na další dny nebo na jiného člena rodiny.','Po dokončení se uvolní domácí fronta úkolů.'],
 documents:['Dokument nebo doklad je důležitý pro další osobní agendu.','Chybějící nebo nejasný dokument může blokovat další krok.','Po dohledání nebo doplnění bude další agenda jednodušší.'],
 finance:['Osobní finance potřebují kontrolu kvůli aktuálním výdajům nebo rezervě.','Bez kontroly můžeš přehlédnout zbytečný výdaj nebo zhoršení cashflow.','Po kontrole bude jasnější, kolik je bezpečně volných peněz.'],
 subscriptions:['Je tu pravidelná platba, kterou má smysl znovu posoudit.','Můžeš dál platit za něco, co nepoužíváš nebo nepotřebuješ.','Po kontrole se sníží zbytečné pravidelné výdaje.'],
 purchases:['Je tu větší plánovaný nákup nebo osobní cíl s peněžním dopadem.','Impulzivní nebo špatně načasovaný nákup může zhoršit rezervu.','Po rozhodnutí bude jasný rozpočet, priorita a termín nákupu.'],
 homeProjects:['Domácí projekt má otevřený další krok.','Bez dalšího kroku se projekt může dlouho neposunout a dál zabírat pozornost.','Po vyřešení bude projekt o konkrétní krok blíž dokončení.'],
 inbox:['Osobní inbox obsahuje otevřené vstupy, které ještě nejsou rozhodnuté.','Nevyřešené vstupy se mohou ztratit nebo zbytečně hromadit.','Po zpracování bude jasné, co je úkol, co čekání a co lze zahodit.'],
 healthAdmin:['Blíží se organizační zdravotní termín nebo kontrola.','Při odkladu může být složitější získat nový termín nebo připravit potřebné věci.','Po vyřízení bude organizační část zdravotní agendy pod kontrolou.'],
 weekend:['Blíží se volný čas, který zatím není využitý nebo sladěný.','Bez plánu může víkend protéct bez toho, co jste chtěli podniknout.','Po naplánování bude jasné, co chcete dělat a co je potřeba připravit.'],
 wishlist:['Je tu osobní nápad nebo přání, které stojí za rozhodnutí.','Bez dalšího kroku zůstane jen v seznamu a pravděpodobně se neuskuteční.','Po rozhodnutí buď dostane termín, nebo přestane zabírat místo v hlavě.'],
 scoreboard:['Life score ukazuje, že některá osobní oblast zvyšuje celkové zatížení.','Bez zásahu se mohou resty, čekání nebo termíny dál hromadit.','Po vyřešení nejslabší oblasti se zlepší celkový stav osobního systému.'],
 sunday:['Týden je vhodný uzavřít a připravit další.','Bez resetu mohou staré resty a nejasné priority přetéct do dalšího týdne.','Po resetu bude jasné, co pokračuje, co se ruší a co je priorita nového týdne.']
};

function explainOne(v){const [why,risk,outcome]=copy[v.key]||['Tato oblast má podle uložených dat vyšší prioritu než ostatní.','Při odložení může zůstat blokovaná nebo se stát urgentnější.','Po vyřešení se sníží osobní zátěž a uvolní se další kapacita.'];return{key:v.key,name:v.name||v.title,title:v.title||v.name,why,risk,outcome,count:Number(v.count||0)};}

export function personalLifeExplain624(s=store.get()){
 const r=personalLifeActionRouter623(s),main=explainOne({key:r.main.key,title:r.main.title,name:r.main.title,count:r.rows.find(x=>x.key===r.main.key)?.count||0});
 return{main,top:r.top.map(explainOne),summary:`${main.title}: ${main.why}`};
}
