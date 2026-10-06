import {test,expect,type Page} from '@playwright/test';
async function enter(page:Page){await page.goto('/');await page.getByRole('button',{name:'Explore AlphaGo',exact:true}).click();await expect(page.getByRole('heading',{name:'AlphaGo',exact:true})).toBeVisible({timeout:15000});}
test('AlphaGo world journey computes search, network and training updates',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const calls:string[]=[];await page.route('**/api/execute-node',r=>{calls.push(r.request().url());return r.abort();});
 await enter(page);
 await expect(page.getByLabel('D4 visits',{exact:true})).toHaveValue('4');
 for(const name of ['Select edge','Expand leaf','Evaluate leaf','Commit backup'])await page.getByRole('button',{name,exact:true}).click();
 await expect(page.getByLabel('D4 visits',{exact:true})).toHaveValue('5');
 await expect(page.locator('.ag-log')).toContainText('one visit backed up');
 await page.getByLabel('Search selection rule').selectOption('ucb1');await expect(page.locator('.math-equation').first()).toContainText('UCB1 comparison');
 await page.getByLabel('D16 visits',{exact:true}).fill('0');await expect(page.locator('.ag-table-wrap tbody tr').last()).toContainText('∞');
 await page.getByRole('navigation',{name:'AlphaGo rooms'}).getByRole('button',{name:/Networks/}).click();
 const activation=page.getByText(/ReLU output/);const before=await activation.textContent();await page.getByLabel('Convolution input 1',{exact:true}).click();await page.getByLabel('Convolution input 2',{exact:true}).click();await expect(activation).not.toHaveText(before!);
 const p=await page.locator('.ag-prob').first().textContent();await page.getByLabel('Policy logit 1',{exact:true}).focus();await page.getByLabel('Policy logit 1',{exact:true}).press('ArrowRight');await expect(page.locator('.ag-prob').first()).not.toHaveText(p!);
 await page.getByRole('navigation',{name:'AlphaGo rooms'}).getByRole('button',{name:/Training/}).click();const old=await page.getByText(/Cross-entropy /).textContent();await page.getByRole('button',{name:'Apply one gradient update'}).click();await expect(page.getByText(/Cross-entropy /)).not.toHaveText(old!);
 await page.getByRole('button',{name:/Position values/}).click();const loss=await page.locator('.ag-number').textContent();await page.getByRole('button',{name:'Apply one gradient update'}).click();await expect(page.locator('.ag-number')).not.toHaveText(loss!);
 expect(calls).toEqual([]);expect(errors).toEqual([]);
});
test('all five historical Go games load, jump and replay on mobile without page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await enter(page);
 await page.getByRole('navigation',{name:'AlphaGo rooms'}).getByRole('button',{name:/Games/}).click();
 const games=page.getByRole('navigation',{name:'Select match game'});await expect(games.getByRole('button')).toHaveCount(5);
 for(let number=1;number<=5;number++){await games.getByRole('button',{name:new RegExp(`GAME ${number} `)}).click();await expect(page.getByRole('img',{name:new RegExp(`Game ${number}, move 0`)})).toBeVisible();await page.getByRole('button',{name:'Go to final move',exact:true}).click();await expect(page.getByText('End of recorded game',{exact:true})).toBeVisible();}
 await page.getByRole('button',{name:/AlphaGo · Game 2, move 37/}).click();await expect(page.getByText('Black P10',{exact:true})).toBeVisible();await expect(page.getByRole('slider',{name:'Game move'})).toHaveValue('37');
 await page.getByRole('button',{name:/Lee Sedol · Game 4, move 78/}).click();await expect(page.getByText('White L11',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Next Go move',exact:true}).click();await expect(page.getByRole('slider',{name:'Game move'})).toHaveValue('79');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('navigation',{name:'AlphaGo rooms'}).getByRole('button',{name:/Search/}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
