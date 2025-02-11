import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))  # Add the root folder to sys.path

from app import app

if __name__ == "__main__":
    app.run(debug=True)  # Runs the server in debug mode
