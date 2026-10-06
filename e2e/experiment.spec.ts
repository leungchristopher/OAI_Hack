import {test,expect} from '@playwright/test';
test('pasted paper never receives a bundled experiment recording',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Add paper text/}).click();await page.getByLabel('Title',{exact:false}).fill('Unrelated supplied paper');await page.getByLabel('Paper text',{exact:true}).fill('This supplied paper discusses an unrelated hypothesis about geometric optimization.');await page.getByRole('button',{name:/Add to research desk/}).click();await page.getByRole('button',{name:'LSTM lab',exact:true}).click();await expect(page.getByRole('article',{name:'Generated experiment explanation'})).toHaveCount(0);
});
