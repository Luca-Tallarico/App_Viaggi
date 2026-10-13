# Duepassi

Un’app in italiano per organizzare i viaggi in coppia, con stile minimale bianco, nero e beige. Creata con React, Vite, D3 Geo e Leaflet.

## Aprire l’app senza installazione

Scaricare [`download/Duepassi.zip`](https://github.com/Luca-Tallarico/App_Viaggi/blob/main/download/Duepassi.zip) usando **Download raw file** su GitHub. Estrarre l’archivio e aprire `Duepassi.html` con Chrome, Edge, Firefox o Safari. È una copia autonoma dell’app con globo, foto e font inclusi; le funzioni online richiedono Internet. Non serve Node.js. I viaggi sono salvati nel browser su quel dispositivo.

Foto di Lisbona: [Ana Correia 28, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Baixa_De_Lisboa.jpg). Altre foto illustrative: Unsplash.

Lo ZIP è una copia dell’app al 13 ottobre 2026. Dopo le modifiche ai sorgenti, eseguire `npm run export:html` per rigenerarlo. Il comando richiede curl e scarica le foto via HTTPS solo se non sono già nella cache locale ignorata da Git.

## Avvio

Serve Node.js 22 o successivo; sviluppo e verifiche eseguiti con Node 24.

```sh
cd /workspace/App_Viaggi
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

Per una build di produzione:

```sh
npm run build
npm run preview -- --port 4173
```

La cartella `dist` è pubblicabile su un hosting statico. Per aggiornare il file autonomo e lo ZIP eseguire `npm run export:html`; gli artefatti sono creati in `download`. Non sono necessarie chiavi API o un backend per questa versione. Ogni task cloud dispone già di un ambiente isolato: usare il checkout esistente, senza creare worktree salvo richiesta esplicita.

## Funzioni

- Home con mappamondo a proiezione ortografica ruotabile con mouse, touch e tastiera. Geografia Natural Earth incorporata, 34 località iniziali, zoom, rotazione automatica facoltativa e filtri per continente. Il globo funziona offline e non richiede WebGL.
- Aggiunta rapida dalla località selezionata con un clic, evitando duplicati accidentali. Date e note sono facoltative nel modulo semplificato.
- Lista delle mete con ricerca, filtri per continente e stato, ordinamento, aggiunta, modifica e rimozione con conferma.
- Calendario mensile con viaggi distribuiti su tutte le date, anche a cavallo di mesi e anni. Le mete senza date rimangono nella wishlist.
- Mappa mondiale OpenStreetMap con zoom, selezione delle località e ricerca di città in tutto il mondo tramite Open-Meteo Geocoding.
- Sei schede editoriali: Kyoto, Lisbona, Copenaghen, Marrakech, Parigi e Ubud. Fotografie illustrative, peculiarità, periodo consigliato, luoghi da visitare, consigli e guide esterne.
- Per le località cercate: coordinate, Paese, lingua e valuta da REST Countries; fotografie, descrizioni e luoghi vicini da Wikipedia quando disponibili. La copertura delle fonti non è universale; l’app mantiene i collegamenti alle guide anche se non trova una scheda.
- Previsioni meteo nelle date selezionate, fino ai 16 giorni disponibili da Open-Meteo, senza simulare dati per date lontane o passate.
- Festività pubbliche del periodo da Nager.Date, anche per viaggi a cavallo di due anni. Eventi locali e festival richiedono verifica sulle guide locali. Paesi non coperti e servizi non disponibili sono segnalati separatamente dall’assenza di festività.
- Ricerche su Booking per due adulti e una camera, Google Flights e Skyscanner con le date selezionate. Milano Malpensa (MXP) è il punto di partenza predefinito, modificabile nelle impostazioni. I siti delle compagnie suggerite sono link di approfondimento: le rotte e la disponibilità effettiva non sono verificate dall’app.
- Interfaccia responsive, navigazione da tastiera, dialoghi con gestione del focus, notifiche e messaggi di errore.

Le prime tre mete sono **idee di esempio**, identificate nell’interfaccia e modificabili o rimovibili. Non sono prenotazioni o viaggi già effettuati.

## Salvataggio e condivisione

Le mete, le date, le note e l’aeroporto sono salvati nel `localStorage` del browser, nella chiave `duepassi-v1`. Persistono dopo il ricaricamento, ma cancellare i dati del browser li elimina. Questa versione **non sincronizza i viaggi tra dispositivi e non ha account condivisi**. Per una condivisione in tempo reale tra due persone occorre aggiungere autenticazione, database e controllo degli accessi in un successivo intervento.

## Rete e fonti

I font sono inclusi localmente tramite Fontsource. Le altre fonti vengono consultate direttamente dal browser con richieste HTTPS e timeout di 15 secondi:

| Funzione | Host |
| --- | --- |
| Foto illustrative | `images.unsplash.com` |
| Ricerca città / GeoNames | `geocoding-api.open-meteo.com` |
| Previsioni | `api.open-meteo.com` |
| Festività | `date.nager.at` |
| Tessere mappa | `tile.openstreetmap.org` |
| Schede e foto dei luoghi | `it.wikipedia.org`, `upload.wikimedia.org` |
| Lingua e valuta | `restcountries.com` |

Le foto generiche provengono da Unsplash; le foto e i testi ottenuti da Wikipedia/Wikimedia mantengono collegamenti alle pagine fonte, dove sono indicate le licenze. Consultare le condizioni e i limiti dei fornitori prima di un impiego commerciale o con traffico elevato; Open-Meteo offre il servizio gratuito pubblico per uso non commerciale. I nomi di lingue e valute da REST Countries seguono la lingua originale della fonte.

La configurazione cloud salva questi host in una bozza. **Salvare una bozza non attiva immediatamente l’accesso nella macchina corrente e non pubblica il progetto.** Nel primo controllo le richieste ai servizi esterni sono state bloccate dal proxy (403); le verifiche con risposte simulate non dimostrano disponibilità dei fornitori in rete. Dopo aver applicato gli accessi nelle impostazioni, verificare ricerca reale, immagini, tessere della mappa, meteo e festività dal browser.

Gli approfondimenti aprono siti esterni in una nuova scheda. Prezzi, orari, requisiti d’ingresso, previsioni e disponibilità vanno ricontrollati sui siti ufficiali. L’app non effettua prenotazioni.

## Verifiche

```sh
npm test
npm run build
npm run test:e2e
```

I test unitari verificano date, intervalli, link e conversione delle località. I 13 test Playwright verificano CRUD, persistenza, filtri, calendario, ricerca mondiale, dati meteo/festività, indisponibilità dei servizi e layout mobile, rotazione con mouse e touch, zoom, navigazione del globo da tastiera e aggiunta in un clic. Le API esterne sono simulate per rendere le verifiche ripetibili e indipendenti dal traffico di rete.

I test nel cloud usano Chromium in `/usr/bin/chromium`. Su un’altra macchina impostare `CHROMIUM_PATH` al percorso di un Chromium installato. Il server di sviluppo viene avviato automaticamente se non è già attivo. Nessun test richiede credenziali.
