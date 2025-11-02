/**
 * TypeScript Logger - A modern logging library for Node.js
 * 
 * Inspired by log4js-node architecture but implemented with pure TypeScript,
 * modern syntax, and ESM modules.
 */

export { Level } from './Level.js';
export { Logger } from './Logger.js';
export { LoggingEvent, CallStack } from './LoggingEvent.js';
export { getLogger, configure, isConfigured, shutdown } from './Configuration.js';
export type { LoggerConfig, CategoryConfig } from './Configuration.js';
export { Appender, AppenderConfig } from './types/Appender.js';
export { Layout, basicLayout, coloredLayout, patternLayout, messagePassThroughLayout } from './layouts/index.js';
export { consoleAppender, fileAppender } from './appenders/index.js';
export type { FileAppenderConfig } from './appenders/file.js';

// Re-export main API as default
import { getLogger, configure, isConfigured, shutdown } from './Configuration.js';
import { Level } from './Level.js';

export default {
  getLogger,
  configure,
  isConfigured,
  shutdown,
  levels: Level,
};
