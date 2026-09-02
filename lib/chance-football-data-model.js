import {resolveFootballDataModels} from './football-data-poisson.js';

function plain(value){
 return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

const CHANCE_TO_FOOTBALL_DATA=new Map([
 ['1 anglicka liga','England Premier League'],
 ['2 anglicka liga','England Championship'],
 ['3 anglicka liga','England League One'],
 ['4 anglicka liga','England League Two'],
 ['1 skotska liga','Scotland Premiership'],
 ['1 nemecka liga','Germany Bundesliga'],
 ['2 nemecka liga','Germany 2 Bundesliga'],
 ['1 italska liga','Italy Serie A'],
 ['2 italska liga','Italy Serie B'],
 ['1 spanelska liga','Spain LaLiga'],
 ['2 spanelska liga','Spain Segunda'],
 ['1 francouzska liga','France Ligue 1'],
 ['2 francouzska liga','France Ligue 2'],
 ['1 nizozemska liga','Netherlands Eredivisie'],
 ['1 belgicka liga','Belgium Pro League'],
 ['1 portugalska liga','Portugal Primeira Liga'],
 ['1 turecka liga','Turkey Super Lig'],
 ['1 recka liga','Greece Super League']
]);

export function canonicalChanceLeague(value){
 const key=plain(value);
 return CHANCE_TO_FOOTBALL_DATA.get(key)||String(value??'');
}

export function mapChanceEventsForFootballData(events){
 return (Array.isArray(events)?events:[]).map(event=>({
  ...event,
  league:canonicalChanceLeague(event?.league),
  chanceLeague:event?.league??null
 }));
}

export async function resolveChanceFootballDataModels(events,options={}){
 const mapped=mapChanceEventsForFootballData(events);
 const resolved=await resolveFootballDataModels(mapped,options);
 return {
  ...resolved,
  meta:{
   ...resolved.meta,
   chanceLeagueMapping:true
  }
 };
}
