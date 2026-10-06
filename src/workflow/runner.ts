import { ArtifactSchema, PROMPT_VERSION, type Artifact, type LensFixture, type NodeType, type PaperDocument, type ResearchProfile, type RunEvent, type Usage, type WorkflowEdge, type WorkflowNode } from '../../shared/contracts';
import { ApiError, executeNode } from '../api';

export type WorkflowKind='understand'|'research';
const required:Partial<Record<NodeType,NodeType[]>>={reader:['paper'],tutor:['reader'],demonstrator:['reader'],community:[],overlap:['reader','profile'],proposer:['overlap'],collaborator:['proposer'],skeptic:['reader']};
const allowed:Record<NodeType,NodeType[]>={paper:[],profile:[],reader:['paper'],tutor:['reader','paper'],demonstrator:['reader','tutor','paper'],community:[],overlap:['paper','reader','profile'],proposer:['paper','reader','profile','overlap','demonstrator','tutor'],collaborator:['paper','profile','overlap','proposer'],skeptic:['paper','reader','demonstrator','profile','overlap','proposer','collaborator']};
export const NODE_LABELS:Record<NodeType,string>={paper:'Paper',reader:'Reader',tutor:'Background Tutor',demonstrator:'Demonstrator',community:'Community Margins',profile:'Research Profile',overlap:'Research Overlap',proposer:'Extension Proposer',collaborator:'Collaboration Mapper',skeptic:'Skeptic'};
export function createWorkflow(kind:WorkflowKind='research'):{nodes:WorkflowNode[];edges:WorkflowEdge[]} {
 const types:NodeType[]=kind==='research'?['paper','reader','tutor','demonstrator','profile','overlap','proposer','collaborator','skeptic']:['paper','reader','tutor','demonstrator','skeptic'];
 const positions:Record<NodeType,[number,number]>={paper:[30,100],profile:[30,360],reader:[350,100],community:[350,580],tutor:[670,0],demonstrator:[670,225],overlap:[670,440],proposer:[990,220],collaborator:[1310,80],skeptic:[1310,360]};
 const pairs=kind==='research'?[['paper','reader'],['reader','tutor'],['reader','demonstrator'],['reader','overlap'],['profile','overlap'],['overlap','proposer'],['demonstrator','proposer'],['proposer','collaborator'],['proposer','skeptic']]:[['paper','reader'],['reader','tutor'],['reader','demonstrator'],['reader','skeptic'],['demonstrator','skeptic']];
 return {nodes:types.map(type=>({id:type,type,settings:type==='tutor'?{audience:'graduate'}:{},status:'idle',inputHash:null,output:null,position:{x:positions[type][0],y:positions[type][1]}})),edges:pairs.map(([source,target])=>({id:`${source}-${target}`,source,target,sourcePort:'output',targetPort:'input'}))};
}
export function descendants(edges:WorkflowEdge[],id:string):Set<string>{const set=new Set<string>();const queue=[id];for(let i=0;i<queue.length;i++)for(const e of edges)if(e.source===queue[i]&&!set.has(e.target)){set.add(e.target);queue.push(e.target);}return set;}
export function invalidateDescendants(nodes:WorkflowNode[],edges:WorkflowEdge[],id:string,includeSelf=true):WorkflowNode[]{const affected=descendants(edges,id);if(includeSelf)affected.add(id);return nodes.map(n=>affected.has(n.id)?{...n,status:'stale',inputHash:null,error:undefined}:n);}
export function validateConnection(nodes:WorkflowNode[],edges:WorkflowEdge[],source:string,target:string):{valid:boolean;error?:string}{
 const from=nodes.find(n=>n.id===source),to=nodes.find(n=>n.id===target);
 if(!from||!to)return {valid:false,error:'Both instruments must exist.'};
 if(from.type==='community'||to.type==='community')return {valid:false,error:'Community search has been removed.'};
 if(source===target||descendants(edges,target).has(source))return {valid:false,error:'This connection would create a cycle.'};
 if(edges.some(e=>e.source===source&&e.target===target))return {valid:false,error:'These instruments are already connected.'};
 if(!allowed[to.type].includes(from.type))return {valid:false,error:`${NODE_LABELS[to.type]} cannot consume ${NODE_LABELS[from.type]} output.`};
 return {valid:true};
}
export function topologicalOrder(nodes:WorkflowNode[],edges:WorkflowEdge[]):string[]{
 const ids=new Set(nodes.map(n=>n.id));if(ids.size!==nodes.length)throw new Error('Duplicate instrument identifiers.');
 if(edges.some(e=>!ids.has(e.source)||!ids.has(e.target)))throw new Error('A connection references a missing instrument.');
 const degree=new Map(nodes.map(n=>[n.id,edges.filter(e=>e.target===n.id).length]));const queue=nodes.filter(n=>degree.get(n.id)===0).map(n=>n.id);const result:string[]=[];
 for(let i=0;i<queue.length;i++){const id=queue[i];result.push(id);for(const e of edges.filter(e=>e.source===id)){degree.set(e.target,degree.get(e.target)!-1);if(degree.get(e.target)===0)queue.push(e.target);}}
 if(result.length!==nodes.length)throw new Error('Workflow contains a cycle. Remove a connection and try again.');return result;
}
function stable(value:unknown):string{if(Array.isArray(value))return `[${value.map(stable).join(',')}]`;if(value&&typeof value==='object')return `{${Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${stable(v)}`).join(',')}}`;return JSON.stringify(value)??'null';}
export async function inputHash(value:unknown):Promise<string>{const bytes=new TextEncoder().encode(stable(value));const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');}
export interface RunOptions{nodes:WorkflowNode[];edges:WorkflowEdge[];paper:PaperDocument;profile:ResearchProfile;mode:'replay'|'live';fixture:LensFixture;demoCode?:string;fromNodeId?:string;onUpdate?:(nodes:WorkflowNode[])=>void;onEvent?:(event:RunEvent)=>void;onUsage?:(usage:Usage)=>void;}
type Executor=typeof executeNode;
export class WorkflowRunner {
 private epoch=0;private controller:AbortController|null=null;private cache=new Map<string,Artifact>();private active=false;
 constructor(private executor:Executor=executeNode){}
 get running(){return this.active;}
 cancel(){this.epoch++;this.controller?.abort();this.active=false;}
 async run(o:RunOptions):Promise<WorkflowNode[]>{
  this.cancel();const epoch=this.epoch;const controller=new AbortController();this.controller=controller;this.active=true;
  let nodes=structuredClone(o.nodes);const edges=o.edges;const runId=crypto.randomUUID();let sequence=0;const current=()=>this.epoch===epoch&&!controller.signal.aborted;
  const emit=(nodeId:string,type:RunEvent['type'],summary:string)=>{if(current())o.onEvent?.({runId,nodeId,sequence:++sequence,type,timestamp:new Date().toISOString(),summary});};
  const update=(id:string,patch:Partial<WorkflowNode>)=>{if(!current())return;nodes=nodes.map(n=>n.id===id?{...n,...patch}:n);o.onUpdate?.(structuredClone(nodes));};
  const ancestors=(id:string)=>{const set=new Set<string>();const queue=[id];for(let i=0;i<queue.length;i++)for(const e of edges)if(e.target===queue[i]&&!set.has(e.source)){set.add(e.source);queue.push(e.source);}return set;};
  try{
   if(nodes.some(n=>n.settings.selectedComment||n.output?.posts?.length))throw new Error('Public comments have been removed. Rebuild the example workflow.');
   if(nodes.some(n=>n.type==='community'))throw new Error('Community search has been removed. Rebuild the example workflow.');
   const order=topologicalOrder(nodes,edges);
   for(const edge of edges){const check=validateConnection(nodes,edges.filter(e=>e.id!==edge.id),edge.source,edge.target);if(!check.valid)throw new Error(check.error);}
   if(o.mode==='replay'&&o.paper.id!==o.fixture.paper.id)throw new Error('Recorded results are only available for the bundled paper. Use Live mode for pasted text.');
   if(o.fromNodeId){if(!nodes.some(n=>n.id===o.fromNodeId))throw new Error('Unknown rerun instrument.');nodes=invalidateDescendants(nodes,edges,o.fromNodeId);}
   const selected=o.fromNodeId?new Set([o.fromNodeId,...descendants(edges,o.fromNodeId)]):new Set(order);
   for(const id of [...selected])for(const ancestor of ancestors(id))selected.add(ancestor);
   const pending=new Set(order.filter(id=>selected.has(id)));const finished=new Set(order.filter(id=>!selected.has(id)&&nodes.find(n=>n.id===id)?.status==='complete'));
   for(const id of pending){const node=nodes.find(n=>n.id===id)!;const upstreamTypes=[...ancestors(id)].map(x=>nodes.find(n=>n.id===x)!.type);const missing=(required[node.type]??[]).filter(t=>!upstreamTypes.includes(t));if(missing.length){update(id,{status:'error',error:`Connect ${missing.map(t=>NODE_LABELS[t]).join(', ')} before running this instrument.`});pending.delete(id);emit(id,'error','Missing required evidence inputs.');}}
   for(const id of pending){if(nodes.find(n=>n.id===id)?.status!=='complete')update(id,{status:'queued',error:undefined});}
   const jobs=new Map<string,Promise<void>>();
   const execute=async(id:string)=>{
    const node=nodes.find(n=>n.id===id)!;const upstream=[...ancestors(id)];const inputs=Object.fromEntries(nodes.filter(n=>upstream.includes(n.id)&&n.output).map(n=>[n.id,n.output!]));
    const hash=await inputHash({version:PROMPT_VERSION,type:node.type,mode:o.mode,source:node.type==='profile'?o.profile:o.paper,inputs,settings:node.settings});
    if(!current())return;
    if(node.status==='complete'&&node.inputHash===hash&&node.output){finished.add(id);emit(id,'cache-hit','Unchanged evidence and settings; retained output.');return;}
    const cached=this.cache.get(hash);if(cached){update(id,{status:'complete',output:structuredClone(cached),inputHash:hash,error:undefined});finished.add(id);emit(id,'cache-hit','Reused matching source, inputs, settings and prompt version.');return;}
    update(id,{status:'running',error:undefined});emit(id,'running',o.mode==='replay'?'Loading the recorded artifact.':`Executing ${NODE_LABELS[node.type]}.`);
    let modelDispatched=false;let usageSettled=false;
    try{
     let output:Artifact;
     if(node.type==='paper')output={summary:`${o.paper.title} (${o.paper.year}). ${o.paper.coverage}.`,evidenceRefs:o.paper.passages.map(p=>({documentId:o.paper.id,passageId:p.id,supportingExcerpt:p.text}))};
     else if(node.type==='profile')output={summary:`${o.profile.label}. ${o.profile.coverageStatement} Explicit user interests: ${node.settings.interests||o.profile.explicitInterests.join('; ')}`,evidenceRefs:o.profile.publications.flatMap(d=>d.passages.map(p=>({documentId:d.id,passageId:p.id,supportingExcerpt:p.text})))};
     else if(o.mode==='replay')output=recordedArtifact(o.fixture,node,inputs);
     else{modelDispatched=true;o.onUsage?.({requests:1,inputTokens:0,outputTokens:0,unmeasuredRequests:1});const result=await this.executor({runId,nodeId:id,type:node.type,settings:node.settings,paper:o.paper,profile:o.profile,inputs},o.demoCode??'',controller.signal);o.onUsage?.({...result.usage,requests:result.usage.requests-1,unmeasuredRequests:(result.usage.unmeasuredRequests??0)-1});usageSettled=true;output=result.output;}
     if(!current())return;ArtifactSchema.parse(output);this.cache.set(hash,structuredClone(output));if(this.cache.size>100)this.cache.delete(this.cache.keys().next().value!);update(id,{status:'complete',output,inputHash:hash,error:undefined});finished.add(id);emit(id,'complete',o.mode==='replay'?'Recorded artifact ready.':'Artifact ready; evidence references retained.');
    }catch(error){if(modelDispatched&&!usageSettled&&error instanceof ApiError){const u=error.usage;o.onUsage?.(u?{...u,requests:u.requests-1,unmeasuredRequests:(u.unmeasuredRequests??0)-1}:{requests:-1,inputTokens:0,outputTokens:0,unmeasuredRequests:-1});}if(!current())return;const message=error instanceof Error?error.message:'Instrument failed.';update(id,{status:'error',error:message});emit(id,'error',message);}
   };
   while((pending.size||jobs.size)&&current()){
    for(const id of order){if(jobs.size>=2)break;if(!pending.has(id))continue;const deps=edges.filter(e=>e.target===id).map(e=>e.source);if(!deps.every(d=>finished.has(d)))continue;pending.delete(id);emit(id,'queued','Dependencies ready.');const job=execute(id).finally(()=>jobs.delete(id));jobs.set(id,job);}
    if(jobs.size)await Promise.race(jobs.values());else if(pending.size){for(const id of pending){update(id,{status:'error',error:'An upstream instrument failed or has no output. Repair it, then rerun.'});emit(id,'error','Blocked by an upstream instrument.');}pending.clear();}
   }
   if(!current())return nodes.map(n=>['running','queued'].includes(n.status)?{...n,status:'stale'}:n);
   return nodes;
  }finally{if(this.epoch===epoch)this.active=false;}
 }
}
function recordedArtifact(fixture:LensFixture,node:WorkflowNode,inputs:Record<string,Artifact>):Artifact {
 const output=structuredClone(fixture.replay[node.type]);
 if(node.type==='demonstrator'&&output.demo){output.demo.parameters={...output.demo.parameters,...node.settings.parameters};}

 const proposals=Object.values(inputs).flatMap(a=>a.proposals??[]);const selected=proposals.find(p=>p.id===node.settings.selectedProposalId)||proposals[0];
 if(node.settings.selectedProposalId&&!proposals.some(p=>p.id===node.settings.selectedProposalId))throw new Error('The selected proposal is not available in the supplied upstream evidence.');
 if(['skeptic','collaborator'].includes(node.type)&&selected&&selected.id!==fixture.replay.proposer.proposals?.[0]?.id)throw new Error('This proposal has no recorded assessment. Switch to Live to generate its critique or collaboration map.');
 return output;
}
