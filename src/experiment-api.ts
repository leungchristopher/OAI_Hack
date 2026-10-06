import { z } from 'zod';
import { ExperimentExplanationSchema, type ExplainExperimentRequest, type ExplainExperimentResponse } from '../shared/experiment';
import type { Usage } from '../shared/contracts';
const UsageSchema=z.object({requests:z.number().int().nonnegative(),inputTokens:z.number().int().nonnegative(),outputTokens:z.number().int().nonnegative(),unmeasuredRequests:z.number().int().nonnegative().optional()});
export class ExperimentApiError extends Error {constructor(message:string,public status:number,public usage?:Usage){super(message);}}
export async function explainExperiment(request:ExplainExperimentRequest,demoCode:string,signal:AbortSignal):Promise<ExplainExperimentResponse>{
 const controller=new AbortController();let timedOut=false;
 const abort=()=>controller.abort();signal.addEventListener('abort',abort,{once:true});if(signal.aborted)controller.abort();
 const timer=setTimeout(()=>{timedOut=true;controller.abort();},140_000);
 try{
  const response=await fetch('/api/explain-experiment',{method:'POST',headers:{'Content-Type':'application/json','X-Demo-Code':demoCode},body:JSON.stringify(request),signal:controller.signal});
  const data=await response.json().catch(()=>null);
  const measured=UsageSchema.safeParse(data?.usage);
  const usage=measured.success?measured.data:data?.requests?{requests:Number(data.requests),inputTokens:0,outputTokens:0,unmeasuredRequests:Number(data.requests)}:undefined;
  if(!response.ok)throw new ExperimentApiError(typeof data?.error==='string'?data.error:`The explanation request failed (${response.status}).`,response.status,usage??{requests:0,inputTokens:0,outputTokens:0});
  const output=ExperimentExplanationSchema.safeParse(data?.output);
  if(!output.success||typeof data?.model!=='string')throw new ExperimentApiError('The server returned an incomplete explanation. Your experiment is still available.',502,usage??{requests:1,inputTokens:0,outputTokens:0,unmeasuredRequests:1});
  return {output:output.data,usage:usage??{requests:1,inputTokens:0,outputTokens:0,unmeasuredRequests:1},model:data.model};
 }catch(error){if(timedOut)throw new Error('The explanation request timed out. No retry was made; its API usage is unmeasured.');throw error;}
 finally{clearTimeout(timer);signal.removeEventListener('abort',abort);}
}
