# 🛠️🐾 IoT Help Beginner (Open Source)

<p align="center">
  <img src="packages/web-visualizer/assets/mascot-cover.png" alt="IoT Help Beginner Cover" width="540" style="border-radius: 16px;" />
</p>

> **ผู้ช่วยคู่ใจนักพัฒนา Hardware IoT มือใหม่** — เปลี่ยน Error ยากๆ ใน Arduino IDE ให้กลายเป็นคำอธิบายภาษาคนจากตัวละครบนหน้าจอ Desktop พร้อมเว็บจำลองวงจรสไตล์ **"รูปแปะกระดาษ (Paper Scrapbook)"** ที่ชี้ให้เห็นทันทีว่าโค้ดที่เขียนผิดส่งผลต่ออุปกรณ์ชิ้นไหน!
>
> **Friendly IoT Hardware Companion for Beginners** — Translates cryptic Arduino IDE bugs into friendly human explanations via a Desktop Mascot and visualizes hardware impact on a **Torn-Paper Scrapbook Circuit Web Visualizer**.

---

## ✨ แนวคิดและจุดเด่นของโปรเจกต์ (Core Features)

1. **🗣️ แปลภาษาคอมพิวเตอร์เป็นภาษาเพื่อน (Human-Friendly Bug Explanation)**
   - แทนที่จะเจอข้อความ Error ยาวๆ เช่น `error: 'Output' was not declared in this scope`
   - ตัวละครจะบอกคุณตรงๆ ว่า:
     - 🇹🇭 *"เฮ้! นายเขียนตัว `Output` ผิดที่บรรทัด 4 นะ นายต้องเขียนเป็นตัวพิมพ์ใหญ่ทั้งหมดว่า `OUTPUT` ไม่งั้นบอร์ดจะไม่จ่ายไฟให้ขา 4 นะ!"*
     - 🇬🇧 *"Hey! You wrote `Output` on line 4. You need to write it in ALL CAPS as `OUTPUT`, otherwise Pin 4 won't configure properly!"*
   - รองรับการสลับภาษา **ไทย (TH)** และ **อังกฤษ (EN)**

2. **📄⚡ เว็บแสดงผลวงจรแบบกระดาษแปะ (Paper-Scrapbook Circuit Visualizer)**
   - ไม่ต้องเสียเวลาปั้นโมเดล 3D หรือต่อวงจรให้เป๊ะทุกเส้น
   - ระบบจะ **อ่านโค้ด Arduino (`.ino`)** แล้วคาดเดาอุปกรณ์ที่คุณน่าจะต่อใช้งานจริง (เช่น หลอดไฟ LED, ปุ่มกด, เซนเซอร์ Ultrasonic, DHT11, จอ LCD I2C, ลำโพง Buzzer)
   - แสดงผลเป็น **รูปอุปกรณ์บนกระดาษฉีกแปะเทปกาว (Scrapbook Cutout)** พร้อมลากสายไฟเชื่อมไปยังขาของบอร์ดอัตโนมัติ
   - หากเขียนโค้ดควบคุมขาไหนผิด อุปกรณ์ที่ต่อขานั้นจะ **ไม่ทำงาน** และมีเครื่องหมาย **`?`** เด้งขึ้นมาบนหัวอุปกรณ์ เพื่อให้เห็นภาพทันทีว่าโค้ดบรรทัดที่ผิดส่งผลกระทบต่อฮาร์ดแวร์ชิ้นไหน!

3. **⚡ ระบบจำลองการทำงานจริง (Live Simulation & Web Audio API)**
   - กดปุ่ม **`▶️ จำลองวงจรจริง (Live Sim)`** เพื่อรันโค้ด Arduino ในฟังก์ชัน `loop()` แบบเรียลไทม์
   - หลอดไฟ LED กะพริบตามจังหวะ `delay()`
   - ลำโพง Buzzer สังเคราะห์เสียงจริงบี๊บๆ ผ่าน Web Audio API (มีสวิตช์เปิด/ปิดเสียง)

4. **🐾 ตัวละครผู้ช่วยบนหน้าจอ & โหมดเกาะขอบจอ (Desktop Companion & Always-on-Top)**
   - เฝ้าดูไฟล์โค้ด `.ino` ของคุณแบบเรียลไทม์ เมื่อกด **Ctrl + S** ใน Arduino IDE โปรแกรมจะตรวจจับและวิเคราะห์ให้ทันที
   - กดปุ่ม **"📌 โหมดเกาะขอบจอคู่กับ Arduino IDE"** เพื่อย่อหน้าต่างเป็นตัวละครลอยอยู่มุมจอคู่กับการเขียนโค้ด

