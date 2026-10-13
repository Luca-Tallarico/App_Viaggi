import { test, expect } from '@playwright/test';
import { todayISO } from '../../src/utils.js';
const currentDay=todayISO();
const futureDate=new Date(`${currentDay}T12:00:00`);futureDate.setMonth(futureDate.getMonth()+6);futureDate.setDate(10);
const futureStart=`${futureDate.getFullYear()}-${String(futureDate.getMonth()+1).padStart(2,'0')}-10`;
const futureEnd=futureStart.slice(0,8)+'12';
const futureReturn=futureStart.slice(0,8)+'14';

test.beforeEach(async ({page})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.route('https://images.unsplash.com/**',route=>route.abort());
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
  await page.route('https://api.open-meteo.com/**',route=>route.fulfill({json:{daily:{time:[currentDay],weather_code:[0],temperature_2m_max:[23],temperature_2m_min:[15],precipitation_probability_max:[5]}}}));
  await page.route('https://date.nager.at/**',route=>route.fulfill({json:[]}));
  await page.route('https://restcountries.com/**',route=>route.fulfill({json:{languages:{jpn:'Japanese'},currencies:{JPY:{name:'Japanese yen'}}}}));
  await page.route('https://it.wikipedia.org/**',route=>route.fulfill({json:{query:{pages:{}}}}));
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button',{name:/Le nostre mete/}).click();
});

