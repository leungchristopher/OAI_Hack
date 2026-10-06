import {test,expect} from '@playwright/test';
test('Socratic tutor sends real contract, shows sources and resets on explicit new conversation',async({page})=>{
 await page.route('**/api/health',r=>r.fulfill({json:{configured:true,models:{fast:'test',reasoning:'test'}}}));
 const requests:any[]=[];
 await page.route('**/api/socratic-chat',async r=>{const body=r.request().postDataJSON();requests.push(body);const doc=body.documents[0],passage=doc?.passages[0];await r.fulfill({json:{output:{reply:'The input gate controls what is written. What happens if it is zero?',evidenceRefs:doc?[{documentId:doc.id,passageId:passage.id,supportingExcerpt:passage.text.slice(0,50)}]:[],suggestedQuestions:['Compare the output gate']},usage:{requests:1,inputTokens:123,outputTokens:45},model:'test-model'}});});
 await page.goto('/');await page.getByRole('button',{name:'Chat with the Socratic tutor',exact:true}).click();
 const chat=page.getByRole('region',{name:'Socratic tutor',exact:true});
 await chat.getByLabel('Live access code').fill('test-access-code-only');await chat.getByLabel('Your question or answer').fill('Explain the input gate.');await chat.getByRole('button',{name:'Send to tutor'}).click();
 await expect(chat.getByText('The input gate controls what is written.',{exact:false})).toBeVisible();await expect(chat.getByText('123 input / 45 output tokens',{exact:false})).toBeVisible();
 await chat.getByText('Sources · 1').click();await expect(chat.locator('blockquote')).toBeVisible();
 expect(requests[0].userMessage).toBe('Explain the input gate.');expect(requests[0].history).toEqual([]);expect(requests[0].systemPrompt).toBeUndefined();
 await chat.getByRole('button',{name:'Compare the output gate'}).click();await chat.getByRole('button',{name:'Send to tutor'}).click();await expect(chat.getByText('2 / 8 requests',{exact:false})).toBeVisible();expect(requests[1].history.map((m:any)=>m.role)).toEqual(['user','assistant']);
 await chat.getByRole('button',{name:'New conversation'}).click();await expect(chat.getByText('0 / 8 requests',{exact:false})).toBeVisible();await expect(chat.locator('.socratic-message')).toHaveCount(0);
 const storage=await page.evaluate(()=>JSON.stringify(localStorage));expect(storage).not.toContain('test-access-code-only');expect(storage).not.toContain('Explain the input gate.');
});
test('Socratic stop prevents late response from entering a new conversation',async({page})=>{
 await page.route('**/api/health',r=>r.fulfill({json:{configured:true,models:{}}}));let received=false;
 await page.route('**/api/socratic-chat',async r=>{received=true;await new Promise(resolve=>setTimeout(resolve,400));await r.fulfill({json:{output:{reply:'OLD RESPONSE MUST NOT APPEAR',evidenceRefs:[],suggestedQuestions:[]},usage:{requests:1,inputTokens:10,outputTokens:10},model:'test'}}).catch(()=>{});});
 await page.goto('/');await page.getByRole('button',{name:'Chat with the Socratic tutor',exact:true}).click();const chat=page.getByRole('region',{name:'Socratic tutor',exact:true});await chat.getByLabel('Live access code').fill('test-access-code-only');await chat.getByLabel('Your question or answer').fill('Quiz me.');await chat.getByRole('button',{name:'Send to tutor'}).click();await expect.poll(()=>received).toBe(true);await chat.getByRole('button',{name:'Stop response'}).click();await expect(chat.getByText('1 unmeasured',{exact:false})).toBeVisible();await chat.getByRole('button',{name:'New conversation'}).click();await page.waitForTimeout(500);await expect(chat.getByText('OLD RESPONSE MUST NOT APPEAR')).toHaveCount(0);await expect(chat.getByText('0 / 8 requests',{exact:false})).toBeVisible();
});
