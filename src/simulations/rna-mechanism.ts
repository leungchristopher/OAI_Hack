export type RnaStage = 0 | 1 | 2 | 3;
export type RnaMechanismSettings = {dicer: 'active' | 'depleted'; ago2: 'active' | 'inactive'; target: 'matched' | 'mismatched'};
export const RNA_CONTROL: RnaMechanismSettings = {dicer:'active',ago2:'active',target:'matched'};
export const RNA_STAGES = ['Double-stranded RNA', 'Guide production', 'Guide-loaded complex', 'Target cleavage'] as const;
export type RnaMechanismState = {
  stage:RnaStage;
  guide:'pending'|'available'|'reduced';
  complex:'pending'|'loaded'|'reduced';
  cleavage:'pending'|'enabled'|'reduced'|'blocked'|'not-predicted';
  heading:string;
  explanation:string;
};
/** A qualitative dependency model. No rates, concentrations or biological time are fitted. */
export function rnaMechanism(settings:RnaMechanismSettings,stage:RnaStage):RnaMechanismState {
  const guide=stage<1?'pending':settings.dicer==='active'?'available':'reduced';
  const complex=stage<2?'pending':settings.dicer==='active'?'loaded':'reduced';
  let cleavage:RnaMechanismState['cleavage']='pending';
  if(stage===3) cleavage=settings.ago2==='inactive'?'blocked':settings.target==='mismatched'?'not-predicted':settings.dicer==='depleted'?'reduced':'enabled';
  let heading:string=RNA_STAGES[stage];
  let explanation='Double-stranded RNA supplies the sequence information for a guide-directed response.';
  if(stage===1) explanation=settings.dicer==='active'?'Dicer-associated processing converts the RNA substrate into small guide-sized fragments.':'Dicer depletion reduces guide-generating activity. Residual processing remains possible.';
  if(stage===2) explanation=settings.dicer==='depleted'?'Reduced guide supply constrains the guide-loaded complex. Loading and catalytic competence are separate.':'A small RNA guide provides targeting information to the effector complex. Guide binding alone does not establish cleavage activity.';
  if(stage===3){
    heading=cleavage==='enabled'?'Cleavage enabled':cleavage==='reduced'?'Cleavage compromised':cleavage==='blocked'?'Catalytic cleavage blocked':'Cleavage not predicted';
    explanation=cleavage==='enabled'?'With guide supply, complementary targeting and catalytic Ago2, the model permits target cleavage.':cleavage==='reduced'?'Guide production is compromised, so the cleavage pathway is reduced rather than eliminated.':cleavage==='blocked'?'Inactive Ago2 removes catalytic cleavage in this model. Guide association can persist; other forms of repression are separate.':'The mismatched target is outside this model’s complementary-cleavage route. Mismatch position and extent matter; repression is a separate outcome.';
  }
  return {stage,guide,complex,cleavage,heading,explanation};
}
export function nextRnaStage(stage:RnaStage):RnaStage{return Math.min(3,stage+1) as RnaStage;}
