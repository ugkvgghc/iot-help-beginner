// ตัวอย่างโจทย์ ESP32: ดึงไลบรารี WiFi.h มาใช้ แต่เผลอใช้ขาต้องห้ามของ ESP32!
#include <WiFi.h>

const int ledPin = 34;     // ❌ Bug 1: ขา GPIO 34 ของ ESP32 เป็นขา Input-Only สั่ง OUTPUT ไม่ได้!
const int sensorPin = 4;   // ❌ Bug 2: ขา GPIO 4 เป็นวงจร ADC2 ซึ่งใช้ analogRead พร้อมกับ WiFi ไม่ได้!

void setup() {
  // ❌ Bug 3: ลืมใส่ Serial.begin(115200);
  WiFi.begin("MyHomeWiFi", "12345678");
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int val = analogRead(sensorPin);
  Serial.println(val);
  digitalWrite(ledPin, HIGH);
  delay(500);
}
