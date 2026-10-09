const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

const token = execSync('& "C:\\Program Files\\GitHub CLI\\gh.exe" auth token', { shell: 'powershell.exe' }).toString().trim();

function getFile(commitSha, filePath) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path: '/repos/luxxmel/Tool-AI/contents/' + filePath + '?ref=' + commitSha,
      headers: { 'User-Agent': 'NodeJS', 'Authorization': 'Bearer ' + token }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const json = JSON.parse(d);
        if (json.content) {
          resolve(Buffer.from(json.content, 'base64').toString('utf8'));
        } else {
          reject(new Error('No content: ' + d));
        }
      });
    }).on('error', reject);
  });
}

async function restore() {
  const sidebarContent = await getFile('7e69f7648a6181caf31895399dce1fe07d6bbbb6', 'src/components/sidebar/AppSidebar.tsx');
  fs.writeFileSync('src/components/sidebar/AppSidebar.tsx', sidebarContent, 'utf8');
  console.log('Restored AppSidebar.tsx to original commit 7e69f76');

  const pageContent = await getFile('7e69f7648a6181caf31895399dce1fe07d6bbbb6', 'src/app/page.tsx');
  fs.writeFileSync('src/app/page.tsx', pageContent, 'utf8');
  console.log('Restored page.tsx to original commit 7e69f76');
}

restore().catch(err => {
  console.error(err);
  process.exit(1);
});