test('add, edit, persist and remove a trip',async ({page})=>{
  await expect(page.locator('.trip-card')).toHaveCount(3);
  await page.getByRole('button',{name:'Aggiungi una meta',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Parigi Francia'}).click();
  await dialog.getByRole('button',{name:/Date e dettagli/}).click();
  await dialog.getByLabel('Partenza',{exact:true}).fill(futureStart);
  await dialog.getByLabel('Ritorno',{exact:true}).fill(futureReturn);
  await dialog.getByLabel('Stato del viaggio').selectOption('planned');
  await dialog.getByRole('textbox',{name:'Note',exact:true}).fill('Un weekend tutto per noi.');
  await dialog.getByRole('button',{name:'Aggiungi ai viaggi'}).click();
  await expect(page.locator('.trip-card')).toHaveCount(4);
  await page.reload();
  await page.getByRole('navigation').getByRole('button',{name:/Le nostre mete/}).click();
  const card=page.locator('.trip-card').filter({has:page.getByRole('heading',{name:'Parigi',exact:true})});
  await expect(card).toContainText('Un weekend tutto per noi.');
  await card.getByRole('button',{name:'Modifica Parigi'}).click();
  await dialog.getByRole('textbox',{name:'Note',exact:true}).fill('Il Louvre e un caffè.');
  await dialog.getByRole('button',{name:'Salva modifiche'}).click();
  await expect(card).toContainText('Il Louvre e un caffè.');
  await card.getByRole('button',{name:'Rimuovi Parigi'}).click();
  await dialog.getByRole('button',{name:'Rimuovi meta',exact:true}).click();
  await expect(page.locator('.trip-card')).toHaveCount(3);
});

test('filters and search compose, and the empty state restores them',async ({page})=>{
  await page.getByRole('button',{name:'Asia',exact:true}).click();
  await expect(page.locator('.trip-card')).toHaveCount(1);
  await page.getByLabel('Cerca nelle tue mete').fill('Lisbona');
  await expect(page.locator('.trip-card')).toHaveCount(0);
  await page.getByRole('button',{name:'Azzera i filtri'}).click();
  await expect(page.locator('.trip-card')).toHaveCount(3);
  await page.getByLabel('Ordina mete').selectOption('name');
  await expect(page.locator('.card-title h3').first()).toHaveText('Copenaghen');
});

test('planned trips require valid dates',async ({page})=>{
  await page.getByRole('button',{name:'Modifica Lisbona'}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Stato del viaggio').selectOption('planned');
  await dialog.getByRole('button',{name:'Salva modifiche'}).click();
  await expect(dialog.getByRole('alert')).toContainText('scegli partenza e ritorno');
  await dialog.getByLabel('Partenza',{exact:true}).fill(futureStart);
  await dialog.getByLabel('Ritorno',{exact:true}).fill(futureEnd);
  await dialog.getByRole('button',{name:'Salva modifiche'}).click();
  await expect(dialog).toHaveCount(0);
});

test('calendar displays actual trip dates and opens the trip',async ({page})=>{
  await page.getByRole('button',{name:'Modifica Lisbona'}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Partenza',{exact:true}).fill(futureStart);
  await dialog.getByLabel('Ritorno',{exact:true}).fill(futureEnd);
  await dialog.getByLabel('Stato del viaggio').selectOption('planned');
  await dialog.getByRole('button',{name:'Salva modifiche'}).click();
  await page.getByRole('navigation').getByRole('button',{name:'Calendario'}).click();
  await expect(page.locator('.calendar-header')).toContainText(futureDate.toLocaleDateString('it-IT',{month:'long',year:'numeric'}));
  await expect(page.locator('.calendar-event')).toHaveCount(3);
  await page.locator('.calendar-event').first().click();
  await expect(dialog).toHaveAttribute('aria-label','Scopri Lisbona');
  await expect(dialog).toContainText('È presto per una previsione affidabile');
  const link=dialog.getByRole('link',{name:'Un posto dove stare Cerca su Booking.com'});
  await expect(link).toHaveAttribute('href',new RegExp(`checkin=${futureStart}`));
  await expect(link).toHaveAttribute('href',new RegExp(`checkout=${futureEnd}`));
  await expect(dialog.getByRole('link',{name:'Il volo che fa per noi Cerca su Google Flights'})).toHaveAttribute('href',/MXP/);
});

test('worldwide search adds a geocoded destination and persists it',async ({page})=>{
  await page.route('https://geocoding-api.open-meteo.com/**',route=>route.fulfill({json:{results:[{id:1850147,name:'Tokyo',country:'Giappone',country_code:'JP',latitude:35.6895,longitude:139.6917,timezone:'Asia/Tokyo'}]}}));
  await page.getByRole('navigation').getByRole('button',{name:'Mappa',exact:true}).click();
  await page.getByLabel('Cerca una località sulla mappa').fill('Tokyo');
  await page.getByRole('button',{name:'Cerca',exact:true}).click();
  await page.locator('.map-search-results').getByRole('button',{name:/Tokyo/}).click();
  await expect(page.locator('.map-discovery')).toContainText('Tokyo');
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(34);
  await page.locator('.map-discovery').getByRole('button',{name:'Aggiungi ai viaggi'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('navigation').getByRole('button',{name:/Le nostre mete/}).click();
  await expect(page.locator('.trip-card')).toHaveCount(4);
  await page.reload();
  await page.getByRole('navigation').getByRole('button',{name:/Le nostre mete/}).click();
  await expect(page.locator('.card-title')).toContainText(['Tokyo','Lisbona','Kyoto','Copenaghen']);
});

test('unavailable APIs show honest fallbacks, and unsupported holidays are distinguished',async ({page})=>{
  await page.route('https://api.open-meteo.com/**',route=>route.abort());
  await page.route('https://date.nager.at/**',route=>route.fulfill({status:204,body:''}));
  await page.getByRole('button',{name:'Scopri Lisbona'}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toContainText('Il servizio meteo non risponde');
  await expect(dialog).toContainText('Questo Paese non è coperto');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Aggiungi una meta',exact:true}).click();
  await page.route('https://geocoding-api.open-meteo.com/**',route=>route.abort());
  await page.getByLabel('Cerca località nel mondo').fill('Tokyo');
  await page.getByRole('dialog').getByRole('button',{name:'Cerca',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('La ricerca mondiale non risponde');
});

test('forecast and public holidays render provider responses',async ({page})=>{
  await page.route('https://date.nager.at/**',route=>route.fulfill({json:[{date:currentDay,localName:'Festività di test',global:true,types:['Public']}]}));
  await page.getByRole('button',{name:'Scopri Lisbona'}).click();
  const dialog=page.getByRole('dialog');
  await dialog.locator('.planner-dates').getByLabel('Dal',{exact:true}).fill(currentDay);
  await dialog.locator('.planner-dates').getByLabel('Al',{exact:true}).fill(currentDay);
  await expect(dialog.locator('.weather-days')).toContainText('23°');
  await expect(dialog.locator('.holiday-panel')).toContainText('Festività di test');
});

test('mobile navigation, trip sheet and layouts fit the viewport',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('h1')).toContainText('Le nostre mete');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Apri menu'}).click();
  await page.getByRole('navigation').getByRole('button',{name:'Calendario'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Nuovo viaggio'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
