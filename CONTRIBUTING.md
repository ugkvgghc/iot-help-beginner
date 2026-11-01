# 🤝 คู่มือการร่วมพัฒนา (Contributing Guide)

ขอบคุณที่สนใจร่วมพัฒนา **IoT Help Beginner**! โปรเจกต์นี้ตั้งใจช่วยให้มือใหม่หัดทำ Hardware IoT เข้าใจข้อผิดพลาดในโค้ดและวงจรได้ง่ายที่สุด

## 🎯 ส่วนที่คุณสามารถช่วยพัฒนาต่อยอดได้

### 1. เพิ่มกฎการตรวจจับ Bug ของ Arduino (`packages/analyzer/rules.js`)
มือใหม่มักเขียนโค้ดผิดในรูปแบบซ้ำๆ เช่น:
- พิมพ์ตัวเล็ก-ตัวใหญ่ผิด (`Output`, `Input`, `High`, `Low`, `digitalwrite`, `pinmode`)
- ลืมใส่ `pinMode(pin, OUTPUT);` ใน `setup()` แต่ไปใช้ `digitalWrite(pin, HIGH);` ใน `loop()`
- ใช้ `=` แทน `==` ในเงื่อนไข `if (digitalRead(2) = HIGH)`
- ลืมใส่ `;` ท้ายบรรทัด
- ใช้ `analogWrite()` กับขาที่ไม่รองรับ PWM บนบอร์ด Arduino Uno

คุณสามารถเพิ่มกฎใหม่ๆ พร้อมคำอธิบายภาษาไทย (`th`) และภาษาอังกฤษ (`en`) ได้ในไฟล์ `packages/analyzer/rules.js`

### 2. เพิ่มรูปภาพอุปกรณ์สไตล์กระดาษแปะ (`packages/web-visualizer/`)
เราใช้แนวคิด **Paper Cutout / Scrapbook** (รูปอุปกรณ์แปะบนกระดาษฉีก + เทปกาว + สายไฟวาดมือ) เพื่อลดความซับซ้อนของการทำ 3D
- คุณสามารถเพิ่ม SVG หรือรูปภาพอุปกรณ์ใหม่ๆ เช่น DHT11, Ultrasonic HC-SR04, Servo SG90, Relay, Buzzer ได้

### 3. เชื่อมต่อ Desktop Mascot (`packages/desktop-mascot/`)
- โปรแกรมหน้า Desktop จะคอยอ่านไฟล์ `.ino` แล้วส่งโค้ดมาวิเคราะห์ผ่าน `packages/analyzer`
- เมื่อพบ Bug ตัวละครจะพูดข้อความจาก `message.th` หรือ `message.en` และเปิดลิงก์มายัง `packages/web-visualizer`

## 📋 ขั้นตอนการส่ง Pull Request
1. Fork โปรเจกต์นี้ไปยัง GitHub ของคุณ
2. สร้าง Branch ใหม่ (`git checkout -b feat/add-new-sensor`)
3. แก้ไขโค้ดและทดสอบการทำงาน
4. Commit การเปลี่ยนแปลง (`git commit -m "feat: add ultrasonic sensor paper cutout"`)
5. Push ขึ้น Branch ของคุณแล้วเปิด **Pull Request**
