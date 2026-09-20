// Vector PDF: printable text and squares, no screen capture or remote service.
const safe=s=>String(s).replace(/œ/g,'oe').replace(/Œ/g,'OE').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[—–]/g,'-').replace(/…/g,'...').replace(/[^\x20-\xFF\n]/g,'');
export function createPuzzlePDF(jsPDF,puzzle,state,theme){
 const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
 doc.setProperties({title:safe(state.title||'Les mots à vous'),author:'Les mots à vous',subject:'Grille personnalisée et corrigé'});
 function page(solution){
  doc.setTextColor(theme.accent);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(solution?'LES MOTS À VOUS - CORRIGÉ':'LES MOTS À VOUS',105,18,{align:'center'});
  doc.setTextColor('#252426');doc.setFont('times','normal');doc.setFontSize(24);const title=doc.splitTextToSize(safe(state.title.trim()||'Notre histoire, en quelques mots'),176);doc.text(title,105,31,{align:'center'});
  let start=39+(title.length-1)*9;doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor('#777079');doc.text(solution?'Tous les souvenirs ont leur place.':'Les petits détails font les plus belles histoires.',105,start,{align:'center'});start+=10;
  doc.setFontSize(9);const columns=['across','down'].map(dir=>puzzle.words.filter(w=>w.dir===dir).map(w=>({word:w,lines:doc.splitTextToSize(safe(`${w.number}. ${w.clue}${solution?' ('+w.answer+')':''}`),82)})));
  const clueHeight=Math.max(...columns.map(a=>a.reduce((n,w)=>n+w.lines.length*3.8+2,0)))+13;
  const extras=(puzzle.mystery.answer?23:0)+(state.signature?13:0)+12;
  const availableGridH=Math.max(0,Math.min(140,279-start-clueHeight-extras));
  const separateClues=Math.min(178/puzzle.width,availableGridH/puzzle.height)<(puzzle.format==='fleches'?6:5);
  const maxGridH=separateClues?Math.min(195,274-start-extras):availableGridH;
  const cell=Math.min(178/puzzle.width,maxGridH/puzzle.height),gridW=cell*puzzle.width,gridH=cell*puzzle.height,left=(210-gridW)/2;
  const selected=new Map(puzzle.mystery.selected.map(c=>[`${c.row},${c.col}`,c.index]));
  puzzle.grid.forEach((row,r)=>row.forEach((v,c)=>{
   const x=left+c*cell,y=start+r*cell,secret=selected.get(`${r},${c}`);
   doc.setFillColor(!v?'#e8e4e7':v.clue?'#f4f0f2':secret?theme.tint:'#ffffff');doc.setDrawColor('#a5969f');doc.setLineWidth(.15);doc.rect(x,y,cell,cell,'FD');
   if(v?.clue){
    const word=puzzle.words.find(w=>w.id===v.id);let fs=Math.max(4.3,Math.min(7,cell*.72));doc.setFont('helvetica','normal');doc.setTextColor('#453941');let lines;do{doc.setFontSize(fs);lines=doc.splitTextToSize(safe(v.clue),Math.max(3,cell-1.2));if(lines.length*fs*.36<=cell-3||fs<=4.3)break;fs=Math.max(4.3,fs-.3);}while(true);const maxLines=Math.max(1,Math.floor((cell-3)/(fs*.36)));let visible=lines.slice(0,maxLines);if(lines.length>maxLines)visible[visible.length-1]=visible.at(-1).slice(0,-2)+'..';doc.text(visible,x+.6,y+fs*.36+.5,{lineHeightFactor:1.05});
    doc.setFontSize(4.5);doc.text(String(word.number),x+.5,y+cell-.5);doc.setDrawColor('#453941');doc.setLineWidth(.23);
    if(v.dir==='across'){doc.line(x+cell-3,y+cell-1.5,x+cell-.6,y+cell-1.5);doc.line(x+cell-1.3,y+cell-2.2,x+cell-.6,y+cell-1.5);doc.line(x+cell-1.3,y+cell-.8,x+cell-.6,y+cell-1.5);}else{doc.line(x+cell-1.5,y+cell-3,x+cell-1.5,y+cell-.6);doc.line(x+cell-2.2,y+cell-1.3,x+cell-1.5,y+cell-.6);doc.line(x+cell-.8,y+cell-1.3,x+cell-1.5,y+cell-.6);}
   }else if(v){
    if(v.number){doc.setTextColor('#71636c');doc.setFontSize(Math.min(6,cell*.7));doc.text(String(v.number),x+.65,y+2.1);}
    if(solution){doc.setFontSize(Math.min(16,cell*1.45));doc.setTextColor('#252426');doc.text(v.letter,x+cell/2,y+cell*.69,{align:'center'});}
    if(secret){doc.setFillColor(theme.accent);doc.circle(x+cell-1.4,y+cell-1.4,1,'F');doc.setTextColor('#ffffff');doc.setFontSize(4);doc.text(String(secret),x+cell-1.4,y+cell-.96,{align:'center'});}
   }
  }));
  function drawClues(baseline){const ends=[];columns.forEach((col,i)=>{let y=baseline;const x=17+i*91;doc.setTextColor(theme.accent);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(i?'VERTICALEMENT':'HORIZONTALEMENT',x,y);y+=6;doc.setFont('helvetica','normal');doc.setTextColor('#3d343a');doc.setFontSize(9);for(const e of col){doc.text(e.lines,x,y,{lineHeightFactor:1.2});y+=e.lines.length*3.8+2;}ends.push(y);});return Math.max(...ends)+4;}
  let y=start+gridH+10;
  if(separateClues){doc.setTextColor('#777079');doc.setFontSize(8);doc.text('Retrouvez tous les indices sur la page suivante.',105,y,{align:'center'});y+=9;}else y=drawClues(y);
  if(puzzle.mystery.answer){doc.setFontSize(8);doc.setTextColor('#777079');doc.text('Le mot mystère : reportez les lettres des cases colorées numérotées.',105,y,{align:'center'});y+=4;const l=(210-puzzle.mystery.answer.length*7)/2;[...puzzle.mystery.answer].forEach((letter,i)=>{doc.setDrawColor(theme.accent);doc.setTextColor(theme.accent);doc.setLineWidth(.2);doc.rect(l+i*7,y,6,7);doc.setFontSize(4.5);doc.text(String(i+1),l+i*7+.5,y+1.8);if(solution){doc.setFontSize(10);doc.text(letter,l+i*7+3,y+5.5,{align:'center'});}});y+=14;}
  if(state.signature){doc.setFontSize(9);doc.setTextColor('#71636c');doc.text(safe(state.signature),105,y,{align:'center'});}
  doc.setFontSize(7);doc.setTextColor('#a0929b');doc.text('Créé avec attention - les mots à vous.',105,286,{align:'center'});
  if(separateClues){doc.addPage();doc.setTextColor(theme.accent);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(solution?'LES INDICES - CORRIGÉ':'LES INDICES',105,18,{align:'center'});doc.setFont('times','normal');doc.setFontSize(19);doc.setTextColor('#252426');doc.text(doc.splitTextToSize(safe(state.title||'Notre histoire'),176),105,31,{align:'center'});drawClues(47+(title.length-1)*9);doc.setFontSize(7);doc.setTextColor('#a0929b');doc.text('Créé avec attention - les mots à vous.',105,286,{align:'center'});}
 }
 page(false);if(state.includeSolution){doc.addPage();page(true);}return doc;
}
