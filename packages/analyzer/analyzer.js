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
  function guessDeviceType(pin, role, codeContext) {
    const lower = codeContext.toLowerCase();
    if (lower.includes("servo")) return "servo";
    if (lower.includes("buzzer") || lower.includes("tone")) return "buzzer";
    if (lower.includes("relay")) return "relay";
    if (lower.includes("button") || lower.includes("btn") || lower.includes("sw")) return "button";
    if (lower.includes("sensor") || lower.includes("ldr") || lower.includes("temp") || String(pin).startsWith("A")) {
      return role === "input" ? "sensor" : "led";
    }
    return role === "input" ? "button" : "led";
  }

  /**
   * วิเคราะห์โค้ด Arduino และคืนค่ารายการ Bug + อุปกรณ์ที่คาดว่าต่ออยู่ในวงจร
   * @param {string} code โค้ด Arduino (.ino)
   */
  function analyzeArduinoCode(code) {
    const lines = code.split(/\r?\n/);
    const bugs = [];
    const pinMap = new Map(); // pin -> { pin, type, configuredMode, usedActions: [], bugs: [], lineNumbers: [] }

    function ensurePin(pinStr, lineNum, roleHint) {
      const pinKey = String(pinStr).trim();
      if (!pinMap.has(pinKey)) {
        const deviceType = guessDeviceType(pinKey, roleHint, code);
        pinMap.set(pinKey, {
          pin: pinKey,
          deviceType,
          configuredMode: null,
          isConfiguredValid: false,
          powerState: "off", // "on" | "off" | "pwm" | "error"
          hasBug: false,
          bugMessages: [],
          lines: [lineNum],
        });
      } else {
        const entry = pinMap.get(pinKey);
        if (!entry.lines.includes(lineNum)) entry.lines.push(lineNum);
      }
      return pinMap.get(pinKey);
    }

    lines.forEach((rawLine, idx) => {
      const lineNum = idx + 1;
      // ตัด comment ออกเพื่อตรวจไวยากรณ์
      const line = rawLine.replace(/\/\/.*$/, "").trim();
      if (!line) return;

      // 1. ตรวจจับ pinMode(...)
      const pinModeRegex = /\b(pinMode|pinmode|PinMode)\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)/;
      const pmMatch = line.match(pinModeRegex);
      if (pmMatch) {
        const fnName = pmMatch[1];
        const pin = pmMatch[2];
        const modeArg = pmMatch[3];
        const roleHint = modeArg.toUpperCase().includes("INPUT") ? "input" : "output";
        const pinObj = ensurePin(pin, lineNum, roleHint);

        // เช็คชื่อฟังก์ชัน pinMode พิมพ์ผิด
        if (fnName !== "pinMode") {
          const bug = {
            id: `bug-fn-pinmode-${lineNum}`,
            line: lineNum,
            pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "pinMode",
            message: {
              th: `เฮ้! นายเขียนคำสั่ง "${fnName}" ผิดที่บรรทัด ${lineNum} นะ ต้องเขียนเป็น "${"pinMode"}" (ตัว M พิมพ์ใหญ่) ไม่งั้นบอร์ดตั้งค่าขา ${pin} ไม่ได้นะ!`,
              en: `Hey! You wrote "${fnName}" on line ${lineNum}. You need to write it as "pinMode" (with a capital M), otherwise Pin ${pin} won't be configured!`,
            },
            impact: {
              th: `ขาที่ ${pin} ยังไม่ถูกตั้งค่า ทำให้หลอดไฟ/อุปกรณ์ที่ต่อขา ${pin} ไม่ทำงาน (?)`,
              en: `Pin ${pin} is not configured properly, causing the device on Pin ${pin} to fail (?)`,
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
            pin,
            codeSnippet: rawLine.trim(),
            wrongToken: modeArg,
            correctToken: suggested,
            message: {
              th: `เฮ้! นายเขียนตัว "${modeArg}" ผิดที่บรรทัด ${lineNum} นะ นายต้องเขียนเป็นตัวพิมพ์ใหญ่ทั้งหมดว่า "${suggested}" ไม่งั้นขา ${pin} จะจ่ายไฟหรือรับค่าไม่ได้!`,
              en: `Hey! You wrote "${modeArg}" on line ${lineNum}. You must write it in ALL CAPS as "${suggested}", otherwise Pin ${pin} won't work!`,
            },
            impact: {
              th: `ตั้งค่าโหมดขา ${pin} ผิดพลาด ทำให้อุปกรณ์ที่ขา ${pin} ไม่ทำงานและขึ้นเครื่องหมาย ?`,
              en: `Invalid mode on Pin ${pin}. The connected component won't operate and shows a ? mark.`,
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
        const pin = dwMatch[2];
        const valArg = dwMatch[3];
        const pinObj = ensurePin(pin, lineNum, "output");

        if (fnName !== "digitalWrite") {
          const bug = {
            id: `bug-fn-dw-${lineNum}`,
            line: lineNum,
            pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "digitalWrite",
            message: {
              th: `เฮ้! ที่บรรทัด ${lineNum} นายสะกดคำสั่ง "${fnName}" ผิดนะ ต้องเป็น "digitalWrite" (ตัว W พิมพ์ใหญ่) ถึงจะสั่งจ่ายไฟที่ขา ${pin} ได้!`,
              en: `Hey! On line ${lineNum}, you wrote "${fnName}". It should be "digitalWrite" (capital W) to control power on Pin ${pin}!`,
            },
            impact: {
              th: `คำสั่งจ่ายไฟขา ${pin} ใช้ไม่ได้ หลอดไฟ/อุปกรณ์ที่ขา ${pin} จึงไม่ติด (?)`,
              en: `Power command on Pin ${pin} failed, so the device on Pin ${pin} stays off (?)`,
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
            pin,
            codeSnippet: rawLine.trim(),
            wrongToken: valArg,
            correctToken: suggested,
            message: {
              th: `เฮ้! นายเขียนค่าจ่ายไฟ "${valArg}" ผิดที่บรรทัด ${lineNum} นะ ต้องเขียนเป็นตัวพิมพ์ใหญ่ทั้งหมดว่า "${suggested}" อุปกรณ์ที่ขา ${pin} ถึงจะทำงาน!`,
              en: `Hey! You wrote "${valArg}" on line ${lineNum}. You need to write "${suggested}" in ALL CAPS so the component on Pin ${pin} gets the right signal!`,
            },
            impact: {
              th: `สั่งจ่ายไฟขา ${pin} ด้วยค่าที่บอร์ดไม่รู้จัก อุปกรณ์ที่ขา ${pin} เลยงง (?) และไม่ทำงาน`,
              en: `Unrecognized signal value on Pin ${pin}. The component is confused (?) and won't turn on.`,
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
      const awRegex = /\b(analogWrite|analogwrite)\s*\(\s*(\d+)\s*,\s*([A-Za-z0-9_]+)\s*\)/;
      const awMatch = line.match(awRegex);
      if (awMatch) {
        const fnName = awMatch[1];
        const pinNum = parseInt(awMatch[2], 10);
        const pin = String(pinNum);
        const pinObj = ensurePin(pin, lineNum, "output");

        if (!UNO_PWM_PINS.includes(pinNum)) {
          const bug = {
            id: `bug-pwm-pin-${lineNum}`,
            line: lineNum,
            pin,
            codeSnippet: rawLine.trim(),
            wrongToken: `analogWrite(${pin}, ...)`,
            correctToken: "ใช้ขา PWM (3, 5, 6, 9, 10, 11)",
            message: {
              th: `เฮ้! บรรทัด ${lineNum} นายใช้ analogWrite กับขา ${pin} ซึ่งบอร์ด Arduino Uno ขา ${pin} ไม่รองรับการหรี่ไฟ (PWM) นะ! ลองย้ายไปขา 3, 5, 6, 9, 10 หรือ 11 ดูสิ`,
              en: `Hey! On line ${lineNum}, you used analogWrite on Pin ${pin}, which doesn't support PWM on Arduino Uno! Try pins 3, 5, 6, 9, 10, or 11 instead.`,
            },
            impact: {
              th: `ขา ${pin} ปรับระดับไฟแบบ Analog (PWM) ไม่ได้ ทำให้อุปกรณ์ทำงานผิดเพี้ยน (?)`,
              en: `Pin ${pin} cannot output PWM signals, causing unexpected behavior (?) on the component.`,
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
        const pin = drMatch[2];
        const pinObj = ensurePin(pin, lineNum, "input");
        if (fnName !== "digitalRead") {
          const bug = {
            id: `bug-fn-dr-${lineNum}`,
            line: lineNum,
            pin,
            codeSnippet: rawLine.trim(),
            wrongToken: fnName,
            correctToken: "digitalRead",
            message: {
              th: `เฮ้! บรรทัด ${lineNum} นายพิมพ์ "${fnName}" ผิดนะ ต้องเป็น "digitalRead" (ตัว R พิมพ์ใหญ่) ถึงจะอ่านค่าจากปุ่ม/เซนเซอร์ขา ${pin} ได้!`,
              en: `Hey! On line ${lineNum}, you wrote "${fnName}". Change it to "digitalRead" (capital R) to read from the sensor/button on Pin ${pin}!`,
            },
            impact: {
              th: `อ่านค่าจากปุ่มกด/เซนเซอร์ที่ขา ${pin} ไม่ได้ (?)`,
              en: `Cannot read signal from button/sensor on Pin ${pin} (?)`,
            },
          };
          bugs.push(bug);
          pinObj.hasBug = true;
          pinObj.powerState = "error";
          pinObj.bugMessages.push(bug);
        }
      }

      // 5. ตรวจจับการลืมใส่ ; ท้ายคำสั่งมาตรฐาน
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

    // 6. ตรวจจับกรณีสั่ง digitalWrite แต่ลืมประกาศ pinMode(pin, OUTPUT) ใน setup()
    for (const [pin, pinObj] of pinMap.entries()) {
      if (pinObj.deviceType !== "button" && pinObj.deviceType !== "sensor") {
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
              th: `เฮ้! นายสั่งจ่ายไฟที่ขา ${pin} (บรรทัด ${firstLine}) แต่ลืมเขียน pinMode(${pin}, OUTPUT); ในฟังก์ชัน setup() นะ! ถ้าไม่ตั้งค่าก่อน ไฟที่ขา ${pin} จะออกมาน้อยมากจนหลอดไฟไม่สว่างนะ`,
              en: `Hey! You used digitalWrite on Pin ${pin} (line ${firstLine}), but forgot to add pinMode(${pin}, OUTPUT); inside setup()! Without it, the LED on Pin ${pin} will be super dim or won't work!`,
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

    const devices = Array.from(pinMap.values());

    return {
      ok: bugs.length === 0,
      bugCount: bugs.length,
      bugs,
      devices,
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
  };
});
