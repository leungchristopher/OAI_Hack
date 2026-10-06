import {test,expect} from '@playwright/test';
test('both village themes preserve portrait, movement and staged house entry',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'Pixel',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Brush & ink',exact:true}).click();await expect(page.locator('.knowledge-world')).toHaveAttribute('data-theme','brush');
 const portrait=page.locator('svg image');await expect(portrait).toHaveAttribute('href','/world/schmidhuber-pixel.png');
 await page.reload();await expect(page.getByRole('button',{name:'Brush & ink',exact:true})).toHaveAttribute('aria-pressed','true');
 const map=page.locator('.world-map');await map.focus();const before=await page.locator('.world-avatar').getAttribute('transform');await page.keyboard.down('ArrowRight');await page.waitForTimeout(200);await page.keyboard.up('ArrowRight');expect(await page.locator('.world-avatar').getAttribute('transform')).not.toBe(before);
 await page.getByRole('button',{name:'Reset walk',exact:true}).click();await page.getByRole('button',{name:'Explore AlphaGo',exact:true}).click();await expect(page.locator('.world-map-status')).toContainText('AlphaGo house');await expect(page.getByRole('heading',{name:'AlphaGo',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Back to the village',exact:false}).click();await page.getByRole('button',{name:'Pixel',exact:true}).click();await expect(page.locator('.knowledge-world')).toHaveAttribute('data-theme','pixel');await expect(portrait).toHaveAttribute('href','/world/schmidhuber-pixel.png');
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.getByRole('button',{name:'Brush & ink',exact:true}).click();await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.getByRole('button',{name:'Chat with the Socratic tutor',exact:true}).click();await expect(page.getByRole('heading',{name:'Socratic tutor',exact:true})).toBeVisible();
});
