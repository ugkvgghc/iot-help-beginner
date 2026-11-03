// ตัวอย่าง: เซนเซอร์วัดระยะทาง Ultrasonic (HC-SR04) + หลอดไฟแจ้งเตือน
const int trigPin = 9;
const int echoPin = 10;
const int ledPin = 13;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // ส่งคลื่น Ultrasonic
  digitalWrite(trigPin, LOW);
  delay(2);
  digitalWrite(trigPin, HIGH);
  delay(10);
  digitalWrite(trigPin, LOW);

  // สั่งไฟแจ้งเตือนระยะใกล้
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
}
