import { describe, expect, it } from 'vitest';
import { lenses } from '../src/data';
import { ArtifactSchema, NODE_TYPES, PaperDocumentSchema, ResearchProfileSchema } from '../shared/contracts';
import { simulate, simulateMemory, simulateRna, validateParameters } from '../src/simulations';

describe('verified research fixture integrity', () => {
  for (const lens of lenses) {
    it(`${lens.id}: all artifacts validate and every evidence excerpt resolves`, () => {
      PaperDocumentSchema.parse(lens.paper);
      ResearchProfileSchema.parse(lens.profile);
      const docs = [lens.paper, ...lens.profile.publications];
      const visit = (value: unknown) => {
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === 'object') {
          const item = value as Record<string, unknown>;
          if ('documentId' in item && 'passageId' in item) {
            const doc = docs.find(d => d.id === item.documentId);
            expect(doc, `missing document ${item.documentId}`).toBeDefined();
            const passage = doc?.passages.find(p=>p.id === item.passageId);
            expect(passage, `missing passage ${item.passageId}`).toBeDefined();
            expect(passage?.text).toContain(item.supportingExcerpt);
          }
          Object.values(item).forEach(visit);
        }
      };
      NODE_TYPES.forEach(type=>ArtifactSchema.parse(lens.replay[type]));
      visit(lens.replay);
      expect(lens.paper.references).toHaveLength(5);
      expect(lens.replay.proposer.proposals?.map(p=>p.kind)).toEqual(['incremental','cross-field','speculative']);
      expect(lens.replay.community.posts).toEqual([]);
      expect(lens.paper.coverage).toBe('selected-passages');
      expect(lens.replay.reader.claims).toHaveLength(3);
      for(const doc of docs) { expect(doc.coverage).toBe('selected-passages'); for(const passage of doc.passages) {expect(passage.page).toBeGreaterThan(0); expect(passage.section).toMatch(/PDF p(?:\.|age)/);} }
      expect(lens.profile.coverageStatement).toContain('no affiliation or endorsement');
      const demo = lens.replay.demonstrator.demo!;
      const result = simulate(demo.templateId, demo.parameters);
      expect(result.points.length).toBeGreaterThan(10);
      demo.claimIds.forEach(id=>expect(lens.replay.reader.claims?.some(c=>c.id===id)).toBe(true));
    });
  }
});

describe('computational illustrations', () => {
  it('memory obeys recurrence and finite-difference sensitivity', () => {
    const a = simulateMemory({retention:0.9,steps:20,initial:1});
    const b = simulateMemory({retention:0.9,steps:20,initial:1.0001});
    expect(a.points[0].changed).toBe(1);
    for(let i=1;i<a.points.length;i++) expect(a.points[i].changed).toBeCloseTo(0.9*a.points[i-1].changed,12);
    expect((b.points[20].changed-a.points[20].changed)/0.0001).toBeCloseTo(0.9**20,8);
    expect(simulateMemory({retention:1}).points.every(p=>p.changed===p.baseline)).toBe(true);
    expect(simulateMemory({retention:0}).points[1].changed).toBe(0);
  });
  it('RNA conserves initial condition, equates no-silencing baseline and follows exact differential equation', () => {
    expect(simulateRna({silencing:0}).points.every(p=>p.changed===p.baseline)).toBe(true);
    const a = simulateRna({production:0.2,decay:0.2,silencing:0.3});
    expect(a.points[0].changed).toBe(1);
    expect(a.points[100].changed).toBeCloseTo(0.4,4);
    const i=20,dt=0.2;
    const derivative=(a.points[i+1].changed-a.points[i-1].changed)/(2*dt);
    expect(derivative).toBeCloseTo(0.2-0.5*a.points[i].changed,3);
    expect(a.points.every(p=>p.changed>=0&&p.changed<=p.baseline)).toBe(true);
    const decayOnly=simulateRna({production:0,decay:0.2,silencing:0.3});
    expect(decayOnly.points[10].changed).toBeCloseTo(Math.exp(-1),12);
  });
  it('all meaningful controls alter checked computations', () => {
    expect(simulateMemory({retention:0.5}).points[5].changed).not.toBe(simulateMemory().points[5].changed);
    expect(simulateMemory({steps:10}).points).toHaveLength(11);
    expect(simulateMemory({initial:2}).points[0].changed).toBe(2);
    for(const key of ['silencing','production','decay']) expect(simulateRna({[key]:0.9}).points[10].changed).not.toBe(simulateRna().points[10].changed);
  });
  it('RNA respects equilibrium and comparison invariants throughout the allowed range', () => {
    // Starting at the equilibrium must be stationary, including nonzero silencing.
    const equilibrium = simulateRna({production:0.7,decay:0.2,silencing:0.5});
    expect(equilibrium.points.every(p=>Math.abs(p.changed-1)<1e-12)).toBe(true);
    for (const production of [0,0.2,1]) for(const decay of [0.05,0.2,1]) {
      const low = simulateRna({production,decay,silencing:0});
      const high = simulateRna({production,decay,silencing:1});
      high.points.forEach((point,i)=>{
        expect(Number.isFinite(point.changed)).toBe(true);
        expect(point.changed).toBeGreaterThanOrEqual(0);
        expect(point.changed).toBeLessThanOrEqual(low.points[i].changed+1e-12);
      });
    }
    const reference = simulateRna({production:0.2,decay:0.2});
    const moreProduction = simulateRna({production:0.4,decay:0.2});
    const fasterTurnover = simulateRna({production:0.2,decay:0.4});
    reference.points.slice(1).forEach((point,i)=>{
      expect(moreProduction.points[i+1].changed).toBeGreaterThan(point.changed);
      expect(fasterTurnover.points[i+1].changed).toBeLessThan(point.changed);
    });
  });
  it('memory remains bounded and retains its initial condition at gate boundaries', () => {
    for(const retention of [0,0.01,0.99,1]) {
      const points=simulateMemory({retention,steps:100,initial:2}).points;
      expect(points[0].changed).toBe(2);
      points.slice(1).forEach((point,i)=>{
        expect(point.changed).toBeGreaterThanOrEqual(0);
        expect(point.changed).toBeLessThanOrEqual(points[i].changed);
      });
    }
  });
  it('rejects unsafe, unknown and nonfinite configuration', () => {
    const invalidInputs:Record<string,number>[]=[{retention:1.1},{steps:10.5},{initial:NaN},{x:1}];
    for (const input of invalidInputs) expect(()=>validateParameters('memory-decay',input)).toThrow();
    expect(()=>simulateRna({decay:0})).toThrow();
    expect(()=>simulate('untrusted-code',{})).toThrow();
  });
});
