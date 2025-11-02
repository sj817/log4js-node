# TypeScript Logger

A modern, pure TypeScript logging library for Node.js v18+, inspired by the log4js-node architecture.

## Features

- ✨ Pure TypeScript with full type safety
- 📦 ESM modules (ES2022)
- 🚀 Modern Node.js v18+ support
- 🎨 Configurable layouts and appenders
- 📝 Multiple log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
- 🎯 Category-based logging
- 🔧 Flexible configuration
- 💾 Console and file appenders
- 🎨 Colored console output

## Installation

```bash
pnpm install
pnpm build
```

## Quick Start

```typescript
import { getLogger } from './index.js';

// Get a logger with default configuration
const logger = getLogger('app');

logger.trace('Trace message');
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
logger.fatal('Fatal message');
```

## Configuration

Configure the logging system with custom appenders and categories:

```typescript
import { configure, getLogger } from './index.js';

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
logger.info('Configured logger');
```

## Log Levels

The logger supports the following levels (in ascending order of severity):

- `ALL` - All log messages
- `TRACE` - Finest-grained informational events
- `DEBUG` - Fine-grained informational events for debugging
- `INFO` - Informational messages highlighting application progress
- `WARN` - Potentially harmful situations
- `ERROR` - Error events that might still allow the application to continue
- `FATAL` - Very severe error events that might cause the application to abort
- `MARK` - Marker for significant events
- `OFF` - No logging

## Appenders

### Console Appender

Writes log events to stdout:

```typescript
{
  type: 'console',
  layout: { type: 'colored' }
}
```

### File Appender

Writes log events to a file:

```typescript
{
  type: 'file',
  filename: './logs/app.log',
  layout: { type: 'pattern', pattern: '%d %p %c - %m' }
}
```

## Layouts

### Pattern Layout

Customizable format with tokens:

- `%d{DATE}` - Date/time
- `%p` - Log level
- `%c` - Category name
- `%m` - Log message

```typescript
{ 
  type: 'pattern', 
  pattern: '%d{ISO8601} [%p] %c - %m' 
}
```

### Colored Layout

Adds color to log levels:

```typescript
{ type: 'colored' }
```

### Basic Layout

Simple message output:

```typescript
{ type: 'basic' }
```

## Context

Add contextual information to log events:

```typescript
const logger = getLogger('user-service');
logger.addContext('userId', '12345');
logger.addContext('sessionId', 'abc-def');
logger.info('User action'); // Context included in log event

logger.removeContext('sessionId');
logger.clearContext();
```

## Level Checking

Check if a log level is enabled before expensive operations:

```typescript
if (logger.isDebugEnabled()) {
  const expensiveData = computeExpensiveData();
  logger.debug('Data:', expensiveData);
}
```

## Architecture

This library follows the log4js-node architecture with these main components:

1. **Level** - Represents log severity levels
2. **Logger** - Main logging interface
3. **LoggingEvent** - Represents a single log event
4. **Appender** - Outputs log events to destinations
5. **Layout** - Formats log events for output
6. **Configuration** - Manages logger setup and categories

## Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

### Run Example

```bash
pnpm build
node dist/example.js
```

### Format Code

```bash
pnpm format
```

## Differences from log4js-node

This is a pure TypeScript rewrite inspired by log4js-node's architecture, not a port:

- Uses modern ES2022 syntax and ESM modules
- Written entirely in TypeScript with full type safety
- Simplified API focused on common use cases
- No clustering support (can be added later)
- Async file operations
- Modern Node.js v18+ features

## License

Apache-2.0
