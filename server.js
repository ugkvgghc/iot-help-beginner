/**
 * IoT Help Beginner - Local Web Server & Mascot API Bridge
 * รันด้วยคำสั่ง: node server.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { analyzeArduinoCode } = require("./packages/analyzer/analyzer");

const PORT = process.env.PORT || 3000;
const WEB_DIR = path.join(__dirname, "packages", "web-visualizer");
const ANALYZER_DIR = path.join(__dirname, "packages", "analyzer");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

const server = http.createServer((req, res) => {
  // API สำหรับให้ตัวละครหน้า Desktop ส่งโค้ด Arduino มาตรวจหา Bug
  if (req.method === "POST" && req.url === "/api/analyze") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const result = analyzeArduinoCode(payload.code || "");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result, null, 2));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // เสิร์ฟไฟล์ analyzer.js ให้ฝั่งเว็บเรียกใช้งานได้
  if (req.url === "/analyzer/analyzer.js") {
    const filePath = path.join(ANALYZER_DIR, "analyzer.js");
    res.writeHead(200, { "Content-Type": MIME_TYPES[".js"] });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // เสิร์ฟไฟล์หน้าเว็บ Paper-Scrapbook Visualizer
  let safeUrl = req.url.split("?")[0];
  if (safeUrl === "/") safeUrl = "/index.html";
  const filePath = path.join(WEB_DIR, safeUrl);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log("============================================================");
  console.log(`🐾⚡ IoT Help Beginner — Paper-Scrapbook Circuit Visualizer`);
  console.log(`🌐 เปิดดูเว็บจำลองวงจรได้ที่: http://localhost:${PORT}`);
  console.log(`🤖 API สำหรับ Desktop Mascot: POST http://localhost:${PORT}/api/analyze`);
  console.log("============================================================");
});
