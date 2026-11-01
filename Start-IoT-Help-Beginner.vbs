Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
AppDir = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & AppDir & "\Start-IoT-Help-Beginner.ps1""", 0, False
