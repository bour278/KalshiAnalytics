# Architecture Overview

## 🏗️ System Architecture

Kalshi Analytics follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React SPA)   │◄──►│   (Node.js)     │◄──►│   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 Frontend Architecture

### Technology Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Query** for server state
- **Wouter** for routing
- **Recharts** for data visualization

### Component Hierarchy
```
App.tsx
├── Layout Components
│   ├── Sidebar
│   └── Header
├── Page Components
│   ├── Dashboard
│   ├── Analytics
│   ├── Arbitrage
│   └── Tools
└── Shared Components
    ├── UI Components (shadcn/ui)
    └── Dashboard Components
```

### State Management
- **Server State**: React Query for API data
- **Local State**: React hooks (useState, useReducer)
- **Global State**: Context API for theme/user preferences

## 🔧 Backend Architecture

### API Structure
```
server/
├── routes.ts        # API route definitions
├── index.ts         # Server setup and middleware
├── storage.ts       # Data layer abstraction
└── vite.ts         # Development server integration
```

### Data Flow
1. **External APIs** → Kalshi & Polymarket APIs
2. **Data Processing** → Normalization and analysis
3. **Caching** → Redis/Memory for performance
4. **Client** → RESTful API responses

## 📊 Data Architecture

### Data Sources
- **Kalshi API** - Primary prediction market data
- **Polymarket API** - Secondary market for arbitrage
- **Historical Data** - Stored analysis and trends

### Data Flow
```
External APIs → Data Normalization → Processing → Cache → Frontend
                      ↓
                 Database Storage
```

### Schemas
Located in `shared/schema.ts`:
- Contract definitions
- Market data structures
- User preferences
- Analytics results

## 🔄 Development Workflow

### Build Process
1. **TypeScript Compilation** - Type checking
2. **Vite Bundling** - Modern build tooling
3. **Tailwind Processing** - CSS optimization
4. **Asset Optimization** - Images and static files

### Development Server
- **Frontend**: Vite dev server (port 5173)
- **Backend**: Express server (port 3000)
- **Hot Reload**: Automatic refresh on changes

## 🚀 Deployment Architecture

### Production Build
```bash
npm run build       # Build frontend
npm run build:server # Build backend
```

### Hosting Strategy
- **Frontend**: Static hosting (Vercel, Netlify)
- **Backend**: Node.js hosting (Railway, Heroku)
- **Database**: PostgreSQL with Drizzle ORM

## 🔐 Security Considerations

### API Security
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable management

### Data Privacy
- No personal trading data storage
- Public market data only
- Secure API key management

## 📈 Performance Optimizations

### Frontend
- **Code Splitting** - Dynamic imports for routes
- **Lazy Loading** - Components loaded on demand
- **Memoization** - React.memo for expensive components
- **Virtual Scrolling** - Large data tables

### Backend
- **Caching** - Aggressive caching of market data
- **Connection Pooling** - Database optimization
- **Rate Limiting** - Prevent API abuse
- **Compression** - Gzip/Brotli for responses

## 🔧 Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Error boundary implementation

### User Analytics
- Usage pattern analysis
- Feature adoption metrics
- Performance bottleneck identification

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests** - Component logic testing
- **Integration Tests** - API integration
- **E2E Tests** - User flow validation

### Backend Testing
- **API Tests** - Endpoint validation
- **Integration Tests** - Database operations
- **Load Tests** - Performance validation

## 📚 Documentation Standards

### Code Documentation
- JSDoc for complex functions
- README files for each major component
- Architecture decision records (ADRs)

### API Documentation
- OpenAPI/Swagger specifications
- Request/response examples
- Error code documentation 