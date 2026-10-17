const fs = require('fs');
const buf = fs.readFileSync('prisma/dev.db');
const str = buf.toString('utf-8');
const searchWord = 'Warren';
let pos = 0;
while (true) {
  pos = str.indexOf(searchWord, pos);
  if (pos === -1) break;
  console.log('Found Warren at char index:', pos);
  const snippet = str.substring(Math.max(0, pos - 80), Math.min(str.length, pos + 250));
  console.log('Snippet:\n', snippet);
  console.log('---');
  pos += searchWord.length;
}
