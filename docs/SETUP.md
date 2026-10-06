# Marginalia

**Read the paper. Move the ideas.** A walkable research village with Pixel and Brush & ink themes, paper-grounded Schmidhuber/Hannon environments, AlphaGo, and a robotics workshop.

[Open the published demo](https://marginalia-research-desk.lovable.app) — the published URL; the latest recorded-only update is being integrated and verified.

## Run locally

Use Node.js 22.12 or newer (verified here with Node 26).

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. The backend listens at `127.0.0.1:3001`; Vite proxies `/api`. Both bundled research workflows use real previously generated outputs, need no credentials and make no model calls. Walk to a house (WASD/arrows, or click a destination), build an example workflow, and Run. The AlphaGo house assembles as you approach; the central portrait opens a Socratic tutor. Inspect claims, open the experiment, change a control, explore proposals, and ask what would falsify one.

## Enable the interactive tutor securely

```sh
test -f .env || cp .env.example .env
```

Edit the ignored, server-only `.env` locally:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Your OpenAI API project key. Never put it in a `VITE_` variable, browser storage, source control, or chat. |
| `DEMO_CODE` | Choose a demo access code of at least 12 characters. Enter this code, **not the API key**, in the Socratic tutor's access-code field. |
| `OPENAI_MODEL_FAST` | Default `gpt-5.4-mini`; interactive tutoring and offline extraction/explanation preparation. |
| `OPENAI_MODEL_REASONING` | Default `gpt-5.4`; offline research synthesis, proposals, collaboration and critique. |
| `PORT` | Backend port; defaults to `3001`. Changing it also requires updating the Vite proxy. |
| `HOST` | Defaults to `127.0.0.1`; use your deployment platform's binding configuration when hosting. |

Restart `npm run dev` after changing server settings. Interactive chat requests go directly from the Node backend through the OpenAI SDK to the Responses API. The server chooses prompts and strict output schemas. Only `/api/socratic-chat` can generate responses in the public app. `/api/execute-node` and `/api/explain-experiment` return HTTP 403 by default. The browser has no Live/Replay switch. Fast tasks use `low` reasoning effort; synthesis uses `medium`. Model IDs must support Responses, Structured Outputs and those reasoning settings. Account access is not implied by documentation availability.

Defaults and API shape were checked against the official [GPT-5.4 Mini model page](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [GPT-5.4 model page](https://developers.openai.com/api/docs/models/gpt-5.4), and [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). There is no Lovable AI gateway in the application.

The demo code is validated by the backend before inference. There are at most two concurrent model calls per server process, eight calls per run, and 60 Live requests per hour per client IP. The displayed understanding and research workflows make zero calls. Offline preparation uses four calls for understanding or seven for a full research workflow. Failed requests are never silently retried or replaced with fixtures. The UI reports request counts and measured token usage; it flags requests whose usage is unavailable. There are no estimated monetary totals.

OpenAI API credentials fund runtime API calls. They do not change this Codex session's authentication or pay for Lovable development. No development-session authentication was changed.

## Learning tools

Use **Study & export** to select source-grounded Q&A cards and download Markdown. **Start Socratic practice** offers typed reasoning, hints, follow-up questions, answer comparison and a revisit queue. It runs locally as guided, self-assessed practice.

**LSTM lab** exposes the actual gate equations, input sequence, recurrent state, bias controls, ablations and a default baseline. **RNA lab** lets you step through guide production, loading and target cleavage while changing Dicer activity, Ago2 catalysis and target pairing. Each lab has authentic pre-generated API explanations for its recorded configuration. Controls recompute the experiment locally; changed settings are distinguished from the recorded explanation. Ask the interactive tutor for further discussion. Source scope is in one expandable panel.

**Robotics lab** plays real pretrained LeRobot ACT, Diffusion and SmolVLA executions in MuJoCo, each 400 frames at 50 Hz. ACT and SmolVLA reach reward 2/4; Diffusion reaches 0/4. None completes the transfer. The Mathematics view has interactive architecture calculations for each policy. See [ACT](docs/ROBOTICS.md), [Diffusion](docs/DIFFUSION.md) and [SmolVLA](docs/SMOLVLA.md) reproduction instructions.

**AlphaGo House** covers MCTS, UCB1 versus AlphaGo's prior-weighted selection, separate policy/value networks, supervised learning, policy gradients and value regression. Replay all five Lee Sedol games, including move 37 in game two and move 78 in game four. The architecture follows the supplied Silver2016 PDF. Search/network calculations are small interactive worked examples, not released AlphaGo model inference.

**Socratic tutor** is a direct API chat opened from the central portrait, workspace, research labs, robotics or AlphaGo. Its fixed server prompt gives focused feedback, asks one guiding question, and grounds source-specific answers in selected PDF passages. Choose memory, RNA, AlphaGo or robotics. Conversation history stays in memory; it is not an impersonation of the pictured researcher.

**Autoresearch** provides a draggable Objective → Propose → Critique → Revise graph. Arrange the graph and inspect one authentic recorded proposal/critique review. The public app does not generate revisions or simulate improvements. The bounded multi-round engine remains available only for explicit offline preparation.

## Evidence and demonstrations

The examples now use **actual passages extracted from all six supplied PDFs**, each stored with a stable passage ID and PDF page number. The extraction script records source checksums, regions and normalization; selected excerpts do not cover every page. All claims and profile connections resolve to supplied passages. The reference neighborhood distinguishes actual citations from inferred conceptual similarity.

- **Schmidhuber:** *Learning to Forget: Continual Prediction with LSTM* (Gers, Schmidhuber & Cummins, 2000). A deterministic scalar retention model compares a fixed gate with perfect retention. It does not train or reproduce an LSTM.
- **Hannon:** *Role for a bidentate ribonuclease in the initiation step of RNA interference* (Bernstein, Caudy, Hammond & Hannon, 2001). A hypothetical production–clearance equation compares silencing with a no-silencing baseline. Its rates are arbitrary and its curves are not biological measurements.

The lenses use selected public publications, with no affiliation or endorsement. Proposals are hypotheses with explicit baselines, ablations, metrics and falsification criteria. Collaboration suggestions remain expertise categories. Neither novelty nor researcher willingness is inferred.

Research Replay artifacts are **actual recorded OpenAI API outputs**, generated from these PDF passages. Model IDs, generation times and measured usage are stored beside them. A different proposal has no recorded assessment unless one was prepared; an unrelated critique is never substituted. The interactive tutor can discuss it on request. See [research provenance](docs/RESEARCH.md) and the [60-second presentation script](docs/DEMO_SCRIPT.md).

## Workflow behavior

The browser coordinates a directed acyclic graph. Invalid connections and cycles are rejected. Source, upstream artifacts, settings, mode and prompt version determine cache identity. Editing a node marks its descendants stale. Rerun from that node retains unaffected outputs. Cancellation aborts browser requests and uses generation checks to prevent late responses overwriting newer work; already accepted API requests may still incur usage.

Small workspace state, paper text and outputs are saved in localStorage. Keys and demo codes are not saved. Closing the tab pauses orchestration. Reopening offers Resume; there is no continuous background execution. Pasted text can be discussed in the interactive tutor; research workflows never substitute an unrelated bundled recording.

## Focused research workspace

The app uses nine instruments in a research workflow and five in an understanding workflow. Bluesky search, public discussion cards, post URL entry, thread retrieval and their backend routes have been removed. Older saved graphs are migrated to omit the retired community instrument. Paper and researcher evidence remain separately attributed.

## Production build and verification

```sh
npm run build
NODE_ENV=production npm start
```

This serves the compiled frontend and API together on port 3001. The local source runs as a single Node process. Use HTTPS and server-side environment variables on your host. The in-memory limits/cache are per process, so this hackathon server is not a horizontally scaled service.

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

Unit/integration tests cover evidence resolution, simulation identities and ranges, both Replay graphs, invalidation, cancellation, quotas and mocked OpenAI transport. Tests that create temporary localhost servers need network-bind permission in sandboxed environments. Both full research journeys have also passed against the real OpenAI API with the configured server-side credentials. See [verification status](docs/VERIFICATION.md) for the final measured checks.

## Lovable hosting

The integrated hosted app is maintained in [Lovable](https://lovable.dev/projects/f4612a76-2b98-4d21-ae5b-263c9763bfbd). Lovable adapted the verified application into its server route environment, retaining its lens illustrations. Hosted source lives under `src/marginalia/`, with API routes under `src/routes/api/`.

Local `.env` values are not uploaded. To enable hosted interactive chat, enter `OPENAI_API_KEY` and a `DEMO_CODE` of at least 12 characters through Lovable **Project Settings → Secrets**. Optionally set the two model variables above. Public research workflows and labs require no secrets. Never set `MARGINALIA_PREGENERATE` on the deployed demo. Hosted concurrency and rate limits apply per worker isolate; use the single-process local server when a strict deployment-wide two-request limit is required.

## Offline preparation only

The explicit verification scripts set server-only `MARGINALIA_PREGENERATE=1` before constructing their temporary local server. This unlocks paid preparation endpoints for that process; it is never a browser setting and must not be set on the deployed demo. Run only when intentionally generating new recordings. A clean full research journey uses seven model calls:

```sh
npx tsx scripts/verify-live.ts schmidhuber
npx tsx scripts/verify-live.ts hannon
```

Results are written outside the repository to `/private/tmp/marginalia-live/`. Use `--resume` only to explicitly retry unfinished work from a saved verification run; successful outputs are reused. Runtime failures are not silently retried. `scripts/verify-learning.ts` explicitly prepares both lab explanations and verifies the tutor. These scripts require the ignored local `.env`; they do not upload credentials.
