@echo off
REM Start script for quantum entropy service (Windows)

echo Starting Quantum Entropy Service...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start the Flask app
echo Starting Flask server...
python app.py
