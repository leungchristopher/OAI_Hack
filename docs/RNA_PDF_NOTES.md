# RNA lens: supplied PDF review

Reviewed on 2026-10-06. Summaries in `src/data/rna-passages.ts` use stable passage IDs and **one-based PDF pages**. They are editorial paraphrases, not quotations or an extraction of every sentence. The uploaded main articles support full-text-derived selected evidence; supplementary files were not supplied or reviewed.

## Metadata and scope

| Local PDF | Verified article | Authors | Publication | PDF pages used |
| --- | --- | --- | --- | --- |
| Bernstein2001.pdf | Role for a bidentate ribonuclease in the initiation step of RNA interference | Emily Bernstein; Amy A. Caudy; Scott M. Hammond; Gregory J. Hannon | Nature 409, 363-366; 18 January 2001 | 1-4 |
| Hammond2000.pdf | An RNA-directed nuclease mediates post-transcriptional gene silencing in Drosophila cells | Scott M. Hammond; Emily Bernstein; David Beach; Gregory J. Hannon | Nature 404, 293-296; 16 March 2000 | 1-3 for selected evidence |
| Liu2004.pdf | Argonaute2 Is the Catalytic Engine of Mammalian RNAi | Jidong Liu; Michelle A. Carmell; Fabiola V. Rivas; Carolyn G. Marsden; J. Michael Thomson; Ji-Joon Song; Scott M. Hammond; Leemor Joshua-Tor; Gregory J. Hannon | Science 305, 1437-1441; 3 September 2004; online 29 July 2004 | 1, 3, 5 for selected evidence |

Liu's DOI is printed on PDF page 5 and the publisher end sheet: `10.1126/science.1102513`. The existing Nature DOI identifiers `10.1038/35053110` and `10.1038/35005107` come from the previously verified publisher records; they are not printed in the body of these supplied Nature scans.

All three first pages contain the end of an unrelated preceding article. Bernstein's last page also contains the start of the next article. Liu's first page includes a preceding Argonaute structure paper and its reference list. The summaries exclude this neighboring content. Liu's own references start on PDF page 5, not page 1.

## Verified target citation edges

Bernstein2001.pdf page 4 (journal page 366) confirms all five existing `cites` edges, using the target's actual reference list:

| Target reference | Work | Journal citation |
| --- | --- | --- |
| 6 | Hammond, Bernstein, Beach and Hannon: An RNA-directed nuclease mediates post-transcriptional gene silencing in Drosophila cells | Nature 404, 293-296 (2000) |
| 7 | Hamilton and Baulcombe: A species of small antisense RNA in posttranscriptional gene silencing in plants | Science 286, 950-952 (1999) |
| 8 | Zamore, Tuschl, Sharp and Bartel: RNAi: double-stranded RNA directs the ATP-dependent cleavage of mRNA at 21 to 23 nucleotide intervals | Cell 101, 25-33 (2000) |
| 11 | Tuschl, Zamore, Lehmann, Bartel and Sharp: Targeted mRNA degradation by double-stranded RNA in vitro | Genes & Development 13, 3191-3197 (1999) |
| 4 | Sharp: RNAi and double-strand RNA | Genes & Development 13, 139-141 (1999) |

These five citations remain reference metadata; four corresponding full papers were not uploaded. The Liu 2004 profile is a later mechanistic connection, not a citation made by Bernstein 2001. Liu's own reference 5 cites Bernstein 2001 and reference 7 cites Hammond 2000 (PDF page 5).

## Scientific boundaries to preserve

- Bernstein separates guide-generating activity from target degradation, while allowing interactions or shared subunits. Its page 3 explicitly does not exclude an additional Dicer-associated nuclease.
- Figure 3 reports relative processing-activity reductions and a reporter response. It does not fit the app's first-order production/clearance model. Do not describe the full text as lacking all numerical results; describe **the app rates** as uncalibrated.
- Incomplete loss of silencing may reflect incomplete Dicer depletion or other guide-production mechanisms. It is not proof that Dicer is dispensable.
- Hammond's early study describes approximately **25-nucleotide** RNAs and does not resolve their strand state within RISC. Do not silently substitute the later approximately 22-nucleotide description throughout its findings.
- Liu's loss-of-function result concerns the tested siRNA response. Its mismatched-site translational repression reporter remains responsive without Ago2. Avoid claiming that Ago2 loss abolishes all RNA silencing.
- The model remains an illustrative, hypothetical aggregate process. None of these papers establishes its saturation hypothesis, calibrated rate constants, or novelty.

## Integration text updates

Replace old claims that only abstracts are available with “Selected editorial summaries from the supplied full-text PDFs; supplements not reviewed.” Keep claims limited to the first three target passages if the Reader contract allows at most three. The additional passages are evidence and limitations, not automatic extra central claims.

Update the biological speculative proposal assumption from “not demonstrated by these abstracts” to “not established by the selected evidence.” Existing critiques about hypothetical rates, identifiability and absence of a Dicer-specific model remain valid. The target method can now mention fractionation, Dicer-associated processing activity and depletion evidence, while retaining the experimental caveats above.

## Verification performed

Read page-tagged text and visually inspected the supplied first pages, Bernstein pages 3-4, Hammond page 3, and Liu pages 3 and 5. Relevant pages were rendered with bundled `pypdfium2`; no OCR-derived numeric reconstruction, laboratory protocol, paid model request or new empirical result was introduced.
