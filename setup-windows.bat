@echo off
echo 🚀 Homelab Dashboard - Quick Setup for Windows
echo.

echo 📦 Installing dependencies...
call npm install
echo.

echo 📦 Installing client dependencies...
cd client
call npm install
cd ..
echo.

echo ⚙️ Setting up environment configuration...
if not exist .env (
    echo 📄 Creating main .env file from example...
    copy .env.example .env
)

if not exist client\.env (
    echo 📄 Creating client .env file from example...
    copy client\.env.example client\.env
)

if not exist server\.env (
    echo 📄 Creating server .env file from example...
    copy server\.env.example server\.env
)

echo.
echo 🔍 Validating configuration...
call npm run validate-env

echo.
echo ✅ Setup complete!
echo.
echo 📖 Next steps:
echo   1. Edit .env files to customize your configuration
echo   2. Run "npm run dev" to start both client and server
echo   3. Visit http://localhost:3000 to see your dashboard
echo.
echo 📚 For detailed configuration options, see ENV_CONFIG.md
echo.
pause
