import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const token = process.env.FIGMA_TOKEN;
const key = process.env.FIGMA_FILE_KEY;

const headers = { 'X-Figma-Token': token };
const base = await fetch(`https://api.figma.com/v1/files/${key}/variables/local`, { headers }).then((r) => r.json());
const firstVar = Object.values(base.meta.variables)[0];
const firstCol = Object.values(base.meta.variableCollections)[0];

const tests = [
  `?ids=${encodeURIComponent(firstVar.id)}`,
  `?variable_ids=${encodeURIComponent(firstVar.id)}`,
  `?collection_id=${encodeURIComponent(firstCol.id)}`,
  `?collection_ids=${encodeURIComponent(firstCol.id)}`,
  `?variable_collection_ids=${encodeURIComponent(firstCol.id)}`,
];

for (const q of tests) {
  const j = await fetch(`https://api.figma.com/v1/files/${key}/variables/local${q}`, { headers }).then((r) => r.json());
  const cols = Object.keys(j.meta?.variableCollections || {}).length;
  const vars = Object.keys(j.meta?.variables || {}).length;
  console.log(`${q} => ${cols} cols, ${vars} vars`);
}
