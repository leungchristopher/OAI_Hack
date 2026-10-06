# Memory lens: supplied-PDF evidence audit

Checked on 2026-10-06. Source PDFs remain local in `papers/`; the app exports selected editorial summaries, not the PDFs or extracted full text. Page numbers below are 1-based PDF pages, not always journal pagination.

| Local PDF | Verified title and authors | Publication | Selected evidence |
| --- | --- | --- | --- |
| Gers2000.pdf | Learning to Forget: Continual Prediction with LSTM — Felix A. Gers, Jürgen Schmidhuber, Fred Cummins | Neural Computation 12, 2451-2471 (2000) | PDF pp. 5-6, 14, 17 |
| Hochreiter1997.pdf | Long Short-Term Memory — Sepp Hochreiter, Jürgen Schmidhuber | Neural Computation 9(8), 1735-1780 (1997) | PDF pp. 1, 7-8 |
| Gers2002.pdf | Learning Precise Timing with LSTM Recurrent Networks — Felix A. Gers, Nicol N. Schraudolph, Jürgen Schmidhuber | JMLR 3, 115-143 (2002) | PDF pp. 1, 7, 12 |

The 1997 PDF has defective character spacing and extraction order. The first-page image establishes Hochreiter before Schmidhuber; extracted text alone reverses the columns. Relevant equation, table and mechanism pages were rendered with pypdfium2 and visually checked. No API inference was used for this audit.

## Passage integration

`src/data/memory-passages.ts` exports the document-to-passages map. The target's p1-p3 keep the existing roles: accumulation failure, learned forget gate, bounded benchmark result. p4-p6 add baselines, a second evaluation and the fixed-decay limitation. Profile p1 meanings remain compatible with existing evidence links. These are selected full-text summaries, not exhaustive paper coverage or direct quotations.

## Verified citation relationships

Gers2000.pdf, PDF p. 20 (printed p. 2470), explicitly lists both Hochreiter & Schmidhuber (1997) and Bengio, Simard & Frasconi (1994), *Learning long-term dependencies with gradient descent is difficult*, IEEE Transactions on Neural Networks 5(2), 157-166. Both can therefore be marked `cites` with this page as provenance. The latter is currently only `conceptual` in the fixture and should be corrected.

The 2000 target cannot cite the later 2001 language paper, 2002 timing paper or 2015 overview. Preserve those as conceptual neighborhood entries, not outgoing target citations. Conversely, Gers2002 explicitly says it builds on Gers et al. (2000) in Section 2, PDF p. 3.

## Required shared-fixture corrections

- Change abstract-only coverage and boilerplate to selected full-text evidence from supplied PDFs; remove claims that methods and numerical results are unavailable.
- Build Reader claims from `paper.passages.slice(0, 3)`, because the existing map over every passage would now exceed the three-claim contract and produce undefined IDs after p3.
- Update the Reader method to architecture comparisons on continual embedded Reber grammar and continual noisy temporal order, using 100 independently trained networks in Tables 2-3.
- Do not describe the benchmark as every run succeeding: Table 2 reports 18% perfect solutions with forget gates and 62% with learning-rate decay, under the stated criterion. Standard externally reset LSTM achieved 74%, but had extra segmentation information.
- Keep the scalar demo disclaimer and existing critique. The geometric-decay toy does not test trained-gate performance. Its fixed-decay baseline performed poorly on the target's continual benchmark; it is a teaching model, not an evidence-backed proposed improvement.
- Avoid a blanket claim that peepholes improve all timing tasks. Gers2002 Table 1 has mixed outcomes; Section 4.2 says peepholes are not mandatory for the tested measuring task.
- Do not interpret the 1997 profile as a claim that both gate types are necessary for every task: PDF p. 8 explicitly allows input-only arrangements in particular experiments.
