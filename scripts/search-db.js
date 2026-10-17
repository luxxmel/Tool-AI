const fs = require('fs');
const content = fs.readFileSync('prisma/dev.db', 'utf-8');
let idx = 0;
while ((idx = content.indexOf('Warren', idx)) !== -1) {
  console.log('Found Warren in DB at offset:', idx);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  idx += 6;
}