---

## 📁 โครงสร้างโปรเจกต์ (Monorepo Structure)

```text
IoT-Help-Beginner/
├── packages/
│   ├── analyzer/           # ตัววิเคราะห์โค้ด Arduino (.ino) และแปลง Bug เป็นคำพูดภาษาคน + ข้อมูลวงจร
│   ├── web-visualizer/     # หน้าต่างจำลองวงจรสไตล์รูปแปะกระดาษฉีก (Paper-Scrapbook IoT Visualizer)
│   └── desktop-mascot/     # พื้นที่สำหรับพัฒนา/เชื่อมต่อตัวละครบนหน้าจอ Desktop (WIP)
├── examples/               # ตัวอย่างโค้ด Arduino ที่มี Bug ยอดฮิตของมือใหม่สำหรับทดสอบ
├── CONTRIBUTING.md         # คู่มือสำหรับผู้ที่สนใจร่วมพัฒนา Open Source
├── LICENSE                 # MIT License
├── Start-IoT-Help-Beginner.vbs  # ตัวเปิดโปรแกรม Desktop App แบบไม่มีแถบ URL
├── Start-IoT-Help-Beginner.ps1  # สคริปต์ควบคุมการเปิดแอปพลิเคชัน
├── Create-Desktop-Shortcut.vbs  # สคริปต์สร้างไอคอนปุ่มลัดบน Desktop อัตโนมัติ
└── README.md
```

---

## 🚀 วิธีเริ่มต้นใช้งาน (Getting Started)

### 1. เปิดใช้งานเป็นโปรแกรม Desktop App ได้ทันที (แนะนำ)
คุณสามารถเปิดโปรแกรมได้โดยตรงเหมือนแอปพลิเคชันทั่วไปใน Windows โดยไม่ต้องเปิดเบราว์เซอร์:
- **วิธีที่ 1**: ดับเบิ้ลคลิกที่ไอคอน **"IoT Help Beginner"** บนหน้าจอ Desktop ของคุณได้ทันที
- **วิธีที่ 2**: ดับเบิ้ลคลิกที่ไฟล์ **`Start-IoT-Help-Beginner.vbs`** ในโฟลเดอร์โปรเจกต์
- **วิธีที่ 3 (สร้าง Shortcut บน Desktop ใหม่)**: ดับเบิ้ลคลิกไฟล์ **`Create-Desktop-Shortcut.vbs`** เพื่อสร้างไอคอนไว้บนหน้าจอ Desktop ได้ตลอดเวลา

โปรแกรมจะเปิดขึ้นมาเป็น **หน้าต่างโปรแกรมแบบ Standalone Window** โดยไม่มีแถบ URL พร้อมปุ่มเกาะขอบจอ (Always-on-Top) ใช้งานคู่กับ Arduino IDE ได้ทันที!

### 2. รันผ่านคอมมานด์ไลน์ / ทดสอบตัววิเคราะห์โค้ด (CLI)
```bash
# รันผ่าน CLI เพื่อตรวจโค้ดตัวอย่าง
node packages/analyzer/cli.js examples/if_assignment_bug.ino

# หรือรันเซิร์ฟเวอร์แบบแมนนวล
node server.js
```

---

## 🤝 การมีส่วนร่วมพัฒนา (Contributing)

โปรเจกต์นี้เปิดเป็น **Open Source (MIT License)** เปิดรับนักพัฒนาทุกสาย:
- **สาย Arduino / Embedded**: เพิ่มกฎตรวจจับ Bug ยอดฮิตของมือใหม่ใน `packages/analyzer/`
- **สาย Web / UI / ศิลปะ**: วาดรูปอุปกรณ์ IoT สไตล์กระดาษตัดแปะเพิ่มเติมใน `packages/web-visualizer/`
- **สาย Desktop App**: ร่วมเชื่อมต่อตัวละคร Desktop Mascot ใน `packages/desktop-mascot/`

ดูรายละเอียดเพิ่มเติมได้ที่ [CONTRIBUTING.md](./CONTRIBUTING.md)
