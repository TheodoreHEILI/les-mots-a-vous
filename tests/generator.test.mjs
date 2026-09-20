import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generate,normalize,validateEntries,mapMystery} from '../dist/generator.js';
const words=['VENISE','CHOCOLAT','PARIS','SOLEIL','CINEMA','AMOUR','MUSIQUE','CROISSANT'];
const entries=words.map(answer=>({answer,clue:'Indice pour '+answer}));
function verify(puzzle,expected){
 assert.equal(puzzle.words.length,expected.length);assert.equal(puzzle.unplaced.length,0);
 const memberships=new Map();
 for(const w of puzzle.words){for(let i=0;i<w.answer.length;i++){const r=w.row+(w.dir==='down'?i:0),c=w.col+(w.dir==='across'?i:0);assert.equal(puzzle.grid[r][c].letter,w.answer[i]);const k=`${r},${c}`;memberships.set(k,[...(memberships.get(k)||[]),w]);}if(puzzle.format==='fleches'){const cell=puzzle.grid[w.row-(w.dir==='down'?1:0)][w.col-(w.dir==='across'?1:0)];assert.equal(cell.clue,w.clue);assert.equal(cell.dir,w.dir);}}
 // Every horizontal/vertical run of 2+ letters must be one declared answer, no accidental adjacent words.
 for(const dir of ['across','down'])for(let r=0;r<puzzle.height;r++)for(let c=0;c<puzzle.width;c++){
  const dr=dir==='down'?1:0,dc=1-dr;if(!puzzle.grid[r][c]?.letter||puzzle.grid[r-dr]?.[c-dc]?.letter)continue;
  let text='',i=0;while(puzzle.grid[r+dr*i]?.[c+dc*i]?.letter){text+=puzzle.grid[r+dr*i][c+dc*i].letter;i++;}
  if(text.length>1)assert.ok(puzzle.words.some(w=>w.row===r&&w.col===c&&w.dir===dir&&w.answer===text),`Unexpected ${dir} run ${text}`);
 }
 for(const members of memberships.values()){assert.ok(members.length<=2);if(members.length===2)assert.notEqual(members[0].dir,members[1].dir);}
 const secretCells=new Set();for(const s of puzzle.mystery.selected){assert.equal(puzzle.grid[s.row][s.col].letter,puzzle.mystery.answer[s.index-1]);assert.ok(!secretCells.has(`${s.row},${s.col}`));secretCells.add(`${s.row},${s.col}`);}
}
test('normalizes French ligatures, accents, hyphens and spaces',()=>{assert.equal(normalize('Cœur d’été'),'COEURDETE');assert.equal(normalize('Saint-Étienne'),'SAINTETIENNE');});
test('rejects duplicate, missing, oversized and invalid entries',()=>{assert.throws(()=>validateEntries([]));assert.throws(()=>validateEntries([...entries,{answer:'PÂRIS',clue:'Duplicate'}]));assert.throws(()=>validateEntries(entries.map((e,i)=>i?e:{...e,clue:''})));assert.throws(()=>validateEntries(entries.map((e,i)=>i?e:{...e,answer:'A'.repeat(19)})));});
for(const format of ['croises','fleches'])test(`${format}: valid crossings, every word preserved, correct mystery across 16 seeds`,()=>{for(let seed=1;seed<=16;seed++){const p=generate(entries,{format,seed,mystery:'AMOUR',attempts:10});verify(p,entries);assert.equal(p.mystery.missing.length,0);}});
test('all 18 entries and disconnected alphabets retained',()=>{const e=['AAAA','BBBB','CCCC','DDDD','EEEE','FFFF','GGGG','HHHH','IIII','JJJJ','KKKK','LLLL','MMMM','NNNN','OOOO','PPPP','QQQQ','RRRR'].map(answer=>({answer,clue:'Un indice'}));for(const format of ['croises','fleches'])verify(generate(e,{format,seed:42,attempts:3}),e);});
test('missing and repeated mystery letters use unique available squares',()=>{const p=generate(entries,{seed:4,attempts:3});assert.deepEqual(mapMystery(p,'ZZZ').missing,['Z','Z','Z']);const result=mapMystery(p,'A'.repeat(18));assert.ok(result.missing.length>0);assert.equal(new Set(result.selected.map(s=>`${s.row},${s.col}`)).size,result.selected.length);});
test('same seed reproduces layout, alternate seeds vary layout',()=>{assert.deepEqual(generate(entries,{seed:3,attempts:3}),generate(entries,{seed:3,attempts:3}));assert.notDeepEqual(generate(entries,{seed:3,attempts:3}).grid,generate(entries,{seed:19,attempts:3}).grid);});
