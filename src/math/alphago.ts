export type SearchEdge={id:string;prior:number;visits:number;valueSum:number;rolloutSum:number};
export const softmax=(logits:number[])=>{if(!logits.length||logits.some(x=>!Number.isFinite(x)))throw new Error('Finite logits required');const max=Math.max(...logits),e=logits.map(x=>Math.exp(x-max)),sum=e.reduce((a,b)=>a+b,0);return e.map(x=>x/sum);};
export const mixedValue=(value:number,rollout:number,lambda:number)=>{if(lambda<0||lambda>1)throw new Error('Invalid mixture');return (1-lambda)*value+lambda*rollout;};
export function edgeQ(e:SearchEdge,lambda:number){return e.visits?mixedValue(e.valueSum/e.visits,e.rolloutSum/e.visits,lambda):0;}
export function searchScore(e:SearchEdge,total:number,c:number,lambda:number,rule:'puct'|'ucb1'='puct'){
 if(c<0||total<e.visits)throw new Error('Invalid search statistics');
 const q=edgeQ(e,lambda);
 return rule==='ucb1'?(e.visits===0?Infinity:q+c*Math.sqrt(Math.log(Math.max(1,total))/e.visits)):q+c*e.prior*Math.sqrt(total)/(1+e.visits);
}
export function selectEdge(edges:SearchEdge[],c:number,lambda:number,rule:'puct'|'ucb1'){
 const total=edges.reduce((a,e)=>a+e.visits,0);return edges.reduce((best,e)=>searchScore(e,total,c,lambda,rule)>searchScore(best,total,c,lambda,rule)?e:best);
}
/** Store both evaluations in the player's perspective at this edge. */
export function backup(edges:SearchEdge[],id:string,value:number,rollout:number,perspective:1|-1=1){
 if(!Number.isFinite(value)||Math.abs(value)>1||![-1,1].includes(rollout))throw new Error('Invalid leaf result');
 return edges.map(e=>e.id===id?{...e,visits:e.visits+1,valueSum:e.valueSum+perspective*value,rolloutSum:e.rolloutSum+perspective*rollout}:e);
}
export function finalMove(edges:SearchEdge[]){return edges.reduce((a,b)=>b.visits>a.visits?b:a).id;}
export function crossEntropy(logits:number[],target:number){const p=softmax(logits);if(!Number.isInteger(target)||target<0||target>=p.length)throw new Error('Target out of range');return {probabilities:p,loss:-Math.log(p[target]),gradient:p.map((v,i)=>v-(i===target?1:0))};}
export function policyUpdate(logits:number[],target:number,advantage:number,rate:number){const {gradient}=crossEntropy(logits,target);return logits.map((v,i)=>v-rate*advantage*gradient[i]);}
export function valueLoss(preactivation:number,outcome:number){const value=Math.tanh(preactivation);return {value,loss:(outcome-value)**2,gradient:2*(value-outcome)*(1-value*value)};}
export function convolution(patch:number[],kernel:number[],bias=0){if(patch.length!==kernel.length)throw new Error('Kernel dimensions differ');return Math.max(0,patch.reduce((s,x,i)=>s+x*kernel[i],bias));}
export const initialEdges=():SearchEdge[]=>[{id:'D4',prior:.55,visits:4,valueSum:1.2,rolloutSum:2},{id:'Q16',prior:.3,visits:2,valueSum:1.2,rolloutSum:0},{id:'D16',prior:.15,visits:1,valueSum:-.1,rolloutSum:-1}];
