import { z } from 'zod';
import { ArtifactSchema, type Artifact, type ExecuteRequest, type ExecuteResponse, type LensFixture, type Usage } from '../shared/contracts';
import { ApiError, executeNode } from './api';

export const STAGES = ['objective', 'propose', 'critique', 'revise'] as const;
export type StageKind = typeof STAGES[number];
const StageSchema = z.object({id:z.enum(STAGES),position:z.object({x:z.number().finite(),y:z.number().finite()})}).strict();
const EdgeSchema = z.object({id:z.string(),source:z.enum(STAGES),target:z.enum(STAGES)}).strict();
export const LoopConfigSchema = z.object({objective:z.string().min(1).max(1600),kind:z.enum(['incremental','cross-field','speculative']),rounds:z.number().int().min(1).max(3),stopOnSupported:z.boolean(),stages:z.array(StageSchema).max(4),edges:z.array(EdgeSchema).max(6)}).strict();
export type LoopConfig = z.infer<typeof LoopConfigSchema>;
const RoundSchema = z.object({number:z.number().int().min(1).max(3),proposal:ArtifactSchema,critique:ArtifactSchema,selectedId:z.string()}).strict();
const UsageSchema = z.object({requests:z.number().nonnegative(),inputTokens:z.number().nonnegative(),outputTokens:z.number().nonnegative(),unmeasuredRequests:z.number().nonnegative()});
export const LoopSnapshotSchema = z.object({runId:z.string(),fingerprint:z.string(),mode:z.enum(['replay','live']),status:z.enum(['idle','running','paused','complete','error']),phase:z.enum(['propose','critique']),rounds:z.array(RoundSchema).max(3),pending:ArtifactSchema.nullable(),usage:UsageSchema,dispatches:z.number().int().min(0).max(8),stopReason:z.string()}).strict();
export type LoopSnapshot = z.infer<typeof LoopSnapshotSchema>;
export type LoopRound = z.infer<typeof RoundSchema>;
export const STAGE_LABELS:Record<StageKind,string> = {objective:'Research objective',propose:'Propose',critique:'Critique',revise:'Revise'};
export function defaultLoopConfig():LoopConfig{return {objective:'Make the incremental hypothesis more testable. Tighten the baseline, ablation and falsification criterion.',kind:'incremental',rounds:2,stopOnSupported:false,stages:STAGES.map((id,i)=>({id,position:{x:35+i*215,y:75}})),edges:STAGES.slice(1).map((id,i)=>({id:`${STAGES[i]}-${id}`,source:STAGES[i],target:id}))};}
export function validateLoop(config:LoopConfig):string|null{
 const parsed=LoopConfigSchema.safeParse(config);if(!parsed.success)return 'Use an objective of 1–1,600 characters and 1–3 rounds.';
 if(!config.objective.trim())return 'Enter a research objective.';
 const ids=config.stages.map(s=>s.id);if(new Set(ids).size!==ids.length)return 'Each instrument can appear once.';
 const required:StageKind[]=config.rounds>1?['objective','propose','critique','revise']:['objective','propose','critique'];
 if(required.some(id=>!ids.includes(id)))return `Connect ${required.map(id=>STAGE_LABELS[id]).join(' → ')}.`;
 const seen=new Set<string>();
 for(const e of config.edges){if(!ids.includes(e.source)||!ids.includes(e.target))return 'Remove connections to missing instruments.';if(STAGES.indexOf(e.target)!==STAGES.indexOf(e.source)+1)return 'Wire Objective → Propose → Critique → Revise. Rounds control the feedback loop.';const key=`${e.source}-${e.target}`;if(seen.has(key))return 'Remove duplicate connections.';seen.add(key);}
 for(let i=1;i<required.length;i++)if(!seen.has(`${required[i-1]}-${required[i]}`))return `Connect ${STAGE_LABELS[required[i-1]]} → ${STAGE_LABELS[required[i]]}.`;
 return null;
}
export function canConnectStage(config:LoopConfig,source:string,target:string):boolean{return config.stages.some(s=>s.id===source)&&config.stages.some(s=>s.id===target)&&STAGES.indexOf(target as StageKind)===STAGES.indexOf(source as StageKind)+1&&!config.edges.some(e=>e.source===source&&e.target===target);}
export function readyForLive(lens:LensFixture,inputs:Record<string,Artifact>):boolean{return !!lens.paper.passages.length&&!!lens.profile.publications.length&&Object.values(inputs).some(a=>!!a.claims?.length)&&Object.values(inputs).some(a=>!!a.connections?.length);}
function canonical(value:unknown):string{if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;if(value&&typeof value==='object')return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;return JSON.stringify(value)??'null';}
export function loopFingerprint(lens:LensFixture,inputs:Record<string,Artifact>,config:LoopConfig,mode:'live'|'replay'):string{
 // Positions are presentation only; moving a block must not discard paid outputs.
 const text=canonical({paper:lens.paper,profile:lens.profile,inputs:mode==='live'?inputs:{},config:{...config,stages:config.stages.map(s=>s.id).sort(),edges:config.edges.map(e=>`${e.source}-${e.target}`).sort()},mode});let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return `${text.length}:${hash>>>0}`;
}
export function blankLoopSnapshot(fingerprint:string,mode:'live'|'replay'):LoopSnapshot{return {runId:`autoresearch-${crypto.randomUUID()}`,fingerprint,mode,status:'idle',phase:'propose',rounds:[],pending:null,usage:{requests:0,inputTokens:0,outputTokens:0,unmeasuredRequests:0},dispatches:0,stopReason:''};}
/** Whitelisting excludes authentication, props, inputs and arbitrary browser data. */
export function serializeLoop(config:LoopConfig,snapshot:LoopSnapshot|null):string{
 const safeConfig=LoopConfigSchema.parse({objective:config.objective,kind:config.kind,rounds:config.rounds,stopOnSupported:config.stopOnSupported,stages:config.stages.map(s=>({id:s.id,position:{x:s.position.x,y:s.position.y}})),edges:config.edges.map(e=>({id:e.id,source:e.source,target:e.target}))});
 const safeSnapshot=snapshot?LoopSnapshotSchema.parse({runId:snapshot.runId,fingerprint:snapshot.fingerprint,mode:snapshot.mode,status:snapshot.status,phase:snapshot.phase,rounds:snapshot.rounds,pending:snapshot.pending,usage:snapshot.usage,dispatches:snapshot.dispatches,stopReason:snapshot.stopReason}):null;
 return JSON.stringify({version:1,config:safeConfig,snapshot:safeSnapshot});
}
export function restoreLoop(raw:string|null):{config:LoopConfig;snapshot:LoopSnapshot|null}|null{
 if(!raw||raw.length>1_000_000)return null;
 try{const parsed=z.object({version:z.literal(1),config:LoopConfigSchema,snapshot:LoopSnapshotSchema.nullable()}).strict().parse(JSON.parse(raw));if(parsed.snapshot?.status==='running'){parsed.snapshot.status='paused';parsed.snapshot.stopReason='Paused when the page closed. Resume from the last saved stage.';}return {config:parsed.config,snapshot:parsed.snapshot};}catch{return null;}
}
type Executor=(request:ExecuteRequest,code:string,signal?:AbortSignal)=>Promise<ExecuteResponse>;
export interface LoopRunOptions{lens:LensFixture;inputs:Record<string,Artifact>;config:LoopConfig;mode:'replay'|'live';demoCode:string;snapshot?:LoopSnapshot|null;onUpdate:(snapshot:LoopSnapshot)=>void;}
/** A bounded serial controller, independent from graph presentation and React lifecycle. */
export class AutoresearchRunner{
 private epoch=0;private controller:AbortController|null=null;private active:LoopSnapshot|null=null;private notify:((snapshot:LoopSnapshot)=>void)|null=null;
 constructor(private execute:Executor=executeNode){}
 cancel(){this.epoch++;this.controller?.abort();this.controller=null;if(this.active?.status==='running'){this.active.status='paused';this.active.stopReason='Paused. Completed stages are saved; an in-flight request may have used tokens.';this.notify?.(structuredClone(this.active));}}
 async run(options:LoopRunOptions):Promise<LoopSnapshot>{
  if(this.active?.status==='running')throw new Error('A research loop is already running.');
  const {lens,inputs,config,mode,demoCode,onUpdate}=options;const invalid=validateLoop(config);if(invalid)throw new Error(invalid);
  if(mode==='live'&&!readyForLive(lens,inputs))throw new Error('Complete Reader and Research Overlap in Live mode before starting this loop.');
  if(mode==='live'&&!demoCode)throw new Error('Enter your Live access code in the workspace.');
  if(mode==='replay'&&!lens.replay.paper.evidenceRefs?.some(ref=>ref.documentId===lens.paper.id))throw new Error('Recorded reviews belong to the bundled paper. Use Live for a new paper.');
  if(mode==='replay'&&config.kind!=='incremental')throw new Error('The recorded review covers the incremental hypothesis. Choose Live for another hypothesis kind.');
  const fingerprint=loopFingerprint(lens,inputs,config,mode);
  if(options.snapshot&&options.snapshot.fingerprint!==fingerprint)throw new Error('The objective or source evidence changed. Start a new loop.');
  const snapshot=options.snapshot?structuredClone(options.snapshot):blankLoopSnapshot(fingerprint,mode);
  if(snapshot.status==='complete')return snapshot;
  const epoch=++this.epoch;const controller=new AbortController();this.controller=controller;this.active=snapshot;this.notify=onUpdate;
  const current=()=>epoch===this.epoch&&!controller.signal.aborted;
  const emit=()=>{if(epoch===this.epoch)onUpdate(structuredClone(snapshot));};
  snapshot.status='running';snapshot.stopReason='';emit();
  const call=async(type:'proposer'|'skeptic',requestInputs:Record<string,Artifact>,selectedProposalId?:string):Promise<Artifact|null>=>{
   if(!current())return null;if(snapshot.dispatches>=8)throw new Error('Eight-request safety limit reached for this run. Start a new loop to continue.');
   snapshot.dispatches++;snapshot.usage.requests++;snapshot.usage.unmeasuredRequests++;emit();
   const settle=(usage:Usage)=>{snapshot.usage.requests+=usage.requests-1;snapshot.usage.inputTokens+=usage.inputTokens;snapshot.usage.outputTokens+=usage.outputTokens;snapshot.usage.unmeasuredRequests+= (usage.unmeasuredRequests??0)-1;};
   try{
    const response=await this.execute({runId:snapshot.runId,nodeId:`loop-${snapshot.rounds.length+1}-${type}-${snapshot.dispatches}`,type,settings:{interests:config.objective,...(selectedProposalId?{selectedProposalId}:{})},paper:lens.paper,profile:lens.profile,inputs:requestInputs},demoCode,controller.signal);
    settle(response.usage);
    // Usage can settle after cancellation; artifacts cannot. Never touch a newer run.
    if(!current()){if(this.active===snapshot)this.notify?.(structuredClone(snapshot));return null;}
    return ArtifactSchema.parse(response.output);
   }catch(error){
    if(error instanceof ApiError)settle(error.usage??{requests:0,inputTokens:0,outputTokens:0});
    if(!current()){if(this.active===snapshot)this.notify?.(structuredClone(snapshot));return null;}
    throw error;
   }
  };
  try{
   if(mode==='replay'){
    const proposal=structuredClone(lens.replay.proposer);const critique=structuredClone(lens.replay.skeptic);const selected=proposal.proposals?.find(p=>p.kind==='incremental');if(!selected||!critique.critique)throw new Error('The recorded review is incomplete.');
    snapshot.rounds=[{number:1,proposal,critique,selectedId:selected.id}];snapshot.status='complete';snapshot.stopReason='Recorded review complete. Live mode generates revisions.';emit();return structuredClone(snapshot);
   }
   while(current()&&snapshot.rounds.length<config.rounds){
    const previous=snapshot.rounds.at(-1);const groundedInputs={...inputs};
    // Remove unrelated proposal/critique outputs: the selected target is unambiguous.
    for(const [key,value]of Object.entries(groundedInputs))if(value.proposals||value.critique)delete groundedInputs[key];
    if(previous){groundedInputs.autoresearch_previous_proposal={summary:'Previous selected hypothesis for revision.',proposals:previous.proposal.proposals?.filter(p=>p.id===previous.selectedId)};groundedInputs.autoresearch_previous_critique=previous.critique;}
    if(!snapshot.pending){snapshot.phase='propose';emit();const proposed=await call('proposer',groundedInputs);if(!proposed)break;if(!proposed.proposals?.some(p=>p.kind===config.kind))throw new Error('The proposer did not return the selected hypothesis kind.');snapshot.pending=proposed;snapshot.phase='critique';emit();}
    const selected=snapshot.pending.proposals?.find(p=>p.kind===config.kind);if(!selected)throw new Error('The selected hypothesis is missing.');
    const critiqueInputs={...groundedInputs};delete critiqueInputs.autoresearch_previous_proposal;
    const critique=await call('skeptic',{...critiqueInputs,autoresearch_selected_proposal:{summary:snapshot.pending.summary,proposals:[selected]}},selected.id);if(!critique)break;if(!critique.critique)throw new Error('The critic did not return a verdict.');
    snapshot.rounds.push({number:snapshot.rounds.length+1,proposal:snapshot.pending,critique,selectedId:selected.id});snapshot.pending=null;snapshot.phase='propose';emit();
    if(config.stopOnSupported&&critique.critique.verdict==='supported'){snapshot.status='complete';snapshot.stopReason='Stopped at the configured supported-verdict condition.';break;}
   }
   if(current()&&snapshot.status==='running'){snapshot.status='complete';snapshot.stopReason=`Round budget reached (${config.rounds}).`;}
  }catch(error){if(current()){snapshot.status='error';snapshot.stopReason=error instanceof Error?error.message:'The research loop failed.';}}
  finally{if(current()){this.controller=null;emit();}}
  return structuredClone(snapshot);
 }
}
