import {z} from 'zod';
import {PaperDocumentSchema,ResearchProfileSchema,EvidenceRefSchema,type Usage} from './contracts';
export const ExperimentSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('lstm'),sequence:z.array(z.number().finite().min(-2).max(2)).min(1).max(24),settings:z.object({forgetBias:z.number().min(-4).max(4),inputBias:z.number().min(-4).max(4),outputBias:z.number().min(-4).max(4),ablation:z.enum(['none','forget','input','output'])}).strict(),cursor:z.number().int().min(0).max(23)}).strict(),
 z.object({kind:z.literal('rna'),settings:z.object({dicer:z.enum(['active','depleted']),ago2:z.enum(['active','inactive']),target:z.enum(['matched','mismatched'])}).strict(),stage:z.union([z.literal(0),z.literal(1),z.literal(2),z.literal(3)])}).strict()
]);
export const ExplainExperimentRequestSchema=z.object({runId:z.string().min(1).max(120),lensId:z.enum(['schmidhuber','hannon']),paper:PaperDocumentSchema,profile:ResearchProfileSchema,experiment:ExperimentSchema,question:z.string().max(1000).optional()}).strict();
export const ExperimentExplanationSchema=z.object({title:z.string(),explanation:z.string(),comparison:z.string(),paperConnection:z.string(),suggestedExperiment:z.string(),socraticQuestion:z.string(),evidenceRefs:z.array(EvidenceRefSchema).min(1).max(6)}).strict();
export type Experiment=z.infer<typeof ExperimentSchema>;
export type ExplainExperimentRequest=z.infer<typeof ExplainExperimentRequestSchema>;
export type ExperimentExplanation=z.infer<typeof ExperimentExplanationSchema>;
export interface ExplainExperimentResponse {output:ExperimentExplanation;usage:Usage;model:string;}
