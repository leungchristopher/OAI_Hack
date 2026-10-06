export interface SimulationControl { key: string; label: string; min: number; max: number; step: number; defaultValue: number }
export const simulationControls: Record<string, SimulationControl[]> = {
  'memory-decay': [
    { key: 'retention', label: 'Retention f', min: 0, max: 1, step: 0.01, defaultValue: 0.95 },
    { key: 'steps', label: 'Time steps T', min: 10, max: 100, step: 1, defaultValue: 60 },
    { key: 'initial', label: 'Initial memory c₀', min: 0.1, max: 2, step: 0.1, defaultValue: 1 },
  ],
  'rna-silencing': [
    { key: 'silencing', label: 'Effective silencing k (illustrative)', min: 0, max: 1, step: 0.05, defaultValue: 0.3 },
    { key: 'production', label: 'Production s (arbitrary units)', min: 0, max: 1, step: 0.05, defaultValue: 0.2 },
    { key: 'decay', label: 'Background turnover δ', min: 0.05, max: 1, step: 0.05, defaultValue: 0.2 },
  ],
};
export interface SimulationResult { points: { x: number; baseline: number; changed: number }[]; equation: string; explanation: string; xLabel: string; yLabel: string }
export function validateParameters(templateId: string, parameters: Record<string, number>): Record<string, number> {
  const controls = simulationControls[templateId];
  if (!controls) throw new Error('Unknown demonstration template');
  if (Object.keys(parameters).some(key => !controls.some(c => c.key === key))) throw new Error('Unknown simulation parameter');
  return Object.fromEntries(controls.map(control => {
    const value = parameters[control.key] ?? control.defaultValue;
    if (!Number.isFinite(value) || value < control.min || value > control.max || (control.key === 'steps' && !Number.isInteger(value))) throw new Error(`Invalid ${control.key}`);
    return [control.key, value];
  }));
}
export function simulateMemory(parameters: Record<string, number> = {}): SimulationResult {
  const {retention, steps, initial} = validateParameters('memory-decay', parameters);
  const points = Array.from({length: steps + 1}, (_, x) => ({x, baseline: initial, changed: initial * retention ** x}));
  return { points, equation: 'c_t=f c_{t-1}=f^t c_0,\\quad \\frac{\\partial c_t}{\\partial c_0}=f^t', xLabel: 'Discrete time t', yLabel: 'Scalar memory cₜ', explanation: `After ${steps} steps, ${(100 * retention ** steps).toFixed(1)}% of the initial memory remains; the f=1 baseline retains 100%. c is scalar memory and f is a fixed retention multiplier. No new inputs or training: this isolates forgetting, not the full LSTM or its learned gates.` };
}
export function simulateRna(parameters: Record<string, number> = {}): SimulationResult {
  const {silencing, production, decay} = validateParameters('rna-silencing', parameters);
  const abundance = (rate: number, t: number) => production / rate + (1 - production / rate) * Math.exp(-rate * t);
  const points = Array.from({length: 101}, (_, i) => ({x:i / 5, baseline:abundance(decay, i / 5), changed:abundance(decay + silencing, i / 5)}));
  return {points, equation:'\\frac{dm}{dt}=s-(\\delta+k)m,\\quad m(0)=1', xLabel:'Time (arbitrary units)', yLabel:'Relative target mRNA m', explanation:`Hypothetical steady state: ${(production / (decay + silencing)).toFixed(2)} versus ${(production / decay).toFixed(2)} without silencing (k=0). m is relative mRNA, s is constant production, δ is background turnover and k is an effective first-order silencing rate. These parameters are not measured biological quantities; Dicer and RISC are not kinetically resolved.`};
}
export function simulate(templateId: string, parameters: Record<string, number> = {}): SimulationResult {
  if (templateId === 'memory-decay') return simulateMemory(parameters);
  if (templateId === 'rna-silencing') return simulateRna(parameters);
  throw new Error('Unknown demonstration template');
}
