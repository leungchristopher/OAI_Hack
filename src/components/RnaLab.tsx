import {useState} from 'react';
import {RNA_CONTROL,RNA_STAGES,nextRnaStage,rnaMechanism,type RnaMechanismSettings,type RnaMechanismState,type RnaStage} from '../simulations/rna-mechanism';
import '../rna-lab.css';
import ExperimentExplainer, {type ExperimentResearch} from './ExperimentExplainer';

function Strand({short=false,split=false,muted=false,complementary=false}:{short?:boolean;split?:boolean;muted?:boolean;complementary?:boolean}){
  const motif=complementary?'UACG':'AUGC';
  const sequence=short?motif:motif.repeat(3);
  return <div className={`rna-strand ${muted?'rna-dim':''}`} aria-label={split?'Cleaved target RNA':short?'Small RNA guide':'RNA strand'}>{Array.from(sequence).map((base,i)=><span className={`rna-base base-${base} ${split&&i===6?'rna-cut':''}`} key={i}>{base}</span>)}</div>;
}
function Route({state,settings,control=false}:{state:RnaMechanismState;settings:RnaMechanismSettings;control?:boolean}){
  const reached=(stage:number)=>state.stage>=stage;
  return <div className={`rna-route ${control?'rna-route-control':''}`}>
    <div className="rna-route-title"><strong>{control?'Reference control':'Your condition'}</strong><span>{state.heading}</span></div>
    <div className="rna-pathway">
      <div className={`rna-station ${reached(0)?'reached':''}`}><span className="rna-step-id">01 / INPUT</span><div className="rna-molecule"><Strand/><Strand complementary/></div><strong>Double-stranded RNA</strong></div>
      <span className="rna-route-arrow" aria-hidden="true">→</span>
      <div className={`rna-station ${reached(1)?'reached':''}`}><span className="rna-step-id">02 / DICER</span><div className="rna-molecule"><div className={`rna-enzyme ${settings.dicer==='depleted'?'perturbed':''}`}>DICER</div>{reached(1)?<Strand short muted={settings.dicer==='depleted'}/>:<span className="rna-waiting">Awaiting processing</span>}</div><strong>{reached(1)?state.guide==='reduced'?'Reduced guide supply':'Guide fragments':'Guide production'}</strong></div>
      <span className="rna-route-arrow" aria-hidden="true">→</span>
      <div className={`rna-station ${reached(2)?'reached':''}`}><span className="rna-step-id">03 / EFFECTOR</span><div className="rna-molecule"><div className={`rna-risc ${settings.ago2==='inactive'?'perturbed':''}`}><span>RISC / Ago2</span>{reached(2)?<Strand short muted={settings.dicer==='depleted'}/>:<span className="rna-waiting">Guide loading</span>}</div></div><strong>{reached(2)?'Guide-loaded complex':'Effector assembly'}</strong></div>
      <span className="rna-route-arrow" aria-hidden="true">→</span>
      <div className={`rna-station ${reached(3)?'reached':''}`}><span className="rna-step-id">04 / TARGET</span><div className="rna-molecule"><Strand complementary={settings.target==='matched'} split={state.cleavage==='enabled'||state.cleavage==='reduced'}/><span className="rna-target-type">{settings.target==='matched'?'Complementary target':'Mismatch control'}</span></div><strong>{reached(3)?state.heading:'Target recognition'}</strong></div>
    </div>
  </div>;
}

export default function RnaLab({onClose,research}:{onClose?:()=>void;research?:ExperimentResearch}){
  const [settings,setSettings]=useState<RnaMechanismSettings>({...RNA_CONTROL});
  const [stage,setStage]=useState<RnaStage>(0);
  const state=rnaMechanism(settings,stage),control=rnaMechanism(RNA_CONTROL,stage);
  const update=(change:Partial<RnaMechanismSettings>)=>setSettings(current=>({...current,...change}));
  return <div className="rna-lab">
    <header className="rna-lab-header"><div><span className="eyebrow">Hannon / mechanism lab</span><h1>Follow the guide.</h1><p>Separate guide production, target recognition and catalytic cleavage.</p></div>{onClose&&<button onClick={onClose} aria-label="Close RNA lab">Close ×</button>}</header>
    <div className="rna-lab-controls">
      <label>Dicer activity<select value={settings.dicer} onChange={e=>update({dicer:e.target.value as RnaMechanismSettings['dicer']})}><option value="active">Active</option><option value="depleted">Depleted</option></select></label>
      <label>Ago2 catalysis<select value={settings.ago2} onChange={e=>update({ago2:e.target.value as RnaMechanismSettings['ago2']})}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
      <label>Target pairing<select value={settings.target} onChange={e=>update({target:e.target.value as RnaMechanismSettings['target']})}><option value="matched">Complementary</option><option value="mismatched">Mismatched</option></select></label>
      <button onClick={()=>{setSettings({...RNA_CONTROL});setStage(0)}}>Reset</button>
    </div>
    <nav className="rna-stage-nav" aria-label="Mechanism stages">{RNA_STAGES.map((title,i)=><button key={title} aria-pressed={stage===i} onClick={()=>setStage(i as RnaStage)}><span>0{i+1}</span>{title}</button>)}</nav>
    <Route state={state} settings={settings}/>
    <div className="rna-explanation" aria-live="polite"><div><span className="eyebrow">Step {stage+1} / 4</span><h2>{state.heading}</h2><p>{state.explanation}</p></div><button className="primary" onClick={()=>setStage(nextRnaStage(stage))} disabled={stage===3}>Next stage →</button></div>
    <Route state={control} settings={RNA_CONTROL} control/>
    {research&&<ExperimentExplainer research={research} experiment={{kind:'rna',settings,stage}}/>}
    <details className="rna-sources"><summary>Sources & assumptions</summary><p>This qualitative state model combines three studies across Drosophila and mammalian systems. The symbols are schematic, not sequence designs; stage numbers are not biological time. No rates or concentrations are inferred.</p><ul><li><a href="https://doi.org/10.1038/35053110" target="_blank" rel="noreferrer">Bernstein et al. (2001)</a>, supplied PDF pp. 1–3: Dicer-associated guide production and depletion. Residual silencing can reflect incomplete depletion or other guide production.</li><li><a href="https://doi.org/10.1038/35005107" target="_blank" rel="noreferrer">Hammond et al. (2000)</a>, supplied PDF pp. 1–3: sequence-specific RNA-directed nuclease activity. The early study reports approximately 25-nucleotide RNAs and does not settle their strand state within RISC.</li><li><a href="https://doi.org/10.1126/science.1102513" target="_blank" rel="noreferrer">Liu et al. (2004)</a>, supplied PDF pp. 3, 5: Ago2 cleavage activity is distinct from guide binding and mismatched-site repression.</li></ul><p>The mismatch control does not predict all mismatch configurations or translational repression. Dicer depletion reduces this route; it is not modeled as abolishing all silencing.</p></details>
  </div>;
}
