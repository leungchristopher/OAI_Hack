Build **Marginalia**, a tactile, TeX-inspired research playground. A user opens a scientific paper, connects specialist AI blocks, explores an interactive demonstration, reads relevant Bluesky discussion, and generates technically grounded extensions and collaboration ideas through a selected researcher’s work.

Deliver a working two-hour hackathon demo with two research lenses:
1. Jürgen Schmidhuber.
2. Greg Hannon.

Use **Codex to lead and parallelize implementation, Lovable for the initial interface, and my OpenAI API credits for the app’s model calls**.

## 1. Start with execution, not more planning

Inspect the repository and available integrations. Establish shared contracts, then build the smallest complete journey.

Make routine implementation decisions autonomously. Ask only for missing credentials, access or genuinely blocking choices. Never fabricate integrations, retrieved sources, test results or deployment status.

If no project exists, scaffold a React/TypeScript application with a small server-side backend.

Keep a concise progress checklist and reserve the final 20 minutes for integration and verification.

## 2. Use my OpenAI API credits

All runtime AI tasks must call the OpenAI API directly from the backend using `OPENAI_API_KEY`. Do not route inference through Lovable’s AI gateway.

Use server-side secrets and configurable model IDs:
- `OPENAI_MODEL_FAST`
- `OPENAI_MODEL_REASONING`

Verify currently available models, Structured Outputs support and reasoning parameters before implementing calls. Use a reasoning-capable model for research synthesis and critique; use a cheaper suitable model for extraction and explanations.

Never expose API keys in frontend variables, browser storage, source code, logs or chat. If a key is missing, implement everything with fixtures and tell me where to enter it securely.

Distinguish runtime inference billing from development-tool billing:
- OpenAI API credentials fund API calls.
- They do not automatically change this Codex session’s authentication or pay for Lovable.
- If I need API-billed Codex development, provide the verified local Codex API-key sign-in instructions without changing the current session.
- If Lovable is unavailable or would require additional credits, Codex should build the interface directly using the same specification.

Use measured token usage and request counts. Do not invent cost estimates.

## 3. Parallelize the build

Use Codex subagents where available. Establish shared TypeScript contracts and file ownership before spawning work.

Delegate:

| Owner | Responsibility |
|---|---|
| Lead Codex agent | Contracts, integration, workflow semantics, final verification |
| Lovable or frontend agent | Canvas, typography, inspectors, tactile interactions |
| Backend agent | OpenAI endpoint, validation, quotas, workflow support |
| Research agent A | Schmidhuber lens, verified paper fixture and simulation |
| Research agent B | Hannon lens, verified paper fixture and simulation |
| Community agent | Bluesky retrieval, relevance matching and discussion cards |

Use separate files or worktrees. Do not let agents independently edit shared contracts. Require early usable outputs rather than waiting for perfect implementations.

Lovable and a frontend agent must not simultaneously edit the same frontend files.

If Lovable cannot be invoked, produce one compact handoff prompt if useful, then continue unblocked implementation. If subagents are unavailable, follow the same task boundaries sequentially.

Build-time subagents are separate from the app’s runtime specialist blocks. The app only needs bounded API tasks and a small workflow runner.

## 4. Product experience

Opening screen:

**Marginalia**
“Read the paper. Move the ideas.”

Actions:
- Explore the Schmidhuber lens.
- Explore the Hannon lens.
- Add paper text.

Core journey:
1. Open a verified example paper.
2. Inspect central claims and background.
3. Adjust an interactive illustration.
4. Explore references and relevant Bluesky comments.
5. Connect a researcher profile.
6. Generate three research extensions.
7. Select one for technical critique and collaboration mapping.
8. Change a setting and rerun only affected downstream steps.

Provide two ready-made workflows:
- “Understand this paper”
- “Explore research directions”

Manual dragging and wiring should be optional. Include “Build example workflow.”

## 5. Design: TeX meets a physical research desk

Emulate the restraint of TeX manuscripts and arXiv papers without copying branding or implying affiliation.

