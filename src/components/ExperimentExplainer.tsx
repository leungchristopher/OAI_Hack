import type { LensFixture } from '../../shared/contracts';
import type { Experiment, ExplainExperimentResponse } from '../../shared/experiment';
import '../experiment.css';
import memoryRecording from '../data/recorded/schmidhuber-experiment.json';
import rnaRecording from '../data/recorded/hannon-experiment.json';
import {lenses as bundledLenses} from '../data';
export interface ExperimentResearch {lens:LensFixture;mode:'replay'|'live';demoCode:string;onChat?:(question?:string)=>void;}
export default function ExperimentExplainer({research,experiment}:{research:ExperimentResearch;experiment:Experiment}){
 const {lens,onChat}=research;
 const recording=lens.id==='schmidhuber'?memoryRecording:rnaRecording;
 const bundled=bundledLenses.find(item=>item.id===lens.id);
 // A recorded response can only accompany the identical evidence it was generated from.
 const sameEvidence=bundled&&JSON.stringify({paper:lens.paper,publications:lens.profile.publications})===JSON.stringify({paper:bundled.paper,publications:bundled.profile.publications});
 const response=sameEvidence?recording.response as ExplainExperimentResponse:null;
 const output=response?.output;
 const changed=JSON.stringify(recording.experiment)!==JSON.stringify(experiment);
 return <section className="experiment-explainer" aria-label="Paper-grounded experiment explanation"><header><div><span className="experiment-kicker">Research assistant / Experiment notes</span><h2>What the experiment shows.</h2><p>Connect the mechanism to the supplied papers.</p></div><span className="experiment-mode">Recorded explanation</span></header>
 {output&&response?<><div aria-live="polite" className="experiment-feedback">{changed&&<p className="experiment-stale">Notes use the starting settings; the experiment above reflects your controls.</p>}</div><article className={changed?'experiment-answer stale':'experiment-answer'} aria-label="Generated experiment explanation"><h3>{output.title}</h3><p className="experiment-answer-lead">{output.explanation}</p><div className="experiment-answer-grid"><section><h4>Against the baseline</h4><p>{output.comparison}</p></section><section><h4>Connection to the paper</h4><p>{output.paperConnection}</p></section></div><section><h4>Try this next</h4><p>{output.suggestedExperiment}</p></section><section className="experiment-socratic"><h4>Check your understanding</h4><p>{output.socraticQuestion}</p>{onChat&&<button onClick={()=>onChat(output.socraticQuestion)}>Discuss this question</button>}</section><details className="experiment-evidence"><summary>Paper evidence · {output.evidenceRefs.length} passages</summary>{output.evidenceRefs.map((ref,index)=>{const doc=[lens.paper,...lens.profile.publications].find(value=>value.id===ref.documentId);const passage=doc?.passages.find(value=>value.id===ref.passageId);return <section key={`${index}-${ref.documentId}-${ref.passageId}`}><h4>[{index+1}] {doc?.title??ref.documentId}{passage?.page?` · PDF p. ${passage.page}`:''}</h4><small>{passage?.kind==='quotation'?'Source quotation':passage?.kind==='summary'?'Supplied editorial passage':'Supplied paper text'} · {ref.passageId}</small><blockquote>{ref.supportingExcerpt}</blockquote>{doc&&<a href={doc.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>}</section>;})}<p className="experiment-model">Recorded API explanation · {response.model} · {response.usage.inputTokens.toLocaleString()} input / {response.usage.outputTokens.toLocaleString()} output tokens at recording time.</p></details></article></>:<p>No recorded explanation is attached to this paper.</p>}
 </section>;
}
