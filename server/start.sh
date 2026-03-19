#!/bin/bash
kill $(lsof -t -i:3001) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
sleep 1
cd ~/Desktop/syncnote2/server && node index.js &
SERVER_PID=$!
sleep 2
cd ~/Desktop/syncnote2/client && npm run dev &
CLIENT_PID=$!
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT
wait