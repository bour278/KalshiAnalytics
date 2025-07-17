# Contributing to Kalshi Analytics

Thank you for your interest in contributing to Kalshi Analytics! This document provides guidelines and information for contributors.

## 🎯 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork the repository**
   ```bash
   git fork https://github.com/bour278/KalshiAnalytics.git
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/KalshiAnalytics.git
   cd KalshiAnalytics
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
client/src/
├── components/
│   ├── dashboard/    # Dashboard-specific components
│   ├── layout/       # Layout components (Header, Sidebar)
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
└── pages/           # Page components/routes
```

## 🎨 Code Style

We use the following tools to maintain code quality:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Files**: kebab-case (`my-component.tsx`)
- **Variables**: camelCase (`myVariable`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🧩 Component Guidelines

### Creating New Components

1. Use TypeScript for all components
2. Follow the existing file structure
3. Include proper TypeScript interfaces
4. Add JSDoc comments for complex logic

```tsx
interface MyComponentProps {
  title: string;
  isActive?: boolean;
}

/**
 * A reusable component for displaying titles
 */
export default function MyComponent({ title, isActive = false }: MyComponentProps) {
  return (
    <div className={cn("base-styles", isActive && "active-styles")}>
      {title}
    </div>
  );
}
```

### UI Components

- Use the existing shadcn/ui components when possible
- Follow Tailwind CSS utility-first approach
- Maintain dark theme consistency (`slate-900`, `slate-800`, etc.)
- Use the `cn()` utility for conditional classes

## 📊 Adding New Features

### New Pages
1. Create the page component in `client/src/pages/`
2. Add the route to `App.tsx`
3. Update navigation in `sidebar.tsx`
4. Follow the existing layout pattern:

```tsx
export default function NewPage() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page content */}
        </div>
      </main>
    </div>
  );
}
```

### New Dashboard Components
1. Add components to `client/src/components/dashboard/`
2. Use React Query for data fetching
3. Include loading and error states
4. Make components responsive

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing patterns
   - Test your changes

3. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Provide a clear description
   - Include screenshots for UI changes
   - Reference any related issues

### Commit Message Format

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed steps
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - Browser, OS, Node.js version
6. **Screenshots** - If applicable

## 💡 Feature Requests

For feature requests:

1. Check existing issues first
2. Provide a clear use case
3. Explain the expected behavior
4. Consider implementation complexity

## 📞 Questions?

- Open an issue for bug reports or feature requests
- Join discussions in existing issues
- Contact the maintainer: josephaldojbbr@gmail.com

Thank you for contributing! 🎉 