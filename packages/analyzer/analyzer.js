/**
 * IoT Help Beginner - Arduino & ESP32 Code Analyzer & 2D Breadboard Circuit Inferencer
 * วิเคราะห์โค้ด Arduino Uno และ ESP32 (.ino) เพื่อหา Bug ที่มือใหม่มักเขียนผิดครบทุกมิติ
 * พร้อมแปลงเป็นคำพูดภาษาคนสั้นกระชับ (TH/EN) และสร้างข้อมูลการต่อวงจรบนเบรดบอร์ด 2D
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.IoTAnalyzer = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const UNO_PWM_PINS = [3, 5, 6, 9, 10, 11];
  const ESP32_INPUT_ONLY_PINS = [34, 35, 36, 39];
  const ESP32_ADC2_PINS = [0, 2, 4, 12, 13, 14, 15, 25, 26, 27];

  /**
   * ตรวจจับชนิดบอร์ดจากโค้ด (Arduino Uno หรือ ESP32)
   */
  function detectBoardType(code) {
    const esp32Patterns = [
      /#include\s*[<"](?:WiFi|WebServer|HTTPClient|ESP32Servo|esp_now|BluetoothSerial|AsyncTCP|ESPAsyncWebServer)\.h[>"]/i,
      /\b(?:WiFi\.begin|ledcSetup|ledcAttach|ledcAttachPin|ledcWrite|touchRead|dacWrite)\b/,
      /\b(?:GPIO_NUM_\d+)\b/,
    ];
    for (const pat of esp32Patterns) {
      if (pat.test(code)) return "esp32";
    }
    // ตรวจสอบว่ามีการใช้หมายเลขขา GPIO สูงๆ ของ ESP32 (เช่น 15..39) หรือไม่
    const pinMentions = code.match(/\b(?:pinMode|digitalWrite|digitalRead|analogRead|analogWrite)\s*\(\s*(\d+)/g) || [];
    for (const m of pinMentions) {
      const numMatch = m.match(/(\d+)$/);
      if (numMatch) {
        const pinNum = parseInt(numMatch[1], 10);
        if (pinNum >= 14 && pinNum <= 39) return "esp32";
      }
    }
    return "uno";
  }

  /**
   * เดารูปแบบอุปกรณ์จากชื่อตัวแปร คอมเมนต์ หรือลักษณะการใช้งานขา (Pin)
   */
  function guessDeviceType(pin, role, codeContext, varName = "") {
    const vLower = String(varName || "").toLowerCase();
    if (vLower.includes("led") || vLower.includes("light") || vLower.includes("lamp")) return "led";
    if (vLower.includes("buzzer") || vLower.includes("tone") || vLower.includes("speaker") || vLower.includes("piezo") || vLower.includes("beep")) return "buzzer";
    if (vLower.includes("servo")) return "servo";
    if (vLower.includes("relay")) return "relay";
    if (vLower.includes("trig") || vLower.includes("echo") || vLower.includes("ultra") || vLower.includes("sonar")) return "ultrasonic";
    if (vLower.includes("dht") || vLower.includes("humi")) return "dht11";
    if (vLower.includes("button") || vLower.includes("btn") || vLower.includes("sw") || vLower.includes("switch")) return "button";
    if (vLower.includes("pot") || vLower.includes("ldr") || vLower.includes("sensor")) return "sensor";

    const pinStr = String(pin).trim();
    const pinEscaped = pinStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const varEscaped = String(varName || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = varEscaped ? `(?:\\b${pinEscaped}\\b|\\b${varEscaped}\\b)` : `\\b${pinEscaped}\\b`;
    const specificRegex = new RegExp(`.*${pattern}.*`, "gi");

    const scanHeader = codeContext.split(/\r?\n/).slice(0, 150).join("\n");
    const matchedLines = (scanHeader.match(specificRegex) || []).join(" ").toLowerCase();

    if (matchedLines.includes("led")) return "led";
    if (matchedLines.includes("buzzer") || matchedLines.includes("tone") || matchedLines.includes("speaker") || matchedLines.includes("piezo")) return "buzzer";
    if (matchedLines.includes("servo")) return "servo";
    if (matchedLines.includes("relay")) return "relay";
    if (matchedLines.includes("trig") || matchedLines.includes("echo") || matchedLines.includes("ultra") || matchedLines.includes("sonar")) return "ultrasonic";
    if (matchedLines.includes("dht")) return "dht11";
    if (matchedLines.includes("button") || matchedLines.includes("btn") || matchedLines.includes("sw")) return "button";
    if (matchedLines.includes("ldr") || matchedLines.includes("pot") || matchedLines.includes("sensor") || pinStr.startsWith("A")) {
      return role === "input" ? "sensor" : "led";
    }

    return role === "input" ? "button" : "led";
  }

  /**
   * ดึงข้อมูลข้อความจากคำสั่ง lcd.print("...") ในโค้ด
   */
  function extractLcdTexts(code) {
    const texts = [];
    const printRegex = /lcd\.print\s*\(\s*(?:"([^"]*)"|'([^']*)')\s*\)/g;
    let match;
    while ((match = printRegex.exec(code)) !== null) {
      const txt = match[1] !== undefined ? match[1] : match[2];
      if (txt) texts.push(txt);
    }
    return texts;
  }

  /**
   * แยกขั้นตอนการทำงานใน loop() สำหรับระบบจำลองการทำงานจริง (Simulation Engine)
   */
  function extractSimulationSteps(code, varToPinMap = new Map()) {
    const steps = [];
    const lines = code.split(/\r?\n/);
    let insideLoop = false;
    let bracketDepth = 0;

    function resolve(token) {
      const t = String(token || "").trim();
      return varToPinMap.get(t) || t;
    }

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const raw = lines[i];
      const line = raw.replace(/\/\/.*$/, "").trim();

      if (/void\s+loop\s*\(\s*\)/.test(line)) {
        insideLoop = true;
      }

      if (insideLoop) {
        if (steps.length >= 64) break;
        if (line.includes("{")) bracketDepth++;
        if (line.includes("}")) {
          bracketDepth--;
          if (bracketDepth <= 0) {
            insideLoop = false;
          }
        }

        // 1. digitalWrite(pin, HIGH/LOW)
        const dwMatch = line.match(/\bdigitalWrite\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)/);
        if (dwMatch) {
          const pin = resolve(dwMatch[1]);
          const val = dwMatch[2].toUpperCase();
          steps.push({
            type: "digitalWrite",
            line: lineNum,
            pin,
            value: val === "HIGH" || val === "1" ? "HIGH" : "LOW",
          });
        }

        // 2. tone(pin, freq, [duration])
        const toneMatch = line.match(/\btone\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([0-9]+)(?:\s*,\s*([0-9]+))?\s*\)/);
        if (toneMatch) {
          steps.push({
            type: "tone",
            line: lineNum,
            pin: resolve(toneMatch[1]),
            freq: parseInt(toneMatch[2], 10) || 880,
            duration: toneMatch[3] ? parseInt(toneMatch[3], 10) : null,
          });
        }

        // 3. noTone(pin)
        const noToneMatch = line.match(/\bnoTone\s*\(\s*([A-Za-z0-9_]+)\s*\)/);
        if (noToneMatch) {
          steps.push({
            type: "noTone",
            line: lineNum,
            pin: resolve(noToneMatch[1]),
          });
        }

        // 4. delay(ms)
        const delayMatch = line.match(/\bdelay\s*\(\s*([0-9]+)\s*\)/);
        if (delayMatch) {
          steps.push({
            type: "delay",
            line: lineNum,
            ms: parseInt(delayMatch[1], 10) || 500,
          });
        }

        // 5. servo.write(angle)
        const servoMatch = line.match(/\b(?:servo|myservo)\.write\s*\(\s*([0-9]+)\s*\)/i);
        if (servoMatch) {
          steps.push({
            type: "servo",
            line: lineNum,
            angle: parseInt(servoMatch[1], 10),
          });
        }

        // 6. lcd.print(...)
        const lcdMatch = line.match(/\blcd\.print\s*\(\s*(?:"([^"]*)"|'([^']*)')\s*\)/);
        if (lcdMatch) {
          steps.push({
            type: "lcd_print",
            line: lineNum,
            text: lcdMatch[1] !== undefined ? lcdMatch[1] : lcdMatch[2],
          });
        }
      }
    }

    return steps;
  }

  /**
   * กำหนดคำแนะนำการต่อขาบนเบรดบอร์ด 2D (Breadboard Wiring Guide) สำหรับอุปกรณ์แต่ละชนิด
   */
  function getBreadboardGuide(deviceType, pin, boardType) {
    const vccLabel = boardType === "esp32" ? "3.3V" : "5V";
    const guides = {
      led: {
        pins: [
          { name: "Anode (+ ขายาว)", to: `Pin ${pin} (ผ่านตัวต้านทาน 220Ω)`, wireType: "signal" },
          { name: "Cathode (- ขาสั้น)", to: "รางลบ GND (-) บนเบรดบอร์ด", wireType: "gnd" },
        ],
        tip: {
          th: `เสียบขายาว (+) ต่อตัวต้านทาน 220Ω ไปที่ขา ${pin} และเสียบขาสั้น (-) ลงราง GND (-) สีน้ำเงิน`,
          en: `Connect long leg (+) via 220Ω resistor to Pin ${pin}, and short leg (-) to blue GND (-) rail.`,
        },
      },
      button: {
        pins: [
          { name: "ขา 1 (Signal)", to: `Pin ${pin}`, wireType: "signal" },
          { name: "ขา 2 (VCC/GND)", to: `รางไฟ ${vccLabel} (+) หรือ GND (-)`, wireType: "vcc" },
        ],
        tip: {
          th: `เสียบปุ่มกดคร่อมร่องกลางเบรดบอร์ด ต่อขาสัญญาณเข้าขา ${pin} และอีกฝั่งลง GND/VCC`,
          en: `Place button across breadboard center trench. Wire signal to Pin ${pin} and other side to GND/VCC.`,
        },
      },
      ultrasonic: {
        pins: [
          { name: "VCC", to: `รางไฟ + (${vccLabel})`, wireType: "vcc" },
          { name: "TRIG / ECHO", to: `Pin ${pin}`, wireType: "signal" },
          { name: "GND", to: "รางลบ GND (-)", wireType: "gnd" },
        ],
        tip: {
          th: `เสียบ 4 ขาลงเบรดบอร์ด ต่อ VCC เข้ารางบวก (+), GND เข้ารางลบ (-), และ Trig/Echo เข้าขา ${pin}`,
          en: `Plug 4 pins into breadboard: VCC to (+), GND to (-), and Trig/Echo to Pin ${pin}.`,
        },
      },
      dht11: {
        pins: [
          { name: "VCC (+)", to: `รางไฟ + (${vccLabel})`, wireType: "vcc" },
          { name: "DATA (Out)", to: `Pin ${pin}`, wireType: "signal" },
          { name: "GND (-)", to: "รางลบ GND (-)", wireType: "gnd" },
        ],
        tip: {
          th: `ต่อขา VCC เข้ารางบวก (+), ขา DATA เข้าขา ${pin}, และขา GND เข้ารางลบ (-)`,
          en: `Connect VCC to (+), DATA to Pin ${pin}, and GND to (-).`,
        },
      },
      lcd_i2c: {
        pins: [
          { name: "VCC", to: `รางไฟ + (5V)`, wireType: "vcc" },
          { name: "GND", to: "รางลบ GND (-)", wireType: "gnd" },
          { name: "SDA / SCL", to: boardType === "esp32" ? "GPIO 21 / 22" : "Pin A4 / A5", wireType: "signal" },
        ],
        tip: {
          th: boardType === "esp32"
            ? "ต่อ VCC เข้า 5V, GND เข้า (-), SDA เข้าขา 21 และ SCL เข้าขา 22"
            : "ต่อ VCC เข้า 5V, GND เข้า (-), SDA เข้าขา A4 และ SCL เข้าขา A5",
          en: "Connect VCC to 5V, GND to (-), and SDA/SCL to I2C pins.",
        },
      },
      buzzer: {
        pins: [
          { name: "ขั้วบวก (+)", to: `Pin ${pin}`, wireType: "signal" },
          { name: "ขั้วลบ (-)", to: "รางลบ GND (-)", wireType: "gnd" },
        ],
        tip: {
          th: `ต่อขั้วบวก (+) ของ Buzzer เข้าขา ${pin} และขั้วลบ (-) ลงราง GND (-)`,
          en: `Wire Buzzer (+) to Pin ${pin} and (-) to blue GND rail.`,
        },
      },
      servo: {
        pins: [
          { name: "สายส้ม/เหลือง (Signal)", to: `Pin ${pin}`, wireType: "signal" },
          { name: "สายแดง (VCC)", to: "รางไฟ + (5V)", wireType: "vcc" },
          { name: "สายน้ำตาล/ดำ (GND)", to: "รางลบ GND (-)", wireType: "gnd" },
        ],
        tip: {
          th: `สายสีส้มต่อเข้าขา ${pin}, สายสีแดงเข้าราง 5V (+), สายสีน้ำตาลเข้าราง GND (-)`,
          en: `Orange wire to Pin ${pin}, Red to 5V (+), Brown/Black to GND (-).`,
        },
      },
      relay: {
        pins: [
          { name: "IN (Signal)", to: `Pin ${pin}`, wireType: "signal" },
          { name: "VCC", to: `รางไฟ + (${vccLabel})`, wireType: "vcc" },
          { name: "GND", to: "รางลบ GND (-)", wireType: "gnd" },
        ],
        tip: {
          th: `ต่อขา IN เข้าขา ${pin}, VCC เข้ารางบวก (+) และ GND เข้ารางลบ (-)`,
          en: `Wire IN to Pin ${pin}, VCC to (+), and GND to (-).`,
        },
      },
      sensor: {
        pins: [
          { name: "AO/DO (Signal)", to: `Pin ${pin}`, wireType: "signal" },
          { name: "VCC", to: `รางไฟ + (${vccLabel})`, wireType: "vcc" },
          { name: "GND", to: "รางลบ GND (-)", wireType: "gnd" },
        ],
        tip: {
          th: `ต่อขาสัญญาณเข้าขา ${pin}, VCC เข้ารางบวก (+) และ GND เข้ารางลบ (-)`,
          en: `Wire Signal to Pin ${pin}, VCC to (+), and GND to (-).`,
        },
      },
    };
    return guides[deviceType] || guides.led;
  }

  /**
   * วิเคราะห์โค้ด Arduino / ESP32 และคืนค่ารายการ Bug + อุปกรณ์ที่ต่อบนเบรดบอร์ด 2D
   * @param {string} code โค้ด Arduino / ESP32 (.ino)
   * @param {string} [forcedBoard] บังคับชนิดบอร์ด ("uno" | "esp32" | "auto")
   */
  function analyzeArduinoCode(code, forcedBoard = "auto") {
    const boardType = forcedBoard && forcedBoard !== "auto" ? forcedBoard : detectBoardType(code);
    const lines = code.split(/\r?\n/);
    const bugs = [];
    const pinMap = new Map();
    const varToPinMap = new Map();
    const varRoleMap = new Map();

    // ตัดคอมเมนต์ออกก่อนตรวจสถานะระดับไฟล์
    const codeNoComments = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    // ตรวจสอบว่าโค้ดเปิดใช้ WiFi หรือไม่ (สำหรับเช็ค Bug ADC2 ของ ESP32)
    const usesWiFi = /#include\s*[<"]WiFi\.h[>"]|\bWiFi\.begin\b/i.test(codeNoComments);
    // ตรวจสอบการใช้ Serial.print โดยลืม Serial.begin
    const hasSerialBegin = /\bSerial\.begin\s*\(\s*\d+\s*\)/.test(codeNoComments);

    // ขั้นตอนที่ 0: สแกนหาการประกาศตัวแปรระบุขา Pin
    const varDeclRegex = /(?:const\s+)?(?:int|byte|uint8_t|short)\s+([A-Za-z0-9_]+)\s*=\s*([0-9]+|A[0-5])\s*;/g;
    let vMatch;
    while ((vMatch = varDeclRegex.exec(code)) !== null) {
      varToPinMap.set(vMatch[1], vMatch[2]);
    }

    const defineRegex = /#define\s+([A-Za-z0-9_]+)\s+([0-9]+|A[0-5])/g;
    let dMatch;
    while ((dMatch = defineRegex.exec(code)) !== null) {
      varToPinMap.set(dMatch[1], dMatch[2]);
    }

    // สแกนตัวแปรจาก DHT dht(DHTPIN, DHT11) หรือ Servo attach
    const dhtInitRegex = /\bDHT\s+[A-Za-z0-9_]+\s*\(\s*([A-Za-z0-9_]+)\s*,/g;
    let dhtMatch;
    while ((dhtMatch = dhtInitRegex.exec(code)) !== null) {
      const pToken = dhtMatch[1];
      const resolved = varToPinMap.get(pToken) || pToken;
      varRoleMap.set(pToken, { role: "dht", pin: resolved });
    }

    const readAssignRegex = /(?:int|byte|bool|auto)\s+([A-Za-z0-9_]+)\s*=\s*(?:digitalRead|analogRead)\s*\(\s*([A-Za-z0-9_]+)\s*\)/g;
    let rMatch;
    while ((rMatch = readAssignRegex.exec(code)) !== null) {
      const stateVar = rMatch[1];
      const pinToken = rMatch[2];
      const actualPin = varToPinMap.get(pinToken) || pinToken;
      varRoleMap.set(stateVar, { role: "buttonState", pin: actualPin });
    }

    function resolvePin(pinToken) {
      const str = String(pinToken).trim();
      return varToPinMap.get(str) || str;
    }

    function ensurePin(pinStr, lineNum, roleHint, varHint = "") {
      const resolved = resolvePin(pinStr);
      const pinKey = String(resolved).trim();
      if (!pinMap.has(pinKey)) {
        const deviceType = guessDeviceType(pinKey, roleHint, code, varHint || pinStr);
        pinMap.set(pinKey, {
          pin: pinKey,
          rawToken: pinStr,
          deviceType,
          configuredMode: null,
          isConfiguredValid: false,
          powerState: "off",
          hasBug: false,
          bugMessages: [],
          lines: [lineNum],
          extraData: {},
          breadboard: getBreadboardGuide(deviceType, pinKey, boardType),
        });
      } else {
        const entry = pinMap.get(pinKey);
        if (entry.lines.length < 50 && !entry.lines.includes(lineNum)) {
          entry.lines.push(lineNum);
        }
        if (entry.deviceType === "led" && varHint && varHint !== pinKey && !entry._checkedHint) {
          entry._checkedHint = true;
          const refinedType = guessDeviceType(pinKey, roleHint, code, varHint);
          if (refinedType !== "led") {
            entry.deviceType = refinedType;
            entry.breadboard = getBreadboardGuide(refinedType, pinKey, boardType);
          }
        }
      }
      return pinMap.get(pinKey);
    }

    let inBlockComment = false;
    let warnedSerialBegin = false;

    // ตรวจสอบโค้ดแบบบรรทัดต่อบรรทัด
    lines.forEach((rawLine, idx) => {
      const lineNum = idx + 1;

      // จัดการคอมเมนต์หลายบรรทัด /* ... */
      let cleanLine = rawLine;
      if (inBlockComment) {
        const endIdx = cleanLine.indexOf("*/");
        if (endIdx !== -1) {
          inBlockComment = false;
          cleanLine = cleanLine.slice(endIdx + 2);
        } else {
          return;
        }
      }
      while (cleanLine.includes("/*")) {
        const startIdx = cleanLine.indexOf("/*");
        const endIdx = cleanLine.indexOf("*/", startIdx + 2);
        if (endIdx !== -1) {
          cleanLine = cleanLine.slice(0, startIdx) + cleanLine.slice(endIdx + 2);
        } else {
          cleanLine = cleanLine.slice(0, startIdx);
          inBlockComment = true;
          break;
        }
      }

      const line = cleanLine.replace(/\/\/.*$/, "").trim();
      if (!line) return;

      // 1. ตรวจจับ pinMode(...)
      const pinModeRegex = /\b(pinMode|pinmode|PinMode)\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)/;
      const pmMatch = line.match(pinModeRegex);
      if (pmMatch) {
        const fnName = pmMatch[1];
        const rawPinToken = pmMatch[2];
        const modeArg = pmMatch[3];
        const roleHint = modeArg.toUpperCase().includes("INPUT") ? "input" : "output";
        const pinObj = ensurePin(rawPinToken, lineNum, roleHint, rawPinToken);
        const pinNum = parseInt(pinObj.pin, 10);

        // 1.1 เช็คชื่อฟังก์ชัน pinMode พิมพ์ผิด
        if (fnName !== "pinMode") {
          const bug = {
            id: `bug-fn-pinmode-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "pinMode",
            message: {
              th: `สะกด "${fnName}" ผิดนะ! ต้องใช้ตัว M พิมพ์ใหญ่เป็น "pinMode" เพื่อตั้งค่าขา ${pinObj.pin}`,
              en: `You wrote "${fnName}" on line ${lineNum}. Write it as "pinMode" (capital M) to configure Pin ${pinObj.pin}!`,
            },
            impact: {
              th: `ขาที่ ${pinObj.pin} ยังไม่ถูกตั้งค่า ทำให้อุปกรณ์ที่ต่อขา ${pinObj.pin} ไม่ทำงาน (?)`,
              en: `Pin ${pinObj.pin} is not configured properly, causing the device on Pin ${pinObj.pin} to fail (?)`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }

        // 1.2 เช็คค่าโหมด OUTPUT / INPUT / INPUT_PULLUP พิมพ์ตัวเล็ก-ใหญ่ผิด
        const validModes = ["OUTPUT", "INPUT", "INPUT_PULLUP", "INPUT_PULLDOWN"];
        if (!validModes.includes(modeArg)) {
          const upper = modeArg.toUpperCase();
          const suggested = validModes.includes(upper) ? upper : "OUTPUT";
          const bug = {
            id: `bug-mode-case-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: modeArg,
            correctToken: suggested,
            message: {
              th: `เขียน "${modeArg}" ผิดนะ! ต้องใช้ตัวพิมพ์ใหญ่ทั้งหมดว่า "${suggested}" ขา ${pinObj.pin} ถึงจะทำงาน`,
              en: `You wrote "${modeArg}" on line ${lineNum}. Write it in ALL CAPS as "${suggested}"!`,
            },
            impact: {
              th: `ตั้งค่าโหมดขา ${pinObj.pin} ผิดพลาด ทำให้อุปกรณ์ที่ขา ${pinObj.pin} ไม่ทำงานและขึ้นเครื่องหมาย ?`,
              en: `Invalid mode on Pin ${pinObj.pin}. The connected component won't operate (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        } else {
          pinObj.configuredMode = modeArg;
          if (!pinObj.hasBug) {
            pinObj.isConfiguredValid = true;
          }
        }

        // 1.3 เช็คขา Input-Only ของ ESP32 (GPIO 34, 35, 36, 39 ห้ามตั้งเป็น OUTPUT)
        if (
          boardType === "esp32" &&
          !isNaN(pinNum) &&
          ESP32_INPUT_ONLY_PINS.includes(pinNum) &&
          modeArg.toUpperCase() === "OUTPUT"
        ) {
          const bug = {
            id: `bug-esp32-input-only-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: `pinMode(${rawPinToken}, OUTPUT)`,
            correctToken: `ใช้ขา GPIO อื่น (เช่น 2, 4, 15, 25, 26, 27, 32, 33)`,
            message: {
              th: `บนบอร์ด ESP32 ขา GPIO ${pinObj.pin} เป็นขารับค่า (Input-Only) เท่านั้น! สั่งจ่ายไฟ OUTPUT ออกไม่ได้นะ ลองย้ายไปขา 4, 15, 25 หรือ 26 แทนสิ`,
              en: `On ESP32, GPIO ${pinObj.pin} is INPUT-ONLY! It cannot be used as OUTPUT. Try GPIO 4, 15, 25, or 26 instead.`,
            },
            impact: {
              th: `ขา GPIO ${pinObj.pin} ของ ESP32 ไม่มีวงจรจ่ายไฟขาออก อุปกรณ์จึงไม่ทำงานแน่นอน (?)`,
              en: `GPIO ${pinObj.pin} has no output driver on ESP32, so the component won't work (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }

        // 1.4 เช็คการตั้งค่าขา Ultrasonic (trigPin ต้องเป็น OUTPUT, echoPin ต้องเป็น INPUT)
        const tokenLower = rawPinToken.toLowerCase();
        if (tokenLower.includes("trig") && modeArg.toUpperCase() === "INPUT") {
          const bug = {
            id: `bug-ultra-trig-mode-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: "INPUT",
            correctToken: "OUTPUT",
            message: {
              th: `ขา Trig (${rawPinToken}) ของ Ultrasonic มีไว้ "ยิงคลื่นเสียงออกไป" จึงต้องตั้งเป็น OUTPUT ไม่ใช่ INPUT นะ!`,
              en: `Ultrasonic Trig pin (${rawPinToken}) sends out sound pulses, so it must be OUTPUT, not INPUT!`,
            },
            impact: {
              th: `เซนเซอร์ Ultrasonic ยิงคลื่นเสียงออกไปวัดระยะไม่ได้ (?)`,
              en: `Ultrasonic sensor cannot emit sound waves to measure distance (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        } else if (tokenLower.includes("echo") && modeArg.toUpperCase() === "OUTPUT") {
          const bug = {
            id: `bug-ultra-echo-mode-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: "OUTPUT",
            correctToken: "INPUT",
            message: {
              th: `ขา Echo (${rawPinToken}) ของ Ultrasonic มีไว้ "รับคลื่นเสียงสะท้อนกลับ" จึงต้องตั้งเป็น INPUT ไม่ใช่ OUTPUT นะ!`,
              en: `Ultrasonic Echo pin (${rawPinToken}) receives the reflected pulse, so it must be INPUT, not OUTPUT!`,
            },
            impact: {
              th: `บอร์ดรับสัญญาณสะท้อนจาก Ultrasonic ไม่ได้ ค่าที่อ่านได้จะเป็น 0 ตลอด (?)`,
              en: `Board cannot read echo pulse from Ultrasonic sensor (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }
      }

      // 2. ตรวจจับ digitalWrite(...)
      const dwRegex = /\b(digitalWrite|digitalwrite|DigitalWrite)\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)/;
      const dwMatch = line.match(dwRegex);
      if (dwMatch) {
        const fnName = dwMatch[1];
        const rawPinToken = dwMatch[2];
        const valArg = dwMatch[3];
        const pinObj = ensurePin(rawPinToken, lineNum, "output", rawPinToken);
        const pinNum = parseInt(pinObj.pin, 10);

        if (fnName !== "digitalWrite") {
          const bug = {
            id: `bug-fn-dw-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "digitalWrite",
            message: {
              th: `สะกด "${fnName}" ผิดนะ! ต้องเป็น "digitalWrite" (W พิมพ์ใหญ่) เพื่อสั่งงานขา ${pinObj.pin}`,
              en: `You wrote "${fnName}". It should be "digitalWrite" (capital W) to control Pin ${pinObj.pin}!`,
            },
            impact: {
              th: `คำสั่งจ่ายไฟขา ${pinObj.pin} ใช้ไม่ได้ อุปกรณ์ที่ขา ${pinObj.pin} จึงไม่ติด (?)`,
              en: `Power command on Pin ${pinObj.pin} failed, so the device stays off (?)`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }

        // เช็คขา Input-Only ของ ESP32 ใน digitalWrite
        if (boardType === "esp32" && !isNaN(pinNum) && ESP32_INPUT_ONLY_PINS.includes(pinNum)) {
          const bug = {
            id: `bug-esp32-dw-inputonly-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: `digitalWrite(${rawPinToken}, ...)`,
            correctToken: `เปลี่ยนไปใช้ขา GPIO อื่น (เช่น 2, 4, 15, 25, 26)`,
            message: {
              th: `ขา GPIO ${pinObj.pin} บน ESP32 เป็นขา Input-Only สั่ง digitalWrite จ่ายไฟออกไม่ได้นะ!`,
              en: `GPIO ${pinObj.pin} on ESP32 is Input-Only and cannot output voltage via digitalWrite!`,
            },
            impact: {
              th: `ไม่มีไฟออกจากขา ${pinObj.pin} บน ESP32 (?)`,
              en: `No voltage output on ESP32 GPIO ${pinObj.pin} (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }

        const validVals = ["HIGH", "LOW", "1", "0"];
        if (!validVals.includes(valArg)) {
          const upper = valArg.toUpperCase();
          const suggested = ["HIGH", "LOW"].includes(upper) ? upper : "HIGH";
          const bug = {
            id: `bug-val-case-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: valArg,
            correctToken: suggested,
            message: {
              th: `เขียนค่า "${valArg}" ผิดนะ! ต้องเป็นตัวพิมพ์ใหญ่ "${suggested}" อุปกรณ์ขา ${pinObj.pin} ถึงจะติด`,
              en: `You wrote "${valArg}". Write "${suggested}" in ALL CAPS so Pin ${pinObj.pin} works!`,
            },
            impact: {
              th: `สั่งจ่ายไฟขา ${pinObj.pin} ด้วยค่าที่บอร์ดไม่รู้จัก อุปกรณ์ที่ขา ${pinObj.pin} เลยงง (?) และไม่ทำงาน`,
              en: `Unrecognized signal value on Pin ${pinObj.pin} (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        } else if (!pinObj.hasBug) {
          if (valArg === "HIGH" || valArg === "1") {
            pinObj.powerState = "on";
          } else if (pinObj.powerState !== "on") {
            pinObj.powerState = "off";
          }
        }
      }

      // 3. ตรวจจับ analogWrite(...) (เช็คขา PWM เฉพาะบอร์ด Uno ส่วน ESP32 เช็คขา Input-Only)
      const awRegex = /\b(analogWrite|analogwrite)\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)/;
      const awMatch = line.match(awRegex);
      if (awMatch) {
        const rawPinToken = awMatch[2];
        const resolved = resolvePin(rawPinToken);
        const pinNum = parseInt(resolved, 10);
        const pinObj = ensurePin(resolved, lineNum, "output", rawPinToken);

        if (boardType === "uno" && !isNaN(pinNum) && !UNO_PWM_PINS.includes(pinNum)) {
          const bug = {
            id: `bug-pwm-pin-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: `analogWrite(${rawPinToken}, ...)`,
            correctToken: "ใช้ขา PWM ~ (3, 5, 6, 9, 10, 11)",
            message: {
              th: `ขา ${pinObj.pin} ไม่รองรับ PWM (analogWrite) บน Arduino Uno นะ! ลองย้ายไปขา 3, 5, 6, 9, 10 หรือ 11`,
              en: `Pin ${pinObj.pin} doesn't support PWM on Arduino Uno! Try pins 3, 5, 6, 9, 10, or 11.`,
            },
            impact: {
              th: `ขา ${pinObj.pin} ปรับระดับไฟแบบ Analog (PWM) ไม่ได้ ทำให้อุปกรณ์ทำงานผิดเพี้ยน (?)`,
              en: `Pin ${pinObj.pin} cannot output PWM signals (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        } else if (boardType === "esp32" && !isNaN(pinNum) && ESP32_INPUT_ONLY_PINS.includes(pinNum)) {
          const bug = {
            id: `bug-esp32-pwm-inputonly-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: `analogWrite(${rawPinToken}, ...)`,
            correctToken: "ใช้ขา GPIO ที่เป็น Output ได้ (เช่น 2, 4, 15, 25)",
            message: {
              th: `ขา GPIO ${pinObj.pin} บน ESP32 เป็นขา Input-Only ใช้สั่งหรี่ไฟ PWM ไม่ได้นะ!`,
              en: `GPIO ${pinObj.pin} on ESP32 is Input-Only and cannot output PWM!`,
            },
            impact: {
              th: `ขา ${pinObj.pin} จ่ายสัญญาณ PWM ออกไม่ได้ (?)`,
              en: `Cannot output PWM on GPIO ${pinObj.pin} (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        } else if (!pinObj.hasBug) {
          pinObj.powerState = "on";
        }
      }

      // 4. ตรวจจับ digitalRead(...) และ analogRead(...)
      const drRegex = /\b(digitalRead|digitalread|analogRead|analogread)\s*\(\s*([A-Za-z0-9_]+)\s*\)/;
      const drMatch = line.match(drRegex);
      if (drMatch) {
        const fnName = drMatch[1];
        const rawPinToken = drMatch[2];
        const isAnalog = fnName.toLowerCase().startsWith("analog");
        const expectedFn = isAnalog ? "analogRead" : "digitalRead";
        const pinObj = ensurePin(rawPinToken, lineNum, "input", isAnalog ? "sensor" : rawPinToken);
        const pinNum = parseInt(pinObj.pin, 10);

        if (fnName !== expectedFn) {
          const bug = {
            id: `bug-fn-read-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: expectedFn,
            message: {
              th: `สะกด "${fnName}" ผิดนะ! ต้องเป็น "${expectedFn}" (ตัว R พิมพ์ใหญ่) เพื่ออ่านค่าขา ${pinObj.pin}`,
              en: `You wrote "${fnName}". Change it to "${expectedFn}" (capital R) to read Pin ${pinObj.pin}!`,
            },
            impact: {
              th: `อ่านค่าจากปุ่มกด/เซนเซอร์ที่ขา ${pinObj.pin} ไม่ได้ (?)`,
              en: `Cannot read signal from Pin ${pinObj.pin} (?)`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }

        // เช็ค Bug ยอดฮิตของ ESP32: ใช้ analogRead บนขา ADC2 ขณะเปิด WiFi
        if (boardType === "esp32" && isAnalog && usesWiFi && !isNaN(pinNum) && ESP32_ADC2_PINS.includes(pinNum)) {
          const bug = {
            id: `bug-esp32-adc2-wifi-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: `analogRead(${rawPinToken}) บนขา ADC2 ขณะใช้ WiFi`,
            correctToken: `ย้ายเซนเซอร์ไปเสียบขา ADC1 (GPIO 32, 33, 34, 35, 36, 39)`,
            message: {
              th: `ระวังนะ! บน ESP32 ขา GPIO ${pinObj.pin} เป็นวงจร ADC2 ซึ่งจะอ่านค่า analogRead ไม่ได้เลยถ้าเปิดใช้ WiFi.h อยู่! แนะนำให้ย้ายสายเซนเซอร์ไปเสียบขา GPIO 32, 33, 34 หรือ 35 (ADC1) แทนครับ`,
              en: `On ESP32, GPIO ${pinObj.pin} uses ADC2 which conflicts with WiFi! Move your analog sensor to an ADC1 pin (GPIO 32, 33, 34, 35, 36, or 39).`,
            },
            impact: {
              th: `เซนเซอร์ที่ขา ${pinObj.pin} จะอ่านค่าผิดพลาดหรือค้างเมื่อ WiFi ทำงาน (?)`,
              en: `analogRead on GPIO ${pinObj.pin} fails while WiFi is active (?).`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }
      }

      // 4.1 ตรวจจับ tone(...) สำหรับลำโพง Buzzer
      const toneRegex = /\b(tone|Tone)\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([0-9]+)/;
      const toneMatch = line.match(toneRegex);
      if (toneMatch) {
        const fnName = toneMatch[1];
        const rawPinToken = toneMatch[2];
        const pinObj = ensurePin(rawPinToken, lineNum, "output", "buzzer");
        if (fnName !== "tone") {
          const bug = {
            id: `bug-fn-tone-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "tone",
            message: {
              th: `สะกด "${fnName}" ผิดนะ! ต้องใช้ตัวพิมพ์เล็ก "tone" เพื่อสั่งลำโพงขา ${pinObj.pin}`,
              en: `You wrote "${fnName}". It should be lowercase "tone" to sound the buzzer on Pin ${pinObj.pin}!`,
            },
            impact: {
              th: `คำสั่งส่งเสียงที่ลำโพงขา ${pinObj.pin} ไม่ทำงาน (?)`,
              en: `Tone command on buzzer Pin ${pinObj.pin} won't execute (?)`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        } else if (!pinObj.hasBug) {
          pinObj.powerState = "on";
        }
      }

      // 4.2 ตรวจจับการใช้ Serial.print / println แต่ลืม Serial.begin ใน setup()
      if (!hasSerialBegin && !warnedSerialBegin && /\bSerial\.print(?:ln|f)?\s*\(/.test(line)) {
        warnedSerialBegin = true;
        const defaultBaud = boardType === "esp32" ? "115200" : "9600";
        bugs.push({
          id: `bug-missing-serial-begin-${lineNum}`,
          line: lineNum,
          pin: null,
          codeSnippet: rawLine.trim(),
          wrongToken: "ไม่มี Serial.begin(...)",
          correctToken: `Serial.begin(${defaultBaud});`,
          message: {
            th: `นายใช้คำสั่งแสดงผล Serial.print แต่ลืมใส่ Serial.begin(${defaultBaud}); ใน setup() นะ! ถ้าไม่ใส่ หน้าจอ Serial Monitor จะไม่แสดงข้อความอะไรเลย`,
            en: `You used Serial.print, but forgot Serial.begin(${defaultBaud}); inside setup()! Without it, Serial Monitor won't show anything.`,
          },
          impact: {
            th: `หน้าจอ Serial Monitor ไม่แสดงค่าที่พิมพ์ออกมา`,
            en: `Serial output won't appear in Serial Monitor.`,
          },
        });
      }

      // 5. ตรวจจับการเขียนเงื่อนไข if ผิด: ใช้ '=' ตัวเดียวแทน '=='
      const ifRegex = /\bif\s*\((.*)\)/;
      const ifMatch = line.match(ifRegex);
      if (ifMatch) {
        const condition = ifMatch[1];
        const assignInConditionRegex = /([A-Za-z0-9_\(\)]+)\s*(?<![!=<>+*\/\-%&|^])=(?![=])\s*([A-Za-z0-9_]+)/;
        const assignMatch = condition.match(assignInConditionRegex);

        if (assignMatch) {
          const leftSide = assignMatch[1].trim();
          const rightSide = assignMatch[2].trim();
          const wrongExpr = assignMatch[0].trim();
          const fixedExpr = `${leftSide} == ${rightSide}`;

          let targetPin = null;
          if (varRoleMap.has(leftSide)) {
            targetPin = varRoleMap.get(leftSide).pin;
          } else if (varToPinMap.has(leftSide)) {
            targetPin = varToPinMap.get(leftSide);
          } else {
            for (const [p, pObj] of pinMap.entries()) {
              if (pObj.deviceType === "button" || pObj.deviceType === "sensor") {
                targetPin = p;
                break;
              }
            }
          }

          const bug = {
            id: `bug-if-assignment-${lineNum}`,
            line: lineNum,
            pin: targetPin,
            codeSnippet: rawLine.trim(),
            wrongToken: wrongExpr,
            correctToken: fixedExpr,
            message: {
              th: `เผลอใช้ "=" ตัวเดียวใน if นะ! ต้องใช้ "==" (สองตัว) เพื่อเปรียบเทียบค่า ไม่งั้นเงื่อนไขจะเป็นจริงตลอดเวลา`,
              en: `You used a single "=" in \`if (${wrongExpr})\`! Use "==" (double equals) to compare values.`,
            },
            impact: {
              th: targetPin
                ? `เงื่อนไขตรวจสอบปุ่ม/เซนเซอร์ขา ${targetPin} เป็นจริงตลอดเวลา ทำให้อุปกรณ์ทำงานค้าง (?)`
                : `เงื่อนไขใน if เป็นจริงตลอดเวลา ทำให้บล็อกคำสั่งทำงานผิดตรรกะ (?)`,
              en: targetPin
                ? `Condition check on Pin ${targetPin} evaluates to true constantly (?)`
                : `Condition always evaluates to true (?)`,
            },
          };
          bugs.push(bug);

          if (targetPin && pinMap.has(String(targetPin))) {
            const pObj = pinMap.get(String(targetPin));
            pObj.hasBug = true;
            pObj.powerState = "error";
            pObj.bugMessages.push(bug);
          }
        }
      }

      // 6. ตรวจจับการลืมใส่ ; ท้ายคำสั่งมาตรฐาน (รองรับไวยากรณ์ C++/ESP32 ครบถ้วน)
      const isControlOrBrace =
        line.endsWith("{") ||
        line.endsWith("}") ||
        line.endsWith(",") ||
        line.endsWith(":") ||
        line.endsWith("\\") ||
        line.startsWith("#") ||
        line.startsWith("*") ||
        /^(?:void|int|float|double|long|unsigned|bool|boolean|char|byte|String|uint\d+_t|struct|class|enum)\s+[A-Za-z0-9_]+\s*\([^;]*\)$/.test(line) ||
        /^(?:if|else|for|while|switch|do)\b/.test(line);

      if (!isControlOrBrace && !line.endsWith(";")) {
        const pinInLineMatch = line.match(/\(\s*([0-9]+|A[0-5])\s*[,)]/);
        const relatedPin = pinInLineMatch ? pinInLineMatch[1] : null;
        const bug = {
          id: `bug-semicolon-${lineNum}`,
          line: lineNum,
          pin: relatedPin,
          codeSnippet: rawLine.trim(),
          wrongToken: rawLine.trim(),
          correctToken: `${rawLine.trim()};`,
          message: {
            th: `ลืมใส่เซมิโคลอน (;) ปิดท้ายคำสั่งนะ! เติม ";" ต่อท้ายบรรทัดนี้ได้เลย`,
            en: `You forgot a semicolon (;) at the end of line ${lineNum}!`,
          },
          impact: {
            th: relatedPin
              ? `คำสั่งที่บรรทัด ${lineNum} ไม่สมบูรณ์ ส่งผลให้อุปกรณ์ที่ขา ${relatedPin} ไม่ทำงาน (?)`
              : `โค้ดที่บรรทัด ${lineNum} ขาด ";" ทำให้คอมไพล์ไม่ผ่าน`,
            en: relatedPin
              ? `Incomplete statement on line ${lineNum} prevents Pin ${relatedPin} from working (?)`
              : `Missing ";" on line ${lineNum} prevents compilation.`,
          },
        };
        bugs.push(bug);
        if (relatedPin && pinMap.has(String(relatedPin))) {
          const pinObj = pinMap.get(String(relatedPin));
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }
      }
    });

    // 7. ตรวจจับกรณีสั่ง digitalWrite แต่ลืมประกาศ pinMode(pin, OUTPUT) ใน setup()
    for (const [pin, pinObj] of pinMap.entries()) {
      if (
        pinObj.deviceType !== "button" &&
        pinObj.deviceType !== "sensor" &&
        pinObj.deviceType !== "lcd_i2c" &&
        pinObj.deviceType !== "dht11"
      ) {
        if (!pinObj.configuredMode && !pinObj.hasBug) {
          const firstLine = pinObj.lines[0] || 1;
          const bug = {
            id: `bug-missing-pinmode-${pin}`,
            line: firstLine,
            pin,
            codeSnippet: `digitalWrite(${pin}, ...)`,
            wrongToken: `ไม่มี pinMode(${pin}, OUTPUT)`,
            correctToken: `pinMode(${pin}, OUTPUT);`,
            message: {
              th: `สั่งจ่ายไฟขา ${pin} แต่ลืมใส่ pinMode(${pin}, OUTPUT); ใน setup() นะ!`,
              en: `You used digitalWrite on Pin ${pin}, but forgot pinMode(${pin}, OUTPUT); inside setup()!`,
            },
            impact: {
              th: `ลืมตั้งค่า pinMode ขา ${pin} เป็น OUTPUT ทำให้อุปกรณ์ขา ${pin} ได้รับไฟไม่พอ (?)`,
              en: `Missing pinMode(${pin}, OUTPUT) leaves Pin ${pin} unconfigured (?)`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }
      }
    }

    // 8. ตรวจจับโมดูล I2C LCD Display
    const hasLcd = /LiquidCrystal_I2C|lcd\.(?:begin|init|print|clear)/.test(code);
    if (hasLcd) {
      const lcdPinKey = boardType === "esp32" ? "21/22" : "A4/A5";
      if (!pinMap.has(lcdPinKey)) {
        const lcdTexts = extractLcdTexts(code);
        pinMap.set(lcdPinKey, {
          pin: lcdPinKey,
          deviceType: "lcd_i2c",
          configuredMode: "I2C (SDA/SCL)",
          isConfiguredValid: true,
          powerState: "on",
          hasBug: false,
          bugMessages: [],
          lines: [1],
          extraData: {
            address: "0x27",
            lines: lcdTexts.length > 0 ? lcdTexts : ["IoT Help Buddy", "LCD I2C Ready!"],
          },
          breadboard: getBreadboardGuide("lcd_i2c", lcdPinKey, boardType),
        });
      }
    }

    // 9. ตรวจจับ Ultrasonic Sensor (Trig & Echo)
    const hasUltrasonic = /trigPin|echoPin|pulseIn|HC-SR04/i.test(code);
    if (hasUltrasonic) {
      for (const [, pinObj] of pinMap.entries()) {
        if (
          pinObj.rawToken &&
          (pinObj.rawToken.toLowerCase().includes("trig") ||
            pinObj.rawToken.toLowerCase().includes("echo"))
        ) {
          pinObj.deviceType = "ultrasonic";
          pinObj.extraData = { distanceCm: 25 };
          pinObj.breadboard = getBreadboardGuide("ultrasonic", pinObj.pin, boardType);
        }
      }
    }

    // 10. ตรวจจับ DHT11 (รวมถึงกรณีประกาศผ่านไลบรารี DHT dht(DHTPIN, DHT11) โดยไม่มี pinMode)
    const hasDht = /DHT\s+|DHT11|dht\./i.test(code);
    if (hasDht) {
      let foundDhtPin = false;
      for (const [, pinObj] of pinMap.entries()) {
        if (
          pinObj.rawToken &&
          (pinObj.rawToken.toLowerCase().includes("dht") ||
            pinObj.rawToken.toLowerCase().includes("temp"))
        ) {
          pinObj.deviceType = "dht11";
          pinObj.extraData = { tempC: 28.5, humidityPct: 65 };
          pinObj.breadboard = getBreadboardGuide("dht11", pinObj.pin, boardType);
          foundDhtPin = true;
        }
      }
      if (!foundDhtPin) {
        for (const [, info] of varRoleMap.entries()) {
          if (info.role === "dht" && !pinMap.has(info.pin)) {
            pinMap.set(info.pin, {
              pin: info.pin,
              deviceType: "dht11",
              configuredMode: "DHT DATA",
              isConfiguredValid: true,
              powerState: "on",
              hasBug: false,
              bugMessages: [],
              lines: [1],
              extraData: { tempC: 28.5, humidityPct: 65 },
              breadboard: getBreadboardGuide("dht11", info.pin, boardType),
            });
          }
        }
      }
    }

    // 11. ตรวจจับ Servo.attach(pin)
    const servoAttachRegex = /\b([A-Za-z0-9_]+)\.attach\s*\(\s*([A-Za-z0-9_]+)\s*\)/g;
    let sMatch;
    while ((sMatch = servoAttachRegex.exec(code)) !== null) {
      const sPin = resolvePin(sMatch[2]);
      if (!pinMap.has(sPin)) {
        pinMap.set(sPin, {
          pin: sPin,
          deviceType: "servo",
          configuredMode: "SERVO PWM",
          isConfiguredValid: true,
          powerState: "on",
          hasBug: false,
          bugMessages: [],
          lines: [1],
          extraData: { angle: 90 },
          breadboard: getBreadboardGuide("servo", sPin, boardType),
        });
      }
    }

    const devices = Array.from(pinMap.values());
    const simulationSteps = extractSimulationSteps(code, varToPinMap);

    return {
      ok: bugs.length === 0,
      boardType,
      bugCount: bugs.length,
      bugs,
      devices,
      simulationSteps,
      summary: {
        th:
          bugs.length === 0
            ? "เย่! โค้ดถูกต้องครบถ้วน อุปกรณ์ทุกชิ้นบนเบรดบอร์ดพร้อมทำงานเลย!"
            : `พบจุดผิด ${bugs.length} จุด! กดปุ่ม ✨ แก้ทันที หรือดูจุดที่มี ? บนเบรดบอร์ดได้เลย`,
        en:
          bugs.length === 0
            ? "Yay! Your code looks great! All components on the breadboard are ready."
            : `Found ${bugs.length} issue(s)! Click ✨ Auto-Fix or check the ? mark on the breadboard.`,
      },
    };
  }

  return {
    analyzeArduinoCode,
    detectBoardType,
    extractSimulationSteps,
    extractLcdTexts,
    getBreadboardGuide,
  };
});
