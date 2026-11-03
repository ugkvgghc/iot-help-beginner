// ตัวอย่าง: เซนเซอร์วัดอุณหภูมิและความชื้น DHT11 + หน้าจอ LCD I2C 16x2 + ลำโพง Buzzer
#include <LiquidCrystal_I2C.h>

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
}
