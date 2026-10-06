import { z } from 'zod';
export const EvidenceRefSchema = z.object({ documentId: z.string(), passageId: z.string(), supportingExcerpt: z.string() });
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
export const ReferenceSchema = z.object({ id: z.string(), title: z.string(), authors: z.array(z.string()), year: z.number(), sourceUrl: z.string().url(), doi: z.string().optional(), relationship: z.enum(['cites','cited-by','conceptual']), relationshipNote: z.string() });
export const PaperDocumentSchema = z.object({ id: z.string(), title: z.string().min(1).max(500), authors: z.array(z.string()), sourceUrl: z.string().url(), identifiers: z.record(z.string()), passages: z.array(z.object({ id: z.string(), text: z.string().max(20000), section: z.string(), kind: z.enum(['quotation','summary','user-supplied']), page: z.number().int().positive().optional() })).min(1).max(30), references: z.array(ReferenceSchema), coverage: z.enum(['abstract-only','selected-passages','user-supplied']), year: z.number() });
export type PaperDocument = z.infer<typeof PaperDocumentSchema>;
export const ClaimSchema = z.object({ id: z.string(), text: z.string(), evidenceRefs: z.array(EvidenceRefSchema).min(1), limitations: z.array(z.string()) });
export type Claim = z.infer<typeof ClaimSchema>;
export const DemoSpecSchema = z.object({ templateId: z.enum(['memory-decay','rna-silencing']), title: z.string(), parameters: z.record(z.number()), explanation: z.string(), claimIds: z.array(z.string()), assumptions: z.array(z.string()) });
export type DemoSpec = z.infer<typeof DemoSpecSchema>;
export const ResearchProfileSchema = z.object({ id: z.string(), label: z.string(), publications: z.array(PaperDocumentSchema), explicitInterests: z.array(z.string()), coverageStatement: z.string() });
export type ResearchProfile = z.infer<typeof ResearchProfileSchema>;
export const ResearchConnectionSchema = z.object({ mechanism: z.string(), targetEvidence: z.array(EvidenceRefSchema).min(1), profileEvidence: z.array(EvidenceRefSchema).min(1), importantDifferences: z.array(z.string()) });
export type ResearchConnection = z.infer<typeof ResearchConnectionSchema>;
export const ExtensionProposalSchema = z.object({ id: z.string(), kind: z.enum(['incremental','cross-field','speculative']), title: z.string(), hypothesis: z.string(), change: z.string(), formulation: z.string(), assumptions: z.array(z.string()), baseline: z.string(), ablation: z.string(), metric: z.string(), falsificationCriterion: z.string(), minimalExperiment: z.string(), resources: z.array(z.string()), evidenceRefs: z.array(EvidenceRefSchema).min(1), noveltyQuestions: z.array(z.string()), compatibleTemplate: z.enum(['memory-decay','rna-silencing']).nullable() });
export type ExtensionProposal = z.infer<typeof ExtensionProposalSchema>;
export const CollaborationSuggestionSchema = z.object({ neededCapability: z.string(), candidateOrExpertiseCategory: z.string(), supportingPublications: z.array(z.string()), complementaryContributions: z.array(z.string()), uncertainty: z.string() });
export type CollaborationSuggestion = z.infer<typeof CollaborationSuggestionSchema>;
export const CritiqueSchema = z.object({ supported: z.array(z.string()), assumptions: z.array(z.string()), unsupported: z.array(z.string()), suggestedChanges: z.array(z.string()), verdict: z.enum(['supported','contradicted','unresolved']) });
export type Critique = z.infer<typeof CritiqueSchema>;
export const CommunityPostSchema = z.object({ uri: z.string(), cid: z.string(), authorDid: z.string(), authorHandle: z.string(), displayName: z.string(), text: z.string(), createdAt: z.string(), url: z.string().url(), matchType: z.enum(['direct-link','identifier','possible-mention']), matchedIdentifier: z.string(), parentUri: z.string().nullable(), retrievedAt: z.string(), labels: z.array(z.string()).optional() });
export type CommunityPost = z.infer<typeof CommunityPostSchema>;
export const NODE_TYPES = ['paper','reader','tutor','demonstrator','community','profile','overlap','proposer','collaborator','skeptic'] as const;
export const NodeTypeSchema = z.enum(NODE_TYPES);
export type NodeType = z.infer<typeof NodeTypeSchema>;
export const NodeSettingsSchema = z.object({ audience: z.enum(['curious','graduate','specialist']).optional(), selectedProposalId: z.string().optional(), selectedComment: CommunityPostSchema.optional(), interests: z.string().max(2000).optional(), parameters: z.record(z.number()).optional() }).strict();
export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
export const ArtifactSchema = z.object({ summary: z.string(), claims: z.array(ClaimSchema).optional(), method: z.string().optional(), limitations: z.array(z.string()).optional(), prerequisites: z.array(z.object({ title: z.string(), explanation: z.string(), connectedTo: z.string() })).optional(), demo: DemoSpecSchema.optional(), connections: z.array(ResearchConnectionSchema).optional(), proposals: z.array(ExtensionProposalSchema).optional(), collaborations: z.array(CollaborationSuggestionSchema).optional(), critique: CritiqueSchema.optional(), posts: z.array(CommunityPostSchema).optional(), retrievedAt: z.string().optional(), evidenceRefs: z.array(EvidenceRefSchema).optional() });
export type Artifact = z.infer<typeof ArtifactSchema>;
export const WorkflowNodeSchema = z.object({ id: z.string(), type: NodeTypeSchema, settings: NodeSettingsSchema, status: z.enum(['idle','queued','running','complete','stale','error']), inputHash: z.string().nullable(), output: ArtifactSchema.nullable(), position: z.object({ x: z.number(), y: z.number() }), error: z.string().optional() });
export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;
export const WorkflowEdgeSchema = z.object({ id: z.string(), source: z.string(), target: z.string(), sourcePort: z.string(), targetPort: z.string() });
export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;
export const RunEventSchema = z.object({ runId: z.string(), nodeId: z.string(), sequence: z.number(), type: z.enum(['queued','running','complete','cache-hit','error','cancelled']), timestamp: z.string(), summary: z.string() });
export type RunEvent = z.infer<typeof RunEventSchema>;
export interface LensFixture { id: 'schmidhuber' | 'hannon'; label: string; theme: string; description: string; paper: PaperDocument; profile: ResearchProfile; replay: Record<NodeType, Artifact>; }
export interface ExecuteRequest { runId: string; nodeId: string; type: NodeType; settings: NodeSettings; paper: PaperDocument; profile: ResearchProfile; inputs: Record<string, Artifact>; }
export interface Usage { requests: number; inputTokens: number; outputTokens: number; unmeasuredRequests?: number; }
export interface ExecuteResponse { output: Artifact; usage: Usage; model: string; }
export interface CommunityResponse { posts: CommunityPost[]; retrievedAt: string; cached: boolean; status: 'ok'|'empty'|'unavailable'|'rate-limited'; message: string; }
export const PROFILE_DISCLAIMER = 'Research lens based on selected public work; no affiliation or endorsement.';
export const DEMO_DISCLAIMER = 'Illustrative demonstration — not a reproduction of the paper’s experiments.';
export const PROMPT_VERSION = 'marginalia-v2-pdf';
