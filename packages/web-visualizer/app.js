/**
 * IoT Help Beginner - Paper-Scrapbook Circuit Visualizer App
 */

const PRESETS = {
  output_typo: `void setup() {
  // ตั้งค่าขาที่ 4 สำหรับหลอดไฟ LED
  pinMode(4, Output);
}

void loop() {
  // สั่งจ่ายไฟให้หลอดไฟขาที่ 4 สว่าง
  digitalWrite(4, HIGH);
  delay(1000);
}`,

  high_typo: `void setup() {
  pinMode(4, OUTPUT);
  pinMode(2, INPUT);
}

void loop() {
  int btn = digitalRead(2);
  // เขียน High ผิดตัวเล็ก-ใหญ่ ที่ขา 4
  digitalWrite(4, High);
}`,

  missing_pinmode: `void setup() {
  // ลืมประกาศ pinMode(4, OUTPUT); ใน setup!
}

void loop() {
  digitalWrite(4, HIGH);
  delay(500);
}`,

  clean_working: `void setup() {
  pinMode(4, OUTPUT);
  pinMode(2, INPUT);
}

void loop() {
  int btn = digitalRead(2);
  digitalWrite(4, HIGH);
  delay(1000);
}`,
};

const UI_TEXT = {
  th: {
    subtitle: "ผู้ช่วยตรวจจับ Bug โค้ด Arduino และจำลองวงจรสไตล์กระดาษตัดแปะ",
    presetLabel: "ตัวอย่างโค้ดทดสอบ:",
    mascotName: "คู่หูตรวจโค้ด",
    statusBug: "พบจุดผิดพลาด!",
    statusOk: "โค้ดถูกต้องพร้อมลุย!",
    autoFix: "✨ แก้โค้ดให้ถูกต้องอัตโนมัติ",
    editorHint: "ลองแก้โค้ดด้านล่างแล้วดูผลลัพธ์ในวงจรกระดาษแปะได้ทันที",
    boardTitle: "📌 กระดานจำลองวงจรจากโค้ด (Paper-Scrapbook Circuit)",
    boardNote: "*อ้างอิงอุปกรณ์และขาจากโค้ดโดยอัตโนมัติ",
    pinRailTitle: "ขาเชื่อมต่อ (Pins in Code)",
    deviceNames: {
      led: "หลอดไฟ LED",
      button: "ปุ่มกด (Push Button)",
      sensor: "เซนเซอร์ (Sensor)",
      servo: "เซอร์โวมอเตอร์ (Servo)",
      buzzer: "ลำโพงบัซเซอร์ (Buzzer)",
      relay: "รีเลย์ (Relay)",
    },
    stateWorkingOn: "⚡ สว่าง / ทำงานปกติ",
    stateWorkingInput: "✅ พร้อมรับสัญญาณปกติ",
    stateBroken: "❌ ไม่ทำงาน (เกิด Bug จากโค้ด!)",
    noDevices: "ยังไม่มีการเรียกใช้ขา Pin ในโค้ด ลองเขียน pinMode หรือ digitalWrite ดูสิ!",
  },
  en: {
    subtitle: "Friendly Arduino Bug Detector & Torn-Paper Scrapbook Circuit Visualizer",
    presetLabel: "Sample Scenarios:",
    mascotName: "IoT Buddy",
    statusBug: "Bug Detected!",
    statusOk: "All Systems Go!",
    autoFix: "✨ Auto-Fix Code Bugs",
    editorHint: "Edit the Arduino code below and watch the paper circuit react live",
    boardTitle: "📌 Paper-Scrapbook Circuit Board (Inferred from Code)",
    boardNote: "*Hardware & wires automatically generated from your code",
    pinRailTitle: "Active Pins in Code",
    deviceNames: {
      led: "LED Light",
      button: "Push Button",
      sensor: "Analog Sensor",
      servo: "Servo Motor",
      buzzer: "Piezo Buzzer",
      relay: "Relay Module",
    },
    stateWorkingOn: "⚡ Lit Up / Working Normally",
    stateWorkingInput: "✅ Ready & Reading Signal",
    stateBroken: "❌ Not Working (Code Bug!)",
    noDevices: "No pins detected in code yet. Try adding pinMode() or digitalWrite()!",
  },
};

let currentLang = "th";
let lastAnalysis = null;

