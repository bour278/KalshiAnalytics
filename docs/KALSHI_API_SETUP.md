# Kalshi API Integration Setup Guide

This guide explains how to set up and use the real Kalshi API integration for your KalshiAnalytics project.

## 🏗️ Architecture Overview

The project now uses a **microservices architecture** with:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Node.js       │    │   Python        │
│   (React)       │◄──►│   Backend       │◄──►│   Kalshi API    │
│   Port 5173     │    │   Port 3000     │    │   Service       │
└─────────────────┘    └─────────────────┘    │   Port 8000     │
                                              └─────────────────┘
```

### Components:

1. **Python Kalshi API Service** (`python-service/`): Handles all Kalshi API communication, data processing, and analytics
2. **Node.js Backend** (`server/`): Serves the frontend and communicates with the Python service
3. **React Frontend** (`client/`): User interface for the analytics dashboard

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Kalshi account** with API access

### Option 1: Using Startup Scripts (Recommended for Development)

#### Check for Port Conflicts First:
```bash
# Windows:
check-ports.bat

# Linux/macOS:
./check-ports.sh
```

#### Start All Services:
```bash
# Windows:
run.bat

# Linux/macOS:
./run.sh
```

> **Note:** The simple commands above use wrapper scripts that call the detailed scripts in the `scripts/` directory.

### Option 2: Manual Setup

#### 1. Set up Python Kalshi API Service

```bash
cd python-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create configuration file
cp config.env config.local.env
# Edit config.local.env with your credentials
```

#### 2. Configure Kalshi API Credentials

Create `python-service/config.env` with your Kalshi credentials:

```env
# Kalshi API Configuration
KALSHI_BASE_URL=https://trading-api.kalshi.com/trade-api/v2
KALSHI_EMAIL=your-email@example.com
KALSHI_PASSWORD=your-password

# Demo Environment (for testing)
# KALSHI_BASE_URL=https://demo-api.kalshi.co/trade-api/v2

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Analytics Configuration
MAX_MARKETS_FOR_ARBITRAGE=500
ARBITRAGE_MIN_SPREAD_PERCENTAGE=1.0
```

#### 3. Start Python Service

```bash
cd python-service
python main.py
```

The service will start on `http://localhost:8000`

#### 4. Start Node.js Backend

```bash
# In project root
npm install

# Set environment variable for Python service
export PYTHON_SERVICE_URL="http://localhost:8000"  # Linux/macOS
set PYTHON_SERVICE_URL=http://localhost:8000        # Windows

npm run dev
```

The backend will start on `http://localhost:3000`

#### 5. Access the Application

Open `http://localhost:5173` in your browser.

## 🐳 Docker Setup

### Development with Docker Compose

```bash
# Create .env file with your credentials
cp .env.example .env
# Edit .env with your Kalshi credentials

# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Services will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Python API: `http://localhost:8000`

## 📊 Available Data & Features

### Real Kalshi Data

The Python service fetches real data from Kalshi API:

- **Markets**: All active prediction markets
- **Order Books**: Real-time bid/ask data
- **Trades**: Recent trade history
- **Analytics**: Price efficiency, volatility, momentum
- **Arbitrage**: Cross-market opportunities

### API Endpoints

The Python service provides these endpoints:

```
GET /health                           # Health check
GET /markets                          # Get all markets
GET /markets/{ticker}/orderbook       # Get order book
GET /markets/{ticker}/analytics       # Get market analytics
GET /arbitrage                        # Get arbitrage opportunities
GET /dashboard/stats                  # Get dashboard statistics
```

### Dashboard Features

- **Real-time Market Data**: Live prices and volumes
- **Advanced Analytics**: Volatility, momentum, efficiency scores
- **Arbitrage Detection**: Automated opportunity identification
- **Order Book Analysis**: Depth, spreads, price impact
- **Liquidity Metrics**: Market depth and trading costs

## 🔧 Configuration Options

### Kalshi API Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `KALSHI_BASE_URL` | API base URL | `https://trading-api.kalshi.com/trade-api/v2` |
| `KALSHI_EMAIL` | Your Kalshi email | Required |
| `KALSHI_PASSWORD` | Your Kalshi password | Required |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | API rate limiting | `60` |

### Analytics Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_MARKETS_FOR_ARBITRAGE` | Markets to scan for arbitrage | `500` |
| `ARBITRAGE_MIN_SPREAD_PERCENTAGE` | Minimum spread to report | `1.0` |
| `CACHE_TTL_SECONDS` | Data cache duration | `300` |

## 🚨 Important Notes

### API Rate Limits

- Kalshi has rate limits (typically 60 requests/minute)
- The service automatically handles rate limiting
- Consider caching for production use

### Authentication

- Store credentials securely
- Use environment variables, not hardcoded values
- Consider using demo environment for testing

### Error Handling

The service includes fallback mechanisms:
- If Python service is down, Node.js serves cached/mock data
- If Kalshi API is down, returns appropriate error messages
- Automatic retries for transient failures

## 🔍 Monitoring & Debugging

### Health Checks

```bash
# Check Python service
curl http://localhost:8000/health

# Check backend
curl http://localhost:3000/api/dashboard/stats
```

### Logs

- Python service logs are output to console
- Use `LOG_LEVEL=DEBUG` for detailed logging
- Check browser console for frontend errors

### Common Issues

1. **Port already in use (EADDRINUSE)**
   - Check what's using the ports: Run `check-ports.sh` (Linux/macOS) or `check-ports.bat` (Windows)
   - Kill conflicting processes or change ports in configuration
   - Default ports: Python (8000), Node.js (3000), Frontend (5173)

2. **"Failed to fetch from Kalshi service"**
   - Check if Python service is running
   - Verify credentials in config.env
   - Check network connectivity

3. **Rate limiting errors**
   - Reduce request frequency
   - Increase `RATE_LIMIT_REQUESTS_PER_MINUTE`
   - Implement caching

4. **Authentication failures**
   - Verify Kalshi credentials
   - Check if account has API access
   - Try demo environment first

## 📈 Production Deployment

### Environment Variables

Set these in production:

```env
NODE_ENV=production
PYTHON_SERVICE_URL=http://kalshi-api:8000
KALSHI_EMAIL=your-production-email
KALSHI_PASSWORD=your-production-password
LOG_LEVEL=INFO
```

### Security Considerations

- Use HTTPS in production
- Secure credential storage (e.g., AWS Secrets Manager)
- Implement proper CORS policies
- Add authentication/authorization if needed

### Scaling

- Python service can be horizontally scaled
- Consider Redis for shared caching
- Use load balancer for multiple instances

## 🤝 Contributing

### Adding New Features

1. **New Analytics**: Add to `python-service/analytics.py`
2. **New Endpoints**: Add to `python-service/main.py`
3. **Frontend Components**: Add to `client/src/components/`

### Testing

```bash
# Test Python service
cd python-service
python -m pytest

# Test Node.js backend
npm test
```

## 📚 API Documentation

The Python service provides interactive API docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🆘 Support

For issues:
1. Check logs for error messages
2. Verify configuration settings
3. Test with Kalshi demo environment
4. Check Kalshi API status
5. Create an issue with detailed error information

---

**🎉 You're now ready to use real Kalshi data in your analytics dashboard!** 