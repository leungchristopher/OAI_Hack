import {test,expect} from '@playwright/test';
test('autoresearch canvas validates manual wiring and completes a recorded review without model calls',async({page})=>{
 const calls:string[]=[];await page.route('**/api/execute-node',r=>{calls.push(r.request().url());return r.abort();});
 await page.goto('/');await page.getByRole('button',{name:/Explore the Schmidhuber lens/}).click();await page.getByRole('button',{name:'Autoresearch',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Autoresearch loop'});await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'Clear canvas',exact:true}).click();await expect(dialog.getByRole('button',{name:'Run loop',exact:true})).toBeDisabled();await expect(dialog.locator('.react-flow__node')).toHaveCount(0);
 for(const label of ['Research objective','Propose','Critique','Revise'])await dialog.locator('.auto-palette').getByRole('button',{name:new RegExp(`\\+ ${label}`)}).click();
 await expect(dialog.locator('.react-flow__node')).toHaveCount(4);await dialog.getByText('Wire without dragging',{exact:true}).click();
 for(const label of ['Connect Research objective → Propose','Connect Propose → Critique','Connect Critique → Revise'])await dialog.getByRole('button',{name:label,exact:true}).click();
 await expect(dialog.getByRole('button',{name:'Run loop',exact:true})).toBeEnabled();await dialog.getByLabel('Research objective',{exact:true}).fill('');await expect(dialog.getByRole('button',{name:'Run loop',exact:true})).toBeDisabled();await dialog.getByLabel('Research objective',{exact:true}).fill('Which controlled change would falsify the memory-retention hypothesis?');
 await dialog.getByRole('button',{name:'Run loop',exact:true}).click();await expect(dialog.getByText('1 completed round',{exact:true})).toBeVisible();await expect(dialog.locator('.auto-usage')).toContainText('0 requests');await expect(dialog.locator('.auto-round')).toHaveCount(1);await dialog.getByText('Critique & evidence',{exact:true}).click();await expect(dialog.getByRole('heading',{name:'Next revision',exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'Close autoresearch loop'}).click();await page.getByRole('button',{name:'Autoresearch',exact:true}).click();await expect(page.getByText('1 completed round',{exact:true})).toBeVisible();expect(calls).toEqual([]);
});
test('autoresearch mobile controls and keyboard close remain accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:/Explore the Hannon lens/}).click();await page.getByRole('button',{name:'Autoresearch',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Autoresearch loop'});await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'Clear canvas',exact:true}).click();await dialog.getByRole('button',{name:'Build example loop',exact:true}).click();await expect(dialog.getByRole('button',{name:'Run loop',exact:true})).toBeEnabled();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
});

