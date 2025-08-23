@echo off
echo ==========================================
echo  Homelab Dashboard - Server Package Creator
echo  WITH DOCKER MONITORING FIXES
echo ==========================================
echo.

REM Set variables
set SOURCE_DIR=%~dp0
set PACKAGE_NAME=ServerDasboard
set DEST_DIR=%USERPROFILE%\Downloads\%PACKAGE_NAME%

echo Source Directory: %SOURCE_DIR%
echo Package Directory: %DEST_DIR%
echo.

REM Remove existing package directory if it exists
if exist "%DEST_DIR%" (
    echo Removing existing package directory...
    rmdir /s /q "%DEST_DIR%"
)

REM Create new package directory
echo Creating package directory...
mkdir "%DEST_DIR%"

echo.
echo Copying essential files for server deployment...
echo (Including Docker monitoring fixes)
echo.

REM Copy root configuration files
echo [1/8] Copying root configuration files...
copy "%SOURCE_DIR%\package.json" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\config.js" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\env-loader.js" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\.env.docker" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\validate-env.js" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\setup-env.js" "%DEST_DIR%\" >nul

REM Copy Docker files
echo [2/8] Copying Docker files...
copy "%SOURCE_DIR%\Dockerfile" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\docker-compose.yml" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\.dockerignore" "%DEST_DIR%\" >nul 2>nul

REM Copy documentation
echo [3/8] Copying documentation...
copy "%SOURCE_DIR%\README.md" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\DOCKER_README.md" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\SINGLE_PORT_SETUP.md" "%DEST_DIR%\" >nul
copy "%SOURCE_DIR%\DOCKER_FIXES_SUMMARY.md" "%DEST_DIR%\" >nul 2>nul
copy "%SOURCE_DIR%\ENV_CONFIG.md" "%DEST_DIR%\" >nul 2>nul
copy "%SOURCE_DIR%\PORT_CONFIGURATION.md" "%DEST_DIR%\" >nul 2>nul
copy "%SOURCE_DIR%\QUICK_CONFIG.md" "%DEST_DIR%\" >nul 2>nul

REM Copy server directory with fixes
echo [4/8] Copying server directory (with Docker monitoring fixes)...
xcopy "%SOURCE_DIR%\server" "%DEST_DIR%\server\" /E /I /Q
REM Remove any existing database files from the copy
if exist "%DEST_DIR%\server\data\homelab.db" del "%DEST_DIR%\server\data\homelab.db"

REM Copy client source and package files (needed for Docker build)
echo [5/8] Copying client source files...
mkdir "%DEST_DIR%\client"
copy "%SOURCE_DIR%\client\package.json" "%DEST_DIR%\client\" >nul
copy "%SOURCE_DIR%\client\package-lock.json" "%DEST_DIR%\client\" >nul 2>nul
copy "%SOURCE_DIR%\client\tsconfig.json" "%DEST_DIR%\client\" >nul
xcopy "%SOURCE_DIR%\client\src" "%DEST_DIR%\client\src\" /E /I /Q
xcopy "%SOURCE_DIR%\client\public" "%DEST_DIR%\client\public\" /E /I /Q

REM Copy nginx configuration if exists
echo [6/8] Copying nginx configuration...
copy "%SOURCE_DIR%\nginx.conf.example" "%DEST_DIR%\" >nul 2>nul

REM Create .env template for server
echo [7/8] Creating server .env template...
echo # =========================================== > "%DEST_DIR%\.env"
echo # HOMELAB DASHBOARD - SERVER CONFIGURATION >> "%DEST_DIR%\.env"
echo # =========================================== >> "%DEST_DIR%\.env"
echo # Updated with Docker monitoring fixes >> "%DEST_DIR%\.env"
echo # >> "%DEST_DIR%\.env"
echo # SERVER CONFIGURATION >> "%DEST_DIR%\.env"
echo PORT=3020 >> "%DEST_DIR%\.env"
echo NODE_ENV=production >> "%DEST_DIR%\.env"
echo # >> "%DEST_DIR%\.env"
echo # DATABASE CONFIGURATION >> "%DEST_DIR%\.env"
echo DB_PATH=./server/data/homelab.db >> "%DEST_DIR%\.env"
echo # >> "%DEST_DIR%\.env"
echo # MONITORING (Docker optimized) >> "%DEST_DIR%\.env"
echo MONITOR_INTERVAL=5000 >> "%DEST_DIR%\.env"
echo ENABLE_CPU_TEMPERATURE=true >> "%DEST_DIR%\.env"
echo ENABLE_DISK_IO_MONITORING=true >> "%DEST_DIR%\.env"
echo ENABLE_PROCESS_MONITORING=true >> "%DEST_DIR%\.env"

