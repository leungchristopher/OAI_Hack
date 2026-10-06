/** A scalar-coordinate DDPM worked example with an oracle clean action chunk. */
export function schedule(steps: number, betaEnd: number) {
  if (!Number.isInteger(steps) || steps < 2 || steps > 200 || !(betaEnd > 0 && betaEnd < 1)) throw new Error('Invalid diffusion schedule');
  let product = 1;
  return Array.from({length: steps}, (_, i) => {
    const beta = 0.0001 + (betaEnd - 0.0001) * i / (steps - 1);
    const previous = product;
    product *= 1 - beta;
    return {k:i + 1, beta, alpha:1-beta, alphaBar:product, previous, variance:beta * (1-previous)/(1-product)};
  });
}
export function gaussian(seed: number) {
  let state = seed >>> 0;
  const uniform = () => {state = (Math.imul(1664525,state)+1013904223)>>>0; return (state+1)/4294967297;};
  return () => Math.sqrt(-2*Math.log(uniform())) * Math.cos(2*Math.PI*uniform());
}
export const forwardNoise = (clean:number, epsilon:number, alphaBar:number) => Math.sqrt(alphaBar)*clean + Math.sqrt(1-alphaBar)*epsilon;
export function reverseStep(noisy:number, epsilon:number, s:ReturnType<typeof schedule>[number], z:number) {
  return (noisy-s.beta/Math.sqrt(1-s.alphaBar)*epsilon)/Math.sqrt(s.alpha) + Math.sqrt(s.variance)*z;
}
export function diffusionExample(steps:number, betaEnd:number, seed:number, target=0.7) {
  const noise=gaussian(seed), sched=schedule(steps,betaEnd);
  const clean=Array.from({length:16},(_,i)=>target*Math.sin((i+1)/16*Math.PI/2));
  let action=clean.map(x=>forwardNoise(x,noise(),sched[steps-1].alphaBar));
  const states=[{k:steps,action:[...action]}];
  for(let k=steps-1;k>=0;k--){
    const s=sched[k];
    action=action.map((x,i)=>reverseStep(x,(x-Math.sqrt(s.alphaBar)*clean[i])/Math.sqrt(1-s.alphaBar),s,noise()));
    states.push({k,action:[...action]});
  }
  return {clean,states,schedule:sched};
}
