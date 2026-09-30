const http = require('http');

http.get('http://127.0.0.1:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    const matches = data.match(/error[a-zA-Z0-9_-]*/gi) || [];
    console.log('Unique error tokens:', [...new Set(matches)]);
    if (data.includes('__next_error__') || data.includes('Hydration') || data.includes('hydration')) {
      console.log('HYDRATION / NEXT ERROR FOUND IN HTML!');
    } else {
      console.log('No Hydration / Next error keywords found in HTML');
    }
  });
}).on('error', e => console.error(e));
