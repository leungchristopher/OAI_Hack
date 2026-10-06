import {test,expect} from '@playwright/test';
test('ACT attention and latent loss recalculate',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Robotics lab/}).click();await page.getByRole('tab',{name:'Mathematics',exact:true}).click();
 await page.getByLabel('Latent mean μ',{exact:true}).fill('0');await page.getByLabel('Log variance ℓ',{exact:true}).fill('0');await expect(page.getByText(/KL = 0.0000/)).toBeVisible();
 const before=await page.getByRole('meter',{name:'Token 1 attention'}).getAttribute('value');await page.getByLabel('Query first coordinate',{exact:true}).fill('-3');expect(await page.getByRole('meter',{name:'Token 1 attention'}).getAttribute('value')).not.toBe(before);
});
test('Diffusion step and SmolVLA flow controls recalculate',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Robotics lab/}).click();await page.getByRole('tab',{name:'Mathematics',exact:true}).click();await page.getByRole('button',{name:'Diffusion trajectory',exact:true}).click();
 await page.getByRole('button',{name:'Denoise one step'}).click();await expect(page.getByLabel('Diffusion denoising progress')).toHaveValue('1');await page.getByLabel('Diffusion denoising progress').fill('40');await expect(page.getByText(/Noise level k = 0/)).toBeVisible();
 await page.getByRole('button',{name:'SmolVLA trajectory',exact:true}).click();await page.getByLabel('SmolVLA interpolation time').fill('1');await page.getByLabel('SmolVLA conditioning').fill('1.5');await expect(page.getByText(/Scalar training pair:/)).toContainText('1.500');await page.getByLabel('SmolVLA Euler steps').fill('64');await expect(page.getByText(/Endpoint integration error:/)).toBeVisible();
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
