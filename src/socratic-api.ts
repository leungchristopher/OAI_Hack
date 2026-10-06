import {SocraticOutputSchema,type SocraticRequest,type SocraticResponse} from '../shared/socratic';
import type {Usage} from '../shared/contracts';
export class SocraticApiError extends Error{constructor(message:string,public status:number,public usage?:Usage){super(message);}}
export async function socraticChat(input:SocraticRequest,code:string,signal:AbortSignal):Promise<SocraticResponse>{
 const response=await fetch('/api/socratic-chat',{method:'POST',headers:{'Content-Type':'application/json','X-Demo-Code':code},body:JSON.stringify(input),signal});
 const value=await response.json().catch(()=>({error:'The tutor returned an unreadable response.'}));
 if(!response.ok)throw new SocraticApiError(value.error||`Tutor request failed (${response.status})`,response.status,value.usage??(value.requests?{requests:value.requests,inputTokens:0,outputTokens:0,unmeasuredRequests:value.requests}:undefined));
 SocraticOutputSchema.parse(value.output);return value;
}
