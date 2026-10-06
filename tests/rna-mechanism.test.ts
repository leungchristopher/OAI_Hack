import {describe,expect,it} from 'vitest';
import {RNA_CONTROL,nextRnaStage,rnaMechanism} from '../src/simulations/rna-mechanism';
describe('qualitative RNA mechanism',()=>{
  it('does not produce guides, loading or cleavage before their stages',()=>{
    expect(rnaMechanism(RNA_CONTROL,0)).toMatchObject({guide:'pending',complex:'pending',cleavage:'pending'});
    expect(rnaMechanism(RNA_CONTROL,1)).toMatchObject({guide:'available',complex:'pending',cleavage:'pending'});
    expect(rnaMechanism(RNA_CONTROL,2)).toMatchObject({guide:'available',complex:'loaded',cleavage:'pending'});
    expect(rnaMechanism(RNA_CONTROL,3).cleavage).toBe('enabled');
  });
  it('Dicer depletion reduces the route without asserting complete silencing loss',()=>{
    expect(rnaMechanism({...RNA_CONTROL,dicer:'depleted'},3)).toMatchObject({guide:'reduced',complex:'reduced',cleavage:'reduced'});
  });
  it('distinguishes Ago2 catalysis from guide production and loading',()=>{
    expect(rnaMechanism({...RNA_CONTROL,ago2:'inactive'},3)).toMatchObject({guide:'available',complex:'loaded',cleavage:'blocked'});
  });
  it('does not infer complementary cleavage of the mismatch control',()=>{
    expect(rnaMechanism({...RNA_CONTROL,target:'mismatched'},3).cleavage).toBe('not-predicted');
  });
  it('prioritizes the catalytic block when both enzyme perturbations are present',()=>{
    expect(rnaMechanism({dicer:'depleted',ago2:'inactive',target:'matched'},3)).toMatchObject({guide:'reduced',cleavage:'blocked'});
  });
  it('stops at the endpoint without wrapping or changing input settings',()=>{
    expect([0,1,2,3].map(s=>nextRnaStage(s as 0|1|2|3))).toEqual([1,2,3,3]);
    rnaMechanism(RNA_CONTROL,3);expect(RNA_CONTROL).toEqual({dicer:'active',ago2:'active',target:'matched'});
  });
});
