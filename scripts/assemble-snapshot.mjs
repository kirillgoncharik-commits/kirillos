import {readFile,writeFile} from 'node:fs/promises';
import {validateSnapshot} from '../src/model.mjs';

// Input is private connector output, never a tracked repository file.
// {registry:{projects,people,memberships,goals,documents,decisions,alerts},
//  boards:[{projectId,observedAt,complete:true,lists:[{name,cards:[]}]}],previous?}
export function assemble(input, now=new Date().toISOString()) {
  const r=input.registry;
  const previous=input.previous;
  const tasks=[],sources=[];
  for(const p of r.projects){
    const b=input.boards.find(x=>x.projectId===p.id);
    if(!b || b.complete!==true){
      if(!previous)throw new Error('Previous private snapshot required for incomplete board: '+p.id);
      tasks.push(...(previous?.tasks||[]).filter(t=>t.projectId===p.id));
      const old=previous?.sources?.find(s=>s.id==='trello-'+p.id);
      sources.push({id:'trello-'+p.id,projectId:p.id,name:'Trello',status:'error',observedAt:now,lastSuccessAt:old?.lastSuccessAt||''});
      continue;
    }
    for(const list of b.lists)for(const c of list.cards){
      const description=c.description||c.desc||'';
      if(description.includes('КириллOS key: passport:'))continue;
      const n=list.name;
      let status=/готово|^done$|опубликовано|^закрыто$/i.test(n)?'done':/в работе|in progress|черновик/i.test(n)?'doing':/ожидание|согласовании|frontend/i.test(n)?'waiting':/review|проверка/i.test(n)?'review':/inbox|на разбор/i.test(n)?'inbox':/to do|следующее|на неделю|интервью/i.test(n)?'next':'backlog';
      if(c.complete||c.closed)status='done';
      const due=c.due?.date||c.due;
      tasks.push({id:c.id,projectId:p.id,title:c.name.replace(/^\[P\d\]\s*/,''),status,priority:c.name.match(/^\[(P\d)\]/)?.[1]||'',dueAt:typeof due==='string'?due:'',url:c.shortUrl||c.url||c.webUrl,legacyTaskId:description.match(/migration key: legacy:(t\d+)/)?.[1]||'',listName:n,archived:!!c.closed});
    }
    sources.push({id:'trello-'+p.id,projectId:p.id,name:'Trello',status:'ok',observedAt:b.observedAt,lastSuccessAt:b.observedAt});
  }
  return validateSnapshot({schemaVersion:1,generation:'sync-'+now,generatedAt:now,timezone:'Europe/Podgorica',...r,tasks,sources:[...sources,...(r.sources||[]).filter(s=>!s.id.startsWith('trello-'))]});
}
if(process.argv[1]?.endsWith('assemble-snapshot.mjs')){
  const [inputPath,outputPath]=process.argv.slice(2);
  if(!inputPath||!outputPath)throw Error('Usage: assemble-snapshot.mjs private/input.json private/snapshot.json');
  await writeFile(outputPath,JSON.stringify(assemble(JSON.parse(await readFile(inputPath,'utf8')))),{mode:0o600});
}
