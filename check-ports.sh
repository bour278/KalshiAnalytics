#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking port availability for Kalshi Analytics...${NC}"

# Check required ports
PORTS=(3000 5173 8000)
PORT_NAMES=("Node.js Backend" "Frontend Dev Server" "Python Kalshi API")

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $PORT ($NAME) is already in use${NC}"
        
        # Get process info
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null)
        
        echo -e "${YELLOW}   Process: $PROCESS (PID: $PID)${NC}"
        echo -e "${YELLOW}   To kill: kill -9 $PID${NC}"
        echo
    else
        echo -e "${GREEN}✅ Port $PORT ($NAME) is available${NC}"
    fi
done

echo
echo -e "${BLUE}💡 If you need to kill processes on specific ports:${NC}"
echo -e "${YELLOW}   Kill process on port 3000: kill -9 \$(lsof -ti:3000)${NC}"
echo -e "${YELLOW}   Kill process on port 5173: kill -9 \$(lsof -ti:5173)${NC}"
echo -e "${YELLOW}   Kill process on port 8000: kill -9 \$(lsof -ti:8000)${NC}"
echo
echo -e "${BLUE}🚀 To start the services: ./start-dev.sh${NC}" 