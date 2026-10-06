/** Quotations extracted from supplied PDFs. Rebuild: python scripts/extract-papers.py. */
export const rnaPassages: Record<string, Array<{ id: string; text: string; section: string; kind: 'quotation'; page: number }>> = {
  "dicer-2001": [
    {
      "id": "p1",
      "text": "RNA interference (RNAi) is the mechanism through which double-stranded RNAs silence cognate genes1–5. In plants, this can occur at both the transcriptional and the post-transcriptional levels1,2,5; however, in animals, only post-transcriptional RNAi has been reported to date. In both plants and animals, RNAi is characterized by the presence of RNAs of about 22 nucleotides in length that are homologous to the gene that is being suppressed6–8. These 22-nucleotide sequences serve as guide sequences that instruct a multicomponent nuclease, RISC, to destroy specific messenger RNAs6. Here we identify an enzyme, Dicer, which can produce putative guide RNAs. Dicer is a member of the RNase III family of nucleases that specifically cleave double-stranded RNAs, and is evolutionarily conserved in worms, flies, plants, fungi and mammals. The enzyme has a distinctive structure, which includes a helicase domain and dual RNase III motifs. Dicer also contains a region of homology to the RDE1/QDE2/ ARGONAUTE family that has been genetically linked to RNAi9,10.",
      "section": "Abstract · PDF p. 1",
      "kind": "quotation",
      "page": 1
    },
    {
      "id": "p2",
      "text": "Our previous studies resulted in the partial purification of an enzyme complex, RISC, which is an effector nuclease for RNA interference6. This enzyme was isolated from Drosophila S2 cells in which RNAi had been initiated in vivo by transfection with double-stranded RNA (dsRNA). We first investigated whether the RISC enzyme, and the enzyme that initiates RNAi through processing of dsRNA into 22-nucleotide sequences, are distinct activities. RISC activity could be largely cleared from extracts by high-speed centrifugation (100,000g for 60 min), whereas the activity that produces 22-nucleotide sequences remained in the supernatant (Fig. 1b, c). This simple fractionation indicates that RISC and the 22-nucleotide sequence-generating activity may be separable. However, it seems probable that these enzymes interact at some point during the silencing process, and it remains possible that initiator and effector enzymes share common subunits.",
      "section": "Results: separating processing and effector activities · PDF p. 1",
      "kind": "quotation",
      "page": 1
    },
    {
      "id": "p3",
      "text": "RNase III family members are among the few nucleases that show specificity for dsRNA12. Analysis of the Drosophila and Caenorhabditis elegans genomes reveals several types of RNase III enzymes. First is the canonical RNase III, which contains a single RNase III signature motif and a dsRNA-binding domain (dsRBD; for example RNC_CAEEL). Second is a class represented by Drosha13, a Drosophila enzyme that contains two RNase III motifs and a dsRBD (CeDrosha in C. elegans). A third class contains two RNase III signatures and an amino-terminal helicase domain (for example, Drosophila CG4792 and CG6493; C. elegans K12H4.8), which had been proposed as potential RNAi nucleases14,20. We tested representatives of all three classes for the ability to produce discrete RNAs of ~22 nucleotides from dsRNA substrates.",
      "section": "Results: nuclease families · PDF p. 1",
      "kind": "quotation",
      "page": 1
    },
    {
      "id": "p4",
      "text": "Figure 3 Dicer participates in RNAi. a, Drosophila S2 cells transfected with dsRNAs corresponding to the two Drosophila Dicers (CG4792 and CG6493) or control dsRNA corresponding to murine caspase-9 (casp9). Cytoplasmic extracts of these cells were tested for Dicer activity. Transfection with Dicer dsRNA reduces activity in lysates 7.4-fold. b, Dicer-1 antiserum (CG4792) used to prepare immunoprecipitates from S2 cells (treated as above). Dicer dsRNA reduces the activity of Dicer-1 6.2-fold. c, GFP expression of co-transfected cells. Three independent experiments were quantified by FACS. A comparison of the relative percentage of GFP-positive cells is shown for control (GFP plasmid plus luciferase dsRNA) or silenced (GFP plasmids plus GFP dsRNA) populations in cells that had previously been transfected with either control (caspase-9) or Dicer dsRNAs.",
      "section": "Figure 3: depletion results · PDF p. 3",
      "kind": "quotation",
      "page": 3
    },
    {
      "id": "p5",
      "text": "Our results indicate that the process of RNAi can be divided into at least two distinct steps. Initiation of PTGS would occur on processing of a dsRNA by Dicer into ~22-nucleotide guide sequences, although we cannot formally exclude the possibility that another Dicer-associated nuclease may participate in this process. These guide RNAs would be incorporated into a distinct nuclease complex (RISC) that targets single-stranded mRNAs for degradation. An implication of this model is that the guide sequences are themselves derived directly from the dsRNA that triggers the response. In accord with this model, we have shown that 32P-labelled, exogenous dsRNAs that have been introduced into S2 cells by transfection are incorporated into the RISC enzyme as 22- nuclotide sequences (Fig. 2e).",
      "section": "Results: two-stage mechanism · PDF p. 3",
      "kind": "quotation",
      "page": 3
    },
    {
      "id": "p6",
      "text": "Depletion of Dicer substantially compromised the ability of cells to silence an exogenous, green fluorescent protein (GFP) transgene by RNAi (Fig. 3c). These results indicate that Dicer may be involved in RNAi in vivo. The lack of complete inhibition of silencing may result from an incomplete suppression of Dicer or may indicate that in vivo guide RNAs may be produced by more than one mechanism.",
      "section": "Results: interpreting depletion · PDF p. 3",
      "kind": "quotation",
      "page": 3
    }
  ],
  "risc-2000": [
    {
      "id": "p1",
      "text": "In a diverse group of organisms that includes Caenorhabditis elegans, Drosophila, planaria, hydra, trypanosomes, fungi and plants, the introduction of double-stranded RNAs inhibits gene expression in a sequence-specific manner1–7. These responses, called RNA interference or post-transcriptional gene silencing, may provide anti-viral defence, modulate transposition or regulate gene expression1,6,8–10. We have taken a biochemical approach towards elucidating the mechanisms underlying this genetic phenomenon. Here we show that ‘loss-of-function’ phenotypes can be created in cultured Drosophila cells by transfection with specific double-stranded RNAs. This coincides with a marked reduction in the level of cognate cellular messenger RNAs. Extracts of transfected cells contain a nuclease activity that specifically degrades exogenous transcripts homologous to transfected double-stranded RNA. This enzyme contains an essential RNA component. After partial purification, the sequence-specific nuclease co-fractionates with a discrete, ~25-nucleotide RNA species which may confer specificity to the enzyme through homology to the substrate mRNAs.",
      "section": "Abstract · PDF p. 1",
      "kind": "quotation",
      "page": 1
    },
    {
      "id": "p2",
      "text": "The decrease in mRNA levels observed upon transfection of specific dsRNAs into Drosophila cells could be explained by effects at transcriptional or post-transcriptional levels. Data from other systems have indicated that some elements of the dsRNA response may affect mRNA directly (reviewed in refs 1 and 6). We therefore sought to develop a cell-free assay that reflected, at least in part, RNAi. S2 cells were transfected with dsRNAs corresponding to either cyclin E or lacZ. Cellular extracts were incubated with synthetic mRNAs of lacZ or cyclin E. Extracts prepared from cells transfected with the 540-nucleotide cyclin E dsRNA efficiently degraded the cyclin E transcript; however, the lacZ transcript was stable in these lysates (Fig. 2a). Conversely, lysates from cells transfected with the lacZ dsRNA degraded the lacZ transcript but left the cyclin E mRNA intact. These results indicate that RNAi ablates target mRNAs through the generation of a sequence-specific nuclease activity. We have termed this enzyme RISC (RNA-induced silencing complex).",
      "section": "Results: sequence-specific nuclease · PDF p. 2",
      "kind": "quotation",
      "page": 2
    },
    {
      "id": "p3",
      "text": "Chromatography of soluble nuclease over an anion-exchange column resulted in a discrete peak of activity (Fig. 4b, cyclin E). This retained specificity as it was inactive against a heterologous mRNA (Fig. 4b, lacZ). Active fractions also contained an RNA species of 25 nucleotides that is homologous to the cyclin E target (Fig. 4b, northern). The band observed on northern blots may represent a family of discrete RNAs because it could be detected with probes specific for both the sense and antisense cyclin E sequences and with probes derived from distinct segments of the dsRNA (data not shown). At present, we cannot determine whether the 25-nucleotide RNA is present in the nuclease complex in a double-stranded or single-stranded form.",
      "section": "Results: small RNAs co-fractionate with RISC · PDF p. 3",
      "kind": "quotation",
      "page": 3
    }
  ],
  "ago2-2004": [
    {
      "id": "p1",
      "text": "Gene silencing through RNA interference (RNAi) is carried out by RISC, the RNA-induced silencing complex. RISC contains two signature components, small interfering RNAs (siRNAs) and Argonaute family proteins. Here, we show that the multiple Argonaute proteins present in mammals are both biologically and biochemically distinct, with a single mammalian family member, Argonaute2, being responsible for messenger RNA cleavage activity. This protein is essential for mouse development, and cells lacking Argonaute2 are unable to mount an experimental response to siRNAs. Mutations within a cryptic ribonuclease H domain within Argonaute2, as identified by comparison with the structure of an archeal Argonaute protein, inactivate RISC. Thus, our evidence supports a model in which Argonaute contributes “Slicer” activity to RISC, providing the catalytic engine for RNAi.",
      "section": "Abstract · PDF p. 1",
      "kind": "quotation",
      "page": 1
    },
    {
      "id": "p2",
      "text": "To address this question, we prepared mouse embryo fibroblasts (MEFs) from E10.5 embryos from Ago2 heterozygous intercrosses. Reverse transcription polymerase chain reaction (RT-PCR) analysis and genotyping revealed that we were able to obtain wild-type, mutant, and heterozygous MEF populations. Importantly, MEFs also express other Ago proteins, including Ago1 and Ago3 (Fig. 3A). Ago2-null MEFs were unable to repress gene expression in response to an siRNA (Fig. 3B and fig. S5). This defect could be rescued by the addition of a third plasmid that encoded human Ago2 but not by a plasmid encoding human Ago1 (Fig. 3B). In contrast, responses were intact for a reporter of repression at the level of protein synthesis, mediated by an siRNA binding to multiple mismatched sites (32) (Fig. 3C).",
      "section": "Results: Ago2-null cells · PDF p. 3",
      "kind": "quotation",
      "page": 3
    },
    {
      "id": "p3",
      "text": "The active center of RNase H and its relatives consists of a catalytic triad of three carboxylate groups contributed by aspartic or glutamic acid (38, 39). These amino acid residues coordinate the essential metal and activate water molecules for nucleolytic attack. Reference to the known structure of RNase H reveals two aspartate residues in the archeal Ago protein present at the precise spatial locations predicted for formation of an RNase H–like active site (37 ). These align with identical residues in the human Ago2 protein (fig. S9). Therefore, to test whether the PIWI domain of Ago2 provides catalytic activity to RISC, we changed the two conserved aspartates, D597 and D669, to alanine, with the prediction that either mutation would inactivate RISC cleavage. Consistent with our hypothesis, the mutant Ago2 proteins were incapable of assembling into a cleavage-competent RISC in vitro or in vivo, despite retaining the ability to bind siRNAs (Fig. 5, B to D).",
      "section": "Results: catalytic-site mutation · PDF p. 5",
      "kind": "quotation",
      "page": 5
    }
  ]
};
