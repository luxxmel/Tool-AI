const fs = require('fs');
const path = require('path');

function walk(d, list=[]) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(p, list);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      list.push(p);
    }
  }
  return list;
}

const files = walk('src');
const missing = new Set();
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const regex = /['"](\/(?:characters|images|icons|avatars)\/[^'"]+?\.(?:png|jpg|jpeg|svg|webp))['"]/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const rel = m[1].replace(/^\//, '');
    const localPath = path.join('public', rel);
    if (!fs.existsSync(localPath)) {
      missing.add(`${m[1]} (in ${f})`);
    }
  }
}

console.log('Total missing local assets:', missing.size);
for (const item of Array.from(missing).slice(0, 15)) {
  console.log(' -', item);
}
