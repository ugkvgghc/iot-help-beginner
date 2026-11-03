// ตัวอย่างโจทย์: เผลอใช้เครื่องหมาย = ตัวเดียวในเงื่อนไข if
// เช่น if (buttonState = HIGH) ซึ่งจะทำให้ไฟ LED ขา 13 ติดค้างตลอดเวลา!

const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  // จุดที่ผิด: ใช้ = ตัวเดียวแทน == สำหรับเปรียบเทียบค่า
  if (buttonState = HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}
