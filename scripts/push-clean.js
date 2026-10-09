const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

async function pushClean() {
  const token = execSync('& "C:\\Program Files\\GitHub CLI\\gh.exe" auth token', { shell: 'powershell.exe' }).toString().trim();
  const owner = 'luxxmel';
  const repo = 'Tool-AI';

  function request(method, path, data) {
    return new Promise((resolve, reject) => {
      const payload = data ? JSON.stringify(data) : null;
      const req = https.request({
        hostname: 'api.github.com',
        path: path,
        method: method,
        headers: {
          'User-Agent': 'NodeJS',
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 400) reject(new Error(res.statusCode + ': ' + body));
            else resolve(parsed);
          } catch(e) { resolve(body); }
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  const ref = await request('GET', `/repos/${owner}/${repo}/git/ref/heads/main`);
  const latestCommitSha = ref.object.sha;
  console.log('Latest commit SHA:', latestCommitSha);

  const modifiedFiles = [
    'src/app/page.tsx',
    'src/components/sidebar/AppSidebar.tsx'
  ];

  const deletedFiles = [
    'src/app/explore/page.tsx',
    'src/app/images/page.tsx',
    'src/app/characters/page.tsx',
    'src/app/healing/page.tsx',
    'src/app/stories/page.tsx',
    'src/app/tools/page.tsx',
    'src/app/tarot/page.tsx',
    'src/app/tuvi/page.tsx',
    'src/app/chiemtinh/page.tsx',
    'src/app/battu/page.tsx'
  ];

  const treeItems = [];

  for (const f of modifiedFiles) {
    const content = fs.readFileSync(f, 'utf8');
    const blob = await request('POST', `/repos/${owner}/${repo}/git/blobs`, {
      content: content,
      encoding: 'utf-8'
    });
    treeItems.push({
      path: f.replace(/\\/g, '/'),
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
  }

  for (const f of deletedFiles) {
    treeItems.push({
      path: f.replace(/\\/g, '/'),
      mode: '100644',
      type: 'blob',
      sha: null
    });
  }

  const newTree = await request('POST', `/repos/${owner}/${repo}/git/trees`, {
    base_tree: latestCommitSha,
    tree: treeItems
  });

  const newCommit = await request('POST', `/repos/${owner}/${repo}/git/commits`, {
    message: 'fix: delete conflicting dummy redirect routes and streamline SPA tab switching',
    tree: newTree.sha,
    parents: [latestCommitSha]
  });

  const updatedRef = await request('PATCH', `/repos/${owner}/${repo}/git/refs/heads/main`, {
    sha: newCommit.sha,
    force: false
  });

  fs.writeFileSync('.git/refs/heads/main', newCommit.sha + '\n');
  console.log('Pushed commit successfully:', newCommit.sha);
}

pushClean().catch(err => {
  console.error(err);
  process.exit(1);
});
