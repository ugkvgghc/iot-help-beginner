$ErrorActionPreference = "SilentlyContinue"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $AppDir

# 1. เช็คว่ามีโปรเซส server.js เก่ารันอยู่บนพอร์ต 3000 หรือไม่ ถ้ามีให้ปิดก่อนเพื่อเปิดเวอร์ชันล่าสุด
$portConnections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($conn in $portConnections) {
  if ($conn.OwningProcess) {
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Milliseconds 300

# รัน Backend Server ในพื้นหลังอย่างเงียบๆ (ไม่แสดงหน้าต่างคอนโซลสีดำ)
Start-Process -FilePath "node.exe" -ArgumentList "server.js" -WorkingDirectory $AppDir -WindowStyle Hidden
Start-Sleep -Milliseconds 900

# 2. เปิดโปรแกรมในโหมด Standalone Desktop App Window (ไม่มีแถบ URL และแถบนำทางของเบราว์เซอร์)
$edgePaths = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$appExe = $null
foreach ($p in $edgePaths) {
  if (Test-Path $p) {
    $appExe = $p
    break
  }
}

$profileDir = Join-Path $AppDir ".app-profile"
if ($appExe) {
  Start-Process -FilePath $appExe -ArgumentList "--app=http://localhost:3000 --user-data-dir=`"$profileDir`" --window-size=1200,780"
} else {
  Start-Process "http://localhost:3000"
}
