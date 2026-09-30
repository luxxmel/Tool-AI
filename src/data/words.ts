export interface WordCollection {
  vietnamese: string[];
  english: string[];
  code: string[];
}

export const WORDS_DATA: WordCollection = {
  vietnamese: [
    "công nghệ", "lập trình", "phát triển", "tương lai", "trí tuệ", "nhân tạo",
    "học tập", "thành công", "nỗ lực", "kiên trì", "khám phá", "sáng tạo",
    "mục tiêu", "kỹ năng", "thử thách", "kinh nghiệm", "giao diện", "hệ thống",
    "dữ liệu", "thuật toán", "hiệu năng", "tốc độ", "chính xác", "bàn phím",
    "máy tính", "phần mềm", "ứng dụng", "thiết kế", "tối ưu", "linh hoạt",
    "thực tế", "giải pháp", "kết nối", "mạng lưới", "thông minh", "quy trình",
    "chất lượng", "cải tiến", "động lực", "tiến bộ", "tập trung", "thói quen",
    "hiệu quả", "công cụ", "nền tảng", "kiến trúc", "trải nghiệm", "người dùng",
    "bền bỉ", "tinh tế", "đột phá", "giá trị", "sứ mệnh", "tầm nhìn", "chiến lược"
  ],
  english: [
    "technology", "developer", "programming", "keyboard", "interface",
    "algorithm", "system", "performance", "accuracy", "challenge",
    "experience", "software", "creative", "future", "intelligence",
    "component", "flexible", "solution", "framework", "application",
    "practice", "optimize", "workflow", "efficient", "structure",
    "database", "frontend", "backend", "fullstack", "responsive",
    "modern", "scalable", "network", "security", "terminal",
    "function", "variable", "learning", "constant", "iteration"
  ],
  code: [
    "const", "function", "return", "async", "await", "import", "export",
    "interface", "type", "useState", "useEffect", "useCallback", "boolean",
    "string", "number", "Promise<void>", "console.log", "document.getElementById",
    "localStorage.setItem", "JSON.stringify", "array.map", "array.filter",
    "array.reduce", "try", "catch", "throw", "new Error", "public", "private",
    "class", "extends", "implements", "readonly", "undefined", "null"
  ]
};

export type LanguageMode = "vietnamese" | "english" | "code";

export function getRandomWords(lang: LanguageMode, count: number = 40): string[] {
  const source = WORDS_DATA[lang] || WORDS_DATA.vietnamese;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * source.length);
    result.push(source[randomIndex]);
  }
  return result;
}
