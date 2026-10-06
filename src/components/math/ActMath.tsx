import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { attentionWeights, diagonalGaussianKL, ensembleAt, workedChunks } from '../../math/act';
import { MathBlock } from './MathBlock';

function Control({ label, value, min, max, step = 0.1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <label>{label} <output>{value}</output><input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /></label>;
}

export default function ActMath() {
  const [query, setQuery] = useState(1), [temperature, setTemperature] = useState(1);
  const [mu, setMu] = useState(0.5), [logvar, setLogvar] = useState(0), [beta, setBeta] = useState(10), [epsilon, setEpsilon] = useState(0.5);
  const [length, setLength] = useState(4), [time, setTime] = useState(3), [decay, setDecay] = useState(0.01);
  const weights = attentionWeights([query, 1], [[1, 0], [0, 1], [-1, 0]], temperature);
  const values = [0.2, 0.8, -0.4], attended = weights.reduce((sum, w, i) => sum + w * values[i], 0);
  const kl = diagonalGaussianKL([mu], [logvar]), z = mu + Math.exp(logvar / 2) * epsilon;
  // Fixed affine decoder exposes the sample-to-reconstruction dependency.
  const reconstruction = [0.2 + 0.1 * z, 0.4 + 0.2 * z, 0.6 - 0.1 * z];
  const l1 = reconstruction.reduce((sum, a, i) => sum + Math.abs(a - [0.3, 0.5, 0.55][i]), 0) / 3;
  const chunks = workedChunks(length), ensemble = ensembleAt(chunks, time, decay);
  const plot = Array.from({ length: length + 4 }, (_, t) => ({ time: t, ensemble: ensembleAt(chunks, t, decay).action, ...Object.fromEntries(chunks.map(c => [`chunk${c.start}`, t >= c.start && t < c.start + c.actions.length ? c.actions[t - c.start] : null])) }));
  return <div className="architecture-math">
    <p>Worked example · Small fixed tensors expose each calculation. The trajectory player uses its separately identified policy run.</p>
    <section className="math-section"><h3>1. Pixels and state → action queries</h3>
      <p>For camera image I and robot state s, a convolutional backbone produces spatial features. Linear projections give every image, state and latent token the same width d. Position embeddings retain spatial location. The decoder has H learned query positions, one per future action.</p>
      <MathBlock tex={String.raw`x_{v,p}=W_v\operatorname{CNN}(I)_p+b_v+e_p,\quad x_s=W_s s+b_s,\quad x_z=W_z z+b_z`} label="p indexes an image feature location; W and b are learned projections; e is a position embedding." />
      <MathBlock tex={String.raw`Q=X_qW_Q,\ K=X_kW_K,\ V=X_kW_V,\quad \operatorname{Attn}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V`} label="Queries choose a weighted mixture of value vectors. dₖ is the key width; softmax normalizes each query row." />
      <p>Self-attention mixes tokens within a sequence; decoder cross-attention reads observation tokens. Multiple heads concatenate their mixtures before an output projection. Residual connections, layer normalization and feed-forward layers complete each transformer block; a final linear head emits H action vectors in parallel.</p>
      <div className="math-controls"><Control label="Query first coordinate" value={query} min={-3} max={3} onChange={setQuery} /><Control label="Attention temperature τ" value={temperature} min={0.2} max={3} onChange={setTemperature} /></div>
      <p>Here q = [{query.toFixed(1)}, 1], keys = [1,0], [0,1], [−1,0], and scalar values = [0.2, 0.8, −0.4]. The temperature divides attention logits; τ = 1 gives standard scaled attention.</p>
      <div className="math-grid">{weights.map((w, i) => <div className="math-card" key={i}>Token {i + 1}<br /><output>{(100 * w).toFixed(1)}% attention</output><meter aria-label={`Token ${i + 1} attention`} min={0} max={1} value={w} /></div>)}</div>
      <p aria-live="polite">Weighted value: {attended.toFixed(4)}. Smaller τ sharpens the strongest match.</p>
    </section>
    <section className="math-section"><h3>2. Training: encode variation, reconstruct actions</h3>
      <p>The training encoder reads state s and demonstrated action chunk A, with a classification token. Its output predicts a diagonal Gaussian for latent z. Images condition the action decoder; demonstrated future actions enter only the training encoder.</p>
      <MathBlock tex={String.raw`q_\phi(z\mid A,s)=\mathcal N(\mu,\operatorname{diag}(e^\ell)),\quad z=\mu+e^{\ell/2}\odot\epsilon,\quad\epsilon\sim\mathcal N(0,I)`} label="μ is latent mean; ℓ is log variance; ε is a standard normal draw. φ denotes encoder parameters." />
      <MathBlock tex={String.raw`D_{\rm KL}(q_\phi\Vert\mathcal N(0,I))=\frac12\sum_j\left(\mu_j^2+e^{\ell_j}-1-\ell_j\right)`} />
      <MathBlock tex={String.raw`\widehat A=f_\theta(I,s,z),\quad \mathcal L=\frac{1}{H d_a}\sum_{h=0}^{H-1}\sum_{r=1}^{d_a}|A_{h,r}-\widehat A_{h,r}|+\beta D_{\rm KL}`} label="For an unpadded chunk: H is horizon, dₐ action width, θ decoder parameters, β regularization strength. Padding masks zero padded reconstruction terms." />
      <div className="math-controls"><Control label="Latent mean μ" value={mu} min={-2} max={2} onChange={setMu} /><Control label="Log variance ℓ" value={logvar} min={-3} max={2} onChange={setLogvar} /><Control label="Fixed noise ε" value={epsilon} min={-2} max={2} onChange={setEpsilon} /><Control label="KL weight β" value={beta} min={0} max={20} step={0.5} onChange={setBeta} /></div>
      <p>One-dimensional calculation: target A = [0.30, 0.50, 0.55]; fixed decoder Â = [0.2 + 0.1z, 0.4 + 0.2z, 0.6 − 0.1z]. Hold ε fixed while changing μ or ℓ to see the reparameterized sample move.</p>
      <div className="math-grid" aria-live="polite"><div className="math-card">z = {z.toFixed(3)}<br />Â = [{reconstruction.map(a => a.toFixed(3)).join(', ')}]</div><div className="math-card">L1 = {l1.toFixed(4)}<br />KL = {kl.toFixed(4)}</div><div className="math-card">Loss = {(l1 + beta * kl).toFixed(4)}</div></div>
      <p>At μ = 0 and ℓ = 0, the posterior equals the standard normal prior and KL is zero. Increasing β strengthens that constraint. At inference ACT bypasses the action encoder and sets z = 0, the prior mean.</p>
    </section>
    <section className="math-section"><h3>3. Align chunks, then execute</h3>
      <MathBlock tex={String.raw`\widehat A^{(u)}=f_\theta(I_u,s_u,0)=[\widehat a_{u\mid u},\ldots,\widehat a_{u+H-1\mid u}]`} label="u is the time a chunk was predicted. Entry t − u targets execution time t." />
      <p>Chunk execution consumes a prefix before observing again. Receding-horizon control predicts a fresh chunk after that prefix. ACT temporal ensembling instead queries at every step and combines overlapping predictions for the same execution time.</p>
      <MathBlock tex={String.raw`\mathcal U_t=\{u:0\le t-u<H\},\quad w_i=\frac{e^{-mi}}{\sum_{j=0}^{n-1}e^{-mj}},\quad a_t=\sum_{i=0}^{n-1}w_i\widehat A^{(u_i)}_{t-u_i}`} label="Sort available uᵢ from oldest to newest; n counts overlapping predictions; m is decay. Positive m weights older predictions more, following the official implementation." />
      <div className="math-controls"><Control label="ACT chunk horizon H" value={length} min={2} max={6} step={1} onChange={setLength} /><Control label="Execution time t" value={time} min={0} max={5} step={1} onChange={setTime} /><Control label="Ensemble decay m" value={decay} min={0} max={2} step={0.01} onChange={setDecay} /></div>
      <div style={{ width: '100%', height: 240 }}><ResponsiveContainer><LineChart data={plot}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis /><Tooltip />{chunks.map(c => <Line key={c.start} type="linear" dataKey={`chunk${c.start}`} name={`Predicted at ${c.start}`} stroke={['#527a9f', '#a67951', '#788e55', '#a56c91', '#898080'][c.start]} strokeDasharray="4 3" dot={false} isAnimationActive={false} />)}<Line type="linear" dataKey="ensemble" name="Executed ensemble" stroke="#ffcd72" strokeWidth={3} dot isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
      <div style={{ overflowX: 'auto' }}><table><caption>Predictions aligned to time {time}</caption><thead><tr><th>Predicted at</th><th>Chunk offset</th><th>Action</th><th>Weight</th></tr></thead><tbody>{ensemble.contributions.map(c => <tr key={c.start}><td>{c.start}</td><td>{c.offset}</td><td>{c.action.toFixed(3)}</td><td>{(c.weight * 100).toFixed(1)}%</td></tr>)}</tbody></table></div>
      <p aria-live="polite">Executed scalar action at t = {time}: <strong>{ensemble.action?.toFixed(4) ?? 'No prediction'}</strong>. At m = 0, overlapping predictions have equal weight. The original implementation uses m = 0.01.</p>
      <button onClick={() => { setQuery(1); setTemperature(1); setMu(0.5); setLogvar(0); setBeta(10); setEpsilon(0.5); setLength(4); setTime(3); setDecay(0.01); }}>Reset ACT calculations</button>
    </section>
    <p className="math-sources">Sources: <a href="https://arxiv.org/abs/2304.13705" target="_blank" rel="noreferrer">ACT paper</a> · <a href="https://github.com/tonyzhaozh/act/blob/main/detr/models/detr_vae.py" target="_blank" rel="noreferrer">Encoder / decoder</a> · <a href="https://github.com/tonyzhaozh/act/blob/main/policy.py" target="_blank" rel="noreferrer">Training objective</a> · <a href="https://github.com/tonyzhaozh/act/blob/main/imitate_episodes.py" target="_blank" rel="noreferrer">Temporal ensembling</a></p>
  </div>;
}
