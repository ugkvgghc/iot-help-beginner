/**
 * IoT Help Beginner - Arduino Code Analyzer & Circuit Inferencer
 * วิเคราะห์โค้ด Arduino (.ino) เพื่อหา Bug ที่มือใหม่มักเขียนผิด
 * พร้อมแปลงเป็นคำพูดภาษาคน (TH/EN) และสร้างรายการอุปกรณ์ในวงจรสำหรับแสดงผลบนเว็บ
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.IoTAnalyzer = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const UNO_PWM_PINS = [3, 5, 6, 9, 10, 11];

  /**
   * เดารูปแบบอุปกรณ์จากชื่อตัวแปร คอมเมนต์ หรือลักษณะการใช้งานขา (Pin)
   */
  function guessDeviceType(pin, role, codeContext, varName = "") {
    // 1. ตรวจสอบจากชื่อตัวแปรโดยตรง (varName) ก่อน
    const vLower = String(varName || "").toLowerCase();
    if (vLower.includes("led")) return "led";
    if (vLower.includes("buzzer") || vLower.includes("tone") || vLower.includes("speaker") || vLower.includes("piezo")) return "buzzer";
    if (vLower.includes("servo")) return "servo";
    if (vLower.includes("relay")) return "relay";
    if (vLower.includes("trig") || vLower.includes("echo") || vLower.includes("ultra") || vLower.includes("sonar")) return "ultrasonic";
    if (vLower.includes("dht") || vLower.includes("humi")) return "dht11";
    if (vLower.includes("button") || vLower.includes("btn") || vLower.includes("sw") || vLower.includes("switch")) return "button";
    if (vLower.includes("pot") || vLower.includes("ldr") || vLower.includes("sensor")) return "sensor";

    // 2. ค้นหาในบรรทัดที่มีการประกาศหรือใช้งานขานี้โดยเฉพาะ (สแกน 150 บรรทัดแรกที่มีการประกาศขาเพื่อประสิทธิภาพสูงสุด)
    const pinStr = String(pin).trim();
    const pinEscaped = pinStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const varEscaped = String(varName || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = varEscaped ? `(?:\\b${pinEscaped}\\b|\\b${varEscaped}\\b)` : `\\b${pinEscaped}\\b`;
    const specificRegex = new RegExp(`.*${pattern}.*`, "gi");
    
    // ค้นหาเฉพาะในส่วนหัวของไฟล์หรือ 150 บรรทัดแรกที่มีการกำหนดค่า
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
  function extractSimulationSteps(code) {
    const steps = [];
    const lines = code.split(/\r?\n/);
    let insideLoop = false;
    let bracketDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const raw = lines[i];
      const line = raw.replace(/\/\/.*$/, "").trim();

      if (/void\s+loop\s*\(\s*\)/.test(line)) {
        insideLoop = true;
      }

      if (insideLoop) {
        if (steps.length >= 64) {
          // เก็บขั้นตอนจำลองสูงสุด 64 สเต็ปเพื่อความลื่นไหลและประหยัดหน่วยความจำ
          break;
        }
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
          const pin = dwMatch[1];
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
            pin: toneMatch[1],
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
            pin: noToneMatch[1],
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
   * วิเคราะห์โค้ด Arduino และคืนค่ารายการ Bug + อุปกรณ์ที่คาดว่าต่ออยู่ในวงจร
   * @param {string} code โค้ด Arduino (.ino)
   */
  function analyzeArduinoCode(code) {
    const lines = code.split(/\r?\n/);
    const bugs = [];
    const pinMap = new Map(); // pin -> { pin, deviceType, configuredMode, ... }
    const varToPinMap = new Map(); // variableName -> pin (เช่น "trigPin" -> "9", "ledPin" -> "4")
    const varRoleMap = new Map(); // variableName -> role/device hint (เช่น "buttonState" -> "button")

    // ขั้นตอนที่ 0: สแกนหาการประกาศตัวแปรระบุขา Pin เช่น const int trigPin = 9; #define LED 4;
    const varDeclRegex = /(?:const\s+)?(?:int|byte|uint8_t|short)\s+([A-Za-z0-9_]+)\s*=\s*([0-9]+|A[0-5])\s*;/g;
    let vMatch;
    while ((vMatch = varDeclRegex.exec(code)) !== null) {
      const varName = vMatch[1];
      const pinVal = vMatch[2];
      varToPinMap.set(varName, pinVal);
    }

    const defineRegex = /#define\s+([A-Za-z0-9_]+)\s+([0-9]+|A[0-5])/g;
    let dMatch;
    while ((dMatch = defineRegex.exec(code)) !== null) {
      varToPinMap.set(dMatch[1], dMatch[2]);
    }

    // สแกนตัวแปรที่รับค่าจาก digitalRead เช่น int buttonState = digitalRead(buttonPin);
    const readAssignRegex = /(?:int|byte|bool|auto)\s+([A-Za-z0-9_]+)\s*=\s*digitalRead\s*\(\s*([A-Za-z0-9_]+)\s*\)/g;
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
          powerState: "off", // "on" | "off" | "pwm" | "error"
          hasBug: false,
          bugMessages: [],
          lines: [lineNum],
          extraData: {},
        });
      } else {
        const entry = pinMap.get(pinKey);
        if (entry.lines.length < 50 && !entry.lines.includes(lineNum)) {
          entry.lines.push(lineNum);
        }
        // ปรับ deviceType ครั้งเดียวถ้ามี hint ใหม่ที่เจาะจงขึ้น
        if (entry.deviceType === "led" && varHint && varHint !== pinKey && !entry._checkedHint) {
          entry._checkedHint = true;
          const refinedType = guessDeviceType(pinKey, roleHint, code, varHint);
          if (refinedType !== "led") entry.deviceType = refinedType;
        }
      }
      return pinMap.get(pinKey);
    }

    // ตรวจสอบโค้ดแบบบรรทัดต่อบรรทัด
    lines.forEach((rawLine, idx) => {
      const lineNum = idx + 1;
      const line = rawLine.replace(/\/\/.*$/, "").trim();
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

        // เช็คชื่อฟังก์ชัน pinMode พิมพ์ผิด
        if (fnName !== "pinMode") {
          const bug = {
            id: `bug-fn-pinmode-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "pinMode",
            message: {
              th: `เฮ้! นายเขียนคำสั่ง "${fnName}" ผิดที่บรรทัด ${lineNum} นะ ต้องเขียนเป็น "pinMode" (ตัว M พิมพ์ใหญ่) ไม่งั้นบอร์ดตั้งค่าขา ${pinObj.pin} ไม่ได้นะ!`,
              en: `Hey! You wrote "${fnName}" on line ${lineNum}. You need to write it as "pinMode" (with a capital M), otherwise Pin ${pinObj.pin} won't be configured!`,
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

        // เช็คค่าโหมด OUTPUT / INPUT / INPUT_PULLUP พิมพ์ตัวเล็ก-ใหญ่ผิด เช่น Output, Input
        const validModes = ["OUTPUT", "INPUT", "INPUT_PULLUP"];
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
              th: `เฮ้! นายเขียนตัว "${modeArg}" ผิดที่บรรทัด ${lineNum} นะ นายต้องเขียนเป็นตัวพิมพ์ใหญ่ทั้งหมดว่า "${suggested}" ไม่งั้นขา ${pinObj.pin} จะจ่ายไฟหรือรับค่าไม่ได้!`,
              en: `Hey! You wrote "${modeArg}" on line ${lineNum}. You must write it in ALL CAPS as "${suggested}", otherwise Pin ${pinObj.pin} won't work!`,
            },
            impact: {
              th: `ตั้งค่าโหมดขา ${pinObj.pin} ผิดพลาด ทำให้อุปกรณ์ที่ขา ${pinObj.pin} ไม่ทำงานและขึ้นเครื่องหมาย ?`,
              en: `Invalid mode on Pin ${pinObj.pin}. The connected component won't operate and shows a ? mark.`,
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
      }

      // 2. ตรวจจับ digitalWrite(...)
      const dwRegex = /\b(digitalWrite|digitalwrite|DigitalWrite)\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)/;
      const dwMatch = line.match(dwRegex);
      if (dwMatch) {
        const fnName = dwMatch[1];
        const rawPinToken = dwMatch[2];
        const valArg = dwMatch[3];
        const pinObj = ensurePin(rawPinToken, lineNum, "output", rawPinToken);

        if (fnName !== "digitalWrite") {
          const bug = {
            id: `bug-fn-dw-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "digitalWrite",
            message: {
              th: `เฮ้! ที่บรรทัด ${lineNum} นายสะกดคำสั่ง "${fnName}" ผิดนะ ต้องเป็น "digitalWrite" (ตัว W พิมพ์ใหญ่) ถึงจะสั่งจ่ายไฟที่ขา ${pinObj.pin} ได้!`,
              en: `Hey! On line ${lineNum}, you wrote "${fnName}". It should be "digitalWrite" (capital W) to control power on Pin ${pinObj.pin}!`,
            },
            impact: {
              th: `คำสั่งจ่ายไฟขา ${pinObj.pin} ใช้ไม่ได้ อุปกรณ์ที่ขา ${pinObj.pin} จึงไม่ติด (?)`,
              en: `Power command on Pin ${pinObj.pin} failed, so the device on Pin ${pinObj.pin} stays off (?)`,
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
              th: `เฮ้! นายเขียนค่าจ่ายไฟ "${valArg}" ผิดที่บรรทัด ${lineNum} นะ ต้องเขียนเป็นตัวพิมพ์ใหญ่ทั้งหมดว่า "${suggested}" อุปกรณ์ที่ขา ${pinObj.pin} ถึงจะทำงาน!`,
              en: `Hey! You wrote "${valArg}" on line ${lineNum}. You need to write "${suggested}" in ALL CAPS so the component on Pin ${pinObj.pin} gets the right signal!`,
            },
            impact: {
              th: `สั่งจ่ายไฟขา ${pinObj.pin} ด้วยค่าที่บอร์ดไม่รู้จัก อุปกรณ์ที่ขา ${pinObj.pin} เลยงง (?) และไม่ทำงาน`,
              en: `Unrecognized signal value on Pin ${pinObj.pin}. The component is confused (?) and won't turn on.`,
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

      // 3. ตรวจจับ analogWrite(...) บนขาที่ไม่ใช่ PWM
      const awRegex = /\b(analogWrite|analogwrite)\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)/;
      const awMatch = line.match(awRegex);
      if (awMatch) {
        const rawPinToken = awMatch[2];
        const resolved = resolvePin(rawPinToken);
        const pinNum = parseInt(resolved, 10);
        const pinObj = ensurePin(resolved, lineNum, "output", rawPinToken);

        if (!isNaN(pinNum) && !UNO_PWM_PINS.includes(pinNum)) {
          const bug = {
            id: `bug-pwm-pin-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: `analogWrite(${rawPinToken}, ...)`,
            correctToken: "ใช้ขา PWM (3, 5, 6, 9, 10, 11)",
            message: {
              th: `เฮ้! บรรทัด ${lineNum} นายใช้ analogWrite กับขา ${pinObj.pin} ซึ่งบอร์ด Arduino Uno ขานี้ไม่รองรับการหรี่ไฟ (PWM) นะ! ลองย้ายไปขา 3, 5, 6, 9, 10 หรือ 11 ดูสิ`,
              en: `Hey! On line ${lineNum}, you used analogWrite on Pin ${pinObj.pin}, which doesn't support PWM on Arduino Uno! Try pins 3, 5, 6, 9, 10, or 11 instead.`,
            },
            impact: {
              th: `ขา ${pinObj.pin} ปรับระดับไฟแบบ Analog (PWM) ไม่ได้ ทำให้อุปกรณ์ทำงานผิดเพี้ยน (?)`,
              en: `Pin ${pinObj.pin} cannot output PWM signals, causing unexpected behavior (?) on the component.`,
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

      // 4. ตรวจจับ digitalRead(...)
      const drRegex = /\b(digitalRead|digitalread)\s*\(\s*([A-Za-z0-9_]+)\s*\)/;
      const drMatch = line.match(drRegex);
      if (drMatch) {
        const fnName = drMatch[1];
        const rawPinToken = drMatch[2];
        const pinObj = ensurePin(rawPinToken, lineNum, "input", rawPinToken);
        if (fnName !== "digitalRead") {
          const bug = {
            id: `bug-fn-dr-${lineNum}`,
            line: lineNum,
            pin: pinObj.pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "digitalRead",
            message: {
              th: `เฮ้! บรรทัด ${lineNum} นายพิมพ์ "${fnName}" ผิดนะ ต้องเป็น "digitalRead" (ตัว R พิมพ์ใหญ่) ถึงจะอ่านค่าจากปุ่ม/เซนเซอร์ขา ${pinObj.pin} ได้!`,
              en: `Hey! On line ${lineNum}, you wrote "${fnName}". Change it to "digitalRead" (capital R) to read from the sensor/button on Pin ${pinObj.pin}!`,
            },
            impact: {
              th: `อ่านค่าจากปุ่มกด/เซนเซอร์ที่ขา ${pinObj.pin} ไม่ได้ (?)`,
              en: `Cannot read signal from button/sensor on Pin ${pinObj.pin} (?)`,
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
              th: `เฮ้! บรรทัด ${lineNum} นายพิมพ์ "${fnName}" ผิดนะ ต้องเป็น "tone" (ตัวพิมพ์เล็กทั้งหมด) ถึงจะสั่งเสียงลำโพงขา ${pinObj.pin} ได้!`,
              en: `Hey! On line ${lineNum}, you wrote "${fnName}". It should be lowercase "tone" to sound the buzzer on Pin ${pinObj.pin}!`,
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

      // 5. ตรวจจับการเขียนเงื่อนไข if ผิด: ใช้ '=' ตัวเดียวแทน '==' (Bug ยอดฮิตของมือใหม่!)
      const ifRegex = /\bif\s*\((.*)\)/;
      const ifMatch = line.match(ifRegex);
      if (ifMatch) {
        const condition = ifMatch[1];
        // ตรวจหาเครื่องหมาย = ตัวเดี่ยวที่ไม่ได้อยู่คู่กับ !, =, <, >, +, -, *, /, %, &, |, ^
        const assignInConditionRegex = /([A-Za-z0-9_\(\)]+)\s*(?<![!=<>+*\/\-%&|^])=(?![=])\s*([A-Za-z0-9_]+)/;
        const assignMatch = condition.match(assignInConditionRegex);

        if (assignMatch) {
          const leftSide = assignMatch[1].trim();
          const rightSide = assignMatch[2].trim();
          const wrongExpr = assignMatch[0].trim();
          const fixedExpr = `${leftSide} == ${rightSide}`;

          // หาว่าเงื่อนไขนี้เกี่ยวข้องกับขาไหนหรือไม่ (เช่น buttonState หรือปุ่มกด)
          let targetPin = null;
          if (varRoleMap.has(leftSide)) {
            targetPin = varRoleMap.get(leftSide).pin;
          } else if (varToPinMap.has(leftSide)) {
            targetPin = varToPinMap.get(leftSide);
          } else {
            // ค้นหาอุปกรณ์ประเภทปุ่มกดหรือเซนเซอร์ในวงจร
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
              th: `เฮ้! ที่บรรทัด ${lineNum} นายเผลอใช้เครื่องหมายกำหนดค่า "=" ตัวเดียวในเงื่อนไข \`if (${wrongExpr})\` นะ! ในภาษา C/Arduino นายต้องใช้ "==" (สองตัว) สำหรับเปรียบเทียบ ไม่งั้นมันจะเป็นการเซ็ตค่าให้ตัวแปรและทำให้เงื่อนไขเป็นจริง (True) ตลอดเวลาเลย!`,
              en: `Hey! On line ${lineNum}, you used a single "=" assignment operator in \`if (${wrongExpr})\`! In C/Arduino, you must use "==" (double equals) to compare. A single "=" assigns the value and makes the condition evaluate to true all the time!`,
            },
            impact: {
              th: targetPin
                ? `เงื่อนไขตรวจสอบปุ่ม/เซนเซอร์ขา ${targetPin} เป็นจริงตลอดเวลา ทำให้อุปกรณ์ทำงานค้างหรือไม่ตรงกับความจริง (?)`
                : `เงื่อนไขใน if เป็นจริงตลอดเวลา ทำให้บล็อกคำสั่งทำงานผิดตรรกะ (?)`,
              en: targetPin
                ? `Condition check on Pin ${targetPin} evaluates to true constantly, causing hardware to behave unexpectedly (?)`
                : `Condition always evaluates to true, breaking program logic (?)`,
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

      // 6. ตรวจจับการลืมใส่ ; ท้ายคำสั่งมาตรฐาน
      const isControlOrBrace =
        line.endsWith("{") ||
        line.endsWith("}") ||
        line.startsWith("#") ||
        line.startsWith("void ") ||
        line.startsWith("if") ||
        line.startsWith("else") ||
        line.startsWith("for") ||
        line.startsWith("while");

      if (!isControlOrBrace && !line.endsWith(";")) {
        // หาว่าบรรทัดนี้เกี่ยวข้องกับขาไหนไหม
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
            th: `เฮ้! นายลืมใส่เครื่องหมายเซมิโคลอน (;) ปิดท้ายที่บรรทัด ${lineNum} นะ! เติม ";" ต่อท้ายบรรทัดนี้ก็เรียบร้อยแล้ว`,
            en: `Hey! You forgot a semicolon (;) at the end of line ${lineNum}! Just add ";" at the end of that line.`,
          },
          impact: {
            th: relatedPin
              ? `คำสั่งที่บรรทัด ${lineNum} ไม่สมบูรณ์ ส่งผลให้อุปกรณ์ที่ขา ${relatedPin} ไม่ทำงาน (?)`
              : `โค้ดที่บรรทัด ${lineNum} ขาด ";" ทำให้คอมไพล์ไม่ผ่าน`,
            en: relatedPin
              ? `Incomplete statement on line ${lineNum} prevents the device on Pin ${relatedPin} from working (?)`
              : `Missing ";" on line ${lineNum} prevents the code from compiling.`,
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
              th: `เฮ้! นายสั่งจ่ายไฟที่ขา ${pin} (บรรทัด ${firstLine}) แต่ลืมเขียน pinMode(${pin}, OUTPUT); ในฟังก์ชัน setup() นะ! ถ้าไม่ตั้งค่าก่อน ไฟที่ขา ${pin} จะออกมาน้อยมากจนอุปกรณ์ไม่ทำงานนะ`,
              en: `Hey! You used digitalWrite on Pin ${pin} (line ${firstLine}), but forgot to add pinMode(${pin}, OUTPUT); inside setup()! Without it, the component on Pin ${pin} will be super dim or won't work!`,
            },
            impact: {
              th: `ลืมตั้งค่า pinMode ขา ${pin} เป็น OUTPUT ทำให้อุปกรณ์ขา ${pin} ได้รับไฟไม่พอ (?)`,
              en: `Missing pinMode(${pin}, OUTPUT) leaves Pin ${pin} unconfigured, so the component fails to power on properly (?)`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }
      }
    }

    // 8. ตรวจจับโมดูล I2C LCD Display จากไลบรารี LiquidCrystal_I2C หรือคำสั่ง lcd.
    const hasLcd = /LiquidCrystal_I2C|lcd\.(?:begin|init|print|clear)/.test(code);
    if (hasLcd) {
      const lcdPinKey = "A4/A5";
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
        });
      }
    }

    // 9. ตรวจจับ Ultrasonic Sensor (Trig & Echo) เพิ่มเติม
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
        }
      }
    }

    // 10. ตรวจจับ DHT11 เพิ่มเติม
    const hasDht = /DHT\s+|DHT11|dht\./i.test(code);
    if (hasDht) {
      for (const [, pinObj] of pinMap.entries()) {
        if (
          pinObj.rawToken &&
          (pinObj.rawToken.toLowerCase().includes("dht") ||
            pinObj.rawToken.toLowerCase().includes("temp"))
        ) {
          pinObj.deviceType = "dht11";
          pinObj.extraData = { tempC: 28.5, humidityPct: 65 };
        }
      }
    }

    const devices = Array.from(pinMap.values());
    const simulationSteps = extractSimulationSteps(code);

    return {
      ok: bugs.length === 0,
      bugCount: bugs.length,
      bugs,
      devices,
      simulationSteps,
      summary: {
        th:
          bugs.length === 0
            ? "เย่! โค้ดของนายดูถูกต้องครบถ้วน อุปกรณ์ทุกชิ้นในวงจรทำงานได้ปกติเลย!"
            : `พบจุดที่เขียนผิด ${bugs.length} จุด! ลองดูคำแนะนำจากตัวละครและดูอุปกรณ์ที่มีเครื่องหมาย ? ในวงจรกระดาษแปะได้เลย`,
        en:
          bugs.length === 0
            ? "Yay! Your Arduino code looks great! All components in the circuit are working normally."
            : `Found ${bugs.length} issue(s) in your code! Check the mascot tip and look for the ? mark above the affected hardware cutout.`,
      },
    };
  }

  return {
    analyzeArduinoCode,
    extractSimulationSteps,
    extractLcdTexts,
  };
});
