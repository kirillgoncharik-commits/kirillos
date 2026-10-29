import test from 'node:test';
import assert from 'node:assert/strict';
import {assemble} from '../scripts/assemble-snapshot.mjs';

const registry={projects:[{id:'a'},{id:'b'}],people:[],memberships:[],goals:[],documents:[],decisions:[],alerts:[]};
test('partial source retains its last known tasks and reports failure',()=>{
  const previous={tasks:[{id:'old',projectId:'b',title:'Retain me'}],sources:[{id:'trello-b',lastSuccessAt:'2026-10-28T08:00:00Z'}]};
  const result=assemble({registry,previous,boards:[{projectId:'a',complete:true,observedAt:'2026-10-29T08:00:00Z',lists:[]},{projectId:'b',complete:false,lists:[]}]});
  assert.deepEqual(result.tasks,previous.tasks);
  assert.equal(result.sources.find(s=>s.projectId==='b').status,'error');
  assert.equal(result.sources.find(s=>s.projectId==='b').lastSuccessAt,previous.sources[0].lastSuccessAt);
});
test('complete source replaces stale cards, preserves terminal states and excludes passports',()=>{
  const boards=[{projectId:'a',complete:true,observedAt:'2026-10-29T08:00:00Z',lists:[{name:'Закрыто',cards:[{id:'new',name:'[P1] New state',description:'КириллOS migration key: legacy:t1',due:{date:'2026-11-01T09:00:00Z'}}]},{name:'Паспорт и правила',cards:[{id:'passport',name:'Passport',description:'КириллOS key: passport:a'}]}]},{projectId:'b',complete:true,lists:[]}];
  const result=assemble({registry,boards,previous:{tasks:[{id:'stale',projectId:'a'}]}});
  assert.equal(result.tasks.length,1);
  assert.equal(result.tasks[0].id,'new');
  assert.equal(result.tasks[0].status,'done');
  assert.equal(result.tasks[0].legacyTaskId,'t1');
});
