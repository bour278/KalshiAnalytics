# 📊 Kalshi Analytics Platform

> A comprehensive analytics and arbitrage detection platform for prediction market trading

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)

## 🚀 Overview

Kalshi Analytics is a sophisticated trading platform that provides real-time analytics, arbitrage detection, and comprehensive market analysis for prediction markets. The platform specializes in cross-platform monitoring between Kalshi and Polymarket, offering traders powerful tools to identify profitable opportunities.

## ✨ Key Features

### 📈 **Advanced Analytics Dashboard**
- Real-time market data visualization
- Price movement analysis and trending
- Volume and liquidity metrics
- Order book depth analysis
- Technical indicators and overlays

### 🔄 **Arbitrage Detection**
- Cross-platform price monitoring (Kalshi ↔ Polymarket)
- Automated opportunity identification
- Risk-adjusted profit calculations
- Contract matching engine with smart algorithms
- Historical arbitrage performance tracking

### 🛠️ **Trading Tools**
- Arbitrage calculator with profit/ROI analysis
- Sweep price calculator for large orders
- Probability estimator from market data
- Customizable price alerts and notifications
- Data export capabilities

### 📊 **Market Analysis**
- Information flow analysis
- Price distribution modeling
- Volume analysis by category
- Platform comparison metrics
- Predictive analytics

## 🏗️ Project Structure

```
KalshiAnalytics/
├── 📁 client/                 # Frontend React application
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   │   ├── 📁 dashboard/  # Dashboard-specific components
│   │   │   ├── 📁 layout/     # Layout components (Header, Sidebar)
│   │   │   └── 📁 ui/         # Base UI components (shadcn/ui)
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 lib/            # Utility functions and configurations
│   │   ├── 📁 pages/          # Page components/routes
│   │   └── 📄 main.tsx        # Application entry point
│   └── 📄 index.html          # HTML template
├── 📁 server/                 # Backend API server
├── 📁 shared/                 # Shared types and schemas
├── 📁 docs/                   # Project documentation
├── 📁 assets/                 # Static assets
└── 📄 README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bour278/KalshiAnalytics.git
   cd KalshiAnalytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Recharts** - Composable charting library
- **React Query** - Server state management
- **Wouter** - Minimalist routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe development

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

## 📱 Pages & Features

| Page | Description | Key Features |
|------|-------------|--------------|
| **Dashboard** | Main overview | Stats, charts, market overview |
| **Contracts** | Contract explorer | Search, filter, detailed listings |
| **Arbitrage** | Opportunity finder | Cross-platform comparisons, profit calculations |
| **Analytics** | Advanced analysis | Probability modeling, information flow |
| **Charts** | Price visualization | Technical analysis, multiple timeframes |
| **Tools** | Trading utilities | Calculators, alerts, data export |