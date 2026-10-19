/**
 * Tiện ích tải và xuất bài luận giải dưới dạng file văn bản (.txt) hoặc in trực tiếp ra file PDF
 */

interface ExportOptions {
  title: string;
  subjectName: string;
  category: "Tử Vi Đẩu Số" | "Bát Tự Tứ Trụ" | "Bản Đồ Sao Chiêm Tinh";
  dateInfo?: string;
  content: string;
}

export function downloadTextReading(options: ExportOptions) {
  const { title, subjectName, category, dateInfo, content } = options;
  const divider = "═".repeat(60);
  const subDivider = "─".repeat(60);

  const fileHeader = `
${divider}
            BIẾT TUỐT AI — LUẬN GIẢI CHUYÊN SÂU
${divider}
Chuyên mục: ${category}
Đương số:   ${subjectName}
Thời điểm:  ${dateInfo || new Date().toLocaleString("vi-VN")}
Tiêu đề:    ${title}
${subDivider}

`;

  const cleanContent = content.replace(/\r?\n/g, "\r\n");
  const fullText = fileHeader + cleanContent + `\r\n\r\n${subDivider}\r\nBiên soạn tự động bởi Trợ lý Tri thức Biết Tuốt AI.\r\n`;

  const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = subjectName.trim().replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, "_") || "reading";
  a.download = `LuanGiai_${category.replace(/\s+/g, "_")}_${safeName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printReadingPdf(options: ExportOptions) {
  const { title, subjectName, category, dateInfo, content } = options;

  // Chuyển markdown cơ bản thành HTML đơn giản cho bản in PDF
  const formattedContent = content
    .replace(/^### (.*$)/gim, '<h3 style="color:#b45309; margin-top:20px; margin-bottom:8px; font-size:16px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#1e3a8a; margin-top:24px; margin-bottom:10px; font-size:18px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:#0f172a; margin-top:28px; margin-bottom:12px; font-size:22px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n\n/gim, '</p><p style="margin-bottom:12px; line-height:1.7;">')
    .replace(/\n/gim, '<br/>');

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Vui lòng cho phép mở popup để xuất file PDF!");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>${title} - ${subjectName}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1e293b;
          background: #fff;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          font-size: 13.5px;
        }
        .header {
          text-align: center;
          border-bottom: 2px double #cbd5e1;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .header h1 {
          font-size: 22px;
          margin: 0 0 6px 0;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header .meta {
          font-size: 12px;
          color: #64748b;
        }
        .info-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
        }
        .content {
          text-align: justify;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Bản Luận Giải Số Mệnh Chuyên Sâu</h1>
        <div class="meta">Hệ Thống Trợ Lý Tri Thức Biết Tuốt AI • Chuyên mục: ${category}</div>
      </div>

      <div class="info-box">
        <div><strong>Họ và tên:</strong> ${subjectName}</div>
        <div><strong>Thời gian sinh:</strong> ${dateInfo || "Theo hồ sơ"}</div>
        <div><strong>Ngày lập:</strong> ${new Date().toLocaleDateString("vi-VN")}</div>
      </div>

      <div class="content">
        <p style="margin-bottom:12px; line-height:1.7;">${formattedContent}</p>
      </div>

      <div class="footer">
        Tài liệu được kết xuất từ website Biết Tuốt AI. Mọi phân tích mang tính chất tham khảo & chiêm nghiệm.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
