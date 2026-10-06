import { useCallback, useEffect, useRef, useState } from 'react';
import { PaperDocumentSchema, WorkflowEdgeSchema, WorkflowNodeSchema, type LensFixture, type NodeSettings, type NodeType, type PaperDocument, type RunEvent, type Usage, type WorkflowEdge, type WorkflowNode } from '../../shared/contracts';
import { createWorkflow, invalidateDescendants, validateConnection, WorkflowRunner } from '../workflow/runner';
const STORAGE = 'marginalia-workspace-v1';
export function useWorkspace(lenses: LensFixture[]) {
 const initial = useRef<ReturnType<typeof restore> | undefined>(undefined);
 if (!initial.current) initial.current=restore(lenses);
 const [lensId,setLensId]=useState(initial.current.lensId);
 const [nodes,setNodes]=useState<WorkflowNode[]>(initial.current.nodes);
 const [edges,setEdges]=useState<WorkflowEdge[]>(initial.current.edges);
 const [customPaper,setCustomPaper]=useState<PaperDocument|null>(initial.current.customPaper);
 const mode='replay' as const;
 const [demoCode,setDemoCode]=useState('');
 const [running,setRunning]=useState(false);
 const [events,setEvents]=useState<RunEvent[]>([]);
 const [usage,setUsage]=useState<Usage>({requests:0,inputTokens:0,outputTokens:0});
 const [message,setMessage]=useState('');
 const [resumable,setResumable]=useState(initial.current.resumable);
 const runner=useRef(new WorkflowRunner());
 const epoch=useRef(0);
 const lens=lenses.find(l=>l.id===lensId)||lenses[0];
 const paper=customPaper||lens.paper;
 useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify({lensId,nodes,edges,customPaper,mode,evidenceVersion:JSON.stringify({paper,profile:lens.profile})}))}catch{/* storage can be unavailable */}},[lensId,nodes,edges,customPaper,mode]);
 useEffect(()=>()=>runner.current.cancel(),[]);
 const cancel=useCallback(()=>{epoch.current++;runner.current.cancel();setRunning(false);setNodes(ns=>ns.map(n=>['running','queued'].includes(n.status)?{...n,status:'stale'}:n));setMessage('Paused. No new requests will start. You can resume this workspace.');setResumable(true)},[]);
 const setMode=(_next:'replay'|'live')=>{setMessage('Research workflows use recorded results. Live generation is available only in the interactive tutor.');};
 const reset=useCallback((kind:'understand'|'research'='research')=>{cancel();const flow=createWorkflow(kind);setNodes(flow.nodes);setEdges(flow.edges);setEvents([]);setMessage('');setResumable(false)},[cancel]);
 const chooseLens=(id:string)=>{cancel();setLensId(id);setCustomPaper(null);const flow=createWorkflow('research');setNodes(flow.nodes);setEdges(flow.edges);setEvents([]);setMessage('');setResumable(false)};
 const editSettings=(id:string,settings:Partial<NodeSettings>)=>{cancel();setNodes(ns=>invalidateDescendants(ns.map(n=>n.id===id?{...n,settings:{...n.settings,...settings}}:n),edges,id));setMessage('Settings changed. Downstream work is marked stale.');};
 const run=async(fromNodeId?:string)=>{if(running)return;if(customPaper&&mode==='replay'){setMessage('Use the interactive tutor to explore pasted papers. Research workflows use the two bundled paper recordings.');return;}const current=++epoch.current;setRunning(true);setMessage('');setResumable(false);try{const result=await runner.current.run({nodes,edges,paper,profile:lens.profile,mode,fixture:lens,demoCode,fromNodeId,onUpdate:next=>{if(epoch.current===current)setNodes([...next])},onEvent:event=>{if(epoch.current===current)setEvents(es=>[...es.slice(-99),event])},onUsage:u=>{setUsage(old=>({requests:old.requests+u.requests,inputTokens:old.inputTokens+u.inputTokens,outputTokens:old.outputTokens+u.outputTokens,unmeasuredRequests:(old.unmeasuredRequests||0)+(u.unmeasuredRequests||0)}))}});if(epoch.current===current)setNodes(result);}catch(error){if(epoch.current===current)setMessage(error instanceof Error?error.message:'Workflow failed. Try Replay mode.')}finally{if(epoch.current===current)setRunning(false)}};
 const addNode=(type:NodeType)=>{cancel();const id=`${type}-${crypto.randomUUID().slice(0,6)}`;setNodes(ns=>[...ns,{id,type,settings:{},status:'idle',inputHash:null,output:null,position:{x:100+(ns.length%3)*300,y:100+Math.floor(ns.length/3)*190}}]);return id;};
 const connect=(source:string,target:string)=>{const check=validateConnection(nodes,edges,source,target);if(!check.valid){setMessage(check.error||'Invalid connection');return;}cancel();const next=[...edges,{id:`${source}-${target}`,source,target,sourcePort:'output',targetPort:'input'}];setEdges(next);setNodes(ns=>invalidateDescendants(ns,next,target));setMessage('Connection added. Target and descendants need to run again.');};
 const addPaper=(p:PaperDocument)=>{cancel();setCustomPaper(p);const flow=createWorkflow('understand');setNodes(flow.nodes);setEdges(flow.edges);setMessage('Paper text added. Open Ask tutor to discuss these passages.');setResumable(false)};
 return {lens,paper,lensId,nodes,edges,setNodes,setEdges,mode,setMode,demoCode,setDemoCode,running,events,usage,message,setMessage,resumable,setResumable,customPaper,cancel,reset,chooseLens,editSettings,run,addNode,connect,addPaper};
}
function restore(lenses:LensFixture[]){const fallback={lensId:lenses[0].id,...createWorkflow('research'),resumable:false,customPaper:null as PaperDocument|null,mode:'replay' as 'replay'|'live'};try{const value=JSON.parse(localStorage.getItem(STORAGE)||'null');if(!value||!lenses.some(l=>l.id===value.lensId))return fallback;const currentLens=lenses.find(l=>l.id===value.lensId)!;const evidenceChanged=value.mode!=='replay'||value.evidenceVersion!==JSON.stringify({paper:value.customPaper||currentLens.paper,profile:currentLens.profile});const nodes=WorkflowNodeSchema.array().parse(Array.isArray(value.nodes)?value.nodes.filter((n:{type?:string})=>n?.type!=='community'):value.nodes).map(n=>({...n,settings:{...n.settings,selectedComment:undefined},output:n.settings.selectedComment?null:n.output?{...n.output,posts:undefined}:n.output,status:(evidenceChanged||n.settings.selectedComment||['running','queued'].includes(n.status)?'stale':n.status) as WorkflowNode['status']}));const edges=WorkflowEdgeSchema.array().parse(value.edges).filter(e=>nodes.some(n=>n.id===e.source)&&nodes.some(n=>n.id===e.target));if(nodes.length>30||edges.length>100)return fallback;return {mode:'replay' as 'replay',lensId:value.lensId as string,nodes,edges,resumable:nodes.some(n=>n.status!=='idle'),customPaper:value.customPaper?PaperDocumentSchema.parse(value.customPaper):null};}catch{return fallback;}}
export type Workspace = ReturnType<typeof useWorkspace>;
