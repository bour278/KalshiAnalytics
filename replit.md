# Kalshi Trading Analytics Platform

## Overview

This is a comprehensive trading analytics platform designed to analyze futures event contracts between Kalshi and Polymarket. The application provides real-time market insights, arbitrage opportunities, order book analytics, and trading metrics through a modern web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom trading-specific color palette
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful API with Express routes
- **Session Management**: PostgreSQL-based session storage

### Data Storage Solutions
- **Database**: PostgreSQL with the following key tables:
  - `users`: User authentication and management
  - `contracts`: Trading contracts from both platforms
  - `price_history`: Historical price data for contracts
  - `order_book_data`: Order book snapshots and analytics
  - `arbitrage_opportunities`: Cross-platform arbitrage analysis
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definitions with Zod validation

### Authentication and Authorization
- **Session-based authentication** using PostgreSQL session storage
- **User management** with username/password authentication
- **Protected routes** on both frontend and backend

### External Service Integrations
- **Kalshi API**: Integration for fetching contract data and market information
- **Polymarket API**: Integration for cross-platform arbitrage analysis
- **Real-time data**: WebSocket connections for live market updates

## Key Components

### Dashboard Components
1. **Stats Overview**: Real-time market statistics and key metrics
2. **Price Charts**: VWAP/TWAP visualization with timeframe selection
3. **Order Book Charts**: Visual representation of bid/ask spreads
4. **Arbitrage Table**: Cross-platform opportunity tracking
5. **Market Overview**: Sector breakdowns and market summaries
6. **Order Book Analytics**: Deep dive into order book patterns
7. **Liquidity Metrics**: Market liquidity analysis and scoring

### Layout Components
- **Sidebar Navigation**: Multi-level navigation with trading, analytics, and tools sections
- **Header**: Real-time status indicators and current time display
- **Responsive Design**: Mobile-first approach with breakpoint-aware components

### UI Components
- **Comprehensive Component Library**: 40+ reusable UI components
- **Trading-specific Styling**: Custom color scheme for financial applications
- **Interactive Elements**: Tooltips, dialogs, and contextual menus
- **Data Visualization**: Charts, progress bars, and metric displays

## Data Flow

### Client-Side Data Flow
1. **Component Queries**: React Query manages API calls and caching
2. **Real-time Updates**: Automatic refetching with configurable intervals
3. **State Management**: Server state cached and synchronized across components
4. **Error Handling**: Graceful error states and retry mechanisms

### Server-Side Data Flow
1. **API Routes**: Express routes handle client requests
2. **Database Operations**: Drizzle ORM manages database interactions
3. **Data Validation**: Zod schemas ensure data integrity
4. **Response Formatting**: Consistent API response structure

### External Data Integration
1. **Platform APIs**: Scheduled fetching from Kalshi and Polymarket
2. **Data Processing**: Price normalization and arbitrage calculation
3. **Storage**: Processed data stored in PostgreSQL
4. **Analytics**: Real-time computation of trading metrics

## External Dependencies

### Core Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connection
- **ORM**: `drizzle-orm` and `drizzle-kit` for database management
- **UI Framework**: Multiple `@radix-ui` packages for component primitives
- **Query Management**: `@tanstack/react-query` for server state
- **Charts**: `recharts` for data visualization
- **Validation**: `zod` for schema validation
- **Styling**: `tailwindcss`, `class-variance-authority`, and `clsx`

### Development Dependencies
- **Build Tools**: Vite for frontend, esbuild for backend
- **TypeScript**: Full type safety across the application
- **Development Experience**: Replit-specific plugins and error handling

## Deployment Strategy

### Development Environment
- **Development Server**: Vite dev server with HMR for frontend
- **Backend Server**: tsx for TypeScript execution with auto-reload
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Environment**: Replit-optimized with custom plugins

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: esbuild bundle for Node.js deployment
- **Database**: Drizzle migrations for schema management
- **Assets**: Static file serving through Express

### Key Features Implemented
1. **Arbitrage Detection**: Cross-platform price comparison and opportunity identification
2. **Order Book Analysis**: Deep market structure analysis with sweep prices
3. **Price Tracking**: Historical price data with VWAP/TWAP calculations
4. **Market Metrics**: Liquidity analysis and trading volume tracking
5. **Real-time Updates**: Live market data with configurable refresh intervals
6. **Responsive Design**: Mobile-optimized trading interface
7. **Contract Explorer**: Full contract browsing with search and filtering
8. **Advanced Analytics**: Probability modeling, price distribution, and information flow analysis
9. **Trading Tools**: Arbitrage calculators, sweep price calculators, and configuration tools
10. **Multi-page Navigation**: Complete navigation system with sidebar and routing

### Current Pages
1. **Dashboard**: Real-time overview with key metrics and visualizations
2. **Contracts**: Contract explorer with search, filtering, and detailed listings
3. **Arbitrage**: Cross-platform arbitrage analysis with opportunity tracking
4. **Analytics**: Advanced analytics with probability modeling and market analysis
5. **Tools**: Trading calculators, utilities, and user preferences
6. **Charts**: Price charts with multiple timeframes and technical analysis
7. **Overview**: Market overview with sector breakdowns and performance metrics
8. **Matching**: Contract matching system with similarity analysis
9. **Calculators**: Financial calculators for arbitrage, sweep pricing, and position sizing

### Planned Features
1. **News Integration**: Market event correlation with price movements
2. **User Authentication**: Portfolio tracking and personalized settings
3. **Real API Integration**: Live data from Kalshi and Polymarket APIs
4. **Advanced Alerts**: Custom price and arbitrage alert systems