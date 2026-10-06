import { describe, expect, it } from 'vitest';
import { attentionWeights, diagonalGaussianKL, ensembleAt } from '../src/math/act';

describe('ACT mathematical walkthrough', () => {
  it('normalizes stable attention and sharpens a matching key with lower temperature', () => {
    const keys = [[1, 0], [0, 1], [-1, 0]];
    const warm = attentionWeights([2, 0], keys, 1), cold = attentionWeights([2, 0], keys, 0.2);
    expect(warm.reduce((a, b) => a + b)).toBeCloseTo(1);
    expect(cold[0]).toBeGreaterThan(warm[0]);
    expect(attentionWeights([1000], [[1000], [-1000]])).toEqual([1, 0]);
    expect(() => attentionWeights([1], [[1]], 0)).toThrow();
  });
  it('KL vanishes exactly at the prior and matches the standard Gaussian formula', () => {
    expect(diagonalGaussianKL([0, 0], [0, 0])).toBe(0);
    expect(diagonalGaussianKL([2], [0])).toBe(2);
    expect(diagonalGaussianKL([0], [Math.log(4)])).toBeCloseTo((4 - 1 - Math.log(4)) / 2);
  });
  it('aligns absolute time before weighting and retains valid zero-valued actions', () => {
    const chunks = [{ start: 1, actions: [0, 10] }, { start: 0, actions: [100, 2, 3] }];
    const e = ensembleAt(chunks, 1, 0);
    expect(e.contributions.map(c => [c.start, c.offset, c.action])).toEqual([[0, 1, 2], [1, 0, 0]]);
    expect(e.action).toBe(1);
    expect(ensembleAt(chunks, 1, 1).action).toBeGreaterThan(1);
    expect(ensembleAt(chunks, 9, 0).action).toBeNull();
  });
  it('does not mix other timesteps into the current action', () => {
    const e = ensembleAt([{ start: 0, actions: [999, 10] }, { start: 1, actions: [20, -999] }], 1, Math.log(2));
    expect(e.action).toBeCloseTo(40 / 3);
    expect(e.contributions.reduce((sum, c) => sum + c.weight, 0)).toBeCloseTo(1);
  });
});
