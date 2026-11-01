/**
 * IoT Help Beginner - Desktop App Backend & Arduino IDE Live File Watcher
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const { analyzeArduinoCode } = require("./packages/analyzer/analyzer");

const PORT = process.env.PORT || 3000;
const WEB_DIR = path.join(__dirname, "packages", "web-visualizer");
const ANALYZER_DIR = path.join(__dirname, "packages", "analyzer");
const EXAMPLES_DIR = path.join(__dirname, "examples");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// สถานะของไฟล์ .ino ที่กำลังเฝ้าดูควบคู่กับ Arduino IDE
let watchedFilePath = path.join(EXAMPLES_DIR, "blink_bug.ino");
let lastModifiedMs = 0;
let autoSwitchNewestIno = true;

/**
 * ค้นหาไฟล์ .ino ทั้งหมดจากโฟลเดอร์ Arduino ของผู้ใช้ และโฟลเดอร์ examples
 */
function scanInoFiles() {
  const home = os.homedir();
  const candidateDirs = [
    path.join(home, "Documents", "Arduino"),
    path.join(home, "OneDrive", "Documents", "Arduino"),
    path.join(home, "Desktop"),
    EXAMPLES_DIR,
  ];

  const found = [];

  function walk(dir, depth = 0) {
    if (depth > 3 || !fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
            walk(fullPath, depth + 1);
          }
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".ino")) {
          const stat = fs.statSync(fullPath);
          found.push({
            path: fullPath,
            name: entry.name,
            folder: path.basename(path.dirname(fullPath)),
            mtimeMs: stat.mtimeMs,
            isExample: fullPath.startsWith(EXAMPLES_DIR),
          });
        }
      }
    } catch (_) {
      // ข้ามโฟลเดอร์ที่ไม่มีสิทธิ์อ่าน
    }
  }

  candidateDirs.forEach((d) => walk(d, 0));
  found.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return found;
}

/**
 * ตรวจสอบว่ามีไฟล์ .ino ของผู้ใช้ที่เพิ่งกด Save ใหม่ใน Arduino IDE หรือไม่
 */
function refreshWatchedFile() {
  const allFiles = scanInoFiles();
  const userFiles = allFiles.filter((f) => !f.isExample);

  // ถ้าเปิดโหมดตรวจจับอัตโนมัติ และมีไฟล์ .ino ของผู้ใช้ที่เพิ่งแก้ไขใหม่กว่าไฟล์ปัจจุบัน
  if (autoSwitchNewestIno && userFiles.length > 0) {
    const newestUserFile = userFiles[0];
    if (
      watchedFilePath.startsWith(EXAMPLES_DIR) ||
      newestUserFile.mtimeMs > lastModifiedMs + 500
    ) {
      watchedFilePath = newestUserFile.path;
      lastModifiedMs = newestUserFile.mtimeMs;
    }
  }

  let code = "";
  let mtimeMs = Date.now();
  if (fs.existsSync(watchedFilePath)) {
    try {
      const stat = fs.statSync(watchedFilePath);
      mtimeMs = stat.mtimeMs;
      lastModifiedMs = mtimeMs;
      code = fs.readFileSync(watchedFilePath, "utf8");
    } catch (_) {}
  }

  const analysis = analyzeArduinoCode(code);
  return {
    watchedFilePath,
    watchedFileName: path.basename(watchedFilePath),
    mtimeMs,
    autoSwitchNewestIno,
    recentFiles: allFiles.slice(0, 12),
    code,
    analysis,
  };
}

/**
 * เปิดหน้าต่างเลือกไฟล์ .ino ของ Windows (Native File Dialog)
 */
function openNativeFilePicker() {
  return new Promise((resolve) => {
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms
      $f = New-Object System.Windows.Forms.OpenFileDialog
      $f.Title = "เลือกไฟล์โค้ด Arduino (.ino) ที่กำลังเขียนใน Arduino IDE"
      $f.Filter = "Arduino Sketch (*.ino)|*.ino|All Files (*.*)|*.*"
      $dummy = New-Object System.Windows.Forms.Form
      $dummy.TopMost = $true
      if ($f.ShowDialog($dummy) -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $f.FileName
      }
    `;
    execFile(
      "powershell.exe",
      ["-NoProfile", "-STA", "-Command", psScript],
      { timeout: 60000 },
      (err, stdout) => {
        if (err) return resolve(null);
        const picked = (stdout || "").trim();
        resolve(picked || null);
      }
    );
  });
}

/**
 * ตั้งค่าหน้าต่างโปรแกรมให้ลอยอยู่บนสุด (Always on Top) คู่กับ Arduino IDE
 */
function setWindowTopMost(enableTopMost) {
  const flag = enableTopMost ? "-1" : "-2"; // HWND_TOPMOST = -1, HWND_NOTOPMOST = -2
  const psScript = `
    Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class Win32Top {
      [DllImport("user32.dll")]
      public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    }
"@
    $procs = Get-Process | Where-Object { $_.MainWindowTitle -like "*IoT Help Beginner*" -and $_.MainWindowHandle -ne 0 }
    foreach ($p in $procs) {
      [Win32Top]::SetWindowPos($p.MainWindowHandle, [IntPtr]${flag}, 0, 0, 0, 0, 0x0003) | Out-Null
    }
  `;
  execFile("powershell.exe", ["-NoProfile", "-Command", psScript], () => {});
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // 1. ดึงสถานะไฟล์ .ino ล่าสุดที่เชื่อมกับ Arduino IDE
  if (req.method === "GET" && req.url.startsWith("/api/state")) {
    const state = refreshWatchedFile();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(state));
    return;
  }

  // 2. วิเคราะห์โค้ดที่ส่งมาโดยตรง
  if (req.method === "POST" && req.url === "/api/analyze") {
    try {
      const payload = await readJsonBody(req);
      const result = analyzeArduinoCode(payload.code || "");
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(result, null, 2));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. เปิด Windows File Picker เพื่อเลือกไฟล์ .ino
  if (req.method === "POST" && req.url === "/api/pick-file") {
    const picked = await openNativeFilePicker();
    if (picked && fs.existsSync(picked)) {
      watchedFilePath = picked;
      autoSwitchNewestIno = false;
    }
    const state = refreshWatchedFile();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ picked, state }));
    return;
  }

  // 4. เลือกไฟล์ .ino จากรายการที่มีในเครื่อง
  if (req.method === "POST" && req.url === "/api/select-file") {
    try {
      const payload = await readJsonBody(req);
      if (payload.filePath && fs.existsSync(payload.filePath)) {
        watchedFilePath = payload.filePath;
        autoSwitchNewestIno = Boolean(payload.autoSwitch);
      }
      const state = refreshWatchedFile();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(state));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 5. บันทึกโค้ดที่แก้แล้วกลับลงไฟล์ .ino ทันที
  if (req.method === "POST" && req.url === "/api/save-file") {
    try {
      const payload = await readJsonBody(req);
      if (typeof payload.code === "string" && watchedFilePath) {
        fs.writeFileSync(watchedFilePath, payload.code, "utf8");
      }
      const state = refreshWatchedFile();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(state));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 6. ตั้งค่าโหมดหน้าต่าง Always-on-Top
  if (req.method === "POST" && req.url === "/api/window-topmost") {
    try {
      const payload = await readJsonBody(req);
      setWindowTopMost(Boolean(payload.topMost));
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // เสิร์ฟไฟล์ analyzer.js
  if (req.url === "/analyzer/analyzer.js") {
    const filePath = path.join(ANALYZER_DIR, "analyzer.js");
    res.writeHead(200, { "Content-Type": MIME_TYPES[".js"] });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // เสิร์ฟไฟล์ UI ของโปรแกรม
  let safeUrl = req.url.split("?")[0];
  if (safeUrl === "/") safeUrl = "/index.html";
  const filePath = path.join(WEB_DIR, safeUrl);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log("============================================================");
  console.log(`🐾⚡ IoT Help Beginner — Desktop Companion Server`);
  console.log(`🌐 Endpoint: http://localhost:${PORT}`);
  console.log(`📂 Watching: ${watchedFilePath}`);
  console.log("============================================================");
});
