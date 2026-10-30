const arrays = ['projects','people','memberships','tasks','goals','documents','decisions','sources','alerts'];
const email = value => String(value || '').trim().toLowerCase();
export function validateSnapshot(data) {
  if (!data || data.schemaVersion !== 1 || typeof data.generation !== 'string' || !Number.isFinite(Date.parse(data.generatedAt))) throw new Error('Snapshot metadata invalid');
  for (const name of arrays) if (!Array.isArray(data[name])) throw new Error('Missing collection: ' + name);
  for (const name of ['projects','people','tasks','goals','documents','decisions','alerts']) {
    const ids = data[name].map(x=>x.id);
    if (ids.some(x=>!x) || new Set(ids).size !== ids.length) throw new Error('Duplicate or missing ID: ' + name);
  }
  const projects = new Set(data.projects.map(p=>p.id));
  const people = new Set(data.people.map(p=>p.id));
  const emails = data.people.map(p=>email(p.email)).filter(Boolean);
  if (new Set(emails).size !== emails.length) throw new Error('Duplicate person email');
  for (const m of data.memberships) {
    if (!projects.has(m.projectId) || !people.has(m.personId)) throw new Error('Invalid membership');
    if (m.active !== undefined && typeof m.active !== 'boolean') throw new Error('Membership active must be a boolean');
  }
  const membershipKeys = data.memberships.map(m=>m.projectId+':'+m.personId);
  if (new Set(membershipKeys).size !== membershipKeys.length) throw new Error('Duplicate membership');
  for (const name of ['tasks','goals','documents','decisions','sources','alerts']) for (const item of data[name]) if (item.projectId && !projects.has(item.projectId)) throw new Error('Invalid project reference: '+name);
  return data;
}
export function visibleSnapshot(data, identity, ownerEmail) {
  const isOwner = email(identity.email) === email(ownerEmail);
  const person = data.people.find(p=>email(p.email) === email(identity.email));
  if (!person && !isOwner) return null;
  const allowed = new Set(isOwner ? data.projects.map(p=>p.id) : data.memberships.filter(m=>m.personId===person.id && m.active !== false).map(m=>m.projectId));
  const memberships = data.memberships.filter(m=>allowed.has(m.projectId) && m.active !== false);
  const personIds = new Set(memberships.map(m=>m.personId));
  const result = {schemaVersion:1,generation:data.generation,generatedAt:data.generatedAt,timezone:data.timezone||'Europe/Podgorica',viewer:{email:identity.email,name:person?.name||'Кирилл',isOwner},projects:data.projects.filter(p=>allowed.has(p.id)),memberships,people:data.people.filter(p=>isOwner||personIds.has(p.id))};
  for (const name of ['tasks','goals','documents','decisions','sources','alerts']) result[name] = data[name].filter(x=>x.projectId && allowed.has(x.projectId) && (isOwner || x.visibility !== 'owner'));
  return result;
}
