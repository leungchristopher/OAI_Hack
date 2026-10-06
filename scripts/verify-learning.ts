import 'dotenv/config';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createApp} from '../server/index';
import {lenses} from '../src/data';
import {alphaGoPaper} from '../src/data/alphago-paper';
import {defaultLstmSequence,defaultLstmSettings} from '../src/simulations/lstm';
import {RNA_CONTROL} from '../src/simulations/rna-mechanism';
process.env.MARGINALIA_PREGENERATE='1'; // Explicit offline pre-generation, never a browser setting.
const server=createApp().listen(0,'127.0.0.1');await new Promise<void>((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject)});
const base=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
async function call(path:string,body:unknown){const r=await fetch(base+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Demo-Code':process.env.DEMO_CODE!},body:JSON.stringify(body)});const data=await r.json();if(!r.ok){console.log(JSON.stringify({path,status:r.status,category:data.category,usage:data.usage}));throw new Error(data.error)}return data;}
try {mkdirSync('/private/tmp/marginalia-live',{recursive:true});
 for(const lens of (process.argv.includes('--chat-only')?[]:lenses)){const experiment=lens.id==='schmidhuber'?{kind:'lstm',sequence:defaultLstmSequence,settings:defaultLstmSettings,cursor:0}:{kind:'rna',settings:RNA_CONTROL,stage:0};const response=await call('explain-experiment',{runId:crypto.randomUUID(),lensId:lens.id,paper:lens.paper,profile:lens.profile,experiment});writeFileSync(`/private/tmp/marginalia-live/${lens.id}-experiment.json`,JSON.stringify({generatedAt:new Date().toISOString(),experiment,response},null,2));console.log(JSON.stringify({lens:lens.id,kind:'experiment',model:response.model,usage:response.usage}));}
 const chat=await call('socratic-chat',{runId:crypto.randomUUID(),topic:'AlphaGo search and learning',documents:[alphaGoPaper],history:[],userMessage:'I think a policy network estimates which player will win. Can you help me distinguish policy from value and ask me a question to check my understanding?'});writeFileSync('/private/tmp/marginalia-live/socratic-check.json',JSON.stringify(chat,null,2));console.log(JSON.stringify({kind:'socratic',model:chat.model,usage:chat.usage,evidenceCount:chat.output.evidenceRefs.length}));
}finally{server.closeAllConnections();server.close()}
