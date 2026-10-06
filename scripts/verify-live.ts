import 'dotenv/config';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createApp } from '../server/index';
import { lenses } from '../src/data';
import { createWorkflow, WorkflowRunner } from '../src/workflow/runner';
import { ApiError } from '../src/api';
import type { ExecuteResponse, Usage } from '../shared/contracts';
const lens=lenses.find(l=>l.id===(process.argv[2]||'schmidhuber'))!;
if(!process.env.OPENAI_API_KEY||!process.env.DEMO_CODE)throw new Error('Server credentials are not configured');
process.env.MARGINALIA_PREGENERATE='1'; // Explicit offline pre-generation, never a browser setting.
const server=createApp().listen(0,'127.0.0.1');
await new Promise<void>((r,j)=>{server.once('listening',r);server.once('error',j)});
const base=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
const prior=process.argv.includes('--resume')?JSON.parse(readFileSync(`/private/tmp/marginalia-live/${lens.id}.json`,'utf8')):null;
const usage:Usage=prior?.usage??{requests:0,inputTokens:0,outputTokens:0,unmeasuredRequests:0};
const runner=new WorkflowRunner(async(request,_code,signal)=>{
 const response=await fetch(base+'/api/execute-node',{method:'POST',headers:{'Content-Type':'application/json','X-Demo-Code':process.env.DEMO_CODE!},body:JSON.stringify(request),signal});
 const result=await response.json();
 if(!response.ok)throw new ApiError(`${request.type}: HTTP ${response.status}. ${result.error} Category: ${result.category||'unknown'}`,response.status,result.usage??(result.requests?{requests:result.requests,inputTokens:0,outputTokens:0,unmeasuredRequests:result.requests}:undefined));
 return result as ExecuteResponse;
});
try{
 const nodes=await runner.run({...createWorkflow(),...(prior?{nodes:prior.nodes.filter((node:{type:string})=>node.type!=='community')}:{}),fixture:lens,paper:lens.paper,profile:lens.profile,mode:'live',demoCode:process.env.DEMO_CODE,onEvent:e=>{if(e.type==='complete'||e.type==='error')console.log(JSON.stringify({node:e.nodeId,status:e.type,summary:e.type==='error'?e.summary:undefined}))},onUsage:u=>{usage.requests+=u.requests;usage.inputTokens+=u.inputTokens;usage.outputTokens+=u.outputTokens;usage.unmeasuredRequests!+=u.unmeasuredRequests||0}});
 const result={lens:lens.id,verifiedAt:new Date().toISOString(),usage,models:{fast:process.env.OPENAI_MODEL_FAST||'gpt-5.4-mini',reasoning:process.env.OPENAI_MODEL_REASONING||'gpt-5.4'},allComplete:nodes.every(n=>n.status==='complete'),nodes};
 mkdirSync('/private/tmp/marginalia-live',{recursive:true});writeFileSync(`/private/tmp/marginalia-live/${lens.id}.json`,JSON.stringify(result,null,2));
 console.log(JSON.stringify({lens:lens.id,allComplete:result.allComplete,usage}));
 if(!result.allComplete)process.exitCode=1;
}finally{server.closeAllConnections();server.close()}
