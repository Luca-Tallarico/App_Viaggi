export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function dateLabel(value, options = {}) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString('it-IT',{day:'numeric',month:'short',...options}) : 'Date da scegliere';
}
export function tripDates(trip) {
  if (!trip.start) return 'Date da scegliere';
  if (!trip.end || trip.end === trip.start) return dateLabel(trip.start,{year:'numeric'});
  return `${dateLabel(trip.start)} — ${dateLabel(trip.end,{year:'numeric'})}`;
}
export function daysBetween(start,end) {
  return Math.round((Date.parse(`${end}T12:00:00Z`)-Date.parse(`${start}T12:00:00Z`))/86400000);
}
export function buildTravelLinks(destination,start,end,departure='MXP') {
  const query = `${departure} a ${destination.name} ${destination.country} ${start || ''} ${end || ''}`;
  const booking = new URL('https://www.booking.com/searchresults.it.html');
  booking.searchParams.set('ss',`${destination.name}, ${destination.country}`);
  booking.searchParams.set('group_adults','2');
  booking.searchParams.set('no_rooms','1');
  if(start && end && end>start){booking.searchParams.set('checkin',start);booking.searchParams.set('checkout',end);}
  return {
    booking:booking.href,
    flights:`https://www.google.com/travel/flights?q=${encodeURIComponent(`Voli da ${query}`)}&hl=it`,
    skyscanner:`https://www.skyscanner.it/trasporti/voli/${departure.toLowerCase()}/${destination.airport?.toLowerCase() || 'anywhere'}/${start?.replaceAll('-','').slice(2) || ''}/${end?.replaceAll('-','').slice(2) || ''}/?adults=2`,
    guide:`https://it.wikivoyage.org/w/index.php?search=${encodeURIComponent(destination.wiki || destination.name)}`,
    wiki:`https://it.wikipedia.org/w/index.php?search=${encodeURIComponent(destination.wiki || destination.name)}`,
    maps:`https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`,
    tourism:`https://www.google.com/search?q=${encodeURIComponent(`${destination.name} ufficio turismo sito ufficiale`)}`,
  };
}
export function weatherDescription(code) {
  if(code === 0) return 'Sereno';
  if([1,2].includes(code)) return 'Poco nuvoloso';
  if(code === 3) return 'Nuvoloso';
  if([45,48].includes(code)) return 'Nebbia';
  if([51,53,55,56,57].includes(code)) return 'Pioviggine';
  if([61,63,65,66,67,80,81,82].includes(code)) return 'Pioggia';
  if([71,73,75,77,85,86].includes(code)) return 'Neve';
  if([95,96,99].includes(code)) return 'Temporali';
  return 'Variabile';
}
export function holidaysWithinRange(holidays,start,end) {
  return holidays.filter(item=>item.date>=start && item.date<=(end || start) && (!item.types || item.types.includes('Public')));
}
export function tripInMonth(trip,year,month) {
  if(!trip.start) return false;
  const first=`${year}-${String(month+1).padStart(2,'0')}-01`;
  const last=`${year}-${String(month+1).padStart(2,'0')}-${new Date(year,month+1,0).getDate()}`;
  return trip.start<=last && (trip.end || trip.start)>=first;
}
