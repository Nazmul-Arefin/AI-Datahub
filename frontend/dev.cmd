@echo off
cd /d "%~dp0"
echo Serving Weeple UI from frontend\
echo Open the Local URL printed below, then add /#/overview
echo Do not open a repo-root listing (folders like backend/, docs/).
npx --yes serve . -l 3000
