export type GoColor='B'|'W';
export interface GoMove{color:GoColor;x:number|null;y:number|null;}
export interface GoGame{id:string;number:number;black:string;white:string;date:string;result:string;size:number;komi:number;rules:string;moves:GoMove[];sourceUrl:string;archiveUrl:string;originalFile:string;originalSha256:string;normalizedSha256:string;downloadUrl:string;}
export interface GoStone{color:GoColor;moveNumber:number;}
export interface GoPosition{size:number;stones:(GoStone|null)[];move:number;captures:Record<GoColor,number>;lastMove:GoMove|null;nextColor:GoColor;}
export const GO_COLUMNS='ABCDEFGHJKLMNOPQRST';
export function goCoordinate(move:GoMove,size=19):string{return move.x===null?'pass':`${GO_COLUMNS[move.x]}${size-move.y!}`;}
export function emptyGoPosition(size=19):GoPosition{if(!Number.isInteger(size)||size<2||size>19)throw new Error('Unsupported Go board size.');return {size,stones:Array(size*size).fill(null),move:0,captures:{B:0,W:0},lastMove:null,nextColor:'B'};}
const other=(color:GoColor):GoColor=>color==='B'?'W':'B';
function neighbors(index:number,size:number):number[]{const x=index%size,y=Math.floor(index/size);return [x>0?index-1:-1,x<size-1?index+1:-1,y>0?index-size:-1,y<size-1?index+size:-1].filter(i=>i>=0);}
export function goGroup(stones:(GoStone|null)[],start:number,size:number):{stones:number[];liberties:number[]}{
 const color=stones[start]?.color;if(!color)return {stones:[],liberties:[]};
 const group=new Set([start]),liberties=new Set<number>(),queue=[start];
 for(let i=0;i<queue.length;i++)for(const next of neighbors(queue[i],size)){if(!stones[next])liberties.add(next);else if(stones[next]!.color===color&&!group.has(next)){group.add(next);queue.push(next);}}
 return {stones:[...group],liberties:[...liberties]};
}
export function goBoardKey(position:GoPosition):string{return position.stones.map(stone=>stone?.color??'.').join('');}
/** Replay rules: alternating moves, liberties, captures, suicide and immediate ko. */
export function applyGoMove(position:GoPosition,move:GoMove,previousBoardKey?:string):GoPosition{
 if(move.color!==position.nextColor)throw new Error(`Move ${position.move+1}: expected ${position.nextColor}.`);
 const next:GoPosition={...position,stones:[...position.stones],move:position.move+1,captures:{...position.captures},lastMove:{...move},nextColor:other(move.color)};
 if(move.x===null&&move.y===null)return next;
 if(move.x===null||move.y===null||!Number.isInteger(move.x)||!Number.isInteger(move.y)||move.x<0||move.y<0||move.x>=position.size||move.y>=position.size)throw new Error(`Move ${next.move}: invalid board coordinate.`);
 const index=move.y*position.size+move.x;
 if(next.stones[index])throw new Error(`Move ${next.move}: occupied intersection ${goCoordinate(move,position.size)}.`);
 next.stones[index]={color:move.color,moveNumber:next.move};
 for(const neighbor of neighbors(index,position.size))if(next.stones[neighbor]?.color===other(move.color)){const group=goGroup(next.stones,neighbor,position.size);if(!group.liberties.length){for(const captured of group.stones)next.stones[captured]=null;next.captures[move.color]+=group.stones.length;}}
 if(!goGroup(next.stones,index,position.size).liberties.length)throw new Error(`Move ${next.move}: suicide is not legal.`);
 if(previousBoardKey&&goBoardKey(next)===previousBoardKey)throw new Error(`Move ${next.move}: immediate ko recapture is not legal.`);
 return next;
}
export function replayGoGame(game:Pick<GoGame,'size'|'moves'>):GoPosition[]{const positions=[emptyGoPosition(game.size)];for(const move of game.moves){const previous=positions.length>1?goBoardKey(positions[positions.length-2]):undefined;positions.push(applyGoMove(positions.at(-1)!,move,previous));}return positions;}

