// ตัวอย่างโค้ด Arduino ที่มือใหม่มักเขียนผิด (เช่น เขียน Output แทนที่จะเป็น OUTPUT)
void setup() {
  // ตั้งค่าขาที่ 4 สำหรับหลอดไฟ LED (เขียน Output ผิด!)
  pinMode(4, Output);
}

void loop() {
  // สั่งจ่ายไฟให้หลอดไฟขาที่ 4 สว่าง
  digitalWrite(4, HIGH);
  delay(1000);
}
