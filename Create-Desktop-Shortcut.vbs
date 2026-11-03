' สคริปต์สร้างปุ่มลัด (Shortcut) ของโปรแกรม IoT Help Beginner ไว้บนหน้าจอ Desktop
Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

AppDir = FSO.GetParentFolderName(WScript.ScriptFullName)
strDesktop = WshShell.SpecialFolders("Desktop")
shortcutPath = strDesktop & "\IoT Help Beginner.lnk"

Set oLink = WshShell.CreateShortcut(shortcutPath)
oLink.TargetPath = "wscript.exe"
oLink.Arguments = """" & AppDir & "\Start-IoT-Help-Beginner.vbs"""
oLink.WorkingDirectory = AppDir
oLink.IconLocation = AppDir & "\packages\web-visualizer\assets\app-icon.ico,0"
oLink.Description = "IoT Help Beginner - ผู้ช่วย Arduino IDE & จำลองวงจรกระดาษแปะ"
oLink.Save

WScript.Echo "สร้างไอคอนโปรแกรม IoT Help Beginner บนหน้าจอ Desktop เรียบร้อยแล้ว!"
