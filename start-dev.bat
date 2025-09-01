@echo off
echo ========================================
echo    Africure Pharma Development Setup
echo ========================================
echo.

echo Starting Backend Server...
echo.
cd backend
start "Africure Backend" cmd /k "npm run dev"
cd ..

echo.
echo Backend server started in new window!
echo.
echo Frontend files are in the 'frontend' folder.
echo Open frontend/index.html in your browser to view the website.
echo.
echo Backend API is running on: http://localhost:3002
echo Frontend contact form will connect to the backend automatically.
echo.
echo ========================================
echo    Development URLs:
echo ========================================
echo Frontend: Open frontend/index.html in browser
echo Backend API: http://localhost:3002
echo Health Check: http://localhost:3002/health
echo Contact API: http://localhost:3002/api/contact
echo ========================================
echo.
pause
