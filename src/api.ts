import { ArtifactSchema, type ExecuteRequest, type ExecuteResponse } from '../shared/contracts';
export class ApiError extends Error { constructor(message:string,public status:number,public usage?:ExecuteResponse['usage']) { super(message); } }
async function request<T>(path:string,body?:unknown,signal?:AbortSignal,code?:string):Promise<T> {
 const response=await fetch(`/api/${path}`,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json',...(code?{'X-Demo-Code':code}:{})},body:body===undefined?undefined:JSON.stringify(body),signal});
 const value=await response.json().catch(()=>({error:'The backend returned an unreadable response. Check that the server is running.'}));
 if(!response.ok)throw new ApiError(value.error||`Request failed (${response.status})`,response.status,value.usage??(value.requests?{requests:value.requests,inputTokens:0,outputTokens:0,unmeasuredRequests:value.requests}:undefined));
 return value as T;
}
export async function executeNode(input:ExecuteRequest,code:string,signal?:AbortSignal):Promise<ExecuteResponse>{const result=await request<ExecuteResponse>('execute-node',input,signal,code);ArtifactSchema.parse(result.output);return result;}
export const getHealth=()=>request<{configured:boolean;models:{fast:string;reasoning:string}}>('health');
