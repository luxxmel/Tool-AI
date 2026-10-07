const https = require('https');

https.get('https://biettuot.io.vn', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const regex = /src="([^"]+\.js)"/g;
    let match;
    const scripts = [];
    while ((match = regex.exec(data)) !== null) {
      scripts.push(match[1]);
    }
    console.log('Total scripts found in HTML:', scripts.length);
    scripts.forEach(src => {
      https.get('https://biettuot.io.vn' + src, r => {
        console.log(r.statusCode, src);
      });
    });
  });
});
