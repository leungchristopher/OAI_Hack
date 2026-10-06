import {describe,it,expect} from 'vitest';
import {schedule,forwardNoise,reverseStep,diffusionExample} from '../src/math/diffusion';
describe('DDPM mathematical worked example',()=>{
 it('has valid decreasing signal and zero final posterior variance',()=>{const s=schedule(40,.15);expect(s[0].variance).toBe(0);s.forEach((x,i)=>{expect(x.alphaBar).toBeGreaterThan(0);expect(x.variance).toBeGreaterThanOrEqual(0);if(i)expect(x.alphaBar).toBeLessThan(s[i-1].alphaBar);});});
 it('implements forward signal/noise endpoints',()=>{expect(forwardNoise(2,3,1)).toBe(2);expect(forwardNoise(2,3,0)).toBe(3);});
 it('oracle reverse first step returns the original clean value',()=>{const s=schedule(10,.1)[0],x=forwardNoise(.4,-.7,s.alphaBar);expect(reverseStep(x,-.7,s,99)).toBeCloseTo(.4,10);});
 it('recovers the complete chunk with exact epsilon and is reproducible',()=>{const a=diffusionExample(40,.15,7);expect(a).toEqual(diffusionExample(40,.15,7));a.states.at(-1)!.action.forEach((x,i)=>expect(x).toBeCloseTo(a.clean[i],10));expect(a.states[0].action).not.toEqual(diffusionExample(40,.15,8).states[0].action);});
 it('rejects an invalid schedule',()=>{expect(()=>schedule(0,.1)).toThrow();expect(()=>schedule(20,1)).toThrow();});
});
