import { LoggingEvent } from '../LoggingEvent.js';

/**
 * Interface for all appenders
 */
export interface Appender {
  (event: LoggingEvent): void;
  shutdown?: (callback: (error?: Error) => void) => void;
}

/**
 * Base configuration for appenders
 */
export interface AppenderConfig {
  type: string;
  layout?: {
    type: string;
    [key: string]: unknown;
  };
}
