"""
Run script for RAILSAFE Backend Server.
Usage: python run.py
"""

import uvicorn
import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("==================================================================")
    print("  RAILSAFE: Automatic Footbridge Control System - Backend Engine  ")
    print("  Ongole Railway Station (OGL) - South Central Railway            ")
    print("  Listening on: http://localhost:8000                             ")
    print("  Interactive API Documentation: http://localhost:8000/docs       ")
    print("  WebSocket Endpoint: ws://localhost:8000/ws                      ")
    print("==================================================================")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
