import {describe,it,expect} from 'vitest';
import {interpolateFlow,targetVelocity,maskedSoftmax,smolMask,analyticFlow} from '../src/math/smolvla';
describe('SmolVLA teaching computations',()=>{
 it('has correct interpolation endpoints and derivative',()=>{expect(interpolateFlow(-2,3,0)).toBe(-2);expect(interpolateFlow(-2,3,1)).toBe(3);expect(targetVelocity(-2,3)).toBe(5);expect((interpolateFlow(-2,3,.501)-interpolateFlow(-2,3,.5))/.001).toBeCloseTo(5);});
 it('normalizes attention without leaking through blocked keys',()=>{for(let q=0;q<5;q++){const mask=smolMask(q),p=maskedSoftmax([1,2,3,4,5],mask);expect(p.reduce((a,b)=>a+b,0)).toBeCloseTo(1);p.forEach((v,i)=>{if(!mask[i])expect(v).toBe(0);});}expect(smolMask(0)).toEqual([true,true,false,false,false]);});
 it('Euler converges to known solution and retains constant solution',()=>{const error=(n:number)=>{const r=analyticFlow(-1,1,n).at(-1)!;return Math.abs(r.euler-r.exact);};expect(error(64)).toBeLessThan(error(8));expect(analyticFlow(2,2,10).every(p=>p.euler===2)).toBe(true);expect(()=>analyticFlow(0,1,0)).toThrow();});
});
