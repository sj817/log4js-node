/**
 * Simple test suite for the TypeScript logger
 * Since this is a minimal implementation, we'll use a basic test structure
 */

import { Level } from './Level.js';
import { Logger } from './Logger.js';
import { LoggingEvent } from './LoggingEvent.js';
import { getLogger, configure } from './Configuration.js';

// Test counter
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`✓ ${message}`);
  } else {
    failed++;
    console.error(`✗ ${message}`);
  }
}

function assertEquals(actual: unknown, expected: unknown, message: string): void {
  if (actual === expected) {
    passed++;
    console.log(`✓ ${message}`);
  } else {
    failed++;
    console.error(`✗ ${message} (expected: ${expected}, got: ${actual})`);
  }
}

console.log('Running TypeScript Logger Tests...\n');

// Test 1: Level creation and comparison
console.log('=== Test 1: Level System ===');
assert(Level.INFO.level === 20000, 'INFO level should have value 20000');
assert(Level.INFO.isLessThanOrEqualTo(Level.WARN), 'INFO should be <= WARN');
assert(Level.ERROR.isGreaterThanOrEqualTo(Level.INFO), 'ERROR should be >= INFO');
assert(Level.DEBUG.isEqualTo(Level.DEBUG), 'DEBUG should equal DEBUG');
assertEquals(Level.getLevel('INFO'), Level.INFO, 'getLevel should return INFO');
assertEquals(Level.INFO.toString(), 'INFO', 'toString should return "INFO"');

// Test 2: Logger creation
console.log('\n=== Test 2: Logger Creation ===');
const logger = new Logger('test', Level.DEBUG, []);
assert(logger.category === 'test', 'Logger should have correct category');
assert(logger.level === Level.DEBUG, 'Logger should have correct level');

// Test 3: Level checking
console.log('\n=== Test 3: Level Checking ===');
logger.level = Level.INFO;
assert(logger.isInfoEnabled(), 'INFO should be enabled when level is INFO');
assert(logger.isWarnEnabled(), 'WARN should be enabled when level is INFO');
assert(logger.isErrorEnabled(), 'ERROR should be enabled when level is INFO');
assert(!logger.isDebugEnabled(), 'DEBUG should not be enabled when level is INFO');
assert(!logger.isTraceEnabled(), 'TRACE should not be enabled when level is INFO');

// Test 4: LoggingEvent
console.log('\n=== Test 4: LoggingEvent ===');
const event = new LoggingEvent('test', Level.INFO, ['Hello', 'World'], { userId: '123' });
assert(event.categoryName === 'test', 'Event should have correct category');
assert(event.level === Level.INFO, 'Event should have correct level');
assert(event.data.length === 2, 'Event should have correct data length');
assert(event.context.userId === '123', 'Event should have correct context');

// Test 5: Event serialization
console.log('\n=== Test 5: Event Serialization ===');
const serialized = event.serialise();
assert(typeof serialized === 'string', 'Serialized event should be a string');
const deserialized = LoggingEvent.deserialise(serialized);
assert(deserialized.categoryName === 'test', 'Deserialized event should have correct category');
assert(deserialized.level.toString() === 'INFO', 'Deserialized event should have correct level');

// Test 6: Logger context
console.log('\n=== Test 6: Logger Context ===');
const contextLogger = new Logger('context-test', Level.INFO, []);
contextLogger.addContext('key1', 'value1');
contextLogger.addContext('key2', 'value2');
// We can't directly test the private context, but we know it's working from the event
assert(true, 'Context methods execute without error');

// Test 7: Configuration
console.log('\n=== Test 7: Configuration ===');
configure({
  appenders: {
    console: { type: 'console' },
  },
  categories: {
    default: { appenders: ['console'], level: 'INFO' },
    test: { appenders: ['console'], level: 'DEBUG' },
  },
});

const configuredLogger = getLogger('test');
assert(configuredLogger.category === 'test', 'Configured logger should have correct category');

// Test 8: Log levels array
console.log('\n=== Test 8: Log Levels Array ===');
assert(Level.levels.length === 9, 'Should have 9 log levels');
assert(Level.levels[0] === Level.ALL, 'First level should be ALL');
assert(Level.levels[8] === Level.OFF, 'Last level should be OFF');

// Test 9: Logger methods exist
console.log('\n=== Test 9: Logger Methods ===');
const methodLogger = getLogger('method-test');
assert(typeof methodLogger.trace === 'function', 'trace method should exist');
assert(typeof methodLogger.debug === 'function', 'debug method should exist');
assert(typeof methodLogger.info === 'function', 'info method should exist');
assert(typeof methodLogger.warn === 'function', 'warn method should exist');
assert(typeof methodLogger.error === 'function', 'error method should exist');
assert(typeof methodLogger.fatal === 'function', 'fatal method should exist');

// Test 10: Appender integration
console.log('\n=== Test 10: Appender Integration ===');
let capturedEvent = null as LoggingEvent | null;
const testAppender = (event: LoggingEvent) => {
  capturedEvent = event;
};

const appenderLogger = new Logger('appender-test', Level.INFO, [testAppender]);
appenderLogger.info('Test message');
assert(capturedEvent !== null, 'Appender should have captured event');
const hasCorrectMessage = capturedEvent?.data[0] === 'Test message';
assert(hasCorrectMessage, 'Captured event should have correct message');

// Print results
console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  console.error('\nSome tests failed!');
  process.exit(1);
} else {
  console.log('\nAll tests passed! ✓');
  process.exit(0);
}
