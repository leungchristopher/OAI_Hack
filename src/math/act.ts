/** Small, deterministic ACT worked examples. No trained weights. */
export function attentionWeights(query: number[], keys: number[][], temperature = 1): number[] {
  if (!query.length || !keys.length || temperature <= 0 || !Number.isFinite(temperature) || [...query, ...keys.flat()].some(x => !Number.isFinite(x)) || keys.some(k => k.length !== query.length)) throw new Error('Invalid attention dimensions or temperature');
  const logits = keys.map(key => key.reduce((sum, x, i) => sum + x * query[i], 0) / (Math.sqrt(query.length) * temperature));
  const max = Math.max(...logits);
  const exps = logits.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

export function diagonalGaussianKL(mu: number[], logVariance: number[]): number {
  if (!mu.length || mu.length !== logVariance.length || [...mu, ...logVariance].some(x => !Number.isFinite(x))) throw new Error('Invalid Gaussian dimensions');
  return mu.reduce((sum, x, i) => sum + (x * x + Math.exp(logVariance[i]) - 1 - logVariance[i]) / 2, 0);
}

export interface ActionChunk { start: number; actions: number[] }
/** Align by execution time before weighting; index zero is the oldest prediction,
 * matching tonyzhaozh/act and LeRobot ACTTemporalEnsembler. */
export function ensembleAt(chunks: ActionChunk[], time: number, decay: number) {
  if (!Number.isInteger(time) || !Number.isFinite(decay) || decay < 0) throw new Error('Invalid ensemble time or decay');
  const aligned = chunks.filter(c => time >= c.start && time < c.start + c.actions.length).sort((a, b) => a.start - b.start);
  const raw = aligned.map((_, i) => Math.exp(-decay * i));
  const total = raw.reduce((a, b) => a + b, 0);
  const contributions = aligned.map((c, i) => ({ start: c.start, offset: time - c.start, action: c.actions[time - c.start], weight: raw[i] / total }));
  return { contributions, action: contributions.length ? contributions.reduce((sum, c) => sum + c.action * c.weight, 0) : null };
}

export function workedChunks(length: number): ActionChunk[] {
  return Array.from({ length: 5 }, (_, start) => ({ start, actions: Array.from({ length }, (_, offset) => 0.15 * (start + offset) + 0.3 * Math.sin(start * 1.6) + 0.08 * offset) }));
}
