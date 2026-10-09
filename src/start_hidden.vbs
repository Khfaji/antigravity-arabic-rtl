Set WshShell = CreateObject("WScript.Shell")
appData = WshShell.ExpandEnvironmentStrings("%APPDATA%")
servicePath = appData & "\antigravity-rtl\service.js"
WshShell.Run "node.exe """ & servicePath & """", 0, False

