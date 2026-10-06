# Evidence extracted from supplied PDFs

The 24 passages in `memory-passages.ts` and `rna-passages.ts` are quotations from the user's six PDFs, not editorial summaries. Existing document IDs and passage IDs are preserved. Each passage records its 1-based PDF page and source section. The total selected evidence is 18,384 characters, within the runtime input budget. These are selected passages, not a representation that the complete PDF is supplied to each model call.

## Reproduce and verify

```sh
/Users/chcleung/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract-papers.py
/Users/chcleung/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract-papers.py --check
```

Requires `pdfplumber`. The script fails if source anchors cannot be found, undecoded font glyphs remain, passages exceed bounds, or generated TypeScript differs from the independently extracted text. It emits each passage's source file, page, region, character count and SHA256. `--check` passed for all six documents and 24 passages.

## Extraction decisions

- Nature articles use separate left/right column crops; Science uses individual thirds, with a dedicated full-width abstract crop for Liu page 1. This prevents line-by-line column interleaving and avoids adjacent articles on the first page.
- Text extraction uses a narrow word-gap tolerance, collapses whitespace, joins typographic line wrapping, and preserves listed lexical compounds such as double-stranded and sequence-specific. Formatting such as italic type and superscript reference markers is flattened.
- The supplied Hochreiter PDF marks horizontal glyphs as rotated due to a reflected font matrix. The script restores horizontal character grouping. Visually verified legacy ligatures are decoded (`ff`, `fi`, `fl`, `ffi`), and quotation-mark glyphs are normalized.
- Visually verified Gers Table 2 glyphs are restored: α, angle brackets, and ≤. The row values, denominators and caption are retained. Flattened table text is accompanied by its table/page locator.
- Nature's legacy approximation glyphs extracted as commas before 22/25 are restored to `~`. No scientific paraphrasing or new commentary is inserted into quotations; the authors' own uncertainty remains part of their evidence.
- Selected excerpts are contiguous within the normalized source region. PDF typography rather than semantic text is normalized. Original spelling is retained, including the source's “nuclotide”.

The rendered Nature/Science columns, Liu abstract and catalytic-site results, Gers Table 2, and Hochreiter gate figure were visually checked. Source equations with unreliable legacy symbol extraction are excluded in favour of surrounding prose and captions; equations in the interactive teaching panels are separately typeset.

## Source checksums

| Supplied file | SHA256 |
|---|---|
| Bernstein2001.pdf | `91349885fce9e5dbe6ca53fd48451647057ca20717e66ea429fe570ef9a1bef1` |
| Gers2000.pdf | `6e23d14479754548bc677073a4af05855c4eda3cb1899690af8e306606e371df` |
| Gers2002.pdf | `405b672c3516ebee4af7e92bf83982f8f2baff7a002f9e0697a8628e065d2eb3` |
| Hammond2000.pdf | `ed9ba2c4ea642771629f2d3b57479e6f470767d5e7facaaf7807976b6690e10d` |
| Hochreiter1997.pdf | `ceb9e53dbc0493f5b3bf5520ed940f3e6b526064d17b2118d77e51f79c0edcc6` |
| Liu2004.pdf | `155118d468b09190a2ecd339568b67189f95b32cd518885d7b14b9dd8831c82f` |
| Silver2016.pdf | `8ccb04c7e6b9bd62d2b5a727617fb23a936c28e80bf96a2e511a29bd4a108c72` |
