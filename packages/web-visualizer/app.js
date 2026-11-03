/**
 * IoT Help Beginner - Desktop Companion & 2D Interactive Breadboard App
 * ออกแบบในสไตล์ Cute Paper-Scrapbook Minimalist (โปร่ง โล่ง มีเบรดบอร์ด 2D ให้ทดลองต่อจริง รองรับ Arduino Uno & ESP32)
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

  esp32_wifi_bug: `#include <WiFi.h>

const int ledPin = 34;    // Bug 1: ขา 34 ของ ESP32 เป็นขา Input-Only สั่งจ่ายไฟออกไม่ได้!
const int sensorPin = 4;  // Bug 2: ขา 4 อยู่บนวงจร ADC2 ซึ่งใช้ analogRead ไม่ได้เมื่อเปิด WiFi!

void setup() {
  // Bug 3: ลืมใส่ Serial.begin(115200);
  WiFi.begin("MyHomeWiFi", "12345678");
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int val = analogRead(sensorPin);
  Serial.println(val);
  digitalWrite(ledPin, HIGH);
  delay(500);
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
    subtitle: "คู่หูตรวจโค้ด Arduino & ESP32",
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
    statusOk: "ต่อวงจรครบ!",
    autoFix: "✨ แก้ทันที",
    boardTitle: "📌 โต๊ะทดลองเบรดบอร์ด 2D",
    boardNoteUno: "บอร์ด: Arduino Uno (5V)",
    boardNoteEsp32: "บอร์ด: ESP32 Wi-Fi (3.3V)",
    pinRailTitle: "ขาที่ใช้งาน (Pins)",
    bbExplorerTitle: "🔍 รูเบรดบอร์ดเชื่อมกันยังไง? (ชี้ที่รูเพื่อดูแนวไฟ)",
    bbHoverDefault: "💡 ชี้เมาส์ที่รูเบรดบอร์ดด้านล่างเพื่อดูว่าช่องไหนเชื่อมถึงกัน",
    trayTitle: "🧰 หยิบอุปกรณ์ 2D มาเสียบบนเบรดบอร์ด:",
    deviceNames: {
      led: "หลอดไฟ LED + ตัวต้านทาน 220Ω",
      button: "ปุ่มกด (Push Button)",
      sensor: "เซนเซอร์อนาล็อก (Sensor)",
      servo: "เซอร์โวมอเตอร์ (Servo)",
      buzzer: "ลำโพงเปียโซ (Buzzer)",
      relay: "โมดูลรีเลย์ (Relay)",
      ultrasonic: "เซนเซอร์วัดระยะ Ultrasonic",
      dht11: "เซนเซอร์อุณหภูมิ DHT11",
      lcd_i2c: "จอภาพ LCD I2C 16x2",
    },
    stateWorkingOn: "⚡ ทำงานปกติ (ไฟเข้าครบ)",
    stateWorkingInput: "✅ พร้อมรับค่าสัญญาณ",
    stateBroken: "❌ พบจุดผิดในโค้ด",
    stateUnplugged: "🔌 สายไฟบนเบรดบอร์ดหลุด! (กดเสียบสายด้านล่าง)",
    noDevices: "ยังไม่มีอุปกรณ์บนเบรดบอร์ด กดปุ่ม '+ อุปกรณ์' ที่ถาดด้านล่าง หรือพิมพ์โค้ดได้เลย!",
    simStart: "▶️ รันวงจร",
    simStop: "⏹️ หยุด",
    simSoundOn: "🔊 เสียง",
    simSoundOff: "🔇 ปิดเสียง",
    simStatusReady: "พร้อมจำลอง",
    simStatusRunning: "⚡ กำลังรัน...",
  },
  en: {
    subtitle: "Arduino & ESP32 Companion",
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
    statusBug: "Issue Found",
    statusOk: "All Good!",
    autoFix: "✨ Auto-Fix",
    boardTitle: "📌 2D Breadboard Lab",
    boardNoteUno: "Board: Arduino Uno (5V)",
    boardNoteEsp32: "Board: ESP32 Wi-Fi (3.3V)",
    pinRailTitle: "Active Pins",
    bbExplorerTitle: "🔍 How do Breadboard holes connect? (Hover below)",
    bbHoverDefault: "💡 Hover over any column below to see the 5 connected holes",
    trayTitle: "🧰 Add 2D Component to Breadboard:",
    deviceNames: {
      led: "LED + 220Ω Resistor",
      button: "Push Button",
      sensor: "Analog Sensor",
      servo: "Servo Motor",
      buzzer: "Piezo Buzzer",
      relay: "Relay Module",
      ultrasonic: "Ultrasonic HC-SR04",
      dht11: "DHT11 Temp Sensor",
      lcd_i2c: "16x2 LCD I2C",
    },
    stateWorkingOn: "⚡ Working Properly",
    stateWorkingInput: "✅ Ready for Input",
    stateBroken: "❌ Code Bug Found",
    stateUnplugged: "🔌 Breadboard Wire Unplugged!",
    noDevices: "No components on breadboard yet. Click '+ Component' on the bottom tray!",
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
let forcedBoardMode = "auto"; // "auto" | "uno" | "esp32"
let isMiniMode = false;
let isCodeHidden = false;
let currentWatchedPath = "";
let lastSyncedMtime = 0;
let isUserTyping = false;
let typingTimer = null;

// Interactive 2D Breadboard State (จำลองเสียบ/ถอดสายไฟ และปรับค่าอุปกรณ์ 2D บนเบรดบอร์ด)
const breadboardWireState = new Map(); // pin -> { vcc: true, gnd: true }
const interactiveSensorValues = {
  buttonPressed: false,
  ultrasonicCm: 24,
  dhtTempC: 28.5,
};

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
const arduinoPinList = document.getElementById("arduinoPinList");
const devicesZone = document.getElementById("devicesZone");
const wireLayer = document.getElementById("wireLayer");
const scrapbookCanvas = document.getElementById("scrapbookCanvas");
const btnSimulate = document.getElementById("btnSimulate");
const btnToggleSound = document.getElementById("btnToggleSound");
const simStatusBadge = document.getElementById("simStatusBadge");

// 2D Board & Breadboard DOM Elements
const btnBoardAuto = document.getElementById("btnBoardAuto");
const btnBoardUno = document.getElementById("btnBoardUno");
const btnBoardEsp32 = document.getElementById("btnBoardEsp32");
const boardBoxInner = document.getElementById("boardBoxInner");
const boardNameTitle = document.getElementById("boardNameTitle");
const boardMcuChip = document.getElementById("boardMcuChip");
const boardVccLabel = document.getElementById("boardVccLabel");
const boardPaperCaption = document.getElementById("boardPaperCaption");
const bbHoverHint = document.getElementById("bbHoverHint");
const bbMiniGrid = document.getElementById("bbMiniGrid");
const vccRailHoles = document.getElementById("vccRailHoles");
const gndRailHoles = document.getElementById("gndRailHoles");

/**
 * สร้างตารางรูเบรดบอร์ด 2D แบบโต้ตอบได้ (ชี้เมาส์แล้วเห็นว่า 5 รูในคอลัมน์เดียวกันเชื่อมถึงกัน)
 */
