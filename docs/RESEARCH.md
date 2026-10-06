# Research provenance and limits

Updated corpus: all six user-supplied PDFs have been inspected. The app uses 24 selected editorial summaries with one-based PDF page numbers, including full-text mechanisms, methods, results and limitations. Raw PDFs remain local in `papers/`; no full copyrighted paper is included in the public app. See [memory PDF audit](MEMORY_PDF_NOTES.md) and [RNA PDF audit](RNA_PDF_NOTES.md). Both examples now have `selected-passages` coverage.

The notes below record the original abstract-only fixture construction and scientific model boundaries; the PDF audits supersede the original coverage and evidence availability statements. Gers2000 explicitly cites Bengio1994 on PDF p20, and that edge is now corrected to `cites`.


Verified against primary publisher, author-hosted and PubMed records during this build (6 October 2026). Both target documents deliberately use **abstract-only** editorial paraphrases, not reproduced copyrighted abstracts or claims of full-text ingestion. Each paraphrase has a stable `p1`, `p2`, or `p3` ID within its document. Evidence excerpts quote our supplied paraphrase, not the source author verbatim. Profiles are historical selections; they do not impersonate researchers or infer current interests.

## Schmidhuber: memory and forgetting

Target: Gers, Schmidhuber and Cummins, **Learning to Forget: Continual Prediction with LSTM**, Neural Computation 12(10), 2451–2471 (2000). DOI [10.1162/089976600300015015](https://direct.mit.edu/neco/article/12/10/2451/6415/Learning-to-Forget-Continual-Prediction-with-LSTM). The publisher abstract supports the continual-stream failure mode, learned forget gate, and illustrative benchmark claims. The author-hosted PDF has garbled text extraction; we did not pretend to ingest it.

Profile sources:

- Hochreiter and Schmidhuber, **Long Short-Term Memory** (1997), DOI 10.1162/neco.1997.9.8.1735. [Author-hosted paper](https://www.bioinf.jku.at/publications/older/2604.pdf).
- Gers, Schraudolph and Schmidhuber, **Learning Precise Timing with LSTM Recurrent Networks**, JMLR 3, 115–143 (2002). [Publisher abstract](https://www.jmlr.org/papers/v3/gers02a.html).

Five neighborhood works are in the fixture. The target abstract explicitly cites LSTM (1997), so this is a citation edge. Other neighbors are explicitly conceptual, without an asserted citation edge: [Bengio, Simard and Frasconi (1994)](https://pubmed.ncbi.nlm.nih.gov/18267787/), Timing (2002), [Gers and Schmidhuber on context-free/context-sensitive languages (2001), verified in the author’s bibliography](https://people.idsia.ch/~juergen/onlinepub.html), and [Schmidhuber’s 2015 overview](https://arxiv.org/abs/1404.7828) (arXiv v4 dated 2014, journal reference 2015).

The implemented scalar recurrence is `c(t)=f*c(t-1)` with no new input, initial state `c(0)`, and constant retention `f`. It isolates one mechanism; it does not implement trained LSTM gates, benchmark accuracy, or the paper’s continual-stream experiments. Baseline is `f=1`. Geometric decay and sensitivity are exact mathematical deductions under those assumptions. No randomness is involved.

## Hannon: guide production and effector action

Target: Bernstein, Caudy, Hammond and Hannon, **Role for a bidentate ribonuclease in the initiation step of RNA interference**, Nature 409, 363–366 (2001). DOI [10.1038/35053110](https://www.nature.com/articles/35053110). Publisher abstract and reference list are accessible; full text is subscription content. We use abstract-level summaries only.

Profile sources:

- Hammond, Bernstein, Beach and Hannon, **An RNA-directed nuclease mediates post-transcriptional gene silencing in Drosophila cells** (2000), DOI [10.1038/35005107](https://www.nature.com/articles/35005107), metadata cross-check [PubMed 10749213](https://pubmed.ncbi.nlm.nih.gov/10749213/).
- Liu, Carmell, Rivas, Marsden, Thomson, Song, Hammond, Joshua-Tor and Hannon, **Argonaute2 is the catalytic engine of mammalian RNAi** (2004), DOI [10.1126/science.1102513](https://pubmed.ncbi.nlm.nih.gov/15284456/).

Five actual target reference-list entries form the citation neighborhood: Hammond et al. (reference 6); [Hamilton and Baulcombe (1999)](https://pubmed.ncbi.nlm.nih.gov/10542148/) (reference 7); Zamore, Tuschl, Sharp and Bartel (2000), DOI 10.1016/S0092-8674(00)80620-0 (reference 8); [Tuschl et al. (1999)](https://pubmed.ncbi.nlm.nih.gov/10617568/) (reference 11); and Sharp, **RNAi and double-strand RNA** (1999), DOI 10.1101/gad.13.2.139 (reference 4). These relationships come from the target publisher reference list, not keyword overlap.

The implemented model is **hypothetical**: `dm/dt = s-(δ+k)m`, `m(0)=1`. Its closed-form solution avoids numerical solver error. Baseline sets effective silencing `k=0`. `m` is relative target abundance; `s` production; `δ` background turnover; `k` effective extra clearance. Time and abundance units are arbitrary. Parameters are unmeasured and uncalibrated. Dicer, guide loading and RISC are **not** resolved kinetically. It cannot establish dose response, sequence specificity or a biological rate. No laboratory protocol is provided.

## Replay, proposals and verification

Replay artifacts are authored demonstration fixtures, not recorded API outputs. Each lens includes all ten specialist artifacts, three proposals with falsification criteria, expertise-category collaboration suggestions, and a critique of the incremental proposal. All proposals are deductions or hypotheses; none is attributed to a researcher or declared novel. Nonlinear/multistate and trained-network proposals are experiment specifications only; only the compatible incremental proposals enable the existing template.

Bluesky search and community discussion were removed from the product. Legacy fixture schema entries contain no fabricated or bundled comments and are not executable instruments.

`tests/research.test.ts` checks schemas, every nested evidence reference and supporting excerpt, template-to-claim links, geometric recurrence and finite-difference sensitivity, RNA initial conditions and analytic behavior, the no-silencing baseline, control effects, and invalid/nonfinite configurations. Run `npm test -- tests/research.test.ts`. Test results are reported by the executing agent, not presumed by this document.
