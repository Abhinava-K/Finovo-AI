#!/bin/bash
# FinovoAI Azure App Service Startup Script
echo "Starting FinovoAI Backend on Azure App Service..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
