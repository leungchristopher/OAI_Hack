"""Rebuild selected quotation evidence from the six supplied PDFs; --check verifies provenance."""
from pathlib import Path
import argparse, hashlib, json, re
import pdfplumber
from pdfplumber.utils import extract_text
ROOT=Path(__file__).resolve().parent.parent
# Region names correspond to visually checked journal columns, never interleaved text.
SELECTIONS={
 'forget-2000':('Gers2000.pdf',[
 (5,'full','Limits of standard LSTM','Saturation will make','each new sequence.'),
 (5,'full','Section 3: Solution: Forget Gates','Our solution to the problem above','slowly fading cell states.'),
 (14,'full','Table 2: CERG results and sample size','Table 2: Continuous','easier, noncontinual ERG.'),
 (14,'full','Table 2: success criterion and sample size','aPercentage of','easier, noncontinual ERG.'),
 (17,'full','Section 4.5.1: forget-gate bias','Using a large bias','LSTM does not.'),
 (5,'full','Section 2.1: fixed decay trade-off','The standard technique of weight decay','“state decay” in Table 2).'),
 ]),
 'lstm-1997':('Hochreiter1997.pdf',[
 (7,'full','Figure 1: memory cell and gates','Figure 1: Architecture','See text and appendix A.1 for details.'),
 (1,'full','Abstract','Learning to store information','previous recurrent network algorithms.'),
 (8,'full','Section 4: learning','Learning. We use a variant','through previous internal states scj .'),
 ]),
 'timing-2002':('Gers2002.pdf',[
 (1,'full','Abstract','The temporal distance','generation of time intervals.'),
 (7,'full','Section 3: peephole connections','Peephole connections. Our simple','except for update timing.'),
 (12,'full','Section 4.2: timing results','A qualitative explanation','with or without peephole connections (Table 1).'),
 ]),
 'dicer-2001':('Bernstein2001.pdf',[
 (1,'left','Abstract','RNA interference (RNAi)','genetically linked to RNAi9,10.'),
 (1,'right','Results: separating processing and effector activities','Our previous studies','share common subunits.'),
 (1,'right','Results: nuclease families','RNase III family members','from dsRNA substrates.'),
 (3,'left','Figure 3: depletion results','Figure 3 Dicer participates','either control (caspase-9) or Dicer dsRNAs.'),
 (3,'left','Results: two-stage mechanism','Our results indicate','sequences (Fig. 2e).'),
 (3,'left','Results: interpreting depletion','Depletion of Dicer','produced by more than one mechanism.'),
 ]),
 'risc-2000':('Hammond2000.pdf',[
 (1,'left','Abstract','In a diverse group','through homology to the substrate mRNAs.'),
 (2,'left','Results: sequence-specific nuclease','The decrease in mRNA levels','RISC (RNA-induced silencing complex).'),
 (3,'left','Results: small RNAs co-fractionate with RISC','Chromatography of soluble nuclease','double-stranded or single-stranded form.'),
 ]),
 'ago2-2004':('Liu2004.pdf',[
 (1,'abstract','Abstract','Gene silencing through','the catalytic engine for RNAi.'),
 (3,'third','Results: Ago2-null cells','To address this question','(32) (Fig. 3C).'),
 (5,'first','Results: catalytic-site mutation','The active center of RNase H','ability to bind siRNAs (Fig. 5, B to D).'),
 ]),
}
def clean(text, filename):
 # Preserve lexical compounds at line ends; remove typographic word wrapping elsewhere.
 text=re.sub(r'\b(double|single|sequence|high|low|post|non|RNA|long|short|cleavage|cell)-\n',r'\1- ',text)
 text=re.sub(r'(?<=[A-Za-z])[-‐]\n(?=[a-z])','',text)
 text=re.sub(r'\s+',' ',text).strip()
 text=re.sub(r'\b(double|single|sequence|high|low|post|non|RNA|long|short|cleavage|cell)- ',r'\1-',text)
 if filename=='Hochreiter1997.pdf':
  for bad,good in {'(cid:11)':'ff','(cid:12)':'fi','(cid:13)':'fl','(cid:14)':'ffi','\\':'“','"':'”'}.items(): text=text.replace(bad,good)
 if filename=='Gers2000.pdf':
  text=text.replace('sequential fi decay','sequential α decay').replace('h¡i','⟨−⟩').replace('h31i','⟨31⟩').replace('h1166i','⟨1166⟩').replace('h37i','⟨37⟩').replace('h56i','⟨56⟩').replace('h39;171i','⟨39,171⟩').replace('h145i','⟨145⟩').replace('h68;464i','⟨68,464⟩').replace('h30i','⟨30⟩').replace('• 1000','≤ 1000')
 if filename in ['Bernstein2001.pdf','Hammond2000.pdf']:
  text=text.replace(',22','~22').replace(',25','~25')
 return text

def region(page,name):
 if name=='full':return page
 boxes={'left':(0,0,297,page.height),'right':(297,0,page.width,page.height),'first':(0,0,207,page.height),'third':(385,0,565,page.height),'abstract':(235,405,550,535)}
 return page.crop(boxes[name])

def generate():
 results={}; provenance=[]
 for doc,(filename,choices) in SELECTIONS.items():
  path=ROOT/'papers'/filename; results[doc]=[]
  with pdfplumber.open(path) as pdf:
   for i,(n,box,section,start,end) in enumerate(choices,1):
    p=region(pdf.pages[n-1],box)
    # Malformed reflected font matrix in the supplied 1997 PDF falsely marks horizontal letters rotated.
    raw=extract_text([dict(c,upright=True) for c in p.chars],x_tolerance=1) if filename=='Hochreiter1997.pdf' else p.extract_text(x_tolerance=.5)
    text=clean(raw or '',filename);a=text.index(start);b=text.index(end,a)+len(end);excerpt=text[a:b]
    assert 150<=len(excerpt)<=2500,(doc,i,len(excerpt))
    assert '(cid:' not in excerpt,(doc,i,'undecoded glyph')
    results[doc].append(dict(id=f'p{i}',text=excerpt,section=f'{section} · PDF p. {n}',kind='quotation',page=n))
    provenance.append((doc,f'p{i}',filename,n,box,len(excerpt),hashlib.sha256(excerpt.encode()).hexdigest()))
 return results,provenance

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
 results,provenance=generate()
 for filename,export,keys in [('memory-passages.ts','memoryPassages',['forget-2000','lstm-1997','timing-2002']),('rna-passages.ts','rnaPassages',['dicer-2001','risc-2000','ago2-2004'])]:
  content='/** Quotations extracted from supplied PDFs. Rebuild: python scripts/extract-papers.py. */\n'
  content+=f"export const {export}: Record<string, Array<{{ id: string; text: string; section: string; kind: 'quotation'; page: number }}>> = "
  content+=json.dumps({k:results[k] for k in keys},ensure_ascii=False,indent=2)+';\n'
  path=ROOT/'src/data'/filename
  if args.check:assert path.read_text()==content,f'{filename} differs from PDF extraction'
  else:path.write_text(content)
 print(json.dumps({'verified':args.check,'documents':len(results),'passages':len(provenance),'characters':sum(x[5] for x in provenance),'passageHashes':provenance},indent=2))
if __name__=='__main__':main()
