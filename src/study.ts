import type { Artifact, EvidenceRef, LensFixture } from '../shared/contracts';
export type StudyStage = 'mechanism' | 'prediction' | 'assumption' | 'falsification';
export interface StudySource { label: string; url: string; text: string }
export interface StudyCard { id: string; stage: StudyStage; question: string; answer: string; sources: StudySource[] }
function resolve(lens:LensFixture, refs:EvidenceRef[]):StudySource[] {
 return refs.flatMap(ref=>{const doc=[lens.paper,...lens.profile.publications].find(d=>d.id===ref.documentId);const p=doc?.passages.find(p=>p.id===ref.passageId);return doc&&p?[{label:`${doc.title} · ${p.id}${p.page?` · PDF p. ${p.page}`:''}`,url:doc.sourceUrl,text:p.text}]:[];});
}
/** An absent artifact produces passage cards, never silently substitutes recorded model results. */
export function buildStudyCards(lens:LensFixture, artifact?:Artifact):StudyCard[] {
 const cards:StudyCard[]=[];
 for(const c of artifact?.claims??[]){const sources=resolve(lens,c.evidenceRefs);if(!sources.length)continue;cards.push({id:`claim-${c.id}`,stage:'mechanism',question:`Explain this claim and its mechanism: ${c.text}`,answer:c.text,sources});if(c.limitations.length)cards.push({id:`limits-${c.id}`,stage:'assumption',question:`What limits the interpretation of this claim: ${c.text}`,answer:c.limitations.join('\n\n'),sources});}
 for(const p of artifact?.prerequisites??[]){const claim=artifact?.claims?.find(c=>c.id===p.connectedTo);const sources=resolve(lens,claim?.evidenceRefs??artifact?.evidenceRefs??[]);if(sources.length)cards.push({id:`prereq-${p.title}`,stage:'mechanism',question:`What is ${p.title}, and why does it matter here?`,answer:p.explanation,sources});}
 if(artifact?.method){const sources=resolve(lens,artifact.evidenceRefs??artifact.claims?.flatMap(c=>c.evidenceRefs)??[]);if(sources.length)cards.push({id:'method',stage:'mechanism',question:'How does the method work?',answer:artifact.method,sources});}
 for(const p of artifact?.proposals??[]){const sources=resolve(lens,p.evidenceRefs);if(!sources.length)continue;cards.push({id:`prediction-${p.id}`,stage:'prediction',question:`For the proposed extension “${p.title}”, what should change relative to the baseline?`,answer:`Hypothesis: ${p.hypothesis}\n\nBaseline: ${p.baseline}\n\nMetric: ${p.metric}`,sources},{id:`assumption-${p.id}`,stage:'assumption',question:`Which assumptions does “${p.title}” require?`,answer:p.assumptions.join('\n\n'),sources},{id:`falsify-${p.id}`,stage:'falsification',question:`What outcome would falsify “${p.title}”?`,answer:p.falsificationCriterion,sources});}
 if(!cards.length)for(const p of lens.paper.passages){cards.push({id:`passage-${p.id}`,stage:'mechanism',question:`Explain the main idea in ${p.section || p.id}.`,answer:p.text,sources:resolve(lens,[{documentId:lens.paper.id,passageId:p.id,supportingExcerpt:p.text}])});}
 const order:StudyStage[]=['mechanism','prediction','assumption','falsification'];return cards.sort((a,b)=>order.indexOf(a.stage)-order.indexOf(b.stage));
}
export function markdownText(s:string):string{return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/([\\`*_{}\[\]#!|])/g,'\\$1');}
export function studyMarkdown(title:string,cards:StudyCard[]):string {
 return `# ${markdownText(title)} — Q&A\n\n${cards.map((c,i)=>`## ${i+1}. ${markdownText(c.question)}\n\n**Q:** ${markdownText(c.question)}\n\n**A:** ${markdownText(c.answer)}\n\n**Sources:**\n\n${c.sources.map(s=>`- [${markdownText(s.label)}](<${safeUrl(s.url)}>)`).join('\n')}`).join('\n\n')}\n`;
}
export function safeUrl(url:string):string{try {const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href.replace(/>/g,'%3E').replace(/</g,'%3C'):'';}catch{return '';}}
export function studyFilename(title:string):string{return `${title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'paper'}-flashcards.md`;}
export function followUp(card:StudyCard,answer:string):string {
 if(answer.trim().split(/\s+/).length<8)return 'Name the relevant mechanism, then explain one causal step in your own words.';
 if(/\b(always|proves?|guarantee|all cases|never)\b/i.test(answer))return 'Which condition or counterexample would limit that claim? Check the source before generalizing.';
 if(card.stage==='prediction')return 'What would you measure, and which baseline would make that comparison informative?';
 if(card.stage==='assumption')return 'If this assumption failed, which part of your explanation would change first?';
 if(card.stage==='falsification')return 'Could that outcome also arise from a confounder? Name a control that separates the explanations.';
 return 'If one component were removed, what would change? Trace the consequence through the mechanism.';
}
export interface QuizProgress { queue:string[]; completed:number; revisits:number }
export function advanceQuiz(progress:QuizProgress,revisit:boolean):QuizProgress {const [current,...rest]=progress.queue;return current?{queue:revisit?[...rest,current]:rest,completed:progress.completed+(revisit?0:1),revisits:progress.revisits+(revisit?1:0)}:progress;}
