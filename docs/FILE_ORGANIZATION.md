# 📁 File Organization Guide

This document explains the organized file structure of the Kalshi Analytics project.

## 🎯 **Why We Organized Files**

The project was reorganized to:
- **Clean up the root directory** - Keep only essential files at the top level
- **Group related functionality** - Scripts, docs, and services in dedicated folders
- **Improve maintainability** - Easier to find and manage files
- **Follow best practices** - Standard directory structure for multi-service projects

## 📂 **New Directory Structure**

### **Root Directory (Clean & Simple)**
```
KalshiAnalytics/
├── run.sh                    # Quick start (Linux/macOS)
├── run.bat                   # Quick start (Windows)  
├── check-ports.sh            # Port checker (Linux/macOS)
├── check-ports.bat           # Port checker (Windows)
├── docker-compose.yml        # Container orchestration
├── package.json              # Node.js dependencies
└── README.md                 # Main documentation
```

### **Organized Subdirectories**

#### **📁 `scripts/` - Development Utilities**
```
scripts/
├── start-dev.sh             # Detailed startup script (Linux/macOS)
├── start-dev.bat            # Detailed startup script (Windows)
├── check-ports.sh           # Port conflict detection (Linux/macOS)
└── check-ports.bat          # Port conflict detection (Windows)
```

#### **📁 `docs/` - Documentation**
```
docs/
├── KALSHI_API_SETUP.md      # Comprehensive setup guide
├── ARCHITECTURE.md          # System architecture
├── features.md              # Feature documentation
├── project-overview.md      # Project overview
├── project-specs.md         # Technical specifications
├── CONTRIBUTING.md          # Contribution guidelines
└── FILE_ORGANIZATION.md     # This file
```

#### **📁 `python-service/` - Kalshi API Microservice**
```
python-service/
├── main.py                  # FastAPI application
├── kalshi_client.py         # Kalshi API integration
├── analytics.py             # Market analytics engine
├── models.py                # Data models
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container definition
└── config.env               # API credentials (gitignored)
```

#### **📁 `server/` - Node.js Backend**
```
server/
├── index.ts                 # Main server entry point
├── routes.ts                # API route definitions
├── storage.ts               # Data layer
├── kalshi-service.ts        # Python service integration
└── vite.ts                  # Development server setup
```

#### **📁 `client/` - React Frontend**
```
client/
├── src/
│   ├── components/          # UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Base UI components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities and configurations
├── index.html               # HTML template
└── public/                  # Static assets
```

## 🚀 **Simple Usage**

### **Quick Start (No Need to Navigate Directories)**
```bash
# Windows
run.bat

# Linux/macOS  
./run.sh
```

### **Port Checking**
```bash
# Windows
check-ports.bat

# Linux/macOS
./check-ports.sh
```

### **Manual Access to Detailed Scripts**
```bash
# If you need the full-featured scripts
./scripts/start-dev.sh       # Linux/macOS
scripts\start-dev.bat        # Windows
```

## 🔧 **Configuration Files**

### **Root Level (Essential)**
- `package.json` - Node.js project configuration
- `docker-compose.yml` - Multi-container setup
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Styling configuration
- `vite.config.ts` - Build tool configuration

### **Service Level (Specific)**
- `python-service/config.env` - Kalshi API credentials
- `python-service/requirements.txt` - Python dependencies
- `client/components.json` - UI component configuration

## 📋 **Benefits of This Organization**

1. **Cleaner Root Directory** - Only essential files visible at the top level
2. **Logical Grouping** - Related files are grouped together
3. **Easy Navigation** - Clear directory structure
4. **Better Git History** - Changes are organized by functionality
5. **Scalable Structure** - Easy to add new services or documentation
6. **Development Efficiency** - Quick access to commonly used scripts

## 🔍 **Finding Files Quickly**

| What you need | Where to look |
|---------------|---------------|
| **Start the app** | `run.sh` or `run.bat` in root |
| **Setup instructions** | `docs/KALSHI_API_SETUP.md` |
| **Fix port conflicts** | `check-ports.sh/bat` in root |
| **Modify startup process** | `scripts/start-dev.*` |
| **API credentials** | `python-service/config.env` |
| **Add new features** | Service-specific directories |
| **Documentation** | `docs/` directory |

This organization makes the project more professional, maintainable, and user-friendly! 🎉 