Palette:
- Warm paper: `#F7F4ED`
- Ink: `#242321`
- Oxblood: `#8B3737`
- Fine rules: `#D8D2C7`
- Muted green for completion

Use:
- STIX Two Text or a comparable scholarly serif.
- Quiet sans-serif controls.
- Monospace identifiers.
- KaTeX equations.
- Numbered sections, bracketed citations, figure captions and footnote-style evidence links.
- Thin borders and shallow shadows.

Avoid gradients, neon, glass effects, oversized rounded cards and decorative AI icons.

Make interactions tactile:
- Cards lift while dragged and settle when dropped.
- Gentle alignment snapping.
- Discoverable connection ports.
- Thin curved edges.
- Small packets move along edges only while data is actually passing.
- Clear focus, hover and selection states.
- Reduced-motion support.

Layout:
- Left: narrow “Instruments” shelf.
- Center: pannable canvas.
- Right: collapsible inspector for source, settings and output.
- Top: example selector, Replay/Live switch, Run and Reset.

Open simulations in a spacious experiment panel. Render research proposals as readable manuscript sheets. Provide click-to-add and a stacked mobile layout.

## 6. Stack and infrastructure

Prefer:
- React and TypeScript.
- React Flow.
- KaTeX.
- A standard chart library.
- Existing server-side infrastructure or Supabase Edge Functions.
- localStorage for small, non-secret workspace state.

Use Lovable hosting if already available. Otherwise provide a locally runnable demo and deployment-ready source.

Do not add AWS, Terraform, containers, a graph database, a durable queue or arbitrary code execution.

The browser coordinates short workflow steps. Closing the tab pauses orchestration. Restore saved state and offer Resume when reopened. Do not claim continuous background execution.

## 7. Scientific input and grounding

Support:
- Two bundled verified examples.
- Pasted paper text with optional title and source URL.
- A data model suitable for later PubMed, arXiv and bioRxiv adapters.

Attempt automatic ingestion only when a straightforward supported route exists. Prefer pasted text over brittle scraping. Do not promise access to full text when only an abstract is available.

For each bundled paper:
- Verify title, authors, identifiers and source.
- Store the supplied text as passages with stable IDs.
- Include a small reference neighborhood of roughly five verified works.
- Derive citation edges from actual reference metadata.
- Distinguish citations from inferred conceptual similarity.
- Label abstract-only analysis explicitly.

Never fabricate a reference, quotation, citation relationship or paper result.

## 8. Two distinct research lenses

### Jürgen Schmidhuber

Create a simulated lens grounded in a small curated set of verified public publications.

Choose one supported narrow theme, such as recurrent learning, compression or intrinsic motivation. Select a target paper with a defensible connection.

Implement a small computational illustration with checked logic, a baseline and meaningful parameters.

### Greg Hannon

