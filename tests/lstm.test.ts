import { describe, expect, it } from 'vitest';
import { defaultLstmSequence, defaultLstmSettings, parseLstmSequence, runLstm, sigmoid } from '../src/simulations/lstm';
describe('scalar LSTM forward pass', () => {
  it('computes the first gate and state values directly', () => {
    const s = runLstm([1])[0];
    expect(s.forget).toBeCloseTo(sigmoid(1.2));
    expect(s.input).toBeCloseTo(sigmoid(.8));
    expect(s.output).toBeCloseTo(sigmoid(1.2));
    expect(s.cell).toBeCloseTo(sigmoid(.8)*Math.tanh(1));
    expect(s.hidden).toBeCloseTo(s.output*Math.tanh(s.cell));
  });
  it('propagates the cell and exposed hidden state, with exact arithmetic', () => {
    const rows = runLstm(defaultLstmSequence);
    rows.forEach((s,i) => {
      expect(s.previousCell).toBe(i ? rows[i-1].cell : 0);
      expect(s.previousHidden).toBe(i ? rows[i-1].hidden : 0);
      expect(s.cell).toBeCloseTo(s.forget*s.previousCell+s.input*s.candidate);
      expect(s.hidden).toBeCloseTo(s.output*Math.tanh(s.cell));
    });
  });
  it('blocks all writing when input is ablated and retains internal memory with hidden output', () => {
    expect(runLstm(defaultLstmSequence,{...defaultLstmSettings,ablation:'input'}).every(s => s.cell===0 && s.hidden===0)).toBe(true);
    const hidden = runLstm(defaultLstmSequence,{...defaultLstmSettings,ablation:'output'});
    expect(hidden.every(s => s.hidden===0)).toBe(true);
    expect(hidden[0].cell).toBeGreaterThan(0);
    expect(runLstm(defaultLstmSequence,{...defaultLstmSettings,ablation:'forget'}).every(s => s.forget===1)).toBe(true);
  });
  it('gate edits recompute downstream memory; repeated default runs reset identically', () => {
    const baseline = runLstm(defaultLstmSequence);
    expect(runLstm(defaultLstmSequence,{...defaultLstmSettings,forgetBias:-4})[3].cell).not.toBeCloseTo(baseline[3].cell);
    expect(runLstm(defaultLstmSequence)).toEqual(baseline);
  });
  it('stays finite and bounds gates/hidden state at extreme settings', () => {
    for(const bias of [-4,4]) for(const x of [-2,2]) for(const s of runLstm(Array(24).fill(x),{...defaultLstmSettings,forgetBias:bias,inputBias:bias,outputBias:bias})) {
      expect(Number.isFinite(s.cell)).toBe(true);
      expect(Math.abs(s.hidden)).toBeLessThanOrEqual(1);
      for(const gate of [s.forget,s.input,s.output]) {expect(gate).toBeGreaterThanOrEqual(0); expect(gate).toBeLessThanOrEqual(1);}
    }
  });
  it('accepts a short numeric sequence and rejects ambiguous/out-of-range inputs', () => {
    expect(parseLstmSequence('1, 0 -1')).toEqual([1,0,-1]);
    for(const input of ['', 'NaN', '3', 'x', Array(25).fill(0).join(',')]) expect(()=>parseLstmSequence(input)).toThrow();
    expect(()=>runLstm([Infinity])).toThrow();
  });
});
