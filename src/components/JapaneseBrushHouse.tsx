export function BrushGarden() {
  return <g className="brush-garden">
    <rect width="1000" height="680" fill="var(--world-garden)" />
    <rect width="1000" height="680" fill="url(#world-paper-grain)" opacity=".26" />
    <path d="M0 297Q210 282 420 302T1000 293M499 0Q487 160 502 310T494 680" fill="none" stroke="var(--world-moss)" strokeWidth="76" opacity=".26" />
    <path d="M210 224Q213 245 215 268L785 265L786 222M211 502L213 555Q505 545 786 556L785 500M501 265Q495 395 501 554" fill="none" stroke="var(--world-stone)" strokeWidth="39" strokeLinejoin="round" />
    <g fill="none" stroke="var(--world-stone-edge)" strokeWidth="1.5" opacity=".55">
      {Array.from({length:22},(_,i)=><path key={i} d={`M${231+i*25} 248l-4 16 6 19m-5 254l4 15-6 20`} />)}
      {Array.from({length:10},(_,i)=><path key={i} d={`M483 ${290+i*25}l18 4 17-5`} />)}
    </g>
    <path d="M429 305Q499 297 574 307L569 416Q501 428 425 415Z" fill="var(--world-stone)" stroke="var(--world-stone-edge)" strokeWidth="2" />
    <path d="M441 318Q495 311 561 319L559 406L439 407Z" fill="var(--world-paper)" stroke="var(--world-wood)" strokeWidth="3" />
    <g fill="var(--world-ink)" opacity=".18">
      <path d="M72 536Q49 530 51 541T84 548Q97 537 72 536ZM883 216Q865 208 857 222T891 231Z" />
    </g>
    <g fill="var(--world-vermilion)">
      {[{x:118,y:315},{x:883,y:323},{x:365,y:503},{x:636,y:155}].map(({x,y})=><g key={x} transform={`translate(${x} ${y})`}>
        <path d="M-3 0L-3 22L3 22L3 0ZM-9-8Q0-13 9-8L8 3Q0 7-8 3Z" />
        <path d="M-7-6L7-6M-6 0L6 0" stroke="var(--world-paper)" strokeWidth="1.5" />
      </g>)}
    </g>
    <path d="M61 190Q96 176 115 191M861 579Q905 565 944 578M355 187l8-8 7 11M620 592l9-11 8 11" fill="none" stroke="var(--world-moss)" strokeWidth="3" strokeLinecap="round" />
  </g>;
}

export function BrushTree({x,y,size=1}:{x:number;y:number;size?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <path d="M-3 22Q2 0-1-34M0-11Q-18-26-20-38M0-20Q18-29 22-41" fill="none" stroke="var(--world-wood)" strokeWidth="5" strokeLinecap="round" />
    <g fill="var(--world-cypress)" filter="url(#world-dry-brush)">
      <path d="M-32-24Q-35-39-15-41Q-23-59 0-58Q18-60 19-45Q41-43 33-26Q19-16 5-23Q-9-12-32-24Z" />
      <path d="M-23-49Q-19-65 0-67Q18-62 20-48Z" />
    </g>
    <path d="M-26-30Q-8-37 5-29M-13-50Q3-54 14-47" fill="none" stroke="var(--world-moss)" strokeWidth="6" strokeLinecap="round" opacity=".7" />
    <path d="M-25 22Q-2 13 22 23" fill="none" stroke="var(--world-moss)" strokeWidth="4" opacity=".4" />
  </g>;
}

export default function JapaneseBrushHouse({x,y,symbol,build=1}:{x:number;y:number;symbol:string;build?:number}) {
  return <g transform={`translate(${x} ${y})`} className="world-building brush-house" data-build-stage={build>=1?'complete':Math.floor(build*10)}>
    <path d="M-111 25Q0 14 113 26L104 34L-107 34Z" fill="var(--world-ink)" opacity=".13" />
    <g opacity={build>=.15?1:.35}>
      <path d="M-94-13L92-11L95 22L-96 24Z" fill="var(--world-stone)" stroke="var(--world-stone-edge)" strokeWidth="2" />
      <path d="M-96 10L94 9M-58-12L-55 10M-8-12L-11 10M45-12L43 10M-77 10L-79 23M12 10L9 22M70 10L73 22" fill="none" stroke="var(--world-stone-edge)" strokeWidth="1.8" />
    </g>
    {build>=.3&&<g>
      <path d="M-87-86L86-85L88 12L-88 13Z" fill="var(--world-paper)" stroke="var(--world-wood)" strokeWidth="3" />
      <path d="M-82-81L-80 12M80-80L81 12M-82-14L80-12M-1-82L1-49" fill="none" stroke="var(--world-wood)" strokeWidth="7" />
      <path d="M-83-71L-81-24M78-67L80-16M-70-11L-32-10M33-9L65-10" fill="none" stroke="var(--world-wood-light)" strokeWidth="1.5" />
    </g>}
    {build>=.5&&<g>
      <path d="M-118-78Q-76-89-45-122Q-17-125 0-137Q21-123 46-122Q79-89 118-78Q62-72 0-77Q-62-73-118-78Z" fill="var(--world-ink)" filter="url(#world-dry-brush)" />
      <path d="M-114-79Q-67-88-40-112M-94-82Q-52-89-27-117M114-79Q67-88 40-112M94-82Q52-89 27-117M-45-119Q0-113 45-119" fill="none" stroke="var(--world-roof-wash)" strokeWidth="3" strokeLinecap="round" />
      <path d="M-119-76Q-68-69 0-74Q69-68 119-76" fill="none" stroke="var(--world-ink)" strokeWidth="4" strokeLinecap="round" />
    </g>}
    {build>=.7&&<g>
      <path d="M-68-55L-36-54L-36-23L-67-23ZM37-55L68-54L66-22L37-23Z" fill="var(--world-shoji)" stroke="var(--world-wood)" strokeWidth="3" />
      <path d="M-57-54L-56-23M-46-54L-46-23M-67-43L-36-43M-67-33L-36-33M47-54L47-23M57-54L57-23M38-43L67-43M38-33L67-33" stroke="var(--world-wood-light)" strokeWidth="1.5" />
      <path d="M-23-47L23-48L22 15L-22 15Z" fill="var(--world-vermilion)" stroke="var(--world-wood)" strokeWidth="3" />
      <path d="M0-46L0 14M-20-39L20-40M-20-27L20-28M-20-15L20-16" stroke="var(--world-wood)" strokeWidth="2" opacity=".55" />
      <path d="M8-13L13-13" stroke="var(--world-shoji)" strokeWidth="3" />
    </g>}
    {build>=.9&&<g>
      <path d="M-24-103L23-104L22-82L-23-82Z" fill="var(--world-paper)" stroke="var(--world-wood)" strokeWidth="2" />
      <text x="0" y="-87" textAnchor="middle" fill="var(--world-ink)" fontSize="20">{symbol}</text>
      <path d="M-29 15L29 15L31 22L-31 22L-36 29L36 29" fill="var(--world-stone)" stroke="var(--world-stone-edge)" strokeWidth="2" />
    </g>}
    {build<1&&<g className="world-construction">
      <path d="M-115 20L-114-115M115 20L114-115M-116-59L116-61M-115-23L115-25M-114-112L115 19" stroke="var(--world-wood-light)" strokeWidth="4" fill="none" />
      <path d="M-126 28L-90 27L-90 40L-125 42ZM90 27L126 28L125 42L90 40Z" fill="var(--world-vermilion)" />
    </g>}
  </g>;
}