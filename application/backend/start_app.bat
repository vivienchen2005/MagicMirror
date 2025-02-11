@echo off
echo Choose an option:
echo 1 - Start Full Application (Flask API + 2DMapping)
echo 2 - Start Flask API only
echo 3 - Start 2DMapping script only
echo 4 - Exit

set /p choice="Enter your choice: "

call mm_env\Scripts\activate

if "%choice%"=="1" (
    echo Starting Flask API...
    start cmd /k "python run.py"
    timeout /t 2
    echo Starting 2DMapping script...
    start cmd /k "python app/2DMapping.py"
    echo All processes started.
) else if "%choice%"=="2" (
    echo Starting Flask API...
    start cmd /k "python run.py"
) else if "%choice%"=="3" (
    echo Starting 2DMapping script...
    start cmd /k "python app/2DMapping.py"
) else if "%choice%"=="4" (
    echo Exiting...
    exit
) else (
    echo Invalid choice. Please run the script again.
)