/** Deterministic scalar LSTM forward pass; fixed teaching weights, no training. */
export interface LstmSettings { forgetBias: number; inputBias: number; outputBias: number; ablation: 'none' | 'forget' | 'input' | 'output' }
export interface LstmStep { t: number; x: number; previousCell: number; previousHidden: number; forget: number; input: number; output: number; candidate: number; retained: number; written: number; cell: number; hidden: number }
export const defaultLstmSettings: LstmSettings = { forgetBias: 1.5, inputBias: 0, outputBias: 1, ablation: 'none' };
export const defaultLstmSequence = [1, 0, 0, 0, -1, 0, 0, 0];
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export function parseLstmSequence(text: string): number[] {
  const tokens = text.trim().split(/[\s,]+/).filter(Boolean);
  if (!tokens.length || tokens.length > 24) throw new Error('Enter 1–24 numbers separated by spaces or commas.');
  const values = tokens.map(Number);
  if (values.some(x => !Number.isFinite(x) || Math.abs(x) > 2)) throw new Error('Each input must be a number between −2 and 2.');
  return values;
}
export function runLstm(sequence: number[], settings: LstmSettings = defaultLstmSettings): LstmStep[] {
  if (!sequence.length || sequence.length > 24 || sequence.some(x => !Number.isFinite(x) || Math.abs(x) > 2)) throw new Error('Invalid input sequence');
  if (![settings.forgetBias, settings.inputBias, settings.outputBias].every(x => Number.isFinite(x) && Math.abs(x) <= 4) || !['none', 'forget', 'input', 'output'].includes(settings.ablation)) throw new Error('Invalid gate settings');
  let cell = 0, hidden = 0;
  return sequence.map((x, index) => {
    const forget = settings.ablation === 'forget' ? 1 : sigmoid(-0.3 * x + 0.2 * hidden + settings.forgetBias);
    const input = settings.ablation === 'input' ? 0 : sigmoid(0.8 * x + 0.2 * hidden + settings.inputBias);
    const output = settings.ablation === 'output' ? 0 : sigmoid(0.2 * x + 0.3 * hidden + settings.outputBias);
    const candidate = Math.tanh(x + 0.4 * hidden);
    const retained = forget * cell, written = input * candidate;
    const result: LstmStep = {t:index + 1, x, previousCell:cell, previousHidden:hidden, forget, input, output, candidate, retained, written, cell:retained + written, hidden:output * Math.tanh(retained + written)};
    cell = result.cell; hidden = result.hidden;
    return result;
  });
}
