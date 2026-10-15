@echo off
echo ========================================================
echo  SUBIR CAMBIOS A GITHUB PARA DESPLIEGUE EN RENDER
echo ========================================================
set GIT_EXE="C:\Users\52553\AppData\Local\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe"

%GIT_EXE% add .
%GIT_EXE% commit -m "update: actualizacion de simulador PVEM"
%GIT_EXE% push origin main

echo.
echo ========================================================
echo  Listo! Si ya vinculaste tu repositorio en Render,
echo  la plataforma se actualizara en linea automaticamente.
echo ========================================================
pause
