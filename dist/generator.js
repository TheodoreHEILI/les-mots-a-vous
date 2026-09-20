/** All generation runs locally. Each occupied square belongs to an explicit word. */
export function normalize(value){return String(value).replace(/œ/gi,'oe').replace(/æ/gi,'ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');}
export function validateEntries(entries){
 if(!Array.isArray(entries)||entries.length<5||entries.length>18)throw new Error('Ajoutez entre 5 et 18 mots.');
 const seen=new Set();
 return entries.map((entry,i)=>{const answer=normalize(entry.answer);const clue=String(entry.clue||'').trim();
 if(answer.length<2||answer.length>18)throw new Error(`Le mot ${i+1} doit contenir de 2 à 18 lettres.`);
 if(!clue||clue.length>90)throw new Error(`L’indice ${i+1} doit contenir de 1 à 90 caractères.`);
 if(seen.has(answer))throw new Error(`Le mot ${answer} est déjà présent.`);seen.add(answer);return{answer,clue,id:i};});
}
function random(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let x=t;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;};}
const key=(r,c)=>`${r},${c}`;
function build(entries,arrow,rng){
 const size=35, mid=17, cells=new Map(),placements=[];let bounds={top:mid,left:mid,bottom:mid,right:mid};
 const at=(r,c)=>cells.get(key(r,c));
 function inspect(entry,row,col,dir,first=false){
  const dr=dir==='down'?1:0,dc=1-dr,endR=row+dr*(entry.answer.length-1),endC=col+dc*(entry.answer.length-1),cr=row-dr,cc=col-dc;
  if(Math.min(row,col)<1||Math.max(endR,endC)>=size-1)return null;
  if(at(row-dr,col-dc)||at(endR+dr,endC+dc))return null;
  if(arrow&&at(cr,cc))return null;
  let crossings=0;
  for(let i=0;i<entry.answer.length;i++){
   const r=row+i*dr,c=col+i*dc,cell=at(r,c);
   if(cell){if(cell.clue||cell.letter!==entry.answer[i]||cell.dirs.includes(dir))return null;crossings++;}
   else {if(at(r+dc,c+dr)?.letter||at(r-dc,c-dr)?.letter)return null;}
  }
  if(!first&&!crossings)return null;
  const top=Math.min(bounds.top,arrow?cr:row),left=Math.min(bounds.left,arrow?cc:col),bottom=Math.max(bounds.bottom,endR),right=Math.max(bounds.right,endC);
  const h=bottom-top+1,w=right-left+1;
  return {entry,row,col,dir,crossings,bounds:{top,left,bottom,right},score:crossings*28-(w*h)*.08-Math.abs(w-h)*.6+rng()*4};
 }
 function place(p){const{entry,row,col,dir}=p,dr=dir==='down'?1:0,dc=1-dr;
  if(arrow)cells.set(key(row-dr,col-dc),{clue:entry.clue,dir,id:entry.id});
  for(let i=0;i<entry.answer.length;i++){const k=key(row+dr*i,col+dc*i),old=cells.get(k);cells.set(k,{letter:entry.answer[i],dirs:[...(old?.dirs||[]),dir]});}
  placements.push(p);bounds=p.bounds;
 }
 const order=entries.map(e=>({...e,rank:e.answer.length+rng()*5})).sort((a,b)=>b.rank-a.rank);let remaining=[...order];
 const first=remaining.shift();place(inspect(first,mid,mid-Math.floor(first.answer.length/2),'across',true));
 for(let pass=0;pass<entries.length&&remaining.length;pass++){
  let changed=false;
  remaining=remaining.filter(entry=>{let best=null;for(const [k,cell]of cells){if(!cell.letter)continue;const[r,c]=k.split(',').map(Number);for(let i=0;i<entry.answer.length;i++){if(entry.answer[i]!==cell.letter)continue;for(const dir of ['across','down']){const p=inspect(entry,r-(dir==='down'?i:0),c-(dir==='across'?i:0),dir);if(p&&(!best||p.score>best.score))best=p;}}}if(best){place(best);changed=true;return false;}return true;});
  if(!changed)break;
 }
 // Preserve every supplied word, including words with no shared letters, as a separate island.
 for(const entry of remaining){let best=null;for(let r=1;r<size-1;r++)for(let c=1;c<size-1;c++)for(const dir of ['across','down']){const p=inspect(entry,r,c,dir,true);if(p&&(!best||p.score>best.score))best=p;}if(best)place(best);}
 const height=bounds.bottom-bounds.top+1,width=bounds.right-bounds.left+1;
 const grid=Array.from({length:height},()=>Array(width).fill(null));
 for(const[k,cell]of cells){const[r,c]=k.split(',').map(Number);grid[r-bounds.top][c-bounds.left]={...cell};}
 const words=placements.map(p=>({answer:p.entry.answer,clue:p.entry.clue,id:p.entry.id,row:p.row-bounds.top,col:p.col-bounds.left,dir:p.dir})).sort((a,b)=>a.row-b.row||a.col-b.col);
 let n=0,previous='';for(const w of words){const k=key(w.row,w.col);if(k!==previous)n++;w.number=n;previous=k;grid[w.row][w.col].number=n;}
 return{grid,words,width,height,unplaced:entries.filter(e=>!words.some(w=>w.id===e.id)),score:words.length*10000-width*height-Math.abs(width-height)*5,format:arrow?'fleches':'croises'};
}
export function mapMystery(puzzle,mystery){
 const answer=normalize(mystery);if(answer.length>18)throw new Error('Le mot mystère est limité à 18 lettres.');
 const available=[];puzzle.grid.forEach((row,r)=>row.forEach((cell,c)=>{if(cell?.letter)available.push({letter:cell.letter,row:r,col:c});}));
 const selected=[],missing=[];
 for(const [i,letter]of[...answer].entries()){const j=available.findIndex(c=>c.letter===letter);if(j<0)missing.push(letter);else selected.push({...available.splice(j,1)[0],index:i+1});}
 return{answer,selected,missing};
}
export function generate(entries,{format='croises',seed=Date.now(),mystery='',attempts=45}={}){
 const clean=validateEntries(entries);if(!['croises','fleches'].includes(format))throw new Error('Format inconnu.');
 const rng=random(seed);let best=null;
 for(let i=0;i<attempts;i++){const result=build(clean,format==='fleches',rng);result.mystery=mapMystery(result,mystery);result.score-=result.mystery.missing.length*500;if(!best||result.score>best.score)best=result;}
 return best;
}
