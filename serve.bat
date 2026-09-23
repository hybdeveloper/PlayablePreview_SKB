@echo off
rem Double-click (or run from anywhere) to start the local preview server.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\serve.ps1" %*
