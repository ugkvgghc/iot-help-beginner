$ErrorActionPreference = "SilentlyContinue"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $AppDir

# 1. เช็คว่ามีโปรเซส server.js รันอยู่บนพอร์ต 3000 หรือยัง ถ้ามีให้รีสตาร์ทเป็นเวอร์ชันล่าสุดถ้าจำเป็น หรือรันขึ้นใหม่
$portActive = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $portActive) {
  Start-Process -FilePath "node.exe" -ArgumentList "server.js" -WorkingDirectory $AppDir -WindowStyle Hidden
  Start-Sleep -Milliseconds 800
}

# 2. เปิดโปรแกรมในโหมด Standalone Desktop App Window (ไม่มีแถบ URL ของเบราว์เซอร์)
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
