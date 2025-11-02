/**
 * Example usage of the TypeScript logger
 */
import { getLogger, configure } from './index.js';

// Example 1: Basic usage with default configuration
console.log('=== Example 1: Basic Usage ===');
const logger1 = getLogger('app');
logger1.info('This is an info message');
logger1.warn('This is a warning');
logger1.error('This is an error');

// Example 2: Custom configuration
console.log('\n=== Example 2: Custom Configuration ===');
configure({
  appenders: {
    console: { 
      type: 'console',
      layout: { type: 'colored' }
    },
    file: {
      type: 'file',
      filename: './logs/app.log',
      layout: { type: 'pattern', pattern: '%d{ISO8601} [%p] %c - %m' }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'DEBUG' },
    app: { appenders: ['console', 'file'], level: 'INFO' }
  }
});

const logger2 = getLogger('app');
logger2.trace('This will not be logged (level is INFO)');
logger2.debug('This will not be logged (level is INFO)');
logger2.info('Application started');
logger2.warn('This is a warning with context');
logger2.error('An error occurred', new Error('Test error'));

// Example 3: Using context
console.log('\n=== Example 3: Logger Context ===');
const logger3 = getLogger('user-service');
logger3.addContext('userId', '12345');
logger3.addContext('sessionId', 'abc-def-ghi');
logger3.info('User logged in');

// Example 4: Different log levels
console.log('\n=== Example 4: Different Log Levels ===');
const logger4 = getLogger('test');
logger4.level = 'TRACE';

if (logger4.isTraceEnabled()) {
  logger4.trace('Trace level message');
}
if (logger4.isDebugEnabled()) {
  logger4.debug('Debug level message');
}
logger4.info('Info level message');
logger4.warn('Warn level message');
logger4.error('Error level message');
logger4.fatal('Fatal level message');

console.log('\nExample completed!');
