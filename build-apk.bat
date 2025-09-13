@echo off
cd /d "C:\Users\Patrick\AUF_Thesis\LABWATCH\labwatch-app\android"
echo Building APK...
gradlew.bat assembleRelease
echo Build complete!
pause
