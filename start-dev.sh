#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Kalshi Analytics Development Environment${NC}"

# Check if Python 3.11+ is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed${NC}"
    exit 1
fi

# Function to start Python service
start_python_service() {
    echo -e "${YELLOW}📦 Starting Python Kalshi API service...${NC}"
    cd python-service
    
    # Check if virtual environment exists, create if not
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}🔨 Creating Python virtual environment...${NC}"
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo -e "${YELLOW}📥 Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    
    # Check if config.env exists
    if [ ! -f "config.env" ]; then
        echo -e "${RED}❌ config.env file not found in python-service directory${NC}"
        echo -e "${YELLOW}📝 Please create config.env with your Kalshi API credentials:${NC}"
        echo "KALSHI_EMAIL=your-email@example.com"
        echo "KALSHI_PASSWORD=your-password"
        echo "KALSHI_BASE_URL=https://trading-api.kalshi.com/trade-api/v2"
        exit 1
    fi
    
    # Load environment variables
    export $(cat config.env | xargs)
    
    # Start the service
    echo -e "${GREEN}🐍 Starting Python service on port 8000...${NC}"
    python main.py &
    PYTHON_PID=$!
    
    cd ..
}

# Function to start Node.js backend
start_nodejs_backend() {
    echo -e "${YELLOW}📦 Starting Node.js backend...${NC}"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📥 Installing Node.js dependencies...${NC}"
        npm install
    fi
    
    # Set environment variables
    export PYTHON_SERVICE_URL="http://localhost:8000"
    export PORT="3000"
    
    # Start the backend
    echo -e "${GREEN}⚡ Starting Node.js backend on port 3000...${NC}"
    npm run dev &
    NODEJS_PID=$!
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}📦 Starting frontend development server...${NC}"
    
    # Start frontend (this will be in foreground)
    echo -e "${GREEN}🌐 Starting frontend on port 5173...${NC}"
    echo -e "${BLUE}🔗 Open http://localhost:5173 in your browser${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    if [ ! -z "$PYTHON_PID" ]; then
        kill $PYTHON_PID 2>/dev/null
    fi
    if [ ! -z "$NODEJS_PID" ]; then
        kill $NODEJS_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start services
start_python_service
sleep 5  # Wait for Python service to start

start_nodejs_backend
sleep 3  # Wait for Node.js backend to start

start_frontend

# Wait for user input
read -p "Press Enter to stop all services..."
cleanup 