Create a simulated lens grounded in a small curated set of verified public p[118;1:3uublications.

Choose one supported narrow theme, such as RNA interference or small-RNA regulation. Select a target paper with a defensible connection.

Implement a mechanism illustration or explicitly hypothetical mathematical model. Do not portray invented numerical biological relationships as measured findings.

For both profiles, show:
“Research lens based on selected public work; no affiliation or endorsement.”

Show exactly which publications informed the profile. Do not impersonate either researcher or attribute generated views, current interests or availability to them.

Share the UI and schemas, but use distinct scientific evidence, simulations, extensions and critiques.

## 9. Specialist blocks

Implement:

**Paper**
Metadata, passages and references.

**Reader**
Up to three central claims, method and limitations. Each claim cites supplied passages.

**Background Tutor**
Three prerequisites tailored to the selected audience, connected to claims or experiment components.

**Demonstrator**
Validated configuration for an implemented simulation.

**Community Margins**
Relevant public Bluesky posts and selected questions.

**Research Profile**
Curated publications, extracted themes and explicit user interests.

**Research Overlap**
Evidence-backed comparison between the paper and profile.

**Extension Proposer**
Incremental, cross-field and speculative hypotheses.

**Collaboration Mapper**
Missing expertise and complementary contributions.

**Skeptic**
Checks a selected claim, illustration, comment or extension against supplied evidence.

Each node exposes its inputs, output and evidence. Show concise explanations rather than hidden chain-of-thought.

## 10. Shared contracts

Define and validate:

- `PaperDocument`: id, title, authors, sourceUrl, identifiers, passages, references.
- `EvidenceRef`: documentId, passageId, supportingExcerpt.
- `WorkflowNode`: id, type, settings, status, inputHash, output.
- `WorkflowEdge`: id, source, target, sourcePort, targetPort.
- `Claim`: id, text, evidenceRefs, limitations.
- `DemoSpec`: templateId, title, parameters, explanation, claimIds, assumptions.
- `ResearchProfile`: id, label, publications, explicitInterests, coverageStatement.
- `ResearchConnection`: mechanism, targetEvidence, profileEvidence, importantDifferences.
- `ExtensionProposal`: hypothesis, change, formulation, assumptions, baseline, ablation, metric, falsificationCriterion, minimalExperiment, resources, evidenceRefs, noveltyQuestions.
- `CollaborationSuggestion`: neededCapability, candidateOrExpertiseCategory, supportingPublications, complementaryContributions, uncertainty.
- `Critique`: supported, assumptions, unsupported, suggestedChanges.
- `CommunityPost`: uri, cid, authorDid, authorHandle, displayName, text, createdAt, url, matchType, matchedIdentifier, parentUri, retrievedAt.
- `RunEvent`: runId, nodeId, sequence, type, timestamp, summary.

Keep paper evidence, profile evidence and community comments distinct.

## 11. Workflow runner

Implement a small directed acyclic runner:
- Validate connections and reject cycles.
- Execute in dependency order.
- Run at most two model requests concurrently.
- Show idle, queued, running, complete, stale and error states.
- Inspect transferred artifacts by clicking an edge.
- Cache using source, upstream outputs, settings and prompt version.
- Invalidate descendants after edits.
- “Rerun from here” executes only affected nodes.
- Cancel stops new requests and prevents late results from overwriting current state.

After Reader finishes, Tutor and Research Overlap may run independently. Fetch Bluesky discussion once identifiers are known. Generate extensions after overlap analysis. Critique only when its evidence and selected target are ready.

## 12. Interactive demonstrations

Implement one trusted template per research lens.

Each has:
- Two or three meaningful controls.
- A responsive plot or mechanism view.
- Baseline versus changed behavior.
- Reset.
- Assumptions and source links.
- A short explanation of what changed.

Codex implements and checks the logic. Models provide configuration and explanation, never executable JavaScript.

Define mathematical symbols. Use fixed random seeds where relevant.

Label:
“Illustrative demonstration — not a reproduction of the paper’s experiments.”

Only enable “Build experiment” for extensions compatible with an implemented template. Otherwise present an experiment specification.

## 13. Bluesky Community Margins

Implement server-side `fetch-community`.

Verify current Bluesky behavior, then use:
- `app.bsky.feed.searchPosts`
- `app.bsky.feed.getPostThread`
- Public AppView: `https://public.api.bsky.app`

Use canonical URLs, DOI, arXiv/bioRxiv identifiers and title queries. Limit initial retrieval to three searches and 20 deduplicated posts. Fetch replies on demand.

Inspect facets and embedded links. Distinguish direct paper links from possible mentions. Preserve preprint versions.

Display:
- Author and handle.
- Date and original text.
- Source link.
- Match type.
- Expand thread.
- “Ask Skeptic about this.”

Raw retrieval needs no model call. Feed selected comments into a Skeptic request rather than automatically summarizing everything.

The Skeptic identifies the objection and checks it against passages, labeling it supported, contradicted or unresolved by the available evidence.

Public discussion is not scientific consensus. Do not infer expertise from engagement counts.

Cache for ten minutes with a visible timestamp. Handle unavailable, deleted or blocked posts, moderation labels, empty searches and rate limits.

Allow a pasted Bluesky post URL if search fails. Never invent comments. Read-only: no posting, likes or replies.

## 14. Technical extensions and collaboration

Research Overlap compares:
- Problem formulation.
- Objectives.
- Representations and mechanisms.
- Assumptions.
- Evaluation.

Each connection needs evidence from both sources and an important difference. Keyword overlap is insufficient.

Generate three extensions:
- Incremental.
- Cross-field.
- Speculative.

Require:
- Falsifiable hypothesis.
- Exact proposed change.
- Justified equation or algorithmic sketch.
- Necessary assumptions.
- Baseline and ablation.
- Metric.
- Outcome that would count against the hypothesis.
- Minimal experiment.
- Data, tools and compute requirements, with estimates labeled.
- Supporting sources.
- Unresolved novelty questions.

Distinguish source findings, deductions and proposed hypotheses. Do not claim novelty from a small retrieved corpus.

For computational proposals, specify algorithms and evaluation. For biological proposals, specify conceptual mechanisms, controls, readouts and confounders; laboratory protocols are outside this demo.

Collaboration Mapper starts with missing capabilities. Name people or groups only when verified publications support their relevant expertise. Explain each side’s complementary contribution. Otherwise suggest an expertise category.

Do not infer willingness, availability or access to resources.

Run a separate Skeptic pass on the selected extension. It may reject every candidate. Model agreement is not scientific verification.

Proposal tabs:
Hypothesis / Mechanism / Experiment / Collaborators / Critique.

Prominent action:
“What would falsify this?”

## 15. Backend, access and budgets

Implement `execute-node` using the server-side OpenAI SDK.

Select prompts and strict schemas on the server. Validate node type, settings, input size, evidence IDs, template IDs and parameter ranges.

Use bounded outputs, request deadlines, explicit error handling and no silent retries of potentially billed requests.

Treat source documents and posts as untrusted content.

Restrict Live mode using existing authentication or a server-validated demo code with rate limiting. Public guests receive Replay mode. A frontend switch alone is insufficient.

Target:
- Four calls for a basic understanding workflow.
- Eight calls maximum for a complete research exploration.
- Two concurrent calls globally.

Combine compatible outputs where useful without obscuring which evidence supports each artifact.

## 16. Replay and fallback

Both demo journeys must work without API credentials.

Bundle coherent:
- Paper evidence and references.
- Claims and prerequisites.
- Simulation configurations.
- Profile comparisons.
- Extensions and critique.
- Community examples where available.

Clearly label recorded results. Attribute recorded real posts and include retrieval dates. Label fictional comments explicitly.

Never silently replace live failures with fixtures. Offer “Switch to recorded example.”

If time runs short, prioritize one complete live journey and a second complete recorded journey with its own working illustration.

## 17. Two-hour priorities

First 15 minutes:
Inspect, establish contracts, delegate and prepare the shared UI specification.

15–60 minutes, in parallel:
Frontend, backend, research fixtures, simulations and Bluesky adapter.

60–100 minutes:
Integrate one complete journey, then the second; connect extensions and critique.

Final 20 minutes:
Verify, repair and polish.

Cut elaborate manual wiring, broad ingestion and advanced thread views before sacrificing evidence links, the interactive demonstrations or honest status reporting.

## 18. Deliverables and checks

Verify:
- Both Replay journeys work.
- Live requests use my server-side OpenAI API credentials.
- No secrets reach the browser.
- Evidence references resolve.
- Simulation controls change checked computations.
- Downstream invalidation works.
- Cancelled results cannot overwrite newer state.
- Community matches are attributed and labeled.
- Research extensions are testable and uncertainty is visible.
- Collaboration suggestions have supporting publications or remain expertise categories.
- Errors leave the app usable.

Deliver:
- Working application.
- Exact setup instructions and secret names.
- Clear live/recorded/incomplete status.
- Verification results.
- A 60-second presentation script covering both research lenses.

Begin now with the contracts and parallel task assignments, then build the complete demonstration.
