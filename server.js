const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Luôn chạy chế độ PRODUCTION trên hosting để sử dụng bản pre-compiled .next
process.env.NODE_ENV = "production";
const dev = false;
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Lỗi server:", err);
      res.statusCode = 500;
      res.end("Internal Server Error: " + (err?.message || String(err)));
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Máy chủ Biết Tuốt AI sẵn sàng tại http://${hostname}:${port}`);
  });
});
