/**
 * IoT Help Beginner - Desktop Companion & Paper-Scrapbook Circuit App
 * ออกแบบในสไตล์ Cute Paper-Scrapbook Minimalist (โปร่ง โล่ง ข้อความกระชับ ใช้งานง่าย)
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

  if_assignment_bug: `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  // Bug ยอดฮิต: เผลอใช้ = ตัวเดียวแทน == ในเงื่อนไข if
  if (buttonState = HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`,

  ultrasonic_demo: `const int trigPin = 9;
const int echoPin = 10;
const int ledPin = 13;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // ส่งคลื่นเสียง Ultrasonic (HC-SR04)
  digitalWrite(trigPin, LOW);
  delay(2);
  digitalWrite(trigPin, HIGH);
  delay(10);
  digitalWrite(trigPin, LOW);

  // หลอดไฟ LED กะพริบแจ้งเตือน
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
}`,

  dht11_lcd_buzzer: `#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int buzzerPin = 8;
const int dhtPin = 7;

void setup() {
  lcd.begin(16, 2);
  lcd.print("Temp: 28.5C");
  pinMode(buzzerPin, OUTPUT);
  pinMode(dhtPin, INPUT);
}

void loop() {
  // สั่งส่งเสียงเตือนบี๊บๆ จากลำโพง Buzzer
  tone(buzzerPin, 1000);
  delay(200);
  noTone(buzzerPin);
  delay(800);
}`,

  clean_working: `void setup() {
  pinMode(4, OUTPUT);
  pinMode(2, INPUT);
}

void loop() {
  int btn = digitalRead(2);
  digitalWrite(4, HIGH);
  delay(1000);
  digitalWrite(4, LOW);
  delay(1000);
}`,
};

const UI_TEXT = {
  th: {
    subtitle: "คู่หูตรวจโค้ด Arduino",
    howToBtn: "❓ วิธีใช้",
    howToTitle: "🚀 วิธีใช้งานคู่กับ Arduino IDE ใน 3 ขั้นตอน",
    closeGuide: "✕ ปิด",
    watchingLabel: "ซิงค์:",
    pickFileBtn: "📂 เปิดไฟล์",
    toggleCodeHide: "📝 ซ่อนโค้ด",
    toggleCodeShow: "📝 ดูโค้ด",
    miniModeBtnOff: "📌 ย่อเกาะจอ",
    miniModeBtnOn: "📐 ขยายเต็มจอ",
    expandCircuitBtn: "🔍 ดูวงจร (?)",
    saveBtn: "💾 เซฟลงไฟล์",
    mascotName: "คู่หูตรวจโค้ด",
    statusBug: "พบจุดผิด",
    statusOk: "โค้ดถูกต้อง!",
    autoFix: "✨ แก้ทันที",
    boardTitle: "📌 กระดานวงจรกระดาษแปะ",
    boardNote: "",
    pinRailTitle: "ขาที่ใช้งาน (Pins)",
    deviceNames: {
      led: "หลอดไฟ LED",
      button: "ปุ่มกด",
      sensor: "เซนเซอร์",
      servo: "เซอร์โวมอเตอร์",
      buzzer: "ลำโพง Buzzer",
      relay: "โมดูลรีเลย์",
      ultrasonic: "Ultrasonic HC-SR04",
      dht11: "เซนเซอร์ DHT11",
      lcd_i2c: "จอ LCD I2C 16x2",
    },
    stateWorkingOn: "⚡ ทำงานปกติ",
    stateWorkingInput: "✅ พร้อมรับค่า",
    stateBroken: "❌ พบจุดผิดในโค้ด",
    noDevices: "ยังไม่มีการเรียกใช้ขา Pin ในโค้ด ลองเขียน pinMode หรือ digitalWrite ดูสิ!",
    simStart: "▶️ รันวงจร",
    simStop: "⏹️ หยุด",
    simSoundOn: "🔊 เสียง",
    simSoundOff: "🔇 ปิดเสียง",
    simStatusReady: "พร้อมจำลอง",
    simStatusRunning: "⚡ กำลังรัน...",
  },
  en: {
    subtitle: "Arduino Companion",
    howToBtn: "❓ Guide",
    howToTitle: "🚀 How to Use Alongside Arduino IDE in 3 Easy Steps",
    closeGuide: "✕ Close",
    watchingLabel: "Sync:",
    pickFileBtn: "📂 Open .ino",
    toggleCodeHide: "📝 Hide Code",
    toggleCodeShow: "📝 Show Code",
    miniModeBtnOff: "📌 Mini Mode",
    miniModeBtnOn: "📐 Full View",
    expandCircuitBtn: "🔍 View Circuit (?)",
    saveBtn: "💾 Save",
    mascotName: "IoT Buddy",
    statusBug: "Bug Found",
    statusOk: "All Good!",
    autoFix: "✨ Auto-Fix",
    boardTitle: "📌 Paper-Scrapbook Circuit",
    boardNote: "",
    pinRailTitle: "Active Pins",
    deviceNames: {
      led: "LED Light",
      button: "Push Button",
      sensor: "Analog Sensor",
      servo: "Servo Motor",
      buzzer: "Piezo Buzzer",
      relay: "Relay Module",
      ultrasonic: "Ultrasonic HC-SR04",
      dht11: "DHT11 Sensor",
      lcd_i2c: "16x2 LCD I2C",
    },
    stateWorkingOn: "⚡ Working",
    stateWorkingInput: "✅ Ready",
    stateBroken: "❌ Code Bug",
    noDevices: "No pins detected yet. Try adding pinMode() or digitalWrite()!",
    simStart: "▶️ Run Sim",
    simStop: "⏹️ Stop",
    simSoundOn: "🔊 Sound",
    simSoundOff: "🔇 Muted",
    simStatusReady: "Ready",
    simStatusRunning: "⚡ Running...",
  },
};

let currentLang = "th";
let lastAnalysis = null;
let isMiniMode = false;
let isCodeHidden = false;
let currentWatchedPath = "";
let lastSyncedMtime = 0;
let isUserTyping = false;
let typingTimer = null;

// Simulation State
let isSimulating = false;
let simTimer = null;
let simStepIndex = 0;
let isSoundEnabled = true;
let audioCtx = null;
const simulatedDeviceStates = new Map();

const mainWorkspace = document.getElementById("mainWorkspace");
const codeInput = document.getElementById("codeInput");
const lineNumbers = document.getElementById("lineNumbers");
const presetSelect = document.getElementById("presetSelect");
const recentFilesSelect = document.getElementById("recentFilesSelect");
const btnPickFile = document.getElementById("btnPickFile");
const btnToggleCode = document.getElementById("btnToggleCode");
const btnToggleMini = document.getElementById("btnToggleMini");
const btnHowTo = document.getElementById("btnHowTo");
const btnCloseHowTo = document.getElementById("btnCloseHowTo");
const howToCard = document.getElementById("howToCard");
const btnExpandCircuit = document.getElementById("btnExpandCircuit");
const btnSaveCode = document.getElementById("btnSaveCode");
const currentFileName = document.getElementById("currentFileName");
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
const btnSimulate = document.getElementById("btnSimulate");
const btnToggleSound = document.getElementById("btnToggleSound");
const simStatusBadge = document.getElementById("simStatusBadge");

/**
 * เล่นเสียงสังเคราะห์ Buzzer ด้วย Web Audio API
 */