const codeInput = document.getElementById("codeInput");
const lineNumbers = document.getElementById("lineNumbers");
const presetSelect = document.getElementById("presetSelect");
const btnLangTH = document.getElementById("btnLangTH");
const btnLangEN = document.getElementById("btnLangEN");
const mascotBanner = document.getElementById("mascotBanner");
const mascotFace = document.getElementById("mascotFace");
const statusPill = document.getElementById("statusPill");
const btnAutoFix = document.getElementById("btnAutoFix");
const speechMessages = document.getElementById("speechMessages");
const bugListBox = document.getElementById("bugListBox");
const arduinoPinList = document.getElementById("arduinoPinList");
const devicesZone = document.getElementById("devicesZone");
const wireLayer = document.getElementById("wireLayer");
const scrapbookCanvas = document.getElementById("scrapbookCanvas");

/**
 * สร้าง SVG รูปภาพอุปกรณ์สไตล์ภาพวาดแปะกระดาษ (LED, ปุ่มกด, เซนเซอร์)
 */
function getDeviceSVG(deviceType, isOn, hasBug) {
  if (deviceType === "button" || deviceType === "sensor") {
    const ringColor = hasBug ? "#d90429" : "#2b9348";
    return `
      <svg viewBox="0 0 80 80" width="64" height="64">
        <rect x="12" y="16" width="56" height="48" rx="8" fill="#ced4da" stroke="#495057" stroke-width="3"/>
        <circle cx="40" cy="40" r="15" fill="${ringColor}" stroke="#212529" stroke-width="3"/>
        <circle cx="35" cy="35" r="4" fill="rgba(255,255,255,0.6)"/>
      </svg>
    `;
  }

  // Default: หลอดไฟ LED (สว่างมีรัศมีเมื่อทำงานปกติ vs มืดดับเมื่อมี Bug)
  if (hasBug || !isOn) {
    return `
      <svg viewBox="0 0 80 80" width="66" height="66">
        <!-- ขาหลอด LED -->
        <line x1="33" y1="54" x2="33" y2="75" stroke="#6c757d" stroke-width="4" stroke-linecap="round"/>
        <line x1="47" y1="54" x2="47" y2="70" stroke="#6c757d" stroke-width="4" stroke-linecap="round"/>
        <!-- หัวหลอด LED ที่ดับสนิท -->
        <path d="M22 52 L22 32 A18 18 0 0 1 58 32 L58 52 Z" fill="#adb5bd" stroke="#495057" stroke-width="3"/>
        <rect x="19" y="50" width="42" height="6" rx="2" fill="#6c757d" stroke="#495057" stroke-width="2"/>
        <!-- รอยกากบาทเล็กๆ ตาหลอดไฟงง -->
        <text x="40" y="41" text-anchor="middle" fill="#343a40" font-size="14" font-weight="bold">x_x</text>
      </svg>
    `;
  }

  // หลอดไฟ LED สว่างสดใส
  return `
    <svg viewBox="0 0 80 80" width="66" height="66">
      <defs>
        <radialGradient id="ledGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#fff3b0"/>
          <stop offset="55%" stop-color="#ffbe0b"/>
          <stop offset="100%" stop-color="rgba(255,190,11,0)"/>
        </radialGradient>
      </defs>
      <!-- รัศมีไฟสว่าง -->
      <circle cx="40" cy="34" r="32" fill="url(#ledGlow)"/>
      <!-- ขาหลอด LED -->
      <line x1="33" y1="54" x2="33" y2="75" stroke="#495057" stroke-width="4" stroke-linecap="round"/>
      <line x1="47" y1="54" x2="47" y2="70" stroke="#495057" stroke-width="4" stroke-linecap="round"/>
      <!-- ตัวหลอดไฟสีเหลืองส้มสว่าง -->
      <path d="M22 52 L22 32 A18 18 0 0 1 58 32 L58 52 Z" fill="#ffbe0b" stroke="#fb5607" stroke-width="3"/>
      <rect x="19" y="50" width="42" height="6" rx="2" fill="#fb5607"/>
      <circle cx="33" cy="28" r="5" fill="rgba(255,255,255,0.85)"/>
    </svg>
  `;
}

function updateLineNumbers() {
  const count = codeInput.value.split(/\r?\n/).length;
  lineNumbers.innerHTML = Array.from({ length: count }, (_, i) => i + 1).join("<br/>");
}

function updateStaticLabels() {
  const t = UI_TEXT[currentLang];
  document.getElementById("subtitleText").textContent = t.subtitle;
  document.getElementById("presetLabel").textContent = t.presetLabel;
  document.getElementById("mascotNameTag").textContent = t.mascotName;
  document.getElementById("btnAutoFix").textContent = t.autoFix;
  document.getElementById("editorHint").textContent = t.editorHint;
  document.getElementById("boardTitle").textContent = t.boardTitle;
  document.getElementById("boardNote").textContent = t.boardNote;
  document.getElementById("pinRailTitle").textContent = t.pinRailTitle;
}

