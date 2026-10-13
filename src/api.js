import { daysBetween, todayISO, holidaysWithinRange } from './utils.js';

export async function fetchJSON(url, signal) {
  const response = await fetch(url,{signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000)});
  if(!response.ok) throw new Error(`Servizio non disponibile (${response.status})`);
  return response.json();
}

export async function searchPlaces(query,signal) {
  const url=new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search=new URLSearchParams({name:query,count:'8',language:'it',format:'json'});
  const data=await fetchJSON(url,signal);
  return data.results || [];
}

export async function getWeather(destination,start,end,signal) {
  const offset=daysBetween(todayISO(),start);
  if(offset<0) return {kind:'past'};
  if(offset>15) return {kind:'future'};
  const forecastEnd=daysBetween(todayISO(),end || start)>15 ? new Date(`${todayISO()}T12:00:00`) : null;
  if(forecastEnd) forecastEnd.setDate(forecastEnd.getDate()+15);
  const maxEnd=forecastEnd ? `${forecastEnd.getFullYear()}-${String(forecastEnd.getMonth()+1).padStart(2,'0')}-${String(forecastEnd.getDate()).padStart(2,'0')}` : end || start;
  const url=new URL('https://api.open-meteo.com/v1/forecast');
  url.search=new URLSearchParams({latitude:destination.lat,longitude:destination.lng,daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',timezone:destination.timezone || 'auto',start_date:start,end_date:maxEnd});
  const data=await fetchJSON(url,signal);
  return {kind:'forecast',partial:!!forecastEnd,days:data.daily.time.map((date,i)=>({date,code:data.daily.weather_code[i],max:data.daily.temperature_2m_max[i],min:data.daily.temperature_2m_min[i],rain:data.daily.precipitation_probability_max[i]}))};
}

export async function getHolidays(destination,start,end,signal) {
  if(!destination.countryCode) return {kind:'unsupported',holidays:[]};
  const years=Array.from({length:Number((end || start).slice(0,4))-Number(start.slice(0,4))+1},(_,i)=>Number(start.slice(0,4))+i);
  const results=await Promise.all(years.map(async year=> {
    const response=await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${destination.countryCode}`,{signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000)});
    if(response.status===204 || response.status===404) return null;
    if(!response.ok) throw new Error('Festività non disponibili');
    return response.json();
  }));
  if(results.some(result=>result===null)) return {kind:'unsupported',holidays:[]};
  return {kind:'loaded',holidays:holidaysWithinRange(results.flat(),start,end)};
}

export async function getPlaceSummary(destination,signal) {
  if(!destination.custom) return null;
  const result=await fetchJSON(`https://it.wikipedia.org/w/api.php?${new URLSearchParams({action:'query',generator:'geosearch',ggscoord:`${destination.lat}|${destination.lng}`,ggsradius:'10000',ggslimit:'5',prop:'pageimages|extracts',piprop:'thumbnail',pithumbsize:'1000',exintro:'1',explaintext:'1',exsentences:'3',format:'json',origin:'*'})}`,signal);
  const pages=Object.values(result.query?.pages || {});
  const city=pages.find(page=>page.title.toLowerCase()===destination.name.toLowerCase()) || pages.find(page=>page.thumbnail) || pages[0];
  return city ? {image:city.thumbnail?.source,description:city.extract,title:city.title,source:`https://it.wikipedia.org/?curid=${city.pageid}`,nearby:pages.filter(page=>page.pageid!==city.pageid).slice(0,3).map(page=>({name:page.title,description:page.extract,image:page.thumbnail?.source,source:`https://it.wikipedia.org/?curid=${page.pageid}`}))} : null;
}

export async function getCountryFacts(destination,signal) {
  if(!destination.custom || !destination.countryCode) return null;
  const data=await fetchJSON(`https://restcountries.com/v3.1/alpha/${destination.countryCode}?fields=languages,currencies`,signal);
  const country=Array.isArray(data)?data[0]:data;
  return {language:Object.values(country.languages || {}).join(', ') || destination.language,currency:Object.entries(country.currencies || {}).map(([code,currency])=>`${currency.name} (${code})`).join(', ') || destination.currency};
}

export async function getSpotPhotos(destination,signal) {
  if(!destination.spots?.length) return {};
  const titles={'Fushimi Inari':'Fushimi Inari-taisha','Torre di Belém':'Torre di Belém','Miradouro da Graça':'Graça (Lisbona)','Giardini di Tivoli':'Giardini di Tivoli','Jardin Majorelle':'Giardini Majorelle','Palazzo Bahia':'Palazzo El Bahia','Jemaa el-Fna':'Jamaa el Fna','Museo del Louvre':'Louvre','Jardin du Luxembourg':'Giardini del Lussemburgo'};
  const lookup=destination.spots.map(spot=>({name:spot.name,title:titles[spot.name] || spot.name}));
  const data=await fetchJSON(`https://it.wikipedia.org/w/api.php?${new URLSearchParams({action:'query',prop:'pageimages',piprop:'thumbnail',pithumbsize:'600',titles:lookup.map(spot=>spot.title).join('|'),format:'json',origin:'*'})}`,signal);
  const pages=Object.values(data.query?.pages || {});
  return Object.fromEntries(lookup.map(spot=>[spot.name,pages.find(page=>page.title===spot.title)?.thumbnail?.source]));
}
