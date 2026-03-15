@echo off
setlocal EnableDelayedExpansion

REM === Get current local IPv4 ===
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address" /C:"IPv4-address"') do (
    set IP=%%a
    goto :ipfound
)

:ipfound
if "%IP%"=="" (
    echo Could not detect local IPv4 address.
    pause
    exit /b 1
)

REM Trim leading spaces
for /f "tokens=* delims= " %%a in ("%IP%") do set IP=%%a

echo Detected IP: %IP%

REM === Set ports ===
set BACKEND_PORT=5000
set FRONTEND_PORT=3000

REM === Update backend .env ===
powershell -NoProfile -Command ^
"$envPath='D:\C_lang\Code\Web\Sales_Tracker\Backend\.env';" ^
"if (!(Test-Path $envPath)) { New-Item -Path $envPath -ItemType File -Force | Out-Null }" ^
"$content = Get-Content $envPath -Raw -ErrorAction SilentlyContinue;" ^
"if ($null -eq $content) { $content = '' };" ^
"$pairs = @{" ^
"  'HOST'='%IP%';" ^
"  'PORT'='%BACKEND_PORT%';" ^
"  'CLIENT_URL'='http://%IP%:%FRONTEND_PORT%'" ^
"};" ^
"foreach ($k in $pairs.Keys) {" ^
"  if ($content -match ('(?m)^' + [regex]::Escape($k) + '=')) {" ^
"    $content = [regex]::Replace($content, '(?m)^' + [regex]::Escape($k) + '=.*$', $k + '=' + $pairs[$k])" ^
"  } else {" ^
"    if ($content.Length -gt 0 -and !$content.EndsWith([Environment]::NewLine)) { $content += [Environment]::NewLine }" ^
"    $content += $k + '=' + $pairs[$k] + [Environment]::NewLine" ^
"  }" ^
"};" ^
"Set-Content $envPath $content"

REM === Update frontend .env ===
powershell -NoProfile -Command ^
"$envPath='D:\C_lang\Code\Web\Sales_Tracker\Sales-performance-tracker\.env';" ^
"if (!(Test-Path $envPath)) { New-Item -Path $envPath -ItemType File -Force | Out-Null }" ^
"$content = Get-Content $envPath -Raw -ErrorAction SilentlyContinue;" ^
"if ($null -eq $content) { $content = '' };" ^
"$pairs = @{" ^
"  'HOST'='0.0.0.0';" ^
"  'PORT'='%FRONTEND_PORT%';" ^
"  'REACT_APP_API_URL'='http://%IP%:%BACKEND_PORT%'" ^
"};" ^
"foreach ($k in $pairs.Keys) {" ^
"  if ($content -match ('(?m)^' + [regex]::Escape($k) + '=')) {" ^
"    $content = [regex]::Replace($content, '(?m)^' + [regex]::Escape($k) + '=.*$', $k + '=' + $pairs[$k])" ^
"  } else {" ^
"    if ($content.Length -gt 0 -and !$content.EndsWith([Environment]::NewLine)) { $content += [Environment]::NewLine }" ^
"    $content += $k + '=' + $pairs[$k] + [Environment]::NewLine" ^
"  }" ^
"};" ^
"Set-Content $envPath $content"

echo Updated .env files successfully.
echo Frontend URL: http://%IP%:%FRONTEND_PORT%
echo Backend URL:  http://%IP%:%BACKEND_PORT%

REM === Start backend in new terminal ===
start "Backend Server" cmd /k "cd /d Backend && nodemon app.js"

REM === Start frontend in new terminal ===
start "Frontend Server" cmd /k "cd /d Sales-performance-tracker && npm run dev"

exit /b