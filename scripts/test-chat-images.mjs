async function testChatImageGen() {
  console.log('--- TEST 1: Text-to-Image in /api/chat ---');
  try {
    const res = await fetch('http://127.0.0.1:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botId: 'omni-assistant',
        userId: 'admin',
        messages: [
          { role: 'user', content: 'Vẽ cho tôi một bức tranh anime một chú mèo nhỏ bên hoa anh đào' }
        ]
      })
    });

    console.log('Status:', res.status);
    console.log('Generated Image Header:', res.headers.get('x-generated-image'));
    const text = await res.text();
    console.log('Response excerpt:', text.slice(0, 300));
  } catch (err) {
    console.error('Test 1 failed:', err);
  }
}

async function testChatImageEdit() {
  console.log('\n--- TEST 2: Image Editing (Image-to-Image) in /api/chat ---');
  try {
    // 1x1 transparent png data url for test
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const res = await fetch('http://127.0.0.1:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botId: 'omni-assistant',
        userId: 'admin',
        messages: [
          {
            role: 'user',
            content: 'Hãy sửa hình ảnh này theo phong cách cyberpunk neon tương lai',
            images: [dummyImage]
          }
        ]
      })
    });

    console.log('Status:', res.status);
    console.log('Generated Image Header:', res.headers.get('x-generated-image'));
    const text = await res.text();
    console.log('Response excerpt:', text.slice(0, 300));
  } catch (err) {
    console.error('Test 2 failed:', err);
  }
}

async function run() {
  await testChatImageGen();
  await testChatImageEdit();
}

run();