function renderAnalysis() {
  updateLineNumbers();
  const code = codeInput.value;
  const result = window.IoTAnalyzer.analyzeArduinoCode(code);
  lastAnalysis = result;
  const t = UI_TEXT[currentLang];

  // 1. อัปเดตกล่องคำพูดตัวละคร (Mascot Banner)
  if (result.ok) {
    mascotBanner.classList.add("status-ok");
    mascotFace.textContent = "🦊🎉";
    statusPill.textContent = t.statusOk;
    btnAutoFix.style.display = "none";
    speechMessages.innerHTML = `<div class="speech-item"><strong>${result.summary[currentLang]}</strong></div>`;
  } else {
    mascotBanner.classList.remove("status-ok");
    mascotFace.textContent = "🦊📢";
    statusPill.textContent = `${t.statusBug} (${result.bugCount})`;
    btnAutoFix.style.display = "inline-block";
    speechMessages.innerHTML = result.bugs
      .map(
        (b) =>
          `<div class="speech-item">💬 <strong>Line ${b.line}:</strong> ${b.message[currentLang]}</div>`
      )
      .join("");
  }

  // 2. อัปเดตกล่องรายการ Bug ใต้ Code Editor
  if (result.bugs.length === 0) {
    bugListBox.innerHTML = `<span style="color: var(--ok-green); font-weight: 700;">✅ ${result.summary[currentLang]}</span>`;
  } else {
    bugListBox.innerHTML = result.bugs
      .map(
        (b) => `
        <div style="margin-bottom: 6px;">
          <span class="bug-line-badge">Line ${b.line}</span>
          <code>${b.wrongToken}</code> ➔ <strong><code>${b.correctToken}</code></strong>
        </div>`
      )
      .join("");
  }

  // 3. วาดขา Pin บนบอร์ด Arduino และกระดาษแปะอุปกรณ์ทางขวา
  arduinoPinList.innerHTML = "";
  devicesZone.innerHTML = "";

  if (result.devices.length === 0) {
    devicesZone.innerHTML = `<div class="paper-cutout"><p>${t.noDevices}</p></div>`;
    wireLayer.innerHTML = "";
    return;
  }

  result.devices.forEach((dev, index) => {
    // สร้างช่องเสียบขา Pin บนบอร์ด Arduino
    const pinEl = document.createElement("div");
    pinEl.className = `pin-socket ${dev.hasBug ? "pin-error" : ""}`;
    pinEl.id = `board-pin-${dev.pin}`;
    pinEl.innerHTML = `
      <span>PIN ${dev.pin}</span>
      <span class="pin-dot" id="pin-dot-${dev.pin}"></span>
    `;
    arduinoPinList.appendChild(pinEl);

    // สร้างแผ่นกระดาษฉีกแปะรูปอุปกรณ์ (Torn Paper Cutout)
    const tiltDeg = index % 2 === 0 ? 1.5 : -1.8;
    const wrapper = document.createElement("div");
    wrapper.className = "device-card-wrapper";

    const deviceTitle = t.deviceNames[dev.deviceType] || dev.deviceType.toUpperCase();
    const isInput = dev.deviceType === "button" || dev.deviceType === "sensor";
    const stateLabel = dev.hasBug
      ? t.stateBroken
      : isInput
      ? t.stateWorkingInput
      : t.stateWorkingOn;

    const bugTooltipHtml = dev.hasBug
      ? dev.bugMessages
          .map((b) => `<div class="device-bug-tooltip">❓ ${b.impact[currentLang]}</div>`)
          .join("")
      : "";

    wrapper.innerHTML = `
      ${
        dev.hasBug
          ? `<div class="question-mark-badge" title="${dev.bugMessages[0]?.message[currentLang] || ""}">?</div>`
          : ""
      }
      <div class="paper-cutout device-cutout ${dev.hasBug ? "has-bug" : ""}" style="transform: rotate(${tiltDeg}deg);" id="device-card-${dev.pin}">
        <div class="washi-tape tape-top-center"></div>
        <div class="device-inner">
          <div class="device-terminal-dot" id="dev-dot-${dev.pin}"></div>
          <div class="device-illustration">
            ${getDeviceSVG(dev.deviceType, dev.powerState === "on", dev.hasBug)}
          </div>
          <div class="device-info">
            <div class="device-title">${deviceTitle} (Pin ${dev.pin})</div>
            <div class="device-state-text ${dev.hasBug ? "state-error" : "state-ok"}">
              ${stateLabel}
            </div>
          </div>
        </div>
        ${bugTooltipHtml}
      </div>
    `;

    devicesZone.appendChild(wrapper);
  });

  // 4. ลากเส้นสายไฟเชื่อมระหว่างขาบอร์ด Arduino ไปยังรูปกระดาษแปะอุปกรณ์
  requestAnimationFrame(drawHandDrawnWires);
}

