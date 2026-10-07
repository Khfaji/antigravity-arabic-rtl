Set WshShell = CreateObject("WScript.Shell")
appData = WshShell.ExpandEnvironmentStrings("%APPDATA%")
servicePath = appData & "\antigravity-rtl\service.js"
WshShell.Run "node """ & servicePath & """", 0, False
