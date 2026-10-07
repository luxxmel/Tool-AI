const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '.next', 'required-server-files.json');
if (fs.existsSync(file)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.appDir = '/home/cuacongn/biettuot.io.vn';
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Normalized appDir to:', data.appDir);
} else {
  console.log('File not found:', file);
}