function drawHandDrawnWires() {
  if (!lastAnalysis || !lastAnalysis.devices.length) {
    wireLayer.innerHTML = "";
    return;
  }

  const canvasRect = scrapbookCanvas.getBoundingClientRect();
  let pathsHtml = "";

  lastAnalysis.devices.forEach((dev) => {
    const pinDot = document.getElementById(`pin-dot-${dev.pin}`);
    const devDot = document.getElementById(`dev-dot-${dev.pin}`);
    if (!pinDot || !devDot) return;

    const pRect = pinDot.getBoundingClientRect();
    const dRect = devDot.getBoundingClientRect();

    const x1 = pRect.left + pRect.width / 2 - canvasRect.left;
    const y1 = pRect.top + pRect.height / 2 - canvasRect.top;
    const x2 = dRect.left + dRect.width / 2 - canvasRect.left;
    const y2 = dRect.top + dRect.height / 2 - canvasRect.top;

    const midX = (x1 + x2) / 2;
    const curveOffset = y2 >= y1 ? 28 : -28;

    const dPath = `M ${x1} ${y1} C ${midX} ${y1 + curveOffset}, ${midX} ${y2 - curveOffset}, ${x2} ${y2}`;
    const wireClass = dev.hasBug ? "wire-error" : "wire-ok";

    pathsHtml += `<path d="${dPath}" class="hand-wire ${wireClass}" />`;
  });

  wireLayer.innerHTML = pathsHtml;
}

/**
 * ปุ่มแก้โค้ดให้ถูกต้องอัตโนมัติ (Auto-Fix) เพื่อให้ผู้เรียนเห็นความต่างทันที
 */
function autoFixCode() {
  let code = codeInput.value;
  // แก้คำที่มักพิมพ์ผิดเป็นคำที่ถูกต้อง
  code = code.replace(/\b(pinmode|PinMode)\b/g, "pinMode");
  code = code.replace(/\b(Output|output)\b/g, "OUTPUT");
  code = code.replace(/\b(Input|input)\b/g, "INPUT");
  code = code.replace(/\b(digitalwrite|DigitalWrite)\b/g, "digitalWrite");
  code = code.replace(/\b(digitalread|DigitalRead)\b/g, "digitalRead");
  code = code.replace(/\b(High|high)\b/g, "HIGH");
  code = code.replace(/\b(Low|low)\b/g, "LOW");

  // หากลืมประกาศ pinMode ใน setup() สำหรับขาที่มี digitalWrite
  if (lastAnalysis) {
    lastAnalysis.bugs.forEach((b) => {
      if (b.id.startsWith("bug-missing-pinmode-") && b.pin) {
        code = code.replace(
          /void\s+setup\s*\(\s*\)\s*\{/,
          `void setup() {\n  pinMode(${b.pin}, OUTPUT);`
        );
      }
    });
  }

  codeInput.value = code;
  renderAnalysis();
}

// Event Listeners
codeInput.addEventListener("input", renderAnalysis);
presetSelect.addEventListener("change", (e) => {
  const key = e.target.value;
  if (PRESETS[key]) {
    codeInput.value = PRESETS[key];
    renderAnalysis();
  }
});

btnLangTH.addEventListener("click", () => {
  currentLang = "th";
  btnLangTH.classList.add("active");
  btnLangEN.classList.remove("active");
  updateStaticLabels();
  renderAnalysis();
});

btnLangEN.addEventListener("click", () => {
  currentLang = "en";
  btnLangEN.classList.add("active");
  btnLangTH.classList.remove("active");
  updateStaticLabels();
  renderAnalysis();
});

btnAutoFix.addEventListener("click", autoFixCode);
window.addEventListener("resize", drawHandDrawnWires);

// เริ่มต้นด้วย Preset แรกตามตัวอย่างของผู้ใช้: pinMode(4, Output);
codeInput.value = PRESETS.output_typo;
updateStaticLabels();
renderAnalysis();