function playBuzzerSound(freq = 1000, durationMs = 200) {
  if (!isSoundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + durationMs / 1000);
  } catch (err) {
    console.warn("Audio Context warning:", err);
  }
}

/**
 * สร้าง SVG ภาพประกอบอุปกรณ์ในรูปแบบกระดาษฉีกแปะ (Paper Scrapbook Art)
 */
function getDeviceSVG(deviceType, isOn, hasBug, extraData = {}) {
  if (deviceType === "button") {
    const ringColor = hasBug ? "#d90429" : isOn ? "#ffb703" : "#2b9348";
    return `
      <svg viewBox="0 0 80 80" width="66" height="66" class="scrapbook-svg">
        <rect x="12" y="16" width="56" height="48" rx="8" fill="#ced4da" stroke="#495057" stroke-width="3"/>
        <circle cx="40" cy="40" r="16" fill="${ringColor}" stroke="#212529" stroke-width="3" style="cursor: pointer;"/>
        <circle cx="36" cy="36" r="4" fill="rgba(255,255,255,0.7)"/>
      </svg>
    `;
  }

  if (deviceType === "ultrasonic") {
    const waveColor = isOn && !hasBug ? "#3a86ff" : "transparent";
    return `
      <svg viewBox="0 0 110 80" width="88" height="66" class="scrapbook-svg">
        <rect x="10" y="18" width="90" height="48" rx="6" fill="#1d3557" stroke="#457b9d" stroke-width="3"/>
        <circle cx="28" cy="62" r="3" fill="#e9c46a"/>
        <circle cx="44" cy="62" r="3" fill="#e9c46a"/>
        <circle cx="66" cy="62" r="3" fill="#e9c46a"/>
        <circle cx="82" cy="62" r="3" fill="#e9c46a"/>
        <circle cx="34" cy="38" r="16" fill="#adb5bd" stroke="#212529" stroke-width="3"/>
        <circle cx="34" cy="38" r="10" fill="#6c757d"/>
        <text x="34" y="42" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">T</text>
        <circle cx="76" cy="38" r="16" fill="#adb5bd" stroke="#212529" stroke-width="3"/>
        <circle cx="76" cy="38" r="10" fill="#6c757d"/>
        <text x="76" y="42" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">R</text>
        ${
          isOn && !hasBug
            ? `<path d="M 52 24 A 18 18 0 0 1 52 52" stroke="${waveColor}" stroke-width="3" fill="none" stroke-linecap="round" class="pulse-wave"/>
               <path d="M 58 18 A 26 26 0 0 1 58 58" stroke="${waveColor}" stroke-width="3" fill="none" stroke-linecap="round" class="pulse-wave-2"/>`
            : ""
        }
      </svg>
    `;
  }

  if (deviceType === "dht11") {
    const gridColor = isOn && !hasBug ? "#00b4d8" : "#90e0ef";
    return `
      <svg viewBox="0 0 80 80" width="66" height="66" class="scrapbook-svg">
        <rect x="18" y="12" width="44" height="52" rx="4" fill="${gridColor}" stroke="#0077b6" stroke-width="3"/>
        <line x1="26" y1="22" x2="54" y2="22" stroke="#03045e" stroke-width="2"/>
        <line x1="26" y1="30" x2="54" y2="30" stroke="#03045e" stroke-width="2"/>
        <line x1="26" y1="38" x2="54" y2="38" stroke="#03045e" stroke-width="2"/>
        <line x1="26" y1="46" x2="54" y2="46" stroke="#03045e" stroke-width="2"/>
        <line x1="26" y1="64" x2="26" y2="76" stroke="#6c757d" stroke-width="3"/>
        <line x1="35" y1="64" x2="35" y2="76" stroke="#6c757d" stroke-width="3"/>
        <line x1="45" y1="64" x2="45" y2="76" stroke="#6c757d" stroke-width="3"/>
        <line x1="54" y1="64" x2="54" y2="76" stroke="#6c757d" stroke-width="3"/>
      </svg>
    `;
  }

  if (deviceType === "lcd_i2c") {
    const lineTexts = extraData.lines || ["Temp: 28.5C", "IoT Buddy"];
    const line1 = (lineTexts[0] || "IoT Ready!").substring(0, 16);
    const line2 = (lineTexts[1] || "").substring(0, 16);
    const screenBg = isOn && !hasBug ? "#52b788" : "#95d5b2";
    return `
      <svg viewBox="0 0 130 80" width="108" height="66" class="scrapbook-svg">
        <rect x="8" y="10" width="114" height="60" rx="6" fill="#1b4332" stroke="#2d6a4f" stroke-width="3"/>
        <rect x="18" y="16" width="94" height="46" rx="4" fill="${screenBg}" stroke="#081c15" stroke-width="2"/>
        <text x="24" y="32" font-family="'Courier New', monospace" font-size="9" font-weight="900" fill="#081c15">${line1}</text>
        <text x="24" y="48" font-family="'Courier New', monospace" font-size="9" font-weight="900" fill="#081c15">${line2}</text>
      </svg>
    `;
  }

  if (deviceType === "buzzer") {
    const isBeeping = isOn && !hasBug;
    return `
      <svg viewBox="0 0 80 80" width="66" height="66" class="scrapbook-svg">
        <circle cx="40" cy="40" r="26" fill="#212529" stroke="#495057" stroke-width="4"/>
        <circle cx="40" cy="40" r="9" fill="#000"/>
        <circle cx="40" cy="40" r="4" fill="#343a40"/>
        <text x="26" y="30" font-size="12" font-weight="900" fill="#e9ecef">+</text>
        ${
          isBeeping
            ? `<path d="M 68 28 A 16 16 0 0 1 68 52" stroke="#f72585" stroke-width="3" fill="none" class="buzzer-pulse"/>
               <path d="M 74 20 A 24 24 0 0 1 74 60" stroke="#f72585" stroke-width="3" fill="none" class="buzzer-pulse-2"/>`
            : ""
        }
      </svg>
    `;
  }

  if (deviceType === "servo") {
    return `
      <svg viewBox="0 0 80 80" width="66" height="66" class="scrapbook-svg">
        <rect x="16" y="24" width="48" height="40" rx="4" fill="#0077b6" stroke="#023e8a" stroke-width="3"/>
        <circle cx="34" cy="24" r="10" fill="#ced4da" stroke="#495057" stroke-width="2"/>
        <rect x="30" y="10" width="28" height="8" rx="4" fill="#fff" stroke="#212529" stroke-width="2" transform="${
          isOn ? "rotate(45 34 24)" : "rotate(0 34 24)"
        }"/>
      </svg>
    `;
  }

  if (deviceType === "relay") {
    return `
      <svg viewBox="0 0 80 80" width="66" height="66" class="scrapbook-svg">
        <rect x="14" y="16" width="52" height="48" rx="6" fill="#0077b6" stroke="#03045e" stroke-width="3"/>
        <circle cx="26" cy="28" r="4" fill="${isOn ? "#52b788" : "#6c757d"}"/>
        <text x="40" y="44" font-size="10" font-weight="900" fill="#fff" text-anchor="middle">RELAY</text>
      </svg>
    `;
  }

  if (deviceType === "sensor") {
    return `
      <svg viewBox="0 0 80 80" width="66" height="66" class="scrapbook-svg">
        <circle cx="40" cy="40" r="22" fill="#adb5bd" stroke="#495057" stroke-width="3"/>
        <path d="M 28 34 Q 40 26 52 34 Q 40 44 28 46 Q 40 54 52 46" stroke="#d90429" stroke-width="3" fill="none"/>
      </svg>
    `;
  }

  if (hasBug || !isOn) {
    return `
      <svg viewBox="0 0 80 80" width="64" height="64" class="scrapbook-svg">
        <line x1="33" y1="54" x2="33" y2="75" stroke="#6c757d" stroke-width="4" stroke-linecap="round"/>
        <line x1="47" y1="54" x2="47" y2="70" stroke="#6c757d" stroke-width="4" stroke-linecap="round"/>
        <path d="M22 52 L22 32 A18 18 0 0 1 58 32 L58 52 Z" fill="#adb5bd" stroke="#495057" stroke-width="3"/>
        <rect x="19" y="50" width="42" height="6" rx="2" fill="#6c757d" stroke="#495057" stroke-width="2"/>
        <text x="40" y="41" text-anchor="middle" fill="#343a40" font-size="13" font-weight="bold">${hasBug ? "x_x" : "off"}</text>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 80 80" width="64" height="64" class="scrapbook-svg led-glowing">
      <defs>
        <radialGradient id="ledGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#fff3b0"/>
          <stop offset="55%" stop-color="#ffbe0b"/>
          <stop offset="100%" stop-color="rgba(255,190,11,0)"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="34" r="32" fill="url(#ledGlow)" class="glow-circle"/>
      <line x1="33" y1="54" x2="33" y2="75" stroke="#495057" stroke-width="4" stroke-linecap="round"/>
      <line x1="47" y1="54" x2="47" y2="70" stroke="#495057" stroke-width="4" stroke-linecap="round"/>
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
  if (btnHowTo) btnHowTo.textContent = t.howToBtn;
  if (document.getElementById("howToTitle")) document.getElementById("howToTitle").textContent = t.howToTitle;
  if (btnCloseHowTo) btnCloseHowTo.textContent = t.closeGuide;
  document.getElementById("watchingLabel").textContent = t.watchingLabel;
  btnPickFile.textContent = t.pickFileBtn;
  if (btnToggleCode) {
    btnToggleCode.textContent = isCodeHidden ? t.toggleCodeShow : t.toggleCodeHide;
  }
  btnToggleMini.textContent = isMiniMode ? t.miniModeBtnOn : t.miniModeBtnOff;
  btnExpandCircuit.textContent = t.expandCircuitBtn;
  btnSaveCode.textContent = t.saveBtn;
  document.getElementById("mascotNameTag").textContent = t.mascotName;
  btnAutoFix.textContent = t.autoFix;
  document.getElementById("boardTitle").textContent = t.boardTitle;
  document.getElementById("boardNote").textContent = t.boardNote;
  document.getElementById("pinRailTitle").textContent = t.pinRailTitle;
  if (btnSimulate) btnSimulate.textContent = isSimulating ? t.simStop : t.simStart;
  if (btnToggleSound) btnToggleSound.textContent = isSoundEnabled ? t.simSoundOn : t.simSoundOff;
  if (simStatusBadge && !isSimulating) simStatusBadge.textContent = t.simStatusReady;
}

function renderAnalysis() {
  updateLineNumbers();
  const code = codeInput.value;
  const result = window.IoTAnalyzer.analyzeArduinoCode(code);
  lastAnalysis = result;
  const t = UI_TEXT[currentLang];

  // 1. Mascot Post-it Note (กระชับ ชัดเจน รวมจุดแก้ไว้ในที่เดียว)
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
        (b) => `
        <div class="speech-item">
          <div><strong>บรรทัด ${b.line}:</strong> ${b.message[currentLang]}</div>
          <span class="fix-inline-chip"><code>${b.wrongToken}</code> ➔ <strong><code>${b.correctToken}</code></strong></span>
        </div>`
      )
      .join("");
  }

  // 2. Paper-Scrapbook Circuit Stage
  arduinoPinList.innerHTML = "";
  devicesZone.innerHTML = "";

  if (result.devices.length === 0) {
    devicesZone.innerHTML = `<div class="paper-cutout"><p>${t.noDevices}</p></div>`;
    wireLayer.innerHTML = "";
    return;
  }

  result.devices.forEach((dev, index) => {
    const pinEl = document.createElement("div");
    pinEl.className = `pin-socket ${dev.hasBug ? "pin-error" : ""}`;
    pinEl.id = `board-pin-${dev.pin}`;
    pinEl.innerHTML = `
      <span>PIN ${dev.pin}</span>
      <span class="pin-dot" id="pin-dot-${dev.pin}"></span>
    `;
    arduinoPinList.appendChild(pinEl);

    const tiltDeg = index % 2 === 0 ? 1.2 : -1.4;
    const wrapper = document.createElement("div");
    wrapper.className = "device-card-wrapper";

    const deviceTitle = t.deviceNames[dev.deviceType] || dev.deviceType.toUpperCase();
    const isInput = dev.deviceType === "button" || dev.deviceType === "sensor";

    const isDeviceOn = simulatedDeviceStates.has(dev.pin)
      ? simulatedDeviceStates.get(dev.pin).powerState === "on"
      : dev.powerState === "on";

    const stateLabel = dev.hasBug
      ? t.stateBroken
      : isInput
      ? t.stateWorkingInput
      : isDeviceOn
      ? t.stateWorkingOn
      : "⏹️ ปิดอยู่ (OFF)";

    let extraBadge = "";
    if (dev.deviceType === "dht11") {
      extraBadge = `<div class="device-readout-pill">🌡️ 28.5°C &nbsp;|&nbsp; 💧 65%</div>`;
    } else if (dev.deviceType === "ultrasonic") {
      extraBadge = `<div class="device-readout-pill">📏 24 cm</div>`;
    }

    const hoverTip = dev.hasBug
      ? dev.bugMessages.map((b) => b.impact[currentLang]).join(" • ")
      : "";

    wrapper.innerHTML = `
      ${
        dev.hasBug
          ? `<div class="question-mark-badge" title="${hoverTip}">?</div>`
          : ""
      }
      <div class="paper-cutout device-cutout ${dev.hasBug ? "has-bug" : ""} ${isDeviceOn ? "device-active" : ""}" style="transform: rotate(${tiltDeg}deg);" id="device-card-${dev.pin}" title="${hoverTip}">
        <div class="washi-tape tape-top-center"></div>
        <div class="device-inner">
          <div class="device-terminal-dot" id="dev-dot-${dev.pin}"></div>
          <div class="device-illustration" id="dev-illu-${dev.pin}">
            ${getDeviceSVG(dev.deviceType, isDeviceOn, dev.hasBug, dev.extraData)}
          </div>
          <div class="device-info">
            <div class="device-title">${deviceTitle} <span style="font-weight:600; color:var(--ink-muted); font-size:0.8rem;">(Pin ${dev.pin})</span></div>
            <div class="device-state-text ${dev.hasBug ? "state-error" : isDeviceOn ? "state-ok" : "state-muted"}" id="dev-state-${dev.pin}">
              ${stateLabel}
            </div>
            ${extraBadge}
          </div>
        </div>
      </div>
    `;

    devicesZone.appendChild(wrapper);
  });

  if (!isMiniMode) {
    requestAnimationFrame(drawHandDrawnWires);
  }
}

function drawHandDrawnWires() {
  if (isMiniMode || !lastAnalysis || !lastAnalysis.devices.length) {
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
 * บันทึกโค้ดลงไฟล์ .ino จริงในเครื่อง
 */
async function saveCodeToInoFile(codeToSave) {
  try {
    const res = await fetch("/api/save-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeToSave }),
    });
    if (res.ok) {
      const state = await res.json();
      lastSyncedMtime = state.mtimeMs;
    }
  } catch (_) {}
}

/**
 * แก้โค้ดให้ถูกต้องอัตโนมัติ และบันทึกกลับลงไฟล์ .ino ทันที
 */
async function autoFixCode() {
  let code = codeInput.value;
  code = code.replace(/\b(pinmode|PinMode)\b/g, "pinMode");
  code = code.replace(/\b(Output|output)\b/g, "OUTPUT");
  code = code.replace(/\b(Input|input)\b/g, "INPUT");
  code = code.replace(/\b(digitalwrite|DigitalWrite)\b/g, "digitalWrite");
  code = code.replace(/\b(digitalread|DigitalRead)\b/g, "digitalRead");
  code = code.replace(/\b(High|high)\b/g, "HIGH");
  code = code.replace(/\b(Low|low)\b/g, "LOW");
  code = code.replace(/\b(Tone)\b/g, "tone");

  code = code.replace(
    /\bif\s*\(\s*([A-Za-z0-9_\(\)]+)\s*(?<![!=<>+*\/\-%&|^])=(?![=])\s*([A-Za-z0-9_]+)\s*\)/g,
    "if ($1 == $2)"
  );

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
  await saveCodeToInoFile(code);
}

/**
 * ระบบจำลองการทำงานจริง (Live Simulation Engine)
 */
function startSimulation() {
  if (!lastAnalysis) return;
  isSimulating = true;
  simStepIndex = 0;
  btnSimulate.textContent = UI_TEXT[currentLang].simStop;
  btnSimulate.classList.add("active");
  simStatusBadge.textContent = UI_TEXT[currentLang].simStatusRunning;
  simStatusBadge.classList.add("badge-running");

  runNextSimulationStep();
}

function stopSimulation() {
  isSimulating = false;
  clearTimeout(simTimer);
  btnSimulate.textContent = UI_TEXT[currentLang].simStart;
  btnSimulate.classList.remove("active");
  simStatusBadge.textContent = UI_TEXT[currentLang].simStatusReady;
  simStatusBadge.classList.remove("badge-running");

  simulatedDeviceStates.clear();
  renderAnalysis();
}

function runNextSimulationStep() {
  if (!isSimulating || !lastAnalysis) return;

  const steps = lastAnalysis.simulationSteps;
  if (!steps || steps.length === 0) {
    simStatusBadge.textContent = "ทำงานค้าง (Static)";
    return;
  }

  if (simStepIndex >= steps.length) {
    simStepIndex = 0;
  }

  const step = steps[simStepIndex];
  simStepIndex++;

  let nextDelayMs = 400;

  if (step.type === "digitalWrite") {
    const isHigh = step.value === "HIGH";
    simulatedDeviceStates.set(step.pin, { powerState: isHigh ? "on" : "off" });
    updateDeviceSimulationView(step.pin, isHigh);

    const dev = lastAnalysis.devices.find((d) => d.pin === String(step.pin));
    if (dev && dev.deviceType === "buzzer" && isHigh) {
      playBuzzerSound(1000, 200);
    }
  } else if (step.type === "tone") {
    simulatedDeviceStates.set(step.pin, { powerState: "on" });
    updateDeviceSimulationView(step.pin, true);
    playBuzzerSound(step.freq || 880, step.duration || 200);
  } else if (step.type === "noTone") {
    simulatedDeviceStates.set(step.pin, { powerState: "off" });
    updateDeviceSimulationView(step.pin, false);
  } else if (step.type === "delay") {
    nextDelayMs = Math.max(200, Math.min(step.ms, 2500));
    simStatusBadge.textContent = `⏱️ ${step.ms}ms`;
  }

  simTimer = setTimeout(runNextSimulationStep, nextDelayMs);
}

function updateDeviceSimulationView(pinKey, isOn) {
  const illuEl = document.getElementById(`dev-illu-${pinKey}`);
  const stateEl = document.getElementById(`dev-state-${pinKey}`);
  const cardEl = document.getElementById(`device-card-${pinKey}`);
  const dev = lastAnalysis?.devices.find((d) => d.pin === String(pinKey));

  if (dev && illuEl) {
    illuEl.innerHTML = getDeviceSVG(dev.deviceType, isOn, dev.hasBug, dev.extraData);
  }

  if (stateEl) {
    stateEl.textContent = isOn ? UI_TEXT[currentLang].stateWorkingOn : "⏹️ ปิดอยู่ (OFF)";
    stateEl.className = `device-state-text ${isOn ? "state-ok" : "state-muted"}`;
  }

  if (cardEl) {
    if (isOn) {
      cardEl.classList.add("device-active");
    } else {
      cardEl.classList.remove("device-active");
    }
  }
}

/**
 * สลับการซ่อน/แสดงกล่องโค้ด เพื่อเปิดพื้นที่กระดานวงจรเต็มจอ 100%
 */
function toggleCodePanel() {
  isCodeHidden = !isCodeHidden;
  if (mainWorkspace) {
    mainWorkspace.classList.toggle("code-hidden", isCodeHidden);
  }
  if (btnToggleCode) {
    btnToggleCode.classList.toggle("active", isCodeHidden);
  }
  updateStaticLabels();
  setTimeout(drawHandDrawnWires, 60);
}

/**
 * สลับระหว่างโหมดหน้าต่างเล็กเกาะขอบจอคู่กับ Arduino IDE (Mini Mode) และโหมดดูวงจรเต็มจอ
 */
async function setMiniMode(enable) {
  isMiniMode = enable;
  if (isMiniMode) {
    document.body.classList.add("mini-mode");
    btnToggleMini.classList.add("active");
    btnExpandCircuit.style.display = "inline-block";
    try {
      window.resizeTo(460, 260);
      window.moveTo(window.screen.availWidth - 480, window.screen.availHeight - 300);
    } catch (_) {}
  } else {
    document.body.classList.remove("mini-mode");
    btnToggleMini.classList.remove("active");
    btnExpandCircuit.style.display = "none";
    try {
      window.resizeTo(1200, 780);
      window.moveTo(
        Math.max(20, (window.screen.availWidth - 1200) / 2),
        Math.max(20, (window.screen.availHeight - 780) / 2)
      );
    } catch (_) {}
    setTimeout(drawHandDrawnWires, 120);
  }
  updateStaticLabels();

  try {
    await fetch("/api/window-topmost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topMost: isMiniMode }),
    });
  } catch (_) {}
}

/**
 * ซิงค์ไฟล์ .ino ล่าสุดจากเซิร์ฟเวอร์
 */
async function pollArduinoFileState() {
  if (isUserTyping) return;
  try {
    const res = await fetch("/api/state");
    if (!res.ok) return;
    const state = await res.json();

    currentFileName.textContent = state.watchedFileName || "blink_bug.ino";
    currentFileName.title = state.watchedFilePath || "";

    if (Array.isArray(state.recentFiles)) {
      const currentOptions = Array.from(recentFilesSelect.options).map((o) => o.value);
      const newPaths = state.recentFiles.map((f) => f.path);
      if (JSON.stringify(currentOptions.slice(1)) !== JSON.stringify(newPaths)) {
        recentFilesSelect.innerHTML = `<option value="">🕒 ไฟล์ล่าสุด (${newPaths.length})</option>`;
        state.recentFiles.forEach((f) => {
          const opt = document.createElement("option");
          opt.value = f.path;
          opt.textContent = `${f.isExample ? "🧪" : "📄"} ${f.name}`;
          if (f.path === state.watchedFilePath) opt.selected = true;
          recentFilesSelect.appendChild(opt);
        });
      }
    }

    if (
      state.watchedFilePath !== currentWatchedPath ||
      state.mtimeMs !== lastSyncedMtime
    ) {
      currentWatchedPath = state.watchedFilePath;
      lastSyncedMtime = state.mtimeMs;
      if (typeof state.code === "string" && state.code !== codeInput.value) {
        codeInput.value = state.code;
        renderAnalysis();
      }
    }
  } catch (_) {}
}

// Event Listeners & Scroll Sync
codeInput.addEventListener("scroll", () => {
  lineNumbers.scrollTop = codeInput.scrollTop;
});

let inputDebounceTimer = null;
codeInput.addEventListener("input", () => {
  isUserTyping = true;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isUserTyping = false;
  }, 2000);
  updateLineNumbers();
  clearTimeout(inputDebounceTimer);
  inputDebounceTimer = setTimeout(renderAnalysis, 80);
});

btnSaveCode.addEventListener("click", async () => {
  await saveCodeToInoFile(codeInput.value);
});

btnPickFile.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/pick-file", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.state && data.state.code) {
        currentWatchedPath = data.state.watchedFilePath;
        lastSyncedMtime = data.state.mtimeMs;
        currentFileName.textContent = data.state.watchedFileName;
        codeInput.value = data.state.code;
        renderAnalysis();
      }
    }
  } catch (_) {}
});

recentFilesSelect.addEventListener("change", async (e) => {
  const filePath = e.target.value;
  if (!filePath) return;
  try {
    const res = await fetch("/api/select-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath, autoSwitch: false }),
    });
    if (res.ok) {
      const state = await res.json();
      currentWatchedPath = state.watchedFilePath;
      lastSyncedMtime = state.mtimeMs;
      currentFileName.textContent = state.watchedFileName;
      codeInput.value = state.code;
      renderAnalysis();
    }
  } catch (_) {}
});

presetSelect.addEventListener("change", (e) => {
  const key = e.target.value;
  if (PRESETS[key]) {
    stopSimulation();
    codeInput.value = PRESETS[key];
    renderAnalysis();
  }
});

btnSimulate.addEventListener("click", () => {
  if (isSimulating) {
    stopSimulation();
  } else {
    startSimulation();
  }
});

btnToggleSound.addEventListener("click", () => {
  isSoundEnabled = !isSoundEnabled;
  btnToggleSound.textContent = isSoundEnabled
    ? UI_TEXT[currentLang].simSoundOn
    : UI_TEXT[currentLang].simSoundOff;
  btnToggleSound.classList.toggle("sound-muted", !isSoundEnabled);

  if (isSoundEnabled) {
    playBuzzerSound(880, 150);
  }
});

if (btnToggleCode) {
  btnToggleCode.addEventListener("click", toggleCodePanel);
}

btnToggleMini.addEventListener("click", () => {
  setMiniMode(!isMiniMode);
});

if (btnHowTo && howToCard) {
  btnHowTo.addEventListener("click", () => {
    howToCard.style.display = howToCard.style.display === "none" ? "block" : "none";
    setTimeout(drawHandDrawnWires, 60);
  });
}

if (btnCloseHowTo && howToCard) {
  btnCloseHowTo.addEventListener("click", () => {
    howToCard.style.display = "none";
    setTimeout(drawHandDrawnWires, 60);
  });
}

btnExpandCircuit.addEventListener("click", () => {
  setMiniMode(false);
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

// เริ่มต้นโปรแกรม
codeInput.value = PRESETS.output_typo;
updateStaticLabels();
renderAnalysis();
pollArduinoFileState();
setInterval(pollArduinoFileState, 1200);
