import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { defaultLstmSequence, defaultLstmSettings, parseLstmSequence, runLstm, type LstmSettings } from '../simulations/lstm';
import '../lstm-lab.css';
import ExperimentExplainer, {type ExperimentResearch} from './ExperimentExplainer';

const fmt = (x: number) => x.toFixed(3);
export function LstmLab({onClose,research}: {onClose?: () => void;research?:ExperimentResearch}) {
  const [sequence, setSequence] = useState(defaultLstmSequence);
  const [draft, setDraft] = useState(defaultLstmSequence.join(', '));
  const [settings, setSettings] = useState<LstmSettings>({...defaultLstmSettings});
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState<'forget' | 'input' | 'output'>('forget');
  const trace = useMemo(() => runLstm(sequence, settings), [sequence, settings]);
  const baseline = useMemo(() => runLstm(sequence), [sequence]);
  const step = trace[cursor];
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCursor(current => {
      if (current >= sequence.length - 1) { setPlaying(false); return current; }
      return current + 1;
    }), 850);
    return () => window.clearInterval(timer);
  }, [playing, sequence.length]);
  const reset = () => {setPlaying(false); setCursor(0); setSettings({...defaultLstmSettings}); setSequence([...defaultLstmSequence]); setDraft(defaultLstmSequence.join(', ')); setError('');};
  const load = (values: number[]) => {setSequence(values); setDraft(values.join(', ')); setCursor(0); setPlaying(false); setError('');};
  const explanations = {
    forget: 'The forget gate scales the previous cell state. Close it to clear memory; open it to retain the old state.',
    input: 'The input gate scales the signed candidate before it enters the cell. A negative candidate can subtract from the state.',
    output: 'The output gate controls how much of tanh(cell) becomes the visible hidden state. That hidden state also feeds the next step’s gates.',
  };
  return <section className="lstm-lab" aria-label="Interactive LSTM laboratory">
    <header className="lstm-heading"><div><span className="lstm-eyebrow">MEMORY / FORWARD PASS</span><h2>Inside an LSTM cell</h2><p>Send a signal through time. Decide what to keep, write, and reveal.</p></div>{onClose && <button onClick={onClose}>Close</button>}</header>
    <div className="lstm-toolbar"><button onClick={() => {if (cursor === sequence.length - 1) setCursor(0); setPlaying(!playing);}}>{playing ? 'Pause' : 'Play sequence'}</button><button disabled={cursor === 0} onClick={() => {setPlaying(false); setCursor(cursor - 1);}}>← Back</button><button disabled={cursor === sequence.length - 1} onClick={() => {setPlaying(false); setCursor(cursor + 1);}}>Step →</button><button onClick={reset}>Reset lab</button><output aria-live="polite">STEP {cursor + 1} / {sequence.length}</output></div>
    <div className="lstm-sequence" aria-label="Input timeline">{sequence.map((value, index) => <button key={index} aria-label={`Inspect step ${index + 1}, input ${value}`} aria-pressed={index === cursor} onClick={() => {setPlaying(false); setCursor(index);}}><small>{index + 1}</small>{value > 0 ? '+' : ''}{value}</button>)}</div>
    <div className="lstm-layout"><div className="lstm-workbench">
      <div className="lstm-state-row"><div><small>INPUT xₜ</small><strong>{fmt(step.x)}</strong></div><div><small>PREVIOUS CELL cₜ₋₁</small><strong>{fmt(step.previousCell)}</strong></div><div><small>PREVIOUS HIDDEN hₜ₋₁</small><strong>{fmt(step.previousHidden)}</strong></div></div>
      <div className="lstm-gates">{(['forget', 'input', 'output'] as const).map((gate, i) => <button key={gate} aria-pressed={focus === gate} onClick={() => setFocus(gate)} className={`lstm-gate lstm-gate-${gate}`}><span>{['01 / KEEP', '02 / WRITE', '03 / REVEAL'][i]}</span><strong>{gate} gate</strong><meter min={0} max={1} value={step[gate]} aria-label={`${gate} gate opening`}/><b>{fmt(step[gate])}</b></button>)}</div>
      <p className="lstm-gate-explanation">{explanations[focus]}</p>
      <div className="lstm-arithmetic"><div><small>RETAINED</small><strong>{fmt(step.forget)} × {fmt(step.previousCell)}</strong><b>{fmt(step.retained)}</b></div><span>+</span><div><small>WRITTEN · CANDIDATE gₜ = {fmt(step.candidate)}</small><strong>{fmt(step.input)} × {fmt(step.candidate)}</strong><b>{fmt(step.written)}</b></div><span>=</span><div className="lstm-cell-result"><small>CELL cₜ</small><strong>{fmt(step.cell)}</strong></div></div>
      <div className="lstm-hidden-result"><span>hₜ = oₜ × tanh(cₜ)</span><strong>{fmt(step.output)} × {fmt(Math.tanh(step.cell))} = {fmt(step.hidden)}</strong></div>
      <div className="lstm-chart" role="img" aria-label="Cell state over time: cyan adjusted settings and amber default baseline"><ResponsiveContainer width="100%" height={220}><LineChart data={[{t:0, changed:0, baseline:0}, ...trace.slice(0,cursor + 1).map((point, i) => ({t:point.t, changed:point.cell, baseline:baseline[i].cell}))]}><CartesianGrid stroke="#334963" strokeDasharray="3 3"/><XAxis dataKey="t" type="number" domain={[0,sequence.length]} allowDecimals={false} stroke="#bac8d9"/><YAxis stroke="#bac8d9" width={45}/><Tooltip contentStyle={{background:'#101c30', border:'1px solid #60758e',color:'#fff'}}/><Legend/><Line name="Default gates · cell" dataKey="baseline" stroke="#f4bb53" strokeDasharray="5 4" dot={false} isAnimationActive={false}/><Line name="Your gates · cell" dataKey="changed" stroke="#60e0d8" strokeWidth={3} dot={{r:3}} isAnimationActive={false}/></LineChart></ResponsiveContainer></div>
      <p className="lstm-comparison">At step {cursor + 1}, your cell is <strong>{fmt(step.cell)}</strong>; the default-gate baseline is <strong>{fmt(baseline[cursor].cell)}</strong>. {settings.ablation === 'output' ? 'The visible hidden state is zero, while the cell can still hold memory.' : settings.ablation === 'forget' ? 'Retention is fixed at one: previous memory is never directly erased.' : settings.ablation === 'input' ? 'With writing blocked and a zero initial state, no memory enters the cell.' : 'Change a gate bias to recompute the entire trajectory.'}</p>
    </div><aside className="lstm-controls" aria-label="LSTM controls"><h3>Gate controls</h3><p>Bias shifts each gate before the sigmoid. Gates still respond to the input and previous hidden state.</p>{(['forget','input','output'] as const).map(gate => {
      const key = `${gate}Bias` as 'forgetBias' | 'inputBias' | 'outputBias';
      return <label key={gate}>{gate.charAt(0).toUpperCase() + gate.slice(1)} bias <output>{settings[key].toFixed(1)}</output><input type="range" min={-4} max={4} step={0.1} value={settings[key]} onChange={e => {setPlaying(false); setSettings({...settings,[key]:Number(e.target.value)});}}/></label>;
    })}<label>Ablation<select value={settings.ablation} onChange={e => {setPlaying(false); setSettings({...settings, ablation:e.target.value as LstmSettings['ablation']});}}><option value="none">All gates active</option><option value="forget">Remove forgetting · f = 1</option><option value="input">Block writing · i = 0</option><option value="output">Hide output · o = 0</option></select></label>
    <h3>Input sequence</h3><form onSubmit={e => {e.preventDefault(); try {load(parseLstmSequence(draft));} catch (err) {setError((err as Error).message);}}}><label htmlFor="lstm-sequence-input">1–24 numbers, from −2 to 2</label><input id="lstm-sequence-input" value={draft} onChange={e => setDraft(e.target.value)} aria-invalid={!!error}/><button type="submit">Apply sequence</button>{error && <p role="alert">{error}</p>}</form><div className="lstm-presets"><button onClick={() => load([1,0,0,0,0,0,0,0])}>Single pulse</button><button onClick={() => load([1,0,0,0,-1,0,0,0])}>Opposing pulses</button><button onClick={() => load([1,-1,1,-1,1,-1,1,-1])}>Alternating</button></div>
    </aside></div>
    {research&&<ExperimentExplainer research={research} experiment={{kind:'lstm',sequence,settings,cursor}}/>}
    <details className="lstm-method"><summary>Equations, fixed weights & source</summary><p>This one-cell forward pass uses fixed teaching weights and zero initial states, without training or peepholes. It shows the gated memory mechanism described by Gers, Schmidhuber & Cummins (2000); it does not reproduce their trained experiments.</p><code>fₜ = σ(−0.3xₜ + 0.2hₜ₋₁ + b_f)<br/>iₜ = σ(0.8xₜ + 0.2hₜ₋₁ + b_i)<br/>oₜ = σ(0.2xₜ + 0.3hₜ₋₁ + b_o)<br/>gₜ = tanh(xₜ + 0.4hₜ₋₁)<br/>cₜ = fₜcₜ₋₁ + iₜgₜ · hₜ = oₜtanh(cₜ)</code><p>σ(z) = 1 / (1 + exp(−z)). c is the cell state; h is its exposed, recurrent output. The amber baseline uses the same inputs and biases b_f = 1.5, b_i = 0, b_o = 1.</p><a href="https://doi.org/10.1162/089976600300015015" target="_blank" rel="noreferrer">Learning to Forget (2000), supplied PDF pp. 5–6</a></details>
  </section>;
}
export default LstmLab;