function initBreadboard2DGrid() {
  if (vccRailHoles) {
    vccRailHoles.innerHTML = Array.from(
      { length: 14 },
      () => `<span class="bb-rail-hole" title="รางไฟบวก (+ VCC) เชื่อมถึงกันตลอดแนวนอน"></span>`
    ).join("");
  }
  if (gndRailHoles) {
    gndRailHoles.innerHTML = Array.from(
      { length: 14 },
      () => `<span class="bb-rail-hole" title="รางสายดิน (- GND) เชื่อมถึงกันตลอดแนวนอน"></span>`
    ).join("");
  }
  if (!bbMiniGrid) return;

  let colsHtml = "";
  for (let col = 1; col <= 12; col++) {
    colsHtml += `
      <div class="bb-col" data-col="${col}">
        <span class="bb-col-num">${col}</span>
        <span class="bb-hole" data-row="A"></span>
        <span class="bb-hole" data-row="B"></span>
        <span class="bb-hole" data-row="C"></span>
        <span class="bb-hole" data-row="D"></span>
        <span class="bb-hole" data-row="E"></span>
      </div>
    `;
  }
  bbMiniGrid.innerHTML = colsHtml;

  bbMiniGrid.querySelectorAll(".bb-col").forEach((colEl) => {
    colEl.addEventListener("mouseenter", () => {
      const colNum = colEl.getAttribute("data-col");
      if (bbHoverHint) {
        bbHoverHint.textContent =
          currentLang === "th"
            ? `⚡ แถวที่ ${colNum} (รู A${colNum}-E${colNum}): ทั้ง 5 รูนี้เชื่อมถึงกันในแนวตั้ง! เสียบขาอุปกรณ์และสายไฟในแถวที่ ${colNum} เพื่อต่อถึงกันได้เลย`
            : `⚡ Column ${colNum} (Holes A${colNum}-E${colNum}): All 5 vertical holes are connected together!`;
      }
    });
    colEl.addEventListener("mouseleave", () => {
      if (bbHoverHint) {
        bbHoverHint.textContent = UI_TEXT[currentLang].bbHoverDefault;
      }
    });
  });
}

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
 * สร้าง SVG ภาพประกอบอุปกรณ์ 2D บนเบรดบอร์ดในรูปแบบกระดาษตัดแปะ (Paper Scrapbook 2D Art)
 */
