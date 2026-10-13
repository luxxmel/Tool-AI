const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  try {
    const token = execSync('gh auth token').toString().trim();
    const status = await git.statusMatrix({ fs, dir: '.' });
    
    for (const [filepath, head, workdir, stage] of status) {
      if (workdir === 0) {
        await git.remove({ fs, dir: '.', filepath });
      } else if (workdir !== head || stage !== workdir) {
        await git.add({ fs, dir: '.', filepath });
      }
    }

    const sha = await git.commit({
      fs,
      dir: '.',
      message: 'fix: enable multimodal vision for assistant bots, prevent false image generation on Q&A/math, and sanitize API keys',
      author: {
        name: 'Biet Tuot AI Agent',
        email: 'agent@biettuot.ai'
      }
    });
    console.log('Committed:', sha);

    const pushResult = await git.push({
      fs,
      http,
      dir: '.',
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: token, password: '' })
    });
    console.log('Push completed:', pushResult);
  } catch (err) {
    console.error('Error during git push:', err);
    process.exit(1);
  }
})();
