Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = Join-Path $PSScriptRoot "hotel-capitol-deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$excludeFolders = @('node_modules', '.git', 'scratch', '.system_generated', 'deploy-folder')
$excludeFiles = @('hotel-capitol-deploy.zip', 'server.js', 'make-zip.ps1', 'package.json')

$allFiles = Get-ChildItem -Path $PSScriptRoot -Recurse -File

foreach ($file in $allFiles) {
    $skip = $false
    foreach ($folder in $excludeFolders) {
        if ($file.FullName -match [regex]::Escape($folder)) {
            $skip = $true
            break
        }
    }
    if ($excludeFiles -contains $file.Name) {
        $skip = $true
    }

    if (-not $skip) {
        # Calculate relative path from root
        $rel = $file.FullName.Substring($PSScriptRoot.Length).TrimStart('\', '/')
        # CRITICAL: Replace Windows backslashes with POSIX forward slashes for Linux/Netlify compatibility!
        $posixEntryName = $rel.Replace('\', '/')
        
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $posixEntryName) | Out-Null
        Write-Host "Added to ZIP: $posixEntryName"
    }
}

$zip.Dispose()

# Also create clean deploy-folder for direct folder drag-and-drop
$deployFolder = Join-Path $PSScriptRoot "deploy-folder"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null

Copy-Item (Join-Path $PSScriptRoot "index.html") -Destination $deployFolder
Copy-Item (Join-Path $PSScriptRoot "hotel-capitol-logo.png") -Destination $deployFolder
Copy-Item (Join-Path $PSScriptRoot "_redirects") -Destination $deployFolder
Copy-Item (Join-Path $PSScriptRoot "netlify.toml") -Destination $deployFolder
if (Test-Path (Join-Path $PSScriptRoot "gemini-code-1787251907996.json")) {
    Copy-Item (Join-Path $PSScriptRoot "gemini-code-1787251907996.json") -Destination $deployFolder
}
if (Test-Path (Join-Path $PSScriptRoot "gemini-code-1787251928685.yaml")) {
    Copy-Item (Join-Path $PSScriptRoot "gemini-code-1787251928685.yaml") -Destination $deployFolder
}
Copy-Item (Join-Path $PSScriptRoot "src") -Destination (Join-Path $deployFolder "src") -Recurse

Write-Host "`nSUCCESS: Created POSIX-compliant hotel-capitol-deploy.zip"
Write-Host "SUCCESS: Created clean deploy-folder ready for direct folder drag-and-drop"

