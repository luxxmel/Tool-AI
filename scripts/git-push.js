const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

async function gitPush(commitMessage = 'chore: update project changes') {
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

  // Track modified files from arguments or detected modified list
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.log('No specific files provided.');
    return;
  }

  const treeItems = [];
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const blob = await request('POST', `/repos/${owner}/${repo}/git/blobs`, {
      content: content,
      encoding: 'utf-8'
    });
    treeItems.push({
      path: filePath.replace(/\\/g, '/'),
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
  }

  const newTree = await request('POST', `/repos/${owner}/${repo}/git/trees`, {
    base_tree: latestCommitSha,
    tree: treeItems
  });

  const newCommit = await request('POST', `/repos/${owner}/${repo}/git/commits`, {
    message: commitMessage,
    tree: newTree.sha,
    parents: [latestCommitSha]
  });

  await request('PATCH', `/repos/${owner}/${repo}/git/refs/heads/main`, {
    sha: newCommit.sha,
    force: false
  });

  fs.writeFileSync('.git/refs/heads/main', newCommit.sha + '\n');
  console.log(`Pushed ${newCommit.sha.substring(0, 7)}: ${commitMessage}`);
}

const msg = process.env.COMMIT_MSG || 'chore: update changes';
gitPush(msg).catch(err => {
  console.error(err);
  process.exit(1);
});
