import { test, expect } from '@playwright/test';

for(const lens of ['Schmidhuber','Hannon']){
 test(`${lens} complete Replay, simulation, proposal and falsification`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const communityRequests:string[]=[];page.on('request',request=>{if(/fetch-community|community-thread|bsky\.app|bsky\.social/.test(request.url()))communityRequests.push(request.url())});
  await page.goto('/');
  await page.getByRole('button',{name:new RegExp(`Explore the ${lens} lens`)}).click();
  await page.getByRole('button',{name:'Run workflow',exact:true}).click();
  await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
  await page.getByRole('button',{name:'Open experiment',exact:true}).click();
  await page.getByText('Source & assumptions',{exact:true}).click();
  await expect(page.getByText('Illustrative demonstration — not a reproduction')).toBeVisible();
  const slider=page.getByRole('slider').first();
  const initial=await slider.inputValue();await slider.focus();await slider.press('ArrowRight');expect(await slider.inputValue()).not.toBe(initial);
  await page.getByRole('button',{name:'Close dialog'}).click();
  await expect(page.locator('.instrument.stale')).toHaveCount(4);
  await page.getByRole('button',{name:/^(Resume|Run workflow)$/}).click();
  await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
  await page.locator('.react-flow__node').filter({has:page.getByRole('heading',{name:'Extension Proposer',exact:true})}).click();
  await page.locator('.proposal-preview').first().click();
  await page.getByRole('button',{name:'What would falsify this?'}).click();
  await expect(page.getByText('Outcome against the hypothesis')).toBeVisible();
  await page.getByRole('button',{name:'Critique',exact:true}).click();
  await page.getByRole('button',{name:'Run separate Skeptic pass'}).click();
  await expect(page.getByText('Evidence verdict: unresolved')).toBeVisible();
  await expect(page.getByText('Community Margins',{exact:true})).toHaveCount(0);
  await expect(page.getByText(/Bluesky/)).toHaveCount(0);
  expect(communityRequests).toEqual([]);
  expect(errors).toEqual([]);
 });
}
test('mobile layout and pasted text work without confusing fixture evidence',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('heading',{name:'Marginalia.'})).toBeVisible();
 await page.getByRole('button',{name:/Add paper text/}).click();
 await page.getByLabel('Paper text').fill('A pasted research abstract with an explicitly unverified hypothesis and sufficient content.');
 await page.getByRole('button',{name:'Add to research desk'}).click();
 await page.getByRole('button',{name:'Run workflow',exact:true}).click();
 await expect(page.getByText('Use the interactive tutor to explore pasted papers.',{exact:false})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});

test('restores an older saved graph without removed community instruments',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Explore the Schmidhuber lens/}).click();
 await page.getByRole('button',{name:'Run workflow',exact:true}).click();
 await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
 await page.evaluate(()=>{const key='marginalia-workspace-v1';const saved=JSON.parse(localStorage.getItem(key)!);saved.nodes.push({id:'community',type:'community',settings:{},status:'complete',inputHash:'legacy',output:{summary:'Old community result',posts:[]},position:{x:1,y:1}});saved.edges.push({id:'paper-community',source:'paper',target:'community',sourcePort:'output',targetPort:'input'});localStorage.setItem(key,JSON.stringify(saved));});
 await page.reload();await page.getByRole('button',{name:/Resume (saved )?workspace/}).click();
 await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
 await expect(page.getByText('Community Margins',{exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>{const saved=JSON.parse(localStorage.getItem('marginalia-workspace-v1')!);return saved.nodes.some((node:{type:string})=>node.type==='community')||saved.edges.some((edge:{source:string;target:string})=>edge.source==='community'||edge.target==='community')})).toBe(false);
});
test('removes saved public comments and stale comment critiques on restore',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Explore the Hannon lens/}).click();
 await page.getByRole('button',{name:'Run workflow',exact:true}).click();
 await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
 await page.evaluate(()=>{const key='marginalia-workspace-v1';const saved=JSON.parse(localStorage.getItem(key)!);const skeptic=saved.nodes.find((node:{type:string})=>node.type==='skeptic');const comment={uri:'at://did:plc:test/app.bsky.feed.post/old',cid:'old',authorDid:'did:plc:test',authorHandle:'legacy.test',displayName:'Legacy',text:'Obsolete random comment',createdAt:'2026-10-06T00:00:00Z',url:'https://bsky.app/profile/legacy.test/post/old',matchType:'possible-mention',matchedIdentifier:'',parentUri:null,retrievedAt:'2026-10-06T00:00:00Z'};skeptic.settings.selectedComment=comment;skeptic.output={summary:'Old comment critique',posts:[comment]};localStorage.setItem(key,JSON.stringify(saved));});
 await page.reload();await page.getByRole('button',{name:/Resume (saved )?workspace/}).click();
 await expect(page.getByText(/0?8 \/ 0?9 instruments complete/)).toBeVisible();
 await expect(page.getByText('Old comment critique',{exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('marginalia-workspace-v1')!.includes('Obsolete random comment'))).toBe(false);
 await page.getByRole('button',{name:/^(Resume|Run workflow)$/}).click();
 await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
});

test('changed bundled evidence invalidates restored outputs',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Explore the Schmidhuber lens/}).click();
 await page.getByRole('button',{name:'Run workflow',exact:true}).click();
 await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
 await page.evaluate(()=>{const key='marginalia-workspace-v1';const saved=JSON.parse(localStorage.getItem(key)!);saved.evidenceVersion='old abstract corpus';localStorage.setItem(key,JSON.stringify(saved));});
 await page.reload();await page.getByRole('button',{name:/Resume (saved )?workspace/}).click();
 await expect(page.locator('.instrument.stale')).toHaveCount(9);
 await page.getByRole('button',{name:/^(Resume|Run workflow)$/}).click();
 await expect(page.getByText(/0?9 \/ 0?9 instruments complete/)).toBeVisible();
});
