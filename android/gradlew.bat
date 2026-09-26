@echo off
set DIRNAME=%~dp0
if "%JAVA_HOME%"=="" (set JAVA=java) else (set JAVA=%JAVA_HOME%\bin\java.exe)
"%JAVA%" -classpath "%DIRNAME%gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
