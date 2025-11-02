# TypeScript Logger Architecture

This document describes the architecture of the TypeScript logging library, inspired by log4js-node.

## Overview

The logging library is built with a modular architecture consisting of several key components that work together to provide flexible and powerful logging capabilities.

## Core Components

### 1. Level (`src/Level.ts`)

The `Level` class represents logging severity levels. Each level has:
- A numeric value (for comparison)
- A string representation (e.g., "INFO", "WARN")
- A color (for terminal output)

**Standard Levels** (from lowest to highest severity):
- `ALL` (Number.MIN_VALUE)
- `TRACE` (5000)
- `DEBUG` (10000)
- `INFO` (20000)
- `WARN` (30000)
- `ERROR` (40000)
- `FATAL` (50000)
- `MARK` (Number.MAX_SAFE_INTEGER)
- `OFF` (Number.MAX_VALUE)

**Key Methods**:
- `isLessThanOrEqualTo()` - Compare levels
- `isGreaterThanOrEqualTo()` - Compare levels
- `isEqualTo()` - Check equality
- `getLevel()` - Static method to retrieve level by name

### 2. LoggingEvent (`src/LoggingEvent.ts`)

Represents a single log event with all its metadata:
- `startTime` - Timestamp when log was created
- `categoryName` - Logger category
- `data` - Array of logged items
- `level` - Log level
- `context` - Key-value context data
- `pid` - Process ID
- `error` - Optional Error object
- `location` - Optional call stack information

**Key Methods**:
- `serialise()` - Convert to JSON string
- `deserialise()` - Static method to restore from JSON

### 3. Logger (`src/Logger.ts`)

The main logging interface that applications use. Each logger has:
- A category name
- A log level threshold
- A list of appenders
- A context object

**Key Methods**:
- Level-specific methods: `trace()`, `debug()`, `info()`, `warn()`, `error()`, `fatal()`
- Level checking: `isTraceEnabled()`, `isDebugEnabled()`, etc.
- Generic logging: `log(level, ...args)`
- Context management: `addContext()`, `removeContext()`, `clearContext()`

**Logging Flow**:
1. User calls logger method (e.g., `logger.info('message')`)
2. Logger checks if level is enabled
3. If enabled, creates a LoggingEvent
4. Passes event to all configured appenders

### 4. Appenders (`src/appenders/`)

Appenders are functions that output log events to specific destinations.

**Interface**:
```typescript
interface Appender {
  (event: LoggingEvent): void;
  shutdown?: (callback: (error?: Error) => void) => void;
}
```

**Built-in Appenders**:

#### Console Appender (`console.ts`)
- Outputs to stdout using `console.log()`
- Accepts a layout function for formatting

#### File Appender (`file.ts`)
- Writes logs to a file
- Creates directories if needed
- Supports custom layouts
- Uses async file operations

**Creating Custom Appenders**:
```typescript
function myAppender(layout: Layout): Appender {
  return (event: LoggingEvent) => {
    const output = layout(event);
    // Send output somewhere
  };
}
```

### 5. Layouts (`src/layouts/index.ts`)

Layouts format LoggingEvent objects into strings for output.

**Interface**:
```typescript
type Layout = (event: LoggingEvent) => string;
```

**Built-in Layouts**:

#### Basic Layout
- Simple message output
- Just the logged data joined with spaces

#### Colored Layout
- Adds ANSI color codes based on log level
- Format: `[LEVEL] message`

#### Pattern Layout
- Customizable format with tokens:
  - `%d{DATE}` - Date/time (ISO8601)
  - `%p` - Log level
  - `%c` - Category name
  - `%m` - Log message
- Default pattern: `%d{ISO8601} [%p] %c - %m`

**Creating Custom Layouts**:
```typescript
function myLayout(): Layout {
  return (event: LoggingEvent) => {
    return `[${event.level}] ${event.data.join(' ')}`;
  };
}
```

### 6. Configuration (`src/Configuration.ts`)

Manages the entire logging system configuration.

**Configuration Structure**:
```typescript
interface LoggerConfig {
  appenders: Record<string, {
    type: string;
    [key: string]: unknown;
  }>;
  categories: Record<string, {
    appenders: string[];
    level: string;
    enableCallStack?: boolean;
  }>;
}
```

**Registry Pattern**:
- Singleton `LoggerRegistry` manages all loggers
- Lazy initialization with default configuration
- Logger instances are cached and reused

**Key Methods**:
- `configure(config)` - Set up logging system
- `getLogger(category)` - Get or create logger
- `isConfigured()` - Check configuration status
- `shutdown(callback)` - Clean shutdown

## Data Flow

```
Application Code
    ↓
Logger.info('message')
    ↓
Check if level enabled?
    ↓ (yes)
Create LoggingEvent
    ↓
For each Appender
    ↓
Layout formats event
    ↓
Output to destination
```

## Design Patterns

### 1. Factory Pattern
- `getLogger()` creates or retrieves loggers
- `createAppender()` instantiates appenders

### 2. Strategy Pattern
- Layouts are interchangeable formatting strategies
- Appenders are interchangeable output strategies

### 3. Singleton Pattern
- `LoggerRegistry` is a singleton
- Each logger category is cached

### 4. Builder Pattern
- Configuration builds complex logger setups

## Configuration Examples

### Basic Console Logging
```typescript
configure({
  appenders: {
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'INFO' }
  }
});
```

### Multi-Appender Setup
```typescript
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
        pattern: '%d [%p] %c - %m' 
      }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'INFO' },
    app: { appenders: ['console', 'file'], level: 'DEBUG' },
    database: { appenders: ['file'], level: 'WARN' }
  }
});
```

## Extension Points

### Adding New Appenders
1. Implement the `Appender` interface
2. Export from `appenders/index.ts`
3. Add type to configuration handler

### Adding New Layouts
1. Implement a function returning `Layout`
2. Export from `layouts/index.ts`
3. Add support in configuration

### Adding New Log Levels
1. Create new Level instance
2. Add to `Level.levels` array
3. Logger methods can be added if needed

## TypeScript Features Used

- **Strict Type Checking**: Full type safety throughout
- **ES2022 Syntax**: Modern JavaScript features
- **ESM Modules**: Native ES module support
- **Type Guards**: Safe type narrowing
- **Union Types**: Flexible parameter types
- **Readonly Properties**: Immutable data
- **Optional Parameters**: Flexible APIs

## Differences from log4js-node

1. **Pure TypeScript**: Built from ground up in TS
2. **ESM Modules**: Native module system
3. **Simplified**: Focuses on core functionality
4. **Modern Async**: Uses async/await for file operations
5. **No Clustering**: Single-process focused (can be added)
6. **Type Safety**: Full compile-time type checking

## Performance Considerations

1. **Level Checking**: Fast numeric comparison
2. **Lazy Evaluation**: Logger creation on demand
3. **Async File I/O**: Non-blocking file writes
4. **Event Pooling**: Could be added for high-throughput scenarios

## Future Enhancements

Possible additions while maintaining the current architecture:

1. **More Appenders**:
   - HTTP/network appender
   - Database appender
   - Syslog appender

2. **Advanced Layouts**:
   - JSON layout
   - XML layout
   - Custom format strings

3. **Features**:
   - Log rotation
   - Log filtering
   - Log sampling
   - Clustering support
   - Performance metrics

4. **Developer Experience**:
   - Plugin system
   - Configuration validation
   - Hot reload
   - Better error messages
