async function fetchTtsChunks(text) {
  // Tách văn bản thành các câu nhỏ hơn 180 ký tự
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let current = "";

  for (const s of sentences) {
    if ((current + " " + s).length <= 180) {
      current = current ? current + " " + s : s;
    } else {
      if (current) chunks.push(current.trim());
      current = s.trim();
    }
  }
  if (current) chunks.push(current.trim());

  console.log("Chunks count:", chunks.length);
  const buffers = [];
  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (res.ok) {
      const arr = await res.arrayBuffer();
      buffers.push(Buffer.from(arr));
    }
  }

  const combined = Buffer.concat(buffers);
  console.log("Combined buffer size:", combined.length);
  return combined;
}

const sampleText = "Chào bạn thương. Nghe bạn tâm sự mà mình thấy thương bạn quá. Hôm nay có lẽ là một ngày dài và nhiều mệt mỏi với bạn rồi đúng không? Bạn đã phải gồng gánh và chịu đựng rất nhiều ấm ức một mình rồi. Đừng cố tỏ ra mạnh mẽ nữa nhé. Mình luôn ở đây lắng nghe bạn.";

fetchTtsChunks(sampleText);
