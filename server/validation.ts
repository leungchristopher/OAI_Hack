import { validateParameters as validateTemplateParameters, simulationControls } from '../src/simulations';
import { z } from 'zod';
import { ArtifactSchema, PaperDocumentSchema, ResearchProfileSchema, NodeSettingsSchema, ClaimSchema, ResearchConnectionSchema, ExtensionProposalSchema, CollaborationSuggestionSchema, CritiqueSchema, type ExecuteRequest, type Artifact, type EvidenceRef } from '../shared/contracts';
export const ExecuteSchema = z.object({runId:z.string().min(1).max(120),nodeId:z.string().min(1).max(120),type:z.enum(['reader','tutor','demonstrator','overlap','proposer','collaborator','skeptic']),settings:NodeSettingsSchema,paper:PaperDocumentSchema,profile:ResearchProfileSchema,inputs:z.record(ArtifactSchema)}).strict();
const summary = z.string();
export const outputSchemas = {
 reader:z.object({summary,claims:z.array(ClaimSchema).min(1).max(3),method:z.string(),limitations:z.array(z.string())}),
 tutor:z.object({summary,prerequisites:z.array(z.object({title:z.string(),explanation:z.string(),connectedTo:z.string()})).length(3)}),
 demonstrator:z.object({summary,demo:z.object({templateId:z.enum(['memory-decay','rna-silencing']),title:z.string(),parameters:z.object({}),explanation:z.string(),claimIds:z.array(z.string()),assumptions:z.array(z.string())}).nullable()}),
 overlap:z.object({summary,connections:z.array(ResearchConnectionSchema).min(1).max(3)}),
 proposer:z.object({summary,proposals:z.array(ExtensionProposalSchema).length(3)}),
 collaborator:z.object({summary,collaborations:z.array(CollaborationSuggestionSchema).min(1).max(3)}),
 skeptic:z.object({summary,critique:CritiqueSchema})
};
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
export function validateEvidence(value:unknown,request:ExecuteRequest):void {
 const docs=[request.paper,...request.profile.publications];
 function walk(v:unknown):void {
  if(!v||typeof v!=='object')return;
  if(Array.isArray(v)){v.forEach(walk);return;}
  const obj=v as Record<string,unknown>;
  if('documentId'in obj&&'passageId'in obj){
   const ref=obj as unknown as EvidenceRef;
   const passage=docs.find(d=>d.id===ref.documentId)?.passages.find(p=>p.id===ref.passageId);
   if(!passage||!normalize(ref.supportingExcerpt)||!normalize(passage.text).includes(normalize(ref.supportingExcerpt)))throw new Error('Evidence must resolve to a supplied passage and an exact supporting excerpt.');
  }
  Object.values(obj).forEach(walk);
 }
 walk(value);
}
export function validateRequest(request:ExecuteRequest):void {
 if(JSON.stringify(request).length>180000)throw new Error('Research input exceeds 180,000 characters.');
 const docs=[request.paper,...request.profile.publications];
 if(docs.length>8)throw new Error('At most seven profile publications are supported.');
 for(const d of docs)if(new Set(d.passages.map(p=>p.id)).size!==d.passages.length)throw new Error('Duplicate passage identifiers.');
 const seen=new Map<string,string>();for(const d of docs){const serialized=JSON.stringify(d.passages);if(seen.has(d.id)&&seen.get(d.id)!==serialized)throw new Error('Document identifiers must refer to the same passages.');seen.set(d.id,serialized);}
 validateEvidence(request.inputs,request);
 if(request.settings.parameters)validateParameters(request.settings.parameters);
 if(['tutor','demonstrator','overlap'].includes(request.type)&&!Object.values(request.inputs).some(x=>x.claims?.length))throw new Error('Reader claims are required before this node can execute.');
 if(request.type==='collaborator'&&!Object.values(request.inputs).some(x=>x.proposals?.length))throw new Error('A supplied proposal is required for collaboration mapping.');
 if(['proposer'].includes(request.type)&&!Object.values(request.inputs).some(x=>x.connections?.length))throw new Error('Research overlap is required before proposing extensions.');
 if(['collaborator','skeptic'].includes(request.type)&&request.settings.selectedProposalId&&!Object.values(request.inputs).some(x=>x.proposals?.some(p=>p.id===request.settings.selectedProposalId)))throw new Error('Selected proposal is not in supplied inputs.');
}
export function validateParameters(parameters:Record<string,number>):void {
 const controls=Object.values(simulationControls).flat();
 for(const [key,value]of Object.entries(parameters)){
  const control=controls.find(c=>c.key===key);
  if(!control||!Number.isFinite(value)||value<control.min||value>control.max||(key==='steps'&&!Number.isInteger(value)))throw new Error('Invalid simulation parameter or range.');
 }
}
export function validateOutput(output:Artifact,request:ExecuteRequest):void {
 validateEvidence(output,request);
 const prerequisiteIds=new Set([...Object.values(request.inputs).flatMap(a=>a.claims?.map(c=>c.id)??[]),...Object.keys(simulationControls),...Object.values(simulationControls).flat().map(c=>c.key)]);
 if(output.prerequisites?.some(p=>!prerequisiteIds.has(p.connectedTo)))throw new Error('Prerequisites must connect to a supplied claim or implemented experiment component ID.');
 if(output.claims?.some(c=>c.evidenceRefs.some(r=>r.documentId!==request.paper.id)))throw new Error('Reader claims must cite the target paper.');
 for(const c of output.connections??[]){if(c.targetEvidence.some(e=>e.documentId!==request.paper.id)||c.profileEvidence.some(e=>!request.profile.publications.some(p=>p.id===e.documentId)))throw new Error('Overlap must distinguish paper and profile evidence.');}
 if(output.proposals&&new Set(output.proposals.map(p=>p.kind)).size!==3)throw new Error('Three distinct proposal kinds are required.');
 for(const c of output.collaborations??[])if(c.supportingPublications.some(id=>!request.profile.publications.some(p=>p.id===id||p.sourceUrl===id)&&id!==request.paper.id&&id!==request.paper.sourceUrl))throw new Error('Unknown collaboration publication.');
 if(output.demo){output.demo.parameters=validateTemplateParameters(output.demo.templateId,output.demo.parameters);const claimIds=Object.values(request.inputs).flatMap(a=>a.claims?.map(c=>c.id)??[]);if(output.demo.claimIds.some(id=>!claimIds.includes(id)))throw new Error('Unknown demonstration claim.');}
}
