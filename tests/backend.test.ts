import { describe,it,expect,afterEach,vi } from 'vitest';
import { Responses } from 'openai/resources/responses/responses';
import { createApp } from '../server/index';
import { validateEvidence,validateOutput,validateRequest,ExecuteSchema } from '../server/validation';
import { lenses } from '../src/data';
import type { ExecuteRequest,PaperDocument } from '../shared/contracts';
const paper:PaperDocument={id:'paper',title:'Example',authors:['A'],sourceUrl:'https://doi.org/10.1234/example',identifiers:{doi:'10.1234/example'},passages:[{id:'p1',text:'A supplied scientific finding.',section:'abstract',kind:'quotation'}],references:[],coverage:'abstract-only',year:2000};
const request:ExecuteRequest={runId:'run',nodeId:'reader',type:'reader',settings:{},paper,profile:{id:'profile',label:'Research lens',publications:[{...paper,id:'profile-paper'}],explicitInterests:[],coverageStatement:'Selected work'},inputs:{}};
describe('backend validation',()=>{
 it('accepts grounded artifacts for both complete Replay journeys',()=>{for(const fixture of lenses){const req={...request,paper:fixture.paper,profile:fixture.profile,inputs:fixture.replay};for(const artifact of Object.values(fixture.replay))expect(()=>validateOutput(structuredClone(artifact),req)).not.toThrow();}});
 it('resolves passage IDs and exact supporting excerpts',()=>{
  expect(()=>validateEvidence({documentId:'paper',passageId:'p1',supportingExcerpt:'supplied scientific finding'},request)).not.toThrow();
  expect(()=>validateEvidence({documentId:'paper',passageId:'missing',supportingExcerpt:'finding'},request)).toThrow();
  expect(()=>validateEvidence({documentId:'paper',passageId:'p1',supportingExcerpt:'fabricated'},request)).toThrow();
 });
 it('rejects unrecognized node types and settings',()=>{
  expect(ExecuteSchema.safeParse({...request,type:'shell'}).success).toBe(false);
  expect(ExecuteSchema.safeParse({...request,type:'community'}).success).toBe(false);
  expect(ExecuteSchema.safeParse({...request,settings:{model:'arbitrary'}}).success).toBe(false);
 });
 it('requires overlap before extensions and supplied selected proposal',()=>{
  expect(()=>validateRequest({...request,type:'proposer'})).toThrow();
  expect(()=>validateRequest({...request,type:'skeptic',settings:{selectedProposalId:'missing'}})).toThrow();
 });
 it('requires Reader claims before Tutor, Demonstrator, and Overlap',()=>{
  for(const type of ['tutor','demonstrator','overlap'] as const)expect(()=>validateRequest({...request,type})).toThrow('Reader claims');
 });
 it('grounds Tutor connections in supplied claims or implemented components',()=>{
  expect(()=>validateOutput({summary:'Tutor',prerequisites:[{title:'Memory',explanation:'Memory decay',connectedTo:'memory-decay'}]},request)).not.toThrow();
  expect(()=>validateOutput({summary:'Tutor',prerequisites:[{title:'Unknown',explanation:'Missing claim',connectedTo:'invented-claim'}]},request)).toThrow('Prerequisites');
 });
 it('rejects cross-contaminated reader evidence',()=>{
  expect(()=>validateOutput({summary:'test',claims:[{id:'claim',text:'claim',limitations:[],evidenceRefs:[{documentId:'profile-paper',passageId:'p1',supportingExcerpt:'scientific finding'}]}]},request)).toThrow();
 });
});
describe('server access',()=>{
 const servers:ReturnType<ReturnType<typeof createApp>['listen']>[]=[];
 afterEach(async()=>{await Promise.all(servers.splice(0).map(server=>new Promise<void>(resolve=>server.close(()=>resolve()))));});
 it('keeps guests out of live inference and never returns secrets',async()=>{
  const old=process.env.OPENAI_API_KEY;delete process.env.OPENAI_API_KEY;const oldFlag=process.env.MARGINALIA_PREGENERATE;delete process.env.MARGINALIA_PREGENERATE;
  const server=createApp().listen(0,'127.0.0.1');servers.push(server);await new Promise<void>((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  if(old!==undefined)process.env.OPENAI_API_KEY=old;if(oldFlag!==undefined)process.env.MARGINALIA_PREGENERATE=oldFlag;
  const address=server.address() as {port:number};const base=`http://127.0.0.1:${address.port}`;
  for(const endpoint of ['fetch-community','community-thread']){const removed=await fetch(base+'/api/'+endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({paper})});expect(removed.status).toBe(404);}
  const health=await fetch(base+'/api/health').then(r=>r.json());expect(health.configured).toBe(false);expect(Object.keys(health).sort()).toEqual(['configured','models','recordedOnly']);
  expect(health.recordedOnly).toBe(true);
 const spy=vi.spyOn(Responses.prototype,'create');
 for(const endpoint of ['execute-node','explain-experiment']){const blocked=await fetch(base+'/api/'+endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request)});expect(blocked.status).toBe(403);}expect(spy).not.toHaveBeenCalled();spy.mockRestore();
 const response=await fetch(base+'/api/execute-node',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request)});expect(response.status).toBe(403);
 });
});
