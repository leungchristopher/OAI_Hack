/** Noise→data time s; LeRobot's t is 1-s. These analytic examples have no learned weights. */
export function interpolateFlow(noise:number, action:number, s:number){return (1-s)*noise+s*action;}
export function targetVelocity(noise:number, action:number){return action-noise;}
export function maskedSoftmax(logits:number[], allowed:boolean[]){
 if(logits.length!==allowed.length||!allowed.some(Boolean))throw new Error('Attention needs at least one allowed key');
 const max=Math.max(...logits.filter((_,i)=>allowed[i]));const e=logits.map((v,i)=>allowed[i]?Math.exp(v-max):0);const sum=e.reduce((a,b)=>a+b,0);return e.map(v=>v/sum);
}
/** Prefix [image, language] cannot see state/actions; state sees prefix/self; actions see all. */
export function smolMask(query:number){return [0,1,2,3,4].map(key=>query<2?key<2:query===2?key<3:true);}
/** Smooth analytic transport x(s)=c+(noise-c)exp(-2s), used to expose Euler error. */
export function analyticFlow(noise:number, conditioning:number, steps:number){
 if(!Number.isInteger(steps)||steps<1||steps>1000)throw new Error('Invalid integration steps');
 let x=noise; const rows=[{s:0,euler:x,exact:x}];
 for(let i=1;i<=steps;i++){x+=2*(conditioning-x)/steps;const s=i/steps;rows.push({s,euler:x,exact:conditioning+(noise-conditioning)*Math.exp(-2*s)});}
 return rows;
}
