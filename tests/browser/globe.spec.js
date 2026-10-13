import { test, expect } from '@playwright/test';

test.beforeEach(async ({page})=>{
  await page.route('https://**/*',route=>route.abort());
  await page.goto('/');
  await expect(page.getByRole('group',{name:'Mappamondo interattivo'})).toBeVisible();
});

test('the homepage globe works offline and can be dragged, zoomed and rotated with the keyboard',async ({page})=>{
  const globe=page.getByRole('group',{name:'Mappamondo interattivo'});
  await expect(page.locator('.globe-land path')).toHaveCount(177);
  const before=await globe.getAttribute('data-rotation');
  const box=await globe.boundingBox();
  await page.mouse.move(box.x+box.width*.35,box.y+box.height*.75);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.35+95,box.y+box.height*.75-25,{steps:8});
  await page.mouse.up();
  await expect(globe).not.toHaveAttribute('data-rotation',before);
  const radius=await globe.locator('clipPath circle').getAttribute('r');
  await page.getByRole('button',{name:'Ingrandisci globo'}).click();
  await expect(globe.locator('clipPath circle')).not.toHaveAttribute('r',radius);
  const dragged=await globe.getAttribute('data-rotation');
  await globe.focus();await page.keyboard.press('ArrowRight');
  await expect(globe).not.toHaveAttribute('data-rotation',dragged);
  await page.getByRole('button',{name:'Ripristina globo'}).click();
  await expect(globe).toHaveAttribute('data-rotation','-12,-23');
});

test('a globe marker adds a destination with one click and prevents accidental duplicates',async ({page})=>{
  await page.getByRole('button',{name:'Seleziona Marrakech, Marocco'}).click();
  await expect(page.locator('.map-discovery h3')).toHaveText('Marrakech');
  await page.locator('.map-discovery').getByRole('button',{name:'Aggiungi ai viaggi'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.map-discovery').getByRole('button',{name:'Nei tuoi viaggi'})).toBeDisabled();
  await page.reload();
  await expect(page.locator('.globe-summary')).toContainText('4 mete salvate');
  await page.getByRole('navigation').getByRole('button',{name:/Le nostre mete/}).click();
  await expect(page.locator('.trip-card')).toHaveCount(4);
  await expect(page.locator('.card-title')).toContainText(['Marrakech','Lisbona','Kyoto','Copenaghen']);
});

test('continents show worldwide destinations and saved dates still appear in the calendar',async ({page})=>{
  await page.getByRole('button',{name:'Americhe',exact:true}).click();
  await page.getByRole('button',{name:'Seleziona New York, Stati Uniti'}).click();
  await page.locator('.map-discovery').getByRole('button',{name:'Aggiungi ai viaggi'}).click();
  await page.getByRole('button',{name:'Modifica date e note'}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByLabel('Partenza',{exact:true}).fill('2030-05-10');
  await dialog.getByLabel('Ritorno',{exact:true}).fill('2030-05-12');
  await dialog.getByLabel('Stato del viaggio').selectOption('planned');
  await dialog.getByRole('button',{name:'Salva modifiche'}).click();
  await page.getByRole('navigation').getByRole('button',{name:'Calendario',exact:true}).click();
  await expect(page.locator('.calendar-event')).toHaveCount(3);
  await expect(page.locator('.calendar-header')).toContainText('maggio 2030');
});

test('the add dialog keeps optional fields collapsed and permits saving only a destination',async ({page})=>{
  await page.getByRole('button',{name:'Aggiungi una meta',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Parigi Francia'}).click();
  await expect(dialog.getByLabel('Partenza',{exact:true})).toHaveCount(0);
  await dialog.getByRole('button',{name:'Aggiungi ai viaggi'}).click();
  await page.getByRole('navigation').getByRole('button',{name:/Le nostre mete/}).click();
  const card=page.locator('.trip-card').filter({has:page.getByRole('heading',{name:'Parigi',exact:true})});
  await expect(card).toContainText('Date da scegliere');
});

test('mobile globe, touch rotation, selection and quick add fit the viewport',async ({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.route('https://**/*',route=>route.abort());
  await page.goto('/');
  const globe=page.getByRole('group',{name:'Mappamondo interattivo'});
  await expect(globe).toBeVisible();
  const before=await globe.getAttribute('data-rotation');
  await globe.scrollIntoViewIfNeeded();
  const box=await globe.boundingBox();
  const session=await context.newCDPSession(page);
  const touch={x:box.x+box.width*.3,y:box.y+box.height*.7};
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
  for(let step=1;step<=5;step++){
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x+12*step,y:touch.y+3*step}]});
    await page.waitForTimeout(30);
  }
  await expect(globe).not.toHaveAttribute('data-rotation',before);
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(globe).not.toHaveAttribute('data-rotation',before);
  await page.getByRole('button',{name:'Ripristina globo'}).click();
  await page.getByRole('button',{name:'Seleziona Marrakech, Marocco'}).tap();
  await page.locator('.map-discovery').getByRole('button',{name:'Aggiungi ai viaggi'}).tap();
  await expect(page.locator('.map-discovery').getByRole('button',{name:'Nei tuoi viaggi'})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await context.close();
});
