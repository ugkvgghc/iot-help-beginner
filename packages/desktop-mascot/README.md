# 🐾 Desktop Mascot Companion (`packages/desktop-mascot`)

โฟลเดอร์นี้เตรียมไว้สำหรับนำโปรเจกต์ **ตัวละครหน้าจอ Desktop (Desktop Pet / Mascot)** มาเชื่อมต่อในขั้นตอนถัดไป

## 🔗 รูปแบบการเชื่อมต่อกับระบบหลัก (Integration Architecture)

1. **อ่านไฟล์โค้ด Arduino (`.ino`)** ที่ผู้ใช้กำลังเขียนใน Arduino IDE
2. **ส่งโค้ดไปวิเคราะห์ที่ `packages/analyzer/analyzer.js`** (หรือเรียกผ่าน HTTP API `POST http://localhost:3000/api/analyze`)
3. **รับข้อมูล JSON กลับมาแสดงเป็นคำพูดของตัวละคร:**
   ```json
   {
     "line": 4,
     "pin": "4",
     "message": {
       "th": "เฮ้! นายเขียนตัว \"Output\" ผิดที่บรรทัด 4 นะ นายต้องเขียนเป็นตัวพิมพ์ใหญ่ทั้งหมดว่า \"OUTPUT\" ไม่งั้นขา 4 จะจ่ายไฟหรือรับค่าไม่ได้!",
       "en": "Hey! You wrote \"Output\" on line 4. You must write it in ALL CAPS as \"OUTPUT\", otherwise Pin 4 won't work!"
     }
   }
   ```
4. **ปุ่มพาไปหน้าเว็บจำลองวงจร (Open Web Circuit Visualizer):**
   - เมื่อผู้ใช้คลิกที่ตัวละครหรือปุ่มดูวงจร ตัวละครจะสั่งเปิดเบราว์เซอร์ไปที่ `http://localhost:3000` เพื่อแสดงรูปวงจรแบบกระดาษแปะ (Paper-Scrapbook Circuit Visualizer) พร้อมชี้เป้าอุปกรณ์ที่มีเครื่องหมาย `?` บนหัวทันที
