@echo off
echo 🧹 Clearing browser cache directories...

REM Clear Chrome cache
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    echo Clearing Chrome cache...
    rmdir /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" 2>nul
)

REM Clear Edge cache  
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" (
    echo Clearing Edge cache...
    rmdir /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" 2>nul
)

REM Clear Firefox cache
if exist "%LOCALAPPDATA%\Mozilla\Firefox\Profiles" (
    echo Clearing Firefox cache...
    for /d %%i in ("%LOCALAPPDATA%\Mozilla\Firefox\Profiles\*") do (
        if exist "%%i\cache2" rmdir /s /q "%%i\cache2" 2>nul
    )
)

REM Clear npm cache
echo Clearing npm cache...
npm cache clean --force 2>nul

REM Clear Vite cache
echo Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul

echo ✅ Cache clearing completed!
echo 🔄 Now restart your dev server with: npm run dev