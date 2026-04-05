#!/bin/bash
echo ""
echo "== GitHub Push Setup =="
echo ""
read -s -p "Paste your GitHub Personal Access Token and press Enter: " TOKEN
echo ""

cd "E:/AI/job_dashboard"
git remote remove origin 2>/dev/null
git remote add origin "https://${TOKEN}@github.com/SperoGottskraft/job-dashboard.git"
git branch -M main
git push -u origin main

echo ""
echo "Done!"
