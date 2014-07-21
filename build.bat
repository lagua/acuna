@echo off&setlocal enableextensions
set root=d:\workspace
set dojo=%root%\dojo-master-src
cd %dojo%\util\buildscripts\
call build profile=acuna
