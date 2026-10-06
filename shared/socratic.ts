import {z} from 'zod';
import {PaperDocumentSchema,EvidenceRefSchema,type Usage} from './contracts';
export const SocraticMessageSchema=z.object({role:z.enum(['user','assistant']),content:z.string().min(1).max(4000)}).strict();
export const SocraticRequestSchema=z.object({runId:z.string().min(1).max(120),topic:z.string().min(1).max(200),documents:z.array(PaperDocumentSchema).max(4),history:z.array(SocraticMessageSchema).max(12),userMessage:z.string().min(1).max(2000)}).strict();
export const SocraticOutputSchema=z.object({reply:z.string(),evidenceRefs:z.array(EvidenceRefSchema).max(6),suggestedQuestions:z.array(z.string()).max(3)}).strict();
export type SocraticMessage=z.infer<typeof SocraticMessageSchema>;
export type SocraticRequest=z.infer<typeof SocraticRequestSchema>;
export type SocraticOutput=z.infer<typeof SocraticOutputSchema>;
export interface SocraticResponse {output:SocraticOutput;usage:Usage;model:string;}
