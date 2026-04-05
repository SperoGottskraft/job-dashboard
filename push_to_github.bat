@echo off
echo.
echo == GitHub Push Setup ==
echo.
set /p TOKEN="Paste your GitHub Personal Access Token and press Enter: "

git remote remove origin 2>nul
git remote add origin https://%TOKEN%@github.com/SperoGottskraft/job-dashboard.git
git branch -M main
git push -u origin main

echo.
echo Done! Check above for any errors.
pause
