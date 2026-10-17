const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.next' || f === '.git' || f === '.system_generated') continue;
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      search(p);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.sql') || f.endsWith('.prisma')) {
      const content = fs.readFileSync(p, 'utf-8');
      if (content.toLowerCase().includes('warren')) {
        console.log('Match in file:', p);
        const lines = content.split('\n');
        lines.forEach((l, i) => {
          if (l.toLowerCase().includes('warren')) {
            console.log('  L' + (i+1) + ': ' + l.trim().slice(0, 100));
          }
        });
      }
    }
  }
}
search('.');
