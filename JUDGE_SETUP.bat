@echo off
echo.
echo  =====================================================
echo   LogicSnap Cafe - Judge Setup Script
echo  =====================================================
echo.
echo  You need your API keys ready (sent via WhatsApp/Email).
echo  Enter them when prompted below.
echo.

set /p GEMINI_KEY="Paste GEMINI_API_KEY: "
set /p SUPABASE_URL="Paste NEXT_PUBLIC_SUPABASE_URL: "
set /p SUPABASE_ANON="Paste NEXT_PUBLIC_SUPABASE_ANON_KEY: "
set /p SUPABASE_SERVICE="Paste SUPABASE_SERVICE_KEY: "

echo.
echo [1/4] Writing environment variables...
(
echo GEMINI_API_KEY=%GEMINI_KEY%
echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL%
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_ANON%
echo SUPABASE_SERVICE_KEY=%SUPABASE_SERVICE%
) > .env
echo    Done.

echo [2/4] Installing dependencies...
call npm install --silent
echo    Done.

echo [3/4] Seeding demo data...
call node scripts/seed-demo.js
echo    Done.

echo [4/4] Starting the development server...
echo.
echo  =====================================================
echo   Open http://localhost:3000 in your browser
echo   Developer Mode key: LOGICSNAP-DEMO
echo  =====================================================
echo.
call npm run dev
