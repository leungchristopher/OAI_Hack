import {describe,it,expect} from 'vitest';
import {softmax,mixedValue,searchScore,selectEdge,backup,finalMove,crossEntropy,policyUpdate,valueLoss,convolution,initialEdges} from '../src/math/alphago';
describe('AlphaGo teaching computations',()=>{
 it('stable softmax normalizes shifted large logits',()=>{expect(softmax([1000,1000])).toEqual([.5,.5]);expect(softmax([1,2,3]).reduce((a,b)=>a+b,0)).toBeCloseTo(1);});
 it('uses rollout lambda, not the opposite mixture',()=>{expect(mixedValue(.6,-1,0)).toBe(.6);expect(mixedValue(.6,-1,1)).toBe(-1);expect(mixedValue(.6,-1,.5)).toBeCloseTo(-.2);});
 it('calculates prior-weighted PUCT and forced UCB exploration',()=>{const e={id:'a',prior:.5,visits:3,valueSum:1.5,rolloutSum:1.5};expect(searchScore(e,16,2,.5)).toBe(1.5);expect(searchScore({...e,visits:0},16,2,.5,'ucb1')).toBe(Infinity);});
 it('selection is score-based but final move is visit-based',()=>{const e=initialEdges();expect(selectEdge(e,0,0,'puct').id).toBe('Q16');expect(finalMove(e)).toBe('D4');});
 it('backup preserves other edges and flips opponent perspective',()=>{const e=initialEdges(),b=backup(e,'Q16',.8,1,-1);expect(b[0]).toEqual(e[0]);expect(b[1].visits).toBe(3);expect(b[1].valueSum).toBeCloseTo(.4);expect(b[1].rolloutSum).toBe(-1);expect(e[1].visits).toBe(2);});
 it('SL and winning policy gradient raise chosen probability; losing lowers it',()=>{const logits=[.2,.4,-.1],p=softmax(logits)[0];expect(softmax(policyUpdate(logits,0,1,.2))[0]).toBeGreaterThan(p);expect(softmax(policyUpdate(logits,0,-1,.2))[0]).toBeLessThan(p);expect(crossEntropy(logits,0).gradient.reduce((a,b)=>a+b,0)).toBeCloseTo(0);});
 it('value gradient agrees with finite differences',()=>{const x=.3,eps=1e-5;expect(valueLoss(x,1).gradient).toBeCloseTo((valueLoss(x+eps,1).loss-valueLoss(x-eps,1).loss)/(2*eps),7);});
 it('convolution includes a bias and ReLU',()=>{expect(convolution([1,0,1],[2,5,-1],.5)).toBe(1.5);expect(convolution([1],[-2])).toBe(0);});
});
