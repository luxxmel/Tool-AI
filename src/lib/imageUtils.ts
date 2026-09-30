/**
 * Tiện ích xử lý hình ảnh cho Chat (Copy-Paste, Upload, Kéo-Thả, Nén ảnh)
 */

export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // Nếu file không phải ảnh, đọc bình thường
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Giữ tỉ lệ và giới hạn kích thước tối đa để tối ưu băng thông & lưu trữ
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Xuất sang JPEG chất lượng cao tối ưu dung lượng
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/**
 * Trích xuất hình ảnh từ sự kiện dán clipboard (Ctrl + V)
 */
export async function extractImagesFromClipboard(
  e: React.ClipboardEvent
): Promise<string[]> {
  const items = e.clipboardData?.items;
  if (!items) return [];

  const promises: Promise<string>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        promises.push(compressImage(file));
      }
    }
  }

  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

/**
 * Trích xuất hình ảnh từ FileList (input type="file")
 */
export async function extractImagesFromFileList(
  files: FileList | null
): Promise<string[]> {
  if (!files) return [];
  const promises: Promise<string>[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith("image/")) {
      promises.push(compressImage(file));
    }
  }

  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

/**
 * Trích xuất hình ảnh từ sự kiện kéo thả (Drag and Drop)
 */
export async function extractImagesFromDrop(
  e: React.DragEvent
): Promise<string[]> {
  const files = e.dataTransfer?.files;
  return extractImagesFromFileList(files);
}

/**
 * Phân tích nội dung tin nhắn để tách riêng các hình ảnh định dạng Markdown ![...](data:...) hoặc url
 */
export function parseMessageImages(rawContent: string): {
  text: string;
  images: string[];
} {
  if (!rawContent) return { text: "", images: [] };

  const imageRegex = /!\[.*?\]\((data:image\/[^;]+;base64,[^)]+|https?:\/\/[^)]+)\)/g;
  const images: string[] = [];
  let match;

  while ((match = imageRegex.exec(rawContent)) !== null) {
    if (match[1]) {
      images.push(match[1]);
    }
  }

  // Loại bỏ các thẻ ảnh markdown để lấy text sạch nếu cần
  const cleanText = rawContent.replace(imageRegex, "").trim();

  return {
    text: cleanText,
    images,
  };
}