REM Create deployment scripts
echo [8/8] Creating deployment scripts...

REM Create start script for Linux
echo #!/bin/bash > "%DEST_DIR%\start.sh"
echo # Homelab Dashboard Start Script (with Docker fixes) >> "%DEST_DIR%\start.sh"
echo echo "Starting Homelab Dashboard with Docker monitoring fixes..." >> "%DEST_DIR%\start.sh"
echo docker-compose up -d >> "%DEST_DIR%\start.sh"
echo sleep 5 >> "%DEST_DIR%\start.sh"
echo echo "Checking container status..." >> "%DEST_DIR%\start.sh"
echo docker-compose logs --tail=20 homelab-dashboard >> "%DEST_DIR%\start.sh"
echo echo "Dashboard available at: http://$(hostname -I | cut -d' ' -f1):3020" >> "%DEST_DIR%\start.sh"

REM Create stop script for Linux
echo #!/bin/bash > "%DEST_DIR%\stop.sh"
echo # Homelab Dashboard Stop Script >> "%DEST_DIR%\stop.sh"
echo echo "Stopping Homelab Dashboard..." >> "%DEST_DIR%\stop.sh"
echo docker-compose down >> "%DEST_DIR%\stop.sh"

REM Create update script for Linux
echo #!/bin/bash > "%DEST_DIR%\update.sh"
echo # Homelab Dashboard Update Script >> "%DEST_DIR%\update.sh"
echo echo "Updating Homelab Dashboard..." >> "%DEST_DIR%\update.sh"
echo docker-compose down >> "%DEST_DIR%\update.sh"
echo docker-compose build --no-cache >> "%DEST_DIR%\update.sh"
echo docker-compose up -d >> "%DEST_DIR%\update.sh"
echo echo "Update complete!" >> "%DEST_DIR%\update.sh"

REM Create debug script for troubleshooting
echo #!/bin/bash > "%DEST_DIR%\debug.sh"
echo # Homelab Dashboard Debug Script >> "%DEST_DIR%\debug.sh"
echo echo "=== Container Status ===" >> "%DEST_DIR%\debug.sh"
echo docker-compose ps >> "%DEST_DIR%\debug.sh"
echo echo "" >> "%DEST_DIR%\debug.sh"
echo echo "=== Recent Logs ===" >> "%DEST_DIR%\debug.sh"
echo docker-compose logs --tail=30 homelab-dashboard >> "%DEST_DIR%\debug.sh"
echo echo "" >> "%DEST_DIR%\debug.sh"
echo echo "=== System Resources ===" >> "%DEST_DIR%\debug.sh"
echo docker stats homelab-dashboard --no-stream >> "%DEST_DIR%\debug.sh"
echo echo "" >> "%DEST_DIR%\debug.sh"
echo echo "=== Health Check ===" >> "%DEST_DIR%\debug.sh"
echo curl -s http://localhost:3020/api/health ^|^| echo "Health check failed" >> "%DEST_DIR%\debug.sh"

