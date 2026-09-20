import {test} from 'node:test';
import assert from 'node:assert/strict';
import{jsPDF}from'jspdf';
import{generate}from'../dist/generator.js';
import{createPuzzlePDF}from'../dist/pdf.js';
const theme={accent:'#df315e',tint:'#fff0f3'};
const entries=['VENISE','CHOCOLAT','PARIS','SOLEIL','CINEMA','AMOUR','MUSIQUE','CROISSANT'].map(answer=>({answer,clue:'Un souvenir très précieux à partager'}));
test('PDF contains A4 puzzle and optional separate solution in both formats',()=>{for(const format of ['croises','fleches'])for(const includeSolution of [true,false]){const puzzle=generate(entries,{format,mystery:'AMOUR',seed:9,attempts:5});const pdf=createPuzzlePDF(jsPDF,puzzle,{title:'Nous, tout simplement.',signature:'Avec amour',includeSolution},theme);assert.equal(pdf.getNumberOfPages(),includeSolution?2:1);assert.ok(Math.abs(pdf.internal.pageSize.getWidth()-210)<.01);assert.ok(Math.abs(pdf.internal.pageSize.getHeight()-297)<.01);assert.ok(pdf.output('arraybuffer').byteLength>4000);}});
test('PDF exports 18 long clues, a long title, signature and mystery with separate readable clue pages',()=>{const e=[...entries,...['TRADITION','SURPRISE','BAGUETTE','MONTAGNE','AVENTURE','BONHEUR','PROMENADE','FAMILLE','SOUVENIR','ANNIVERSAIRE'].map(answer=>({answer,clue:'Le souvenir que nous aimons partager avec toute la famille pendant les grandes vacances.'}))];const p=generate(e,{format:'fleches',seed:41,mystery:'AMOUR'});const pdf=createPuzzlePDF(jsPDF,p,{title:'Les plus beaux souvenirs de notre extraordinaire histoire',signature:'De toute la famille, avec beaucoup d’amour',includeSolution:true},theme);assert.equal(pdf.getNumberOfPages(),4);assert.ok(pdf.output('arraybuffer').byteLength>10000);});
