# Verification — 6 October 2026

## Current behavior

The app defaults to recorded research everywhere. It has no Live/Replay switch. Both bundled workflows load authentic previously generated OpenAI outputs, and lab controls recompute locally. Only the interactive Socratic chat can generate at runtime. Pasted papers are discussed through chat; unrelated bundled analyses are never substituted.

`/api/execute-node` and `/api/explain-experiment` return HTTP 403 before any model request by default. `/api/health` includes `recordedOnly: true`. The explicit offline scripts `verify-live.ts` and `verify-learning.ts` set server-only `MARGINALIA_PREGENERATE=1` for their temporary preparation server. That flag must never be enabled on the deployed demo.

Chat remains authenticated with the server-validated demo code. All enabled model endpoints share a two-request concurrency limit, 60 requests/hour/IP and eight requests/run. There are no automatic retries. Limits apply per Node process or hosted worker isolate.

## Final local checks

| Check | Result |
| --- | --- |
| `npm test` | **130 tests passed across 15 files**, run after the recorded-only change. All SDK calls in these tests are mocked. |
| `npm run build` | TypeScript and production Vite build passed. |
| Current Chromium suite | **24 tests passed**: 14 affected integration checks plus 10 world/math/trajectory checks. |
| Recorded-only browser checks | Both workflows and labs make zero execute-node/explain-experiment requests; old Live workspaces restore in recorded mode. |
| Backend guard checks | Default non-chat routes return 403 with zero SDK calls; explicit offline opt-in retains transport and grounding checks. |
| Chat checks | Request/history shape, sources, measured usage, access code, explicit conversation reset and late-response cancellation protection pass. |
| Storage/secret checks | Chat history and demo code stay out of localStorage; all four bundled recording JSON files contain no credential patterns. |

The latest production main chunk is approximately 1,381 kB uncompressed / 415 kB gzip. Vite warns about its size; the build succeeds. Robot mathematics panels are separate lazy-loaded chunks.

No browser was opened during the final unit/build run, to avoid interrupting presentation recording. The browser totals above come from completed checks immediately before that final run.

## Scientific and recorded provenance

- All six supplied research PDFs contribute 24 extracted quotations, stable passage/document IDs and PDF-page references. `scripts/extract-papers.py --check` verifies extraction regions and normalization. AlphaGo has nine additional Silver2016 excerpts.
- Both full research workflows were pre-generated through seven actual direct OpenAI calls each. The outputs, model IDs, generation timestamps and measured usage are bundled under `src/data/recorded/`.
- Both lab explanations were generated with server-recomputed LSTM or qualitative RNA state. The UI displays a recording only when its source evidence matches and distinguishes changed controls from the recorded configuration.
- The tutor originally failed an exact-output check; the failed response was not retained, so its precise cause is unconfirmed. A stronger source-ID protocol now has the model select known excerpts and the server return their unchanged text. One explicit real retry passed with four citations.
- Research-world verification before presentation recording used **18 API requests, 128,765 measured input tokens and 28,195 measured output tokens**, including the failed call's reported usage. This is not an account-wide billing total; no monetary cost is inferred. Subsequent presentation chat requests, if made, are separate.
- Recorded proposals remain hypotheses with baselines, ablations, metrics and falsification criteria. They do not establish novelty or researcher endorsement.

## Robotics and games

ACT, Diffusion and SmolVLA each have a real pinned-checkpoint MuJoCo ALOHA rollout: 400 video frames, 400 finite action samples, 50 fps. ACT and SmolVLA reached reward 2/4; Diffusion reached 0/4. None completed cube transfer. Each manifest records the checkpoint revision, environment, seed, outcome and file hashes. Playback is not browser-side model inference.

The architecture workbenches calculate explicit small teaching examples. They do not substitute for or control the pretrained recordings. LSTM uses fixed teaching weights; RNA's mechanism view is qualitative, without invented numerical biology.

All five Lee Sedol games contain 1,033 validated moves. Capture, liberties and ko checks pass. The games carry no fabricated engine evaluation. Original AlphaGo's architecture is kept separate from later AlphaZero claims.

## Cancellation and access

Request epochs prevent cancelled chat and experiment responses from overwriting newer state. Workflow and autoresearch runners stop dispatching after cancellation. Requests already accepted by the provider can incur usage; missing token counts stay marked unmeasured. Secrets remain on the server; only the demo access code is entered in the tutor. No local `.env` is uploaded to Lovable.

Bluesky routes and public discussion are removed. Saved community instruments and comments are migrated away. Chat is an AI tutor and does not impersonate the pictured researcher.

## Hosted status

The existing published URL is [Marginalia](https://marginalia-research-desk.lovable.app). Earlier releases were externally verified, but that does not establish deployment of this latest recorded-only build. Latest Lovable integration/publication and direct public checks are pending completion at this document update. Hosted interactive chat requires OPENAI_API_KEY and DEMO_CODE in Lovable Project Settings → Secrets; recorded research requires neither. Do not set MARGINALIA_PREGENERATE on the host.
