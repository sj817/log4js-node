import { Level } from './Level.js';

/**
 * Represents the location/call stack information for a log event
 */
export interface CallStack {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  callStack?: string;
  className?: string;
  functionName?: string;
  functionAlias?: string;
  callerName?: string;
}

/**
 * Represents a logging event
 */
export class LoggingEvent {
  readonly startTime: Date;
  readonly categoryName: string;
  readonly data: unknown[];
  readonly level: Level;
  readonly context: Record<string, unknown>;
  readonly pid: number;
  readonly error?: Error;
  readonly location?: CallStack;

  constructor(
    categoryName: string,
    level: Level,
    data: unknown[],
    context: Record<string, unknown> = {},
    location?: CallStack,
    error?: Error
  ) {
    this.startTime = new Date();
    this.categoryName = categoryName;
    this.data = data;
    this.level = level;
    this.context = { ...context };
    this.pid = process.pid;
    this.error = error;

    if (location) {
      this.location = location;
    }
  }

  /**
   * Serialize the logging event to JSON
   */
  serialise(): string {
    return JSON.stringify(this, (_key, value) => {
      // Handle Error objects specially
      if (value instanceof Error) {
        return {
          ...value,
          message: value.message,
          stack: value.stack,
        };
      }
      return value;
    });
  }

  /**
   * Deserialize a logging event from JSON
   */
  static deserialise(serialised: string): LoggingEvent {
    try {
      const parsed = JSON.parse(serialised);
      return new LoggingEvent(
        parsed.categoryName,
        Level.getLevel(parsed.level?.levelStr) || Level.INFO,
        parsed.data,
        parsed.context,
        parsed.location,
        parsed.error
      );
    } catch (e) {
      return new LoggingEvent(
        'ts-logger',
        Level.ERROR,
        ['Unable to parse log:', serialised, 'because:', e]
      );
    }
  }
}
