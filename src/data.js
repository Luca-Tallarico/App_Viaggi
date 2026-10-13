const photo = (id, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const destinations = [
  {
    id: 'kyoto', name: 'Kyoto', country: 'Giappone', countryCode: 'JP', region: 'Asia', lat: 35.0116, lng: 135.7681, airport: 'KIX',
    image: photo('photo-1493976040374-85c8e12f0c0e'), imagePosition: '50% 55%', tag: 'Cultura & meraviglia',
    subtitle: 'Dove anche il tempo si prende una pausa.',
    description: 'Templi silenziosi, giardini zen e vicoli illuminati dalle lanterne. Kyoto invita a camminare piano, tra il Giappone delle tradizioni e piccoli caffè contemporanei.',
    bestTime: 'Marzo–maggio · Ottobre–novembre', currency: 'Yen giapponese (JPY)', language: 'Giapponese', wiki: 'Kyoto', timezone: 'Asia/Tokyo',
    spots: [{name: 'Fushimi Inari', description: 'Un sentiero di torii rossi che sale nel bosco. Arrivate presto per godervi il silenzio.', query: 'Fushimi Inari-taisha'}, {name: 'Arashiyama', description: 'Bambù, giardini e una passeggiata lungo il fiume Katsura.', query: 'Arashiyama'}, {name: 'Gion', description: 'Case di legno, sale da tè e le atmosfere della Kyoto antica.', query: 'Gion Kyoto'}],
    tips: ['Togliete le scarpe dove richiesto nei templi.', 'Portate contanti per botteghe e piccoli ristoranti.', 'Rispettate i divieti di fotografia nelle strade di Gion.'],
    airlines: [{name:'ANA',url:'https://www.ana.co.jp/en/it/'},{name:'Japan Airlines',url:'https://www.jal.co.jp/it/en/'}],
  },
  {
    id: 'lisbon', name: 'Lisbona', country: 'Portogallo', countryCode: 'PT', region: 'Europa', lat: 38.7223, lng: -9.1393, airport: 'LIS',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Baixa_De_Lisboa.jpg', imageSource:'https://commons.wikimedia.org/wiki/File:Baixa_De_Lisboa.jpg', imageCredit:'Ana Correia 28 · CC BY-SA 4.0', imagePosition: '50% 55%', tag: 'Un weekend lento',
    subtitle: 'La luce giusta, un tram, nessuna fretta.',
    description: 'Facciate di azulejos, miradouros sul Tago e il profumo dei pastéis appena sfornati. Una città da scoprire a piedi, perdendosi tra i vicoli e le terrazze.',
    bestTime: 'Aprile–giugno · Settembre–ottobre', currency: 'Euro (EUR)', language: 'Portoghese', wiki: 'Lisbona', timezone:'Europe/Lisbon',
    spots: [{name:'Alfama',description:'Vicoli, musica fado e scorci sul fiume nel quartiere più antico.',query:'Alfama Lisbon'},{name:'Torre di Belém',description:'Un simbolo della città sulle rive del Tago. Verificate gli orari prima di partire.',query:'Torre de Belém'},{name:'Miradouro da Graça',description:'Una terrazza dove aspettare insieme il tramonto.',query:'Miradouro da Graça'}],
    tips:['Scarpe comode: salite e pavé fanno parte del viaggio.', 'Prenotate i monumenti più frequentati in anticipo.', 'Provate un pastel de nata ancora tiepido.'],
    airlines:[{name:'TAP Air Portugal',url:'https://www.flytap.com/it-it'},{name:'easyJet',url:'https://www.easyjet.com/it'},{name:'Ryanair',url:'https://www.ryanair.com/it/it'}],
  },
  {
    id:'copenhagen',name:'Copenaghen',country:'Danimarca',countryCode:'DK',region:'Europa',lat:55.6761,lng:12.5683,airport:'CPH',
    image:photo('photo-1513622470522-26c3c8a854bc'),tag:'Design & piccoli piaceri',subtitle:'Un po’ di hygge, solo per noi.',
    description:'Biciclette, architettura essenziale e caffè in cui restare un po’ di più. Copenaghen mescola il fascino del porto con una scena creativa e gastronomica vivace.',
    bestTime:'Maggio–settembre',currency:'Corona danese (DKK)',language:'Danese',wiki:'Copenaghen',timezone:'Europe/Copenhagen',
    spots:[{name:'Nyhavn',description:'Case colorate e barche storiche sul canale più fotografato della città.',query:'Nyhavn'},{name:'Giardini di Tivoli',description:'Un parco storico da vivere tra giardini, luci e attrazioni. Controllate le aperture stagionali.',query:'Tivoli Copenhagen'},{name:'Designmuseum Danmark',description:'Una tappa per chi ama le forme semplici e il design scandinavo.',query:'Designmuseum Danmark'}],
    tips:['Noleggiate una bici, rispettando le corsie dedicate.', 'Verificate i prezzi: la città può essere costosa.', 'Una pausa con caffè e dolce è sempre una buona idea.'],
    airlines:[{name:'SAS',url:'https://www.flysas.com/'},{name:'easyJet',url:'https://www.easyjet.com/it'}],
  },
  {
    id:'marrakech',name:'Marrakech',country:'Marocco',countryCode:'MA',region:'Africa',lat:31.6295,lng:-7.9811,airport:'RAK',
    image:photo('photo-1597212618440-806262de4f6b'),tag:'Profumi & colori',subtitle:'Perdersi, e ritrovarsi in un riad.',
    description:'Il ritmo della medina, cortili nascosti e giardini che offrono una pausa dal sole. Marrakech è un incontro di artigianato, sapori e architettura.',
    bestTime:'Marzo–maggio · Settembre–novembre',currency:'Dirham marocchino (MAD)',language:'Arabo e amazigh; francese diffuso',wiki:'Marrakech',timezone:'Africa/Casablanca',
    spots:[{name:'Jardin Majorelle',description:'Blu intenso, piante e quiete. Prenotate l’ingresso sul sito ufficiale.',query:'Jardin Majorelle'},{name:'Palazzo Bahia',description:'Mosaici e cortili dell’architettura marocchina.',query:'Bahia Palace'},{name:'Jemaa el-Fna',description:'La piazza cambia volto tra giorno e sera.',query:'Jemaa el-Fnaa'}],
    tips:['Concordate il prezzo dei taxi prima di salire.', 'Chiedete il permesso prima di fotografare le persone.', 'Verificate consuetudini e orari durante il Ramadan.'],
    airlines:[{name:'Royal Air Maroc',url:'https://www.royalairmaroc.com/it-it'},{name:'easyJet',url:'https://www.easyjet.com/it'},{name:'Ryanair',url:'https://www.ryanair.com/it/it'}],
  },
  {
    id:'paris',name:'Parigi',country:'Francia',countryCode:'FR',region:'Europa',lat:48.8566,lng:2.3522,airport:'PAR',
    image:photo('photo-1502602898657-3e91760cbb34'),tag:'Una fuga romantica',subtitle:'Due caffè e tutta la città davanti.',
    description:'Passeggiate lungo la Senna, musei e piccoli bistrot. Tra un quartiere e l’altro, Parigi regala angoli tranquilli anche lontano dai suoi monumenti più celebri.',
    bestTime:'Aprile–giugno · Settembre–ottobre',currency:'Euro (EUR)',language:'Francese',wiki:'Parigi',timezone:'Europe/Paris',
    spots:[{name:'Montmartre',description:'Scalinate, atelier e una vista sulla città dal Sacré-Cœur.',query:'Montmartre'},{name:'Museo del Louvre',description:'Scegliete un percorso e prenotate l’ingresso: una visita merita tempo.',query:'Louvre'},{name:'Jardin du Luxembourg',description:'Sedie verdi, fontane e un pomeriggio senza programma.',query:'Jardin du Luxembourg'}],
    tips:['Prenotate in anticipo musei e monumenti.', 'Usate la metro per spostarvi tra quartieri.', 'Lasciate tempo per una passeggiata sulla Senna.'],
    airlines:[{name:'Air France',url:'https://www.airfrance.it/'},{name:'easyJet',url:'https://www.easyjet.com/it'}],
  },
  {
    id:'bali',name:'Ubud',country:'Indonesia',countryCode:'ID',region:'Asia',lat:-8.5069,lng:115.2625,airport:'DPS',
    image:photo('photo-1537996194471-e657df975ab4'),tag:'Natura & nuove prospettive',subtitle:'Tra risaie, templi e giorni verdi.',
    description:'Nel cuore di Bali, Ubud è un punto di partenza per esplorare risaie, templi e artigianato locale. Un viaggio da vivere rispettando i luoghi e le loro tradizioni.',
    bestTime:'Maggio–settembre',currency:'Rupia indonesiana (IDR)',language:'Indonesiano e balinese',wiki:'Ubud',timezone:'Asia/Makassar',
    spots:[{name:'Tegallalang',description:'Risaie terrazzate a nord di Ubud, da visitare con rispetto per chi le coltiva.',query:'Tegallalang'},{name:'Tirta Empul',description:'Un tempio dell’acqua: informatevi sulle regole prima di partecipare ai rituali.',query:'Tirta Empul'},{name:'Campuhan Ridge Walk',description:'Una passeggiata sulle colline alle prime luci del giorno.',query:'Campuhan Ridge Walk'}],
    tips:['Verificate le regole d’ingresso su Viaggiare Sicuri.', 'Nei templi è spesso necessario il sarong.', 'Organizzate gli spostamenti con conducenti e servizi affidabili.'],
    airlines:[{name:'Emirates',url:'https://www.emirates.com/it/italian/'},{name:'Qatar Airways',url:'https://www.qatarairways.com/it-it/homepage.html'},{name:'Singapore Airlines',url:'https://www.singaporeair.com/it_IT/it/home'}],
  },
];

export const heroImage = photo('photo-1499856871958-5b9627545d1a', 2000);
export const initialTrips = [
  {id:'example-lisbon',destinationId:'lisbon',start:'',end:'',status:'wish',note:'Un tram, un pastel de nata e un tramonto sul Tago.',example:true},
  {id:'example-kyoto',destinationId:'kyoto',start:'',end:'',status:'wish',note:'Il nostro viaggio tra templi e piccoli giardini.',example:true},
  {id:'example-copenhagen',destinationId:'copenhagen',start:'',end:'',status:'wish',note:'Una fuga tra design, biciclette e caffè.',example:true},
];

export const statuses = {wish:'Da sognare',planned:'In programma',visited:'Già vissuta'};
export const regionFilters = ['Tutte', 'Europa', 'Asia', 'Africa', 'Americhe', 'Oceania'];

export function fromGeocoding(result) {
  const code = result.country_code?.toUpperCase() || '';
  return {
    id:`geo-${result.id}`,name:result.name,country:result.country || result.admin1 || '',countryCode:code,
    region:result.timezone?.startsWith('Europe')?'Europa':result.timezone?.startsWith('Asia')?'Asia':result.timezone?.startsWith('Africa')?'Africa':result.timezone?.startsWith('America')?'Americhe':['Australia','Pacific'].includes(result.timezone?.split('/')[0])?'Oceania':'Mondo',
    lat:result.latitude,lng:result.longitude,timezone:result.timezone || 'auto',wiki:result.name,tag:'La vostra prossima scoperta',
    subtitle:'Ogni viaggio comincia con un posto da immaginare.',
    description:`Esplorate ${result.name}${result.country ? `, ${result.country}` : ''}. Consultate la guida e i collegamenti qui sotto per conoscere attrazioni, cultura e informazioni locali.`,
    image:null,bestTime:'Da verificare nella guida locale',currency:'Da consultare nella guida',language:'Da consultare nella guida',
    spots:[],tips:['Verificate documenti, requisiti d’ingresso e avvisi su Viaggiare Sicuri.', 'Controllate orari e prenotazioni sui siti ufficiali delle attrazioni.'],airlines:[],custom:true,
  };
}