function getDeviceSVG(deviceType, isOn, hasBug, extraData = {}) {
  if (deviceType === "button") {
    const isPressed = interactiveSensorValues.buttonPressed || isOn;
    const ringColor = hasBug ? "#d90429" : isPressed ? "#2b9348" : "#ffb703";
    return `
      <svg viewBox="0 0 80 80" width="66" height="66" class="scrapbook-svg">
        <line x1="20" y1="6" x2="20" y2="18" stroke="#6c757d" stroke-width="4"/>
        <line x1="60" y1="6" x2="60" y2="18" stroke="#6c757d" stroke-width="4"/>
        <line x1="20" y1="62" x2="20" y2="74" stroke="#6c757d" stroke-width="4"/>
        <line x1="60" y1="62" x2="60" y2="74" stroke="#6c757d" stroke-width="4"/>
        <rect x="12" y="16" width="56" height="48" rx="8" fill="#ced4da" stroke="#495057" stroke-width="3"/>
        <circle cx="40" cy="40" r="${isPressed ? 14 : 16}" fill="${ringColor}" stroke="#212529" stroke-width="3"/>
        <circle cx="36" cy="36" r="4" fill="rgba(255,255,255,0.7)"/>
      </svg>
    `;
  }

  if (deviceType === "ultrasonic") {
    const waveColor = isOn && !hasBug ? "#3a86ff" : "transparent";
    return `
      <svg viewBox="0 0 110 80" width="84" height="64" class="scrapbook-svg">
        <rect x="10" y="16" width="90" height="46" rx="6" fill="#1d3557" stroke="#457b9d" stroke-width="3"/>
        <line x1="28" y1="62" x2="28" y2="76" stroke="#e9c46a" stroke-width="3"/>
        <line x1="44" y1="62" x2="44" y2="76" stroke="#e9c46a" stroke-width="3"/>
        <line x1="66" y1="62" x2="66" y2="76" stroke="#e9c46a" stroke-width="3"/>
        <line x1="82" y1="62" x2="82" y2="76" stroke="#e9c46a" stroke-width="3"/>
        <circle cx="34" cy="38" r="15" fill="#adb5bd" stroke="#212529" stroke-width="2.5"/>
        <circle cx="34" cy="38" r="9" fill="#6c757d"/>
        <text x="34" y="41" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">T</text>
        <circle cx="76" cy="38" r="15" fill="#adb5bd" stroke="#212529" stroke-width="2.5"/>
        <circle cx="76" cy="38" r="9" fill="#6c757d"/>
        <text x="76" y="41" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">R</text>
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
      <svg viewBox="0 0 80 80" width="64" height="64" class="scrapbook-svg">
        <rect x="18" y="10" width="44" height="50" rx="4" fill="${gridColor}" stroke="#0077b6" stroke-width="3"/>
        <line x1="26" y1="20" x2="54" y2="20" stroke="#03045e" stroke-width="2"/>
        <line x1="26" y1="28" x2="54" y2="28" stroke="#03045e" stroke-width="2"/>
        <line x1="26" y1="36" x2="54" y2="36" stroke="#03045e" stroke-width="2"/>
        <line x1="26" y1="44" x2="54" y2="44" stroke="#03045e" stroke-width="2"/>
        <line x1="28" y1="60" x2="28" y2="75" stroke="#e63946" stroke-width="3"/>
        <line x1="40" y1="60" x2="40" y2="75" stroke="#2b9348" stroke-width="3"/>
        <line x1="52" y1="60" x2="52" y2="75" stroke="#1d3557" stroke-width="3"/>
      </svg>
    `;
  }

  if (deviceType === "lcd_i2c") {
    const lineTexts = extraData.lines || [`Temp: ${interactiveSensorValues.dhtTempC}C`, "IoT Buddy"];
    const line1 = (lineTexts[0] || "IoT Ready!").substring(0, 16);
    const line2 = (lineTexts[1] || "").substring(0, 16);
    const screenBg = isOn && !hasBug ? "#52b788" : "#95d5b2";
    return `
      <svg viewBox="0 0 130 80" width="98" height="62" class="scrapbook-svg">
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
      <svg viewBox="0 0 80 80" width="64" height="64" class="scrapbook-svg">
        <circle cx="40" cy="40" r="25" fill="#212529" stroke="#495057" stroke-width="4"/>
        <circle cx="40" cy="40" r="8" fill="#000"/>
        <text x="26" y="30" font-size="12" font-weight="900" fill="#ffccd5">+</text>
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
      <svg viewBox="0 0 80 80" width="64" height="64" class="scrapbook-svg">
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
      <svg viewBox="0 0 80 80" width="64" height="64" class="scrapbook-svg">
        <rect x="14" y="16" width="52" height="48" rx="6" fill="#0077b6" stroke="#03045e" stroke-width="3"/>
        <circle cx="26" cy="28" r="4" fill="${isOn ? "#52b788" : "#6c757d"}"/>
        <text x="40" y="44" font-size="10" font-weight="900" fill="#fff" text-anchor="middle">RELAY</text>
      </svg>
    `;
  }

  if (deviceType === "sensor") {
    return `
      <svg viewBox="0 0 80 80" width="64" height="64" class="scrapbook-svg">
        <circle cx="40" cy="40" r="22" fill="#adb5bd" stroke="#495057" stroke-width="3"/>
        <path d="M 28 34 Q 40 26 52 34 Q 40 44 28 46 Q 40 54 52 46" stroke="#d90429" stroke-width="3" fill="none"/>
      </svg>
    `;
  }

  // หลอดไฟ LED 2D พร้อมตัวต้านทาน 220Ω ต่ออนุกรมบนเบรดบอร์ด!
  if (hasBug || !isOn) {
    return `
      <svg viewBox="0 0 100 80" width="78" height="64" class="scrapbook-svg">
        <!-- ขาหลอดไฟ + ตัวต้านทาน 220Ω 2D -->
        <line x1="28" y1="52" x2="28" y2="74" stroke="#6c757d" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="42" y1="52" x2="42" y2="65" stroke="#6c757d" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="42" y1="65" x2="86" y2="65" stroke="#6c757d" stroke-width="3"/>
        <rect x="52" y="59" width="24" height="12" rx="4" fill="#e6ccb2" stroke="#9c6644" stroke-width="2"/>
        <line x1="57" y1="59" x2="57" y2="71" stroke="#d90429" stroke-width="2.2"/>
        <line x1="62" y1="59" x2="62" y2="71" stroke="#d90429" stroke-width="2.2"/>
        <line x1="68" y1="59" x2="68" y2="71" stroke="#7f4f24" stroke-width="2.2"/>
        <!-- หัวหลอด LED -->
        <path d="M18 50 L18 30 A17 17 0 0 1 52 30 L52 50 Z" fill="#adb5bd" stroke="#495057" stroke-width="2.8"/>
        <rect x="15" y="48" width="40" height="6" rx="2" fill="#6c757d" stroke="#495057" stroke-width="2"/>
        <text x="35" y="39" text-anchor="middle" fill="#343a40" font-size="11" font-weight="bold">${hasBug ? "x_x" : "off"}</text>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 100 80" width="78" height="64" class="scrapbook-svg led-glowing">
      <defs>
        <radialGradient id="ledGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#fff3b0"/>
          <stop offset="55%" stop-color="#ffbe0b"/>
          <stop offset="100%" stop-color="rgba(255,190,11,0)"/>
        </radialGradient>
      </defs>
      <circle cx="35" cy="32" r="30" fill="url(#ledGlow)" class="glow-circle"/>
      <!-- ขาหลอดไฟ + ตัวต้านทาน 220Ω 2D -->
      <line x1="28" y1="52" x2="28" y2="74" stroke="#495057" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="42" y1="52" x2="42" y2="65" stroke="#495057" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="42" y1="65" x2="86" y2="65" stroke="#495057" stroke-width="3"/>
      <rect x="52" y="59" width="24" height="12" rx="4" fill="#e6ccb2" stroke="#9c6644" stroke-width="2"/>
      <line x1="57" y1="59" x2="57" y2="71" stroke="#d90429" stroke-width="2.2"/>
      <line x1="62" y1="59" x2="62" y2="71" stroke="#d90429" stroke-width="2.2"/>
      <line x1="68" y1="59" x2="68" y2="71" stroke="#7f4f24" stroke-width="2.2"/>
      <!-- หัวหลอด LED สว่าง -->
      <path d="M18 50 L18 30 A17 17 0 0 1 52 30 L52 50 Z" fill="#ffbe0b" stroke="#fb5607" stroke-width="2.8"/>
      <rect x="15" y="48" width="40" height="6" rx="2" fill="#fb5607"/>
      <circle cx="29" cy="26" r="4.5" fill="rgba(255,255,255,0.85)"/>
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
  document.getElementById("pinRailTitle").textContent = t.pinRailTitle;
  if (document.getElementById("bbExplorerTitle")) {
    document.getElementById("bbExplorerTitle").textContent = t.bbExplorerTitle;
  }
  if (bbHoverHint) bbHoverHint.textContent = t.bbHoverDefault;
  if (document.getElementById("trayTitle")) {
    document.getElementById("trayTitle").textContent = t.trayTitle;
  }
  if (btnSimulate) btnSimulate.textContent = isSimulating ? t.simStop : t.simStart;
  if (btnToggleSound) btnToggleSound.textContent = isSoundEnabled ? t.simSoundOn : t.simSoundOff;
  if (simStatusBadge && !isSimulating) simStatusBadge.textContent = t.simStatusReady;
}

/**
 * อัปเดตหน้าตาบอร์ด 2D ระหว่าง Arduino Uno (สีเขียวมิ้นต์ 5V) กับ ESP32 Wi-Fi (สีกรมท่าเข้ม 3.3V)
 */
function updateBoardAppearance(activeBoard) {
  const t = UI_TEXT[currentLang];
  const isEsp32 = activeBoard === "esp32";

  if (boardBoxInner) {
    boardBoxInner.classList.toggle("board-esp32", isEsp32);
  }
  if (boardNameTitle) {
    boardNameTitle.textContent = isEsp32 ? "ESP32 DEVKIT V1" : "ARDUINO UNO";
  }
  if (boardMcuChip) {
    boardMcuChip.textContent = isEsp32 ? "ESP-WROOM-32 📶" : "ATmega328P";
  }
  if (boardVccLabel) {
    boardVccLabel.textContent = isEsp32 ? "⚡ 3.3V (VCC)" : "⚡ 5V (VCC)";
  }
  if (boardPaperCaption) {
    boardPaperCaption.textContent = isEsp32
      ? "บอร์ด ESP32 (Wi-Fi / Bluetooth)"
      : "บอร์ดไมโครคอนโทรลเลอร์";
  }
  const boardNoteEl = document.getElementById("boardNote");
  if (boardNoteEl) {
    boardNoteEl.textContent = isEsp32 ? t.boardNoteEsp32 : t.boardNoteUno;
  }
}

function renderAnalysis() {
  updateLineNumbers();
  const code = codeInput.value;
  const result = window.IoTAnalyzer.analyzeArduinoCode(code);
  lastAnalysis = result;
  const t = UI_TEXT[currentLang];

  const activeBoard = forcedBoardMode === "auto" ? result.boardType || "uno" : forcedBoardMode;
  updateBoardAppearance(activeBoard);

  // ตรวจสอบว่ามีอุปกรณ์ตัวไหนที่ผู้ใช้กดถอดสาย VCC หรือ GND บนเบรดบอร์ด 2D อยู่หรือไม่
  const unpluggedWarnings = [];
  result.devices.forEach((dev) => {
    if (!breadboardWireState.has(dev.pin)) {
      breadboardWireState.set(dev.pin, { vcc: true, gnd: true });
    }
    const wState = breadboardWireState.get(dev.pin);
    const devName = t.deviceNames[dev.deviceType] || dev.deviceType;
    if (!wState.vcc || !wState.gnd) {
      const missingParts = [];
      if (!wState.vcc) missingParts.push("สายไฟบวก VCC (+)");
      if (!wState.gnd) missingParts.push("สายกราวด์ GND (-)");
      unpluggedWarnings.push(
        `🔌 <strong>${devName} (ขา ${dev.pin}):</strong> ยังไม่ได้เสียบ <strong>${missingParts.join(" และ ")}</strong> บนเบรดบอร์ด 2D ทำให้ไฟไม่ครบวงจร! (คลิกปุ่มสายไฟที่ตัวอุปกรณ์เพื่อเสียบกลับ)`
      );
    }
  });

  // 1. Mascot Post-it Note (รวมจุดแก้โค้ด + คำเตือนสายไฟเบรดบอร์ดหลุด)
  if (result.ok && unpluggedWarnings.length === 0) {
    mascotBanner.classList.add("status-ok");
    mascotFace.textContent = "🦊🎉";
    statusPill.textContent = t.statusOk;
    btnAutoFix.style.display = "none";
    speechMessages.innerHTML = `<div class="speech-item"><strong>${result.summary[currentLang]}</strong></div>`;
  } else {
    mascotBanner.classList.remove("status-ok");
    mascotFace.textContent = "🦊📢";
    const totalIssues = result.bugCount + unpluggedWarnings.length;
    statusPill.textContent = `${t.statusBug} (${totalIssues})`;
    btnAutoFix.style.display = result.bugCount > 0 ? "inline-block" : "none";

    const codeBugHtml = result.bugs
      .map(
        (b) => `
        <div class="speech-item">
          <div><strong>บรรทัด ${b.line}:</strong> ${b.message[currentLang]}</div>
          <span class="fix-inline-chip"><code>${b.wrongToken}</code> ➔ <strong><code>${b.correctToken}</code></strong></span>
        </div>`
      )
      .join("");

    const wireWarnHtml = unpluggedWarnings
      .map((msg) => `<div class="speech-item">${msg}</div>`)
      .join("");

    speechMessages.innerHTML = codeBugHtml + wireWarnHtml;
  }

  // 2. 2D Breadboard & Components Stage
  arduinoPinList.innerHTML = "";
  devicesZone.innerHTML = "";

  if (result.devices.length === 0) {
    devicesZone.innerHTML = `<div class="paper-cutout"><p>${t.noDevices}</p></div>`;
    requestAnimationFrame(drawHandDrawnWires);
    return;
  }

  result.devices.forEach((dev, index) => {
    const wState = breadboardWireState.get(dev.pin) || { vcc: true, gnd: true };
    const isWireUnplugged = !wState.vcc || !wState.gnd;
    const hasProblem = dev.hasBug || isWireUnplugged;

    const pinLabelPrefix = activeBoard === "esp32" && !String(dev.pin).startsWith("I2C") ? "GPIO" : "PIN";
    const pinEl = document.createElement("div");
    pinEl.className = `pin-socket ${hasProblem ? "pin-error" : ""}`;
    pinEl.id = `board-pin-${dev.pin}`;
    pinEl.innerHTML = `
      <span>${pinLabelPrefix} ${dev.pin}</span>
      <span class="pin-dot" id="pin-dot-${dev.pin}"></span>
    `;
    arduinoPinList.appendChild(pinEl);

    const tiltDeg = index % 2 === 0 ? 0.6 : -0.7;
    const wrapper = document.createElement("div");
    wrapper.className = "device-card-wrapper";

    const deviceTitle = t.deviceNames[dev.deviceType] || dev.deviceType.toUpperCase();
    const isInput = dev.deviceType === "button" || dev.deviceType === "sensor";

    const rawPowerOn = simulatedDeviceStates.has(dev.pin)
      ? simulatedDeviceStates.get(dev.pin).powerState === "on"
      : dev.powerState === "on" || (dev.deviceType === "led" && interactiveSensorValues.buttonPressed);

    const isDeviceOn = !hasProblem && rawPowerOn;

    const stateLabel = dev.hasBug
      ? t.stateBroken
      : isWireUnplugged
      ? t.stateUnplugged
      : isInput
      ? t.stateWorkingInput
      : isDeviceOn
      ? t.stateWorkingOn
      : "⏹️ ปิดอยู่ (OFF)";

    const guide = dev.breadboardGuide || {
      vcc: activeBoard === "esp32" ? "3.3V" : "5V",
      gnd: "GND (-)",
      signal: `Pin ${dev.pin}`,
      tip: { th: "", en: "" },
    };

    // แถบปุ่มโต้ตอบ 2D บนตัวอุปกรณ์ (กดปุ่ม / เลื่อนระยะ Ultrasonic / เลื่อนอุณหภูมิ DHT11)
    let interactiveControlsHtml = "";
    if (dev.deviceType === "button") {
      const pressed = interactiveSensorValues.buttonPressed;
      interactiveControlsHtml = `
        <div class="device-interactive-row">
          <button class="interactive-push-btn ${pressed ? "pressed" : ""}" data-toggle-button="${dev.pin}">
            ${pressed ? "🟢 กำลังกดปุ่ม (HIGH)" : "🔘 คลิกกดปุ่มจำลอง (LOW)"}
          </button>
        </div>
      `;
    } else if (dev.deviceType === "ultrasonic") {
      interactiveControlsHtml = `
        <div class="device-interactive-row">
          <div class="interactive-slider-wrap">
            <span>📏 ระยะวัตถุ: <strong id="ultra-val-${dev.pin}">${interactiveSensorValues.ultrasonicCm} cm</strong></span>
            <input type="range" min="5" max="200" value="${interactiveSensorValues.ultrasonicCm}" data-ultra-slider="${dev.pin}" />
          </div>
        </div>
      `;
    } else if (dev.deviceType === "dht11") {
      interactiveControlsHtml = `
        <div class="device-interactive-row">
          <div class="interactive-slider-wrap">
            <span>🌡️ อุณหภูมิ: <strong id="dht-val-${dev.pin}">${interactiveSensorValues.dhtTempC}°C</strong></span>
            <input type="range" min="15" max="45" step="0.5" value="${interactiveSensorValues.dhtTempC}" data-dht-slider="${dev.pin}" />
          </div>
        </div>
      `;
    }

    const hoverTip = dev.hasBug
      ? dev.bugMessages.map((b) => b.impact[currentLang]).join(" • ")
      : isWireUnplugged
      ? "สายไฟ VCC หรือ GND บนเบรดบอร์ดหลุดอยู่! คลิกปุ่มสายไฟด้านล่างเพื่อเสียบกลับ"
      : guide.tip[currentLang] || "";

    wrapper.innerHTML = `
      ${
        hasProblem
          ? `<div class="question-mark-badge" title="${hoverTip}">?</div>`
          : ""
      }
      <div class="paper-cutout device-cutout ${hasProblem ? "has-bug" : ""} ${isDeviceOn ? "device-active" : ""}" style="transform: rotate(${tiltDeg}deg);" id="device-card-${dev.pin}" title="${hoverTip}">
        <div class="washi-tape tape-top-center"></div>
        <div class="device-inner">
          <div class="device-terminal-dot" id="dev-dot-${dev.pin}"></div>
          <div class="device-illustration" id="dev-illu-${dev.pin}">
            ${getDeviceSVG(dev.deviceType, isDeviceOn, hasProblem, dev.extraData)}
          </div>
          <div class="device-info">
            <div class="device-title-row">
              <div class="device-title">${deviceTitle} <span style="font-weight:600; color:var(--ink-muted); font-size:0.78rem;">(${pinLabelPrefix} ${dev.pin})</span></div>
            </div>
            <div class="device-state-text ${hasProblem ? "state-error" : isDeviceOn ? "state-ok" : "state-muted"}" id="dev-state-${dev.pin}">
              ${stateLabel}
            </div>
            <!-- ปุ่มฝึกเสียบ/ถอดสายไฟบนเบรดบอร์ด 2D (คลิกเพื่อทดลองถอด/เสียบสาย VCC & GND ได้จริง!) -->
            <div class="bb-wire-pills">
              <button class="wire-pill-btn pill-vcc ${wState.vcc ? "connected" : "unplugged"}" data-wire-toggle="vcc" data-pin="${dev.pin}" title="คลิกเพื่อทดลองเสียบ/ถอดสายไฟบวก VCC บนเบรดบอร์ด">
                🔴 ${wState.vcc ? `VCC ต่อแล้ว` : `VCC หลุด!`}
              </button>
              <button class="wire-pill-btn pill-gnd ${wState.gnd ? "connected" : "unplugged"}" data-wire-toggle="gnd" data-pin="${dev.pin}" title="คลิกเพื่อทดลองเสียบ/ถอดสายดิน GND บนเบรดบอร์ด">
                🔵 ${wState.gnd ? `GND ต่อแล้ว` : `GND หลุด!`}
              </button>
              <span class="wire-pill-btn pill-sig" title="${guide.tip[currentLang] || ""}">
                🟢 สัญญาณ: ${guide.signal}
              </span>
            </div>
            ${interactiveControlsHtml}
          </div>
        </div>
      </div>
    `;

    devicesZone.appendChild(wrapper);
  });

  // ผูก Event ปุ่มเสียบ/ถอดสาย VCC & GND บนเบรดบอร์ด 2D
  devicesZone.querySelectorAll("[data-wire-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pin = btn.getAttribute("data-pin");
      const wireType = btn.getAttribute("data-wire-toggle");
      const current = breadboardWireState.get(pin) || { vcc: true, gnd: true };
      current[wireType] = !current[wireType];
      breadboardWireState.set(pin, current);
      renderAnalysis();
    });
  });

  // ผูก Event ปุ่มกดจำลอง 2D (Push Button)
  devicesZone.querySelectorAll("[data-toggle-button]").forEach((btn) => {
    btn.addEventListener("click", () => {
      interactiveSensorValues.buttonPressed = !interactiveSensorValues.buttonPressed;
      if (interactiveSensorValues.buttonPressed) {
        playBuzzerSound(660, 90);
      }
      renderAnalysis();
    });
  });

  // ผูก Event สไลเดอร์ปรับระยะทาง Ultrasonic 2D
  devicesZone.querySelectorAll("[data-ultra-slider]").forEach((slider) => {
    slider.addEventListener("input", (e) => {
      interactiveSensorValues.ultrasonicCm = Number(e.target.value);
      const pin = slider.getAttribute("data-ultra-slider");
      const label = document.getElementById(`ultra-val-${pin}`);
      if (label) label.textContent = `${interactiveSensorValues.ultrasonicCm} cm`;
    });
  });

  // ผูก Event สไลเดอร์ปรับอุณหภูมิ DHT11 2D
  devicesZone.querySelectorAll("[data-dht-slider]").forEach((slider) => {
    slider.addEventListener("input", (e) => {
      interactiveSensorValues.dhtTempC = Number(e.target.value);
      const pin = slider.getAttribute("data-dht-slider");
      const label = document.getElementById(`dht-val-${pin}`);
      if (label) label.textContent = `${interactiveSensorValues.dhtTempC}°C`;
      renderAnalysis();
    });
  });

  if (!isMiniMode) {
    requestAnimationFrame(drawHandDrawnWires);
  }
}

/**
 * วาดสายจัมเปอร์ 2D โค้งสวยงามเชื่อมจากบอร์ดมายังเบรดบอร์ด 2D:
 * - สายสีแดง (VCC +) เชื่อมจากขา 5V/3.3V ไปยังรางไฟบวกของเบรดบอร์ด
 * - สายสีน้ำเงิน (GND -) เชื่อมจากขา GND ไปยังรางไฟลบของเบรดบอร์ด
 * - สายสัญญาณสีเขียว/แดง เชื่อมจากขา Pin ไปยังตัวอุปกรณ์บนเบรดบอร์ด
 */
function drawHandDrawnWires() {
  if (isMiniMode || !lastAnalysis) {
    wireLayer.innerHTML = "";
    return;
  }

  const canvasRect = scrapbookCanvas.getBoundingClientRect();
  let pathsHtml = "";

  function makeCurvePath(el1, el2, curveStrength = 26) {
    if (!el1 || !el2) return "";
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const x1 = r1.left + r1.width / 2 - canvasRect.left;
    const y1 = r1.top + r1.height / 2 - canvasRect.top;
    const x2 = r2.left + r2.width / 2 - canvasRect.left;
    const y2 = r2.top + r2.height / 2 - canvasRect.top;
    const midX = (x1 + x2) / 2;
    const offset = y2 >= y1 ? curveStrength : -curveStrength;
    return `M ${x1} ${y1} C ${midX} ${y1 + offset}, ${midX} ${y2 - offset}, ${x2} ${y2}`;
  }

  // 1. สายไฟหลัก VCC (สีแดง) และ GND (สีน้ำเงิน) เข้าสู่รางเบรดบอร์ด 2D
  const pinVcc = document.getElementById("pin-dot-vcc");
  const bbVcc = document.getElementById("bb-dot-vcc");
  const vccPath = makeCurvePath(pinVcc, bbVcc, -18);
  if (vccPath) {
    pathsHtml += `<path d="${vccPath}" class="hand-wire wire-vcc" />`;
  }

  const pinGnd = document.getElementById("pin-dot-gnd");
  const bbGnd = document.getElementById("bb-dot-gnd");
  const gndPath = makeCurvePath(pinGnd, bbGnd, 22);
  if (gndPath) {
    pathsHtml += `<path d="${gndPath}" class="hand-wire wire-gnd" />`;
  }

  // 2. สายสัญญาณของแต่ละอุปกรณ์บนเบรดบอร์ด 2D
  lastAnalysis.devices.forEach((dev) => {
    const pinDot = document.getElementById(`pin-dot-${dev.pin}`);
    const devDot = document.getElementById(`dev-dot-${dev.pin}`);
    if (!pinDot || !devDot) return;

    const wState = breadboardWireState.get(dev.pin) || { vcc: true, gnd: true };
    const isBroken = dev.hasBug || !wState.vcc || !wState.gnd;
    const dPath = makeCurvePath(pinDot, devDot, 26);
    const wireClass = isBroken ? "wire-error" : "wire-ok";

    pathsHtml += `<path d="${dPath}" class="hand-wire ${wireClass}" />`;
  });

  wireLayer.innerHTML = pathsHtml;
}

/**
 * เพิ่มอุปกรณ์ 2D จากถาดด้านล่างลงบนเบรดบอร์ด พร้อมสร้างโค้ดให้มือใหม่อัตโนมัติ!
 */
function addDeviceFromTray(deviceType) {
  let code = codeInput.value;
  const activeBoard =
    forcedBoardMode === "auto"
      ? lastAnalysis?.boardType || "uno"
      : forcedBoardMode;

  const usedPins = new Set((lastAnalysis?.devices || []).map((d) => String(d.pin)));
  const candidatePins =
    activeBoard === "esp32"
      ? ["2", "4", "5", "18", "19", "21", "22", "23", "25", "26", "27", "32", "33"]
      : ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

  const freePin = candidatePins.find((p) => !usedPins.has(p)) || "5";

  let headerAdd = "";
  let setupAdd = "";
  let loopAdd = "";

  if (deviceType === "led") {
    setupAdd = `  pinMode(${freePin}, OUTPUT); // หลอดไฟ LED ที่ขา ${freePin}`;
    loopAdd = `  digitalWrite(${freePin}, HIGH);\n  delay(500);\n  digitalWrite(${freePin}, LOW);\n  delay(500);`;
  } else if (deviceType === "button") {
    setupAdd = `  pinMode(${freePin}, INPUT_PULLUP); // ปุ่มกดที่ขา ${freePin}`;
    loopAdd = `  int btnState_${freePin} = digitalRead(${freePin});`;
  } else if (deviceType === "buzzer") {
    setupAdd = `  pinMode(${freePin}, OUTPUT); // ลำโพง Buzzer ที่ขา ${freePin}`;
    loopAdd = `  tone(${freePin}, 1000);\n  delay(200);\n  noTone(${freePin});\n  delay(600);`;
  } else if (deviceType === "ultrasonic") {
    const echoPin = candidatePins.find((p) => p !== freePin && !usedPins.has(p)) || "10";
    headerAdd = `const int trigPin = ${freePin};\nconst int echoPin = ${echoPin};\n`;
    setupAdd = `  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);`;
    loopAdd = `  digitalWrite(trigPin, HIGH);\n  delay(10);\n  digitalWrite(trigPin, LOW);`;
  } else if (deviceType === "dht11") {
    headerAdd = `const int dhtPin = ${freePin};\n`;
    setupAdd = `  pinMode(dhtPin, INPUT); // เซนเซอร์วัดอุณหภูมิ DHT11`;
  } else if (deviceType === "lcd_i2c") {
    if (!code.includes("LiquidCrystal_I2C")) {
      headerAdd = `#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n`;
      setupAdd = `  lcd.begin(16, 2);\n  lcd.print("Hello IoT!");`;
    }
  } else if (deviceType === "servo") {
    headerAdd = `const int servoPin = ${freePin};\n`;
    setupAdd = `  pinMode(servoPin, OUTPUT); // เซอร์โวมอเตอร์ที่ขา ${freePin}`;
    loopAdd = `  digitalWrite(servoPin, HIGH);\n  delay(500);`;
  }

  if (headerAdd) {
    code = headerAdd + code;
  }
  if (setupAdd && /void\s+setup\s*\(\s*\)\s*\{/.test(code)) {
    code = code.replace(/void\s+setup\s*\(\s*\)\s*\{/, `void setup() {\n${setupAdd}`);
  }
  if (loopAdd && /void\s+loop\s*\(\s*\)\s*\{/.test(code)) {
    code = code.replace(/void\s+loop\s*\(\s*\)\s*\{/, `void loop() {\n${loopAdd}`);
  }

  codeInput.value = code;
  renderAnalysis();
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
 * แก้โค้ดให้ถูกต้องอัตโนมัติ (รวมถึงแก้บั๊ก ESP32 และเสียบสายไฟเบรดบอร์ดให้ครบ)
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
      if (b.id === "bug-missing-serial-begin") {
        const baud = lastAnalysis.boardType === "esp32" ? 115200 : 9600;
        code = code.replace(
          /void\s+setup\s*\(\s*\)\s*\{/,
          `void setup() {\n  Serial.begin(${baud});`
        );
      }
      if (b.id.startsWith("bug-esp32-input-only-")) {
        code = code.replace(/\b34\b/g, "25").replace(/\b35\b/g, "26").replace(/\b36\b/g, "27").replace(/\b39\b/g, "33");
      }
      if (b.id.startsWith("bug-esp32-adc2-wifi-")) {
        code = code.replace(/(sensorPin\s*=\s*)4\b/, "$132").replace(/analogRead\(\s*4\s*\)/g, "analogRead(32)");
      }
    });
  }

  // เสียบสาย VCC และ GND บนเบรดบอร์ด 2D ทุกตัวให้ครบด้วย
  breadboardWireState.forEach((val, key) => {
    breadboardWireState.set(key, { vcc: true, gnd: true });
  });

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
  const wState = breadboardWireState.get(String(pinKey)) || { vcc: true, gnd: true };
  const hasProblem = dev?.hasBug || !wState.vcc || !wState.gnd;
  const effectiveOn = !hasProblem && isOn;

  if (dev && illuEl) {
    illuEl.innerHTML = getDeviceSVG(dev.deviceType, effectiveOn, hasProblem, dev.extraData);
  }

  if (stateEl && !hasProblem) {
    stateEl.textContent = effectiveOn ? UI_TEXT[currentLang].stateWorkingOn : "⏹️ ปิดอยู่ (OFF)";
    stateEl.className = `device-state-text ${effectiveOn ? "state-ok" : "state-muted"}`;
  }

  if (cardEl) {
    cardEl.classList.toggle("device-active", effectiveOn);
  }
}

/**
 * สลับการซ่อน/แสดงกล่องโค้ด เพื่อเปิดพื้นที่กระดานเบรดบอร์ด 2D เต็มจอ 100%
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

if (scrapbookCanvas) {
  scrapbookCanvas.addEventListener("scroll", () => {
    requestAnimationFrame(drawHandDrawnWires);
  });
}

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
    breadboardWireState.clear();
    codeInput.value = PRESETS[key];
    renderAnalysis();
  }
});

// ปุ่มเลือกชนิดบอร์ด (Auto / Arduino Uno / ESP32)
function setBoardMode(mode) {
  forcedBoardMode = mode;
  [btnBoardAuto, btnBoardUno, btnBoardEsp32].forEach((b) => {
    if (b) b.classList.toggle("active", b.getAttribute("data-board") === mode);
  });
  renderAnalysis();
}

if (btnBoardAuto) btnBoardAuto.addEventListener("click", () => setBoardMode("auto"));
if (btnBoardUno) btnBoardUno.addEventListener("click", () => setBoardMode("uno"));
if (btnBoardEsp32) btnBoardEsp32.addEventListener("click", () => setBoardMode("esp32"));

// ถาดหยิบอุปกรณ์ 2D ด้านล่าง
document.querySelectorAll("[data-add-device]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const devType = btn.getAttribute("data-add-device");
    addDeviceFromTray(devType);
  });
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
initBreadboard2DGrid();
codeInput.value = PRESETS.output_typo;
updateStaticLabels();
renderAnalysis();
pollArduinoFileState();
setInterval(pollArduinoFileState, 1200);