type SgfNode=Record<string,string[]>;
/** SGF FF[4] parser: follows the first variation and discards comments/markup. */
export function parseSgfMainline(sgf:string):{metadata:Record<string,string>;moves:GoMove[];size:number}{
 let cursor=0;
 const whitespace=()=>{while(/\s/.test(sgf[cursor]??'')&&cursor<sgf.length)cursor++;};
 function value():string{if(sgf[cursor++]!=='[')throw new Error('Expected SGF property value.');let text='';let closed=false;while(cursor<sgf.length){const char=sgf[cursor++];if(char===']'){closed=true;break;}if(char==='\\'){const escaped=sgf[cursor++];if(escaped==='\r'){if(sgf[cursor]==='\n')cursor++;}else if(escaped!=='\n'&&escaped!==undefined)text+=escaped;}else text+=char;}if(!closed)throw new Error('Unclosed SGF value.');return text;}
 function node():SgfNode{cursor++;const properties:SgfNode={};whitespace();while(/[A-Z]/.test(sgf[cursor]??'')&&cursor<sgf.length){let name='';while(/[A-Z]/.test(sgf[cursor]??'')&&cursor<sgf.length)name+=sgf[cursor++];whitespace();const values:string[]=[];while(sgf[cursor]==='['){values.push(value());whitespace();}if(!values.length)throw new Error('SGF property has no value.');properties[name]=values;}return properties;}
 function tree():SgfNode[]{whitespace();if(sgf[cursor++]!=='(')throw new Error('Expected SGF game tree.');whitespace();const sequence:SgfNode[]=[];while(sgf[cursor]===';'){sequence.push(node());whitespace();}let firstChild:SgfNode[]|null=null;while(sgf[cursor]==='('){const child=tree();if(firstChild===null)firstChild=child;whitespace();}if(sgf[cursor++]!==')')throw new Error('Unclosed SGF game tree.');return sequence.concat(firstChild??[]);}
 const mainline=tree();whitespace();if(cursor!==sgf.length)throw new Error('Expected one SGF game.');if(!mainline.length)throw new Error('Empty SGF game.');
 const root=mainline[0];const size=Number(root.SZ?.[0]??19);if(root.GM?.[0]&&root.GM[0]!=='1')throw new Error('This record is not Go.');emptyGoPosition(size);
 const moves:GoMove[]=[];
 for(const properties of mainline){if(properties.AB||properties.AW||properties.AE||properties.PL)throw new Error('Setup positions are not supported in this replay importer.');if(properties.B&&properties.W)throw new Error('A node cannot contain both colors.');for(const color of ['B','W'] as const)if(properties[color]){if(properties[color].length!==1)throw new Error('A move must have one value.');const coord=properties[color][0];if(coord===''||(size<=19&&coord==='tt'))moves.push({color,x:null,y:null});else{if(!/^[a-s]{2}$/.test(coord))throw new Error('Invalid SGF move coordinate.');const x=coord.charCodeAt(0)-97,y=coord.charCodeAt(1)-97;if(x>=size||y>=size)throw new Error('SGF move outside the board.');moves.push({color,x,y});}}}
 const metadata=Object.fromEntries(['PB','PW','DT','RE','KM','RU','EV','RO'].flatMap(key=>root[key]?[[key,root[key][0]]]:[]));return {metadata,moves,size};
}
export function exportMainlineSgf(game:Pick<GoGame,'size'|'komi'|'rules'|'black'|'white'|'date'|'result'|'moves'>):string{const escape=(value:string)=>value.replaceAll('\\','\\\\').replaceAll(']','\\]');return `(;GM[1]FF[4]CA[UTF-8]SZ[${game.size}]KM[${game.komi}]RU[${escape(game.rules)}]PB[${escape(game.black)}]PW[${escape(game.white)}]DT[${escape(game.date)}]RE[${escape(game.result)}]\n${game.moves.map(move=>`;${move.color}[${move.x===null?'':String.fromCharCode(97+move.x,97+move.y!)}]`).join('')}\n)\n`;}
