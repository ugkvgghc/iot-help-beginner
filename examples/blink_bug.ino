// ก๊อปปี้โค้ดชุดนี้ไปวางใน Arduino IDE ได้เลย
const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  // ❌ จุดที่ตั้งใจเขียนผิด: ใช้ = ตัวเดียว (ต้องเป็น ==)
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}// ตัวอย่างโค้ด Arduino ที่มือใหม่มักเขียนผิด (เช่น เขียน OUTPUT แทนที่จะเป็น OUTPUT)
void setup() {
  // ตั้งค่าขาที่ 4 สำหรับหลอดไฟ LED (เขียน OUTPUT ผิด!)
  pinMode(4, OUTPUT);
}

void loop() {
  // สั่งจ่ายไฟให้หลอดไฟขาที่ 4 สว่าง
  digitalWrite(4, HIGH);
  delay(1000);
}
