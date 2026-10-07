Dim WshShell, fso, appData, localAppData, ideExe, serviceJs, argStr, i
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appData = WshShell.ExpandEnvironmentStrings("%APPDATA%")
localAppData = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%")

ideExe = localAppData & "\Programs\Antigravity IDE\Antigravity IDE.exe"
serviceJs = appData & "\antigravity-rtl\service.js"

' 1. Rebuild commandline arguments passed to launcher
argStr = ""
For i = 0 To WScript.Arguments.Count - 1
    argStr = argStr & " """ & WScript.Arguments(i) & """"
Next

' 2. Launch Antigravity IDE
WshShell.Run """" & ideExe & """" & argStr, 1, False

' 3. Launch the RTL background watcher service with it
If fso.FileExists(serviceJs) Then
    WshShell.Run "node """ & serviceJs & """", 0, False
End If
