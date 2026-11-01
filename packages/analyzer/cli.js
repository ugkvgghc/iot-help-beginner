#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { analyzeArduinoCode } = require("./analyzer");

const targetFile = process.argv[2] || path.join(__dirname, "../../examples/blink_bug.ino");
const lang = (process.argv[3] || "th").toLowerCase() === "en" ? "en" : "th";

if (!fs.existsSync(targetFile)) {
  console.error(`File not found: ${targetFile}`);
  process.exit(1);
}

const code = fs.readFileSync(targetFile, "utf8");
const result = analyzeArduinoCode(code);

console.log("==================================================");
console.log(`🐾 IoT Help Beginner - Code Analyzer (${lang.toUpperCase()})`);
console.log(`📄 File: ${targetFile}`);
console.log("==================================================");
console.log(`\n💬 ${result.summary[lang]}\n`);

if (result.bugs.length > 0) {
  result.bugs.forEach((b, idx) => {
    console.log(`❌ [Bug #${idx + 1}] Line ${b.line} (Pin ${b.pin || "N/A"}):`);
    console.log(`   Code   : ${b.codeSnippet}`);
    console.log(`   Mascot : "${b.message[lang]}"`);
    console.log(`   Impact : ${b.impact[lang]}`);
    console.log(`   Fix    : ${b.wrongToken}  --->  ${b.correctToken}\n`);
  });
}

console.log("🔌 Inferred Circuit Devices:");
result.devices.forEach((d) => {
  const statusBadge = d.hasBug ? "[? ERROR]" : d.powerState === "on" ? "[⚡ ON]" : "[OFF]";
  console.log(`   - Pin ${d.pin}: ${d.deviceType.toUpperCase()} ${statusBadge}`);
});
console.log("==================================================");
