# Quick Start Guide - TypeScript Logger

## Installation and Setup

1. Install dependencies:
```bash
pnpm install
```

2. Build the project:
```bash
pnpm build
```

3. Run tests:
```bash
pnpm test
```

4. Run example:
```bash
pnpm example
```

## Basic Usage

### Simple Logging

```typescript
import { getLogger } from './index.js';

const logger = getLogger('app');

logger.trace('Trace message');
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
logger.fatal('Fatal message');
```

### With Configuration

```typescript
import { configure, getLogger } from './index.js';

// Configure the logging system
configure({
  appenders: {
    console: { 
      type: 'console',
      layout: { type: 'colored' }
    },
    file: {
      type: 'file',
      filename: './logs/app.log',
      layout: { 
        type: 'pattern', 
        pattern: '%d{ISO8601} [%p] %c - %m' 
      }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'INFO' },
    app: { appenders: ['console', 'file'], level: 'DEBUG' }
  }
});

const logger = getLogger('app');
logger.info('Application started');
```

## Key Features

### 1. Log Levels

The library supports 9 log levels:
- `ALL` - Logs everything
- `TRACE` - Finest-grained debug info
- `DEBUG` - Debug information
- `INFO` - General information
- `WARN` - Warning messages
- `ERROR` - Error messages
- `FATAL` - Critical errors
- `MARK` - Important markers
- `OFF` - No logging

### 2. Multiple Appenders

Send logs to different destinations:
- **Console Appender**: Output to stdout
- **File Appender**: Write to files

### 3. Flexible Layouts

Format logs in different ways:
- **Basic Layout**: Simple message output
- **Colored Layout**: Color-coded levels
- **Pattern Layout**: Customizable format with tokens

### 4. Context

Add contextual information to all logs:

```typescript
const logger = getLogger('user-service');
logger.addContext('userId', '12345');
logger.addContext('sessionId', 'abc-xyz');
logger.info('User action'); // Context is included
```

### 5. Level Checking

Avoid expensive operations when logging is disabled:

```typescript
if (logger.isDebugEnabled()) {
  const expensiveData = computeExpensiveData();
  logger.debug('Data:', expensiveData);
}
```

## Project Structure

```
src/
├── Level.ts              # Log level definitions
├── Logger.ts             # Main logger class
├── LoggingEvent.ts       # Log event representation
├── Configuration.ts      # Configuration management
├── index.ts             # Main exports
├── appenders/           # Output destinations
│   ├── console.ts       # Console appender
│   ├── file.ts          # File appender
│   └── index.ts         # Exports
├── layouts/             # Formatting functions
│   └── index.ts         # All layouts
├── types/               # TypeScript types
│   └── Appender.ts      # Appender interface
├── example.ts           # Usage examples
└── test.ts              # Test suite
```

## Development Commands

```bash
# Build the project
pnpm build

# Watch mode (auto-rebuild on changes)
pnpm dev

# Run tests
pnpm test

# Run example
pnpm example

# Lint code
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

## Configuration Options

### Appender Types

**Console Appender:**
```typescript
{
  type: 'console',
  layout: { type: 'colored' }
}
```

**File Appender:**
```typescript
{
  type: 'file',
  filename: './logs/app.log',
  layout: { type: 'pattern', pattern: '%d [%p] %c - %m' }
}
```

### Layout Types

**Pattern Layout:**
```typescript
{
  type: 'pattern',
  pattern: '%d{ISO8601} [%p] %c - %m'
}
```
Tokens:
- `%d{DATE}` - Date/time (ISO8601)
- `%p` - Log level
- `%c` - Category name
- `%m` - Log message

**Colored Layout:**
```typescript
{ type: 'colored' }
```

**Basic Layout:**
```typescript
{ type: 'basic' }
```

## Extending the Library

### Custom Appender

```typescript
import { Appender } from './types/Appender.js';
import { LoggingEvent } from './LoggingEvent.js';
import { Layout } from './layouts/index.js';

export function myCustomAppender(config: { layout?: Layout }): Appender {
  return (event: LoggingEvent) => {
    const output = config.layout ? config.layout(event) : String(event.data);
    // Send output to your destination
    console.log(output);
  };
}
```

### Custom Layout

```typescript
import { Layout } from './layouts/index.js';

export function myCustomLayout(): Layout {
  return (event) => {
    return `${event.categoryName}: ${event.data.join(' ')}`;
  };
}
```

## Best Practices

1. **Use appropriate log levels**: Don't log everything at INFO
2. **Use categories**: Organize loggers by component/module
3. **Check levels**: Use `isDebugEnabled()` before expensive operations
4. **Add context**: Include relevant context information
5. **Configure per environment**: Different configs for dev/prod
6. **Separate concerns**: Use different appenders for different purposes

## Differences from log4js-node

This is a pure TypeScript rewrite, not a port. Key differences:

1. **Pure TypeScript** - Type safety throughout
2. **ESM Modules** - Native ES modules
3. **Modern Syntax** - ES2022 features
4. **Simplified** - Core functionality only
5. **No Clustering** - Single-process focused
6. **Async File I/O** - Non-blocking operations

## Examples

See `src/example.ts` for comprehensive usage examples.

Run with:
```bash
pnpm example
```

## Testing

The library includes 33 tests covering:
- Level system
- Logger creation and methods
- LoggingEvent serialization
- Appender integration
- Configuration
- Context management

Run tests with:
```bash
pnpm test
```

## Documentation

- `README-TS.md` - Main documentation
- `ARCHITECTURE.md` - Architecture and design patterns
- `QUICKSTART.md` - This quick start guide

## License

Apache-2.0

## Requirements

- Node.js 18+
- pnpm 9+
- TypeScript 5+
