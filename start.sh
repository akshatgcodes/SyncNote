#!/bin/bash
kill $(lsof -t -i:3001) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
sleep 1
cd "$(dirname "$0")/server" && node index.js &
SERVER_PID=$!
sleep 2
cd "$(dirname "$0")/client" && npm run dev
