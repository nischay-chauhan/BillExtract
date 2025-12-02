#!/bin/bash
# Run the backend server accessible from the network
# This is required for testing with physical mobile devices
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
