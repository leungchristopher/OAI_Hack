import type {PaperDocument} from '../../shared/contracts';
/** Editorial summaries checked against the primary ACT paper, sections IV and VI-A.
 * Source: https://arxiv.org/pdf/2304.13705 (accessed 2026-10-06).
 * These are paraphrases, not purported quotations or results from our own rollout.
 */
export const roboticsPaper:PaperDocument={
 id:'act-2023',title:'Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware',
 authors:['Tony Z. Zhao','Vikash Kumar','Sergey Levine','Chelsea Finn'],year:2023,
 sourceUrl:'https://arxiv.org/pdf/2304.13705',identifiers:{arxiv:'2304.13705',doi:'10.48550/arXiv.2304.13705'},coverage:'selected-passages',references:[],
 passages:[
  {id:'act-chunking',section:'IV-A · Action chunking',page:4,kind:'summary',text:'ACT predicts k successive target joint configurations from an observation. Executing these chunks reduces the effective decision horizon by a factor of k and can capture temporally correlated demonstration behavior.'},
  {id:'act-feedback',section:'IV-A · Temporal ensembling',page:5,kind:'summary',text:'Executing an entire chunk before observing again can create abrupt corrections. Temporal ensembling instead queries every timestep and combines overlapping predictions for that same timestep, increasing inference computation.'},
  {id:'act-weights',section:'IV-A · Temporal ensemble weights',page:5,kind:'summary',text:'Ensemble weights follow w_i = exp(-m i), with i=0 assigned to the oldest prediction. Smaller m incorporates new observations faster. The average combines predictions of one action time, not neighboring executed actions.'},
  {id:'act-horizon-ablation',section:'VI-A · Chunk-size ablation',page:9,kind:'summary',text:'Without ensembling, separately trained policies averaged 1% success at k=1 and 44% at k=100 across four simulated settings. Larger chunks slightly reduced success; the authors cite reduced reactivity and harder sequence modeling.'},
  {id:'act-cvae',section:'IV-B · Modeling human demonstrations',page:5,kind:'summary',text:'ACT trains a conditional variational autoencoder to model diverse demonstration sequences. Its policy conditions on images, joints and a latent variable. At inference the training encoder is removed and the latent is zero.'},
 ],
};
export default roboticsPaper;
