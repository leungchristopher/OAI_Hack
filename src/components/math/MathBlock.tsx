import katex from 'katex';
export function MathBlock({tex,label}:{tex:string;label?:string}){return <figure className="math-equation" aria-label={label||tex}><div dangerouslySetInnerHTML={{__html:katex.renderToString(tex,{displayMode:true,throwOnError:false,trust:false})}}/>{label&&<figcaption>{label}</figcaption>}</figure>}
