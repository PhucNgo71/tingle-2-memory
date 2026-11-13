import fs from 'node:fs';
import path from 'node:path';
const web=path.resolve(import.meta.dirname,'..');
const folder=path.resolve(web,'../outputs/tingle-3000-cards');
const load=name=>JSON.parse(fs.readFileSync(path.join(folder,name),'utf8')).records;
const starter=new Map(load('starter/starter-cards.json').map(c=>[c.conceptId,c]));
const rows=load('cards.en.draft.json').map(c=>{
  const override=starter.get(c.conceptId);
  const pencil='/game-sketches/'+c.headword+'-pencil-draft-v1.png';
  const image=[pencil,c.sketchPath].find(p=>p && /^\/(game-sketches|archive-images|word-images)\/[\w./-]+$/.test(p) && !p.includes('..') && fs.existsSync(path.join(web,'public',p)));
  return {id:c.conceptId,word:c.headword,topic:c.topic,meaning:override?.meaning||c.meaning||'',example:override?.example||c.example||'',...(image?{image}:{})};
});
if(rows.length!==3000||new Set(rows.map(c=>c.id)).size!==3000||rows.some(c=>!c.id||!c.word||!c.topic))throw Error('Invalid card catalogue');
fs.writeFileSync(path.join(web,'public/cards-3000.json'),JSON.stringify(rows)+'\n');
console.log({cards:rows.length,withMeaning:rows.filter(c=>c.meaning).length,withImage:rows.filter(c=>c.image).length,withExample:rows.filter(c=>c.example).length});