REM Create README for deployment with Docker fixes
echo # Homelab Dashboard - Server Package (Docker Monitoring Fixes) > "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo This package contains all files needed to deploy the Homelab Dashboard on your Ubuntu server. >> "%DEST_DIR%\DEPLOYMENT.md"
echo **INCLUDES DOCKER MONITORING FIXES** for memory and network monitoring issues. >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo ## Docker Monitoring Fixes Included >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo - ✅ **Memory Monitoring**: Reads host memory from /proc/meminfo directly >> "%DEST_DIR%\DEPLOYMENT.md"
echo - ✅ **Network Monitoring**: Improved network interface detection for Docker >> "%DEST_DIR%\DEPLOYMENT.md"
echo - ✅ **Environment Detection**: Automatically detects Docker environment >> "%DEST_DIR%\DEPLOYMENT.md"
echo - ✅ **Fallback Support**: Falls back to standard monitoring if Docker methods fail >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo ## Quick Start >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo 1. Upload this entire folder to your Ubuntu server >> "%DEST_DIR%\DEPLOYMENT.md"
echo 2. SSH into your server and navigate to this directory >> "%DEST_DIR%\DEPLOYMENT.md"
echo 3. Make scripts executable: `chmod +x *.sh` >> "%DEST_DIR%\DEPLOYMENT.md"
echo 4. Start the application: `./start.sh` >> "%DEST_DIR%\DEPLOYMENT.md"
echo 5. Access dashboard at: `http://your-server-ip:3020` >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo ## Troubleshooting >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo If monitoring still shows issues: >> "%DEST_DIR%\DEPLOYMENT.md"
echo 1. Run `./debug.sh` to check container status and logs >> "%DEST_DIR%\DEPLOYMENT.md"
echo 2. Check logs: `docker-compose logs homelab-dashboard` >> "%DEST_DIR%\DEPLOYMENT.md"
echo 3. Verify the container has proper host access to /proc and /sys >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo ## Files Included >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo - Docker configuration (Dockerfile, docker-compose.yml) >> "%DEST_DIR%\DEPLOYMENT.md"
echo - Server source code (WITH DOCKER MONITORING FIXES) >> "%DEST_DIR%\DEPLOYMENT.md"
echo - Client source code (for Docker build) >> "%DEST_DIR%\DEPLOYMENT.md"
echo - Configuration files >> "%DEST_DIR%\DEPLOYMENT.md"
echo - Documentation >> "%DEST_DIR%\DEPLOYMENT.md"
echo - Deployment scripts (start.sh, stop.sh, update.sh, debug.sh) >> "%DEST_DIR%\DEPLOYMENT.md"
echo. >> "%DEST_DIR%\DEPLOYMENT.md"
echo See DOCKER_README.md for detailed deployment instructions. >> "%DEST_DIR%\DEPLOYMENT.md"

echo.
echo ==========================================
echo  DOCKER MONITORING FIXES INCLUDED
echo ==========================================
echo.
echo ✅ Package created successfully at: %DEST_DIR%
echo.
echo 🔧 Docker Monitoring Fixes Applied:
echo    - Memory monitoring reads from host /proc/meminfo
echo    - Network monitoring with improved interface detection
echo    - Docker environment auto-detection
echo    - Enhanced logging for troubleshooting
echo.
echo 📁 Files included:
echo    - Docker configuration files
echo    - Server source code (with Docker fixes)
echo    - Client source code (for build)
echo    - Configuration templates
echo    - Documentation
echo    - Deployment scripts (including debug.sh)
echo.
echo 📋 Next Steps:
echo    1. Compress the '%PACKAGE_NAME%' folder to a ZIP file
echo    2. Upload to your Ubuntu server
echo    3. Extract and run: chmod +x *.sh && ./start.sh
echo    4. Check logs if issues: ./debug.sh
echo.
echo 🌐 The dashboard will be available at: http://your-server-ip:3020
echo    (Memory and network monitoring should now work correctly!)
echo.

REM Count files in package
for /f %%i in ('dir "%DEST_DIR%" /s /-c /a-d ^| findstr /r /c:"[0-9][0-9]* File(s)"') do set file_count=%%i
echo 📊 Total files packaged: %file_count%

REM Calculate package size
for /f "usebackq" %%A in (`dir "%DEST_DIR%" /s /-c /a-d ^| findstr /r /c:"[0-9][0-9]* bytes"`) do set package_size=%%A
echo 💾 Package size: %package_size%

echo.
echo Press any key to exit...
pause >nul
