@echo off
echo ====================================================
echo    Fix Render Deployment Script for MyOnlineStories
echo ====================================================
echo.

:: Check if we're in the right directory
if not exist package.json (
    echo ERROR: package.json not found!
    echo Please run this script from your myonlinestories directory
    pause
    exit /b 1
)

echo [OK] Found package.json, proceeding with restructure...
echo.

:: Step 1: Create src directory
echo Creating src directory...
if not exist src mkdir src
echo [OK] src directory ready
echo.

:: Step 2: Move web files to src (only if they exist at root)
echo Moving web files to src directory...

if exist index.html (
    move index.html src\ >nul 2>&1
    echo   - Moved index.html
)
if exist script.js (
    move script.js src\ >nul 2>&1
    echo   - Moved script.js
)
if exist styles.css (
    move styles.css src\ >nul 2>&1
    echo   - Moved styles.css
)
if exist server.js (
    move server.js src\ >nul 2>&1
    echo   - Moved server.js
)
echo.

:: Step 3: Remove duplicate package.json from src if it exists
if exist src\package.json (
    echo Removing duplicate package.json from src...
    del /q src\package.json
    echo [OK] Duplicate removed
    echo.
)

:: Step 4: Create new package.json
echo Updating package.json...
(
echo {
echo   "name": "myonlinestories",
echo   "version": "1.0.0",
echo   "description": "AI-powered personalized children's story generator with Kimi AI and Runware integration",
echo   "main": "src/server.js",
echo   "scripts": {
echo     "start": "node src/server.js",
echo     "dev": "node src/server.js",
echo     "test": "echo \"Error: no test specified\" && exit 1"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2"
echo   },
echo   "engines": {
echo     "node": ">=14.0.0"
echo   },
echo   "keywords": [
echo     "ai",
echo     "stories",
echo     "children",
echo     "kimi-ai",
echo     "runware"
echo   ],
echo   "author": "Your Name",
echo   "license": "MIT"
echo }
) > package.json
echo [OK] package.json updated
echo.

:: Step 5: Update server.js
echo Updating server.js with correct paths...
(
echo const express = require('express'^);
echo const path = require('path'^);
echo.
echo const app = express(^);
echo const PORT = process.env.PORT ^|^| 3000;
echo.
echo // Middleware
echo app.use(express.json(^)^);
echo // Serve static files from the src directory
echo app.use(express.static(path.join(__dirname^)^)^);
echo.
echo // API endpoint to get environment variables
echo app.get('/api/config', (req, res^) =^> {
echo   res.json({
echo     kimiApiKey: process.env.KIMI_API_KEY ^|^| '',
echo     runwareApiKey: process.env.RUNWARE_API_KEY ^|^| ''
echo   }^);
echo }^);
echo.
echo // Handle all other routes by serving index.html
echo app.get('*', (req, res^) =^> {
echo   res.sendFile(path.join(__dirname, 'index.html'^)^);
echo }^);
echo.
echo // Start the server
echo app.listen(PORT, (^) =^> {
echo   console.log(`MyOnlineStories server is running on port ${PORT}`^);
echo   console.log(`Visit: http://localhost:${PORT}`^);
echo }^);
echo.
echo // Handle graceful shutdown
echo process.on('SIGTERM', (^) =^> {
echo   console.log('SIGTERM received, shutting down gracefully'^);
echo   process.exit(0^);
echo }^);
echo.
echo process.on('SIGINT', (^) =^> {
echo   console.log('SIGINT received, shutting down gracefully'^);
echo   process.exit(0^);
echo }^);
) > src\server.js
echo [OK] server.js updated
echo.

:: Step 6: Create render.yaml
echo Creating render.yaml configuration...
(
echo services:
echo   - type: web
echo     name: myonlinestories
echo     runtime: node
echo     buildCommand: npm install
echo     startCommand: npm start
echo     envVars:
echo       - key: NODE_ENV
echo         value: production
) > render.yaml
echo [OK] render.yaml created
echo.

:: Step 7: Create .gitignore if it doesn't exist
if not exist .gitignore (
    echo Creating .gitignore...
    (
    echo # Dependencies
    echo node_modules/
    echo npm-debug.log*
    echo yarn-debug.log*
    echo yarn-error.log*
    echo.
    echo # Environment variables
    echo .env
    echo .env.local
    echo .env.development.local
    echo .env.test.local
    echo .env.production.local
    echo.
    echo # IDE files
    echo .vscode/
    echo .idea/
    echo *.swp
    echo *.swo
    echo *~
    echo.
    echo # OS generated files
    echo .DS_Store
    echo Thumbs.db
    echo.
    echo # Logs
    echo logs
    echo *.log
    echo.
    echo # Temporary files
    echo tmp/
    echo temp/
    ) > .gitignore
    echo [OK] .gitignore created
    echo.
)

:: Step 8: Clean and reinstall dependencies
echo Reinstalling dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
call npm install
echo [OK] Dependencies reinstalled
echo.

:: Step 9: Show new structure
echo ====================================================
echo NEW PROJECT STRUCTURE:
echo ====================================================
echo.
echo Root directory files:
dir /b
echo.
echo src directory files:
dir /b src
echo.

:: Step 10: Git operations
echo ====================================================
echo GIT OPERATIONS:
echo ====================================================
echo.

:: Check if .git exists
if exist .git (
    echo Adding changes to git...
    git add .
    echo.
    echo [OK] Changes staged for commit
    echo.
    echo Next steps:
    echo -----------
    echo 1. Review the changes with: git status
    echo 2. Commit the changes: git commit -m "Fix Render deployment - restructure with src directory"
    echo 3. Push to GitHub: git push origin main
) else (
    echo WARNING: This is not a git repository yet!
    echo.
    echo Initialize git and push to GitHub:
    echo -----------------------------------
    echo git init
    echo git add .
    echo git commit -m "Fix Render deployment - restructure with src directory"
    echo git branch -M main
    echo git remote add origin https://github.com/YOUR_USERNAME/myonlinestories.git
    echo git push -u origin main
)

echo.
echo ====================================================
echo RESTRUCTURING COMPLETE!
echo ====================================================
echo.
echo Summary of changes:
echo - All web files moved to src/ directory
echo - package.json updated to use src/server.js
echo - server.js updated with correct paths
echo - render.yaml created for explicit configuration
echo - Dependencies reinstalled
echo.
echo Your project is now ready for Render deployment!
echo.
echo In Render dashboard, ensure:
echo - Root Directory: (leave empty)
echo - Build Command: npm install
echo - Start Command: npm start
echo.
pause