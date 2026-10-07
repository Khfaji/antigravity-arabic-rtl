Dim fso, scriptDir, servicePath, nodePath
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
servicePath = fso.BuildPath(scriptDir, "service.js")

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node """ & servicePath & """", 0, False
