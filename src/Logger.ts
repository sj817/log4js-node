import { Level } from './Level.js';
import { LoggingEvent } from './LoggingEvent.js';
import { Appender } from './types/Appender.js';

/**
 * Logger class - main interface for logging
 */
export class Logger {
  private context: Record<string, unknown> = {};
  private _level: Level = Level.INFO;
  private appenders: Appender[] = [];

  constructor(
    public readonly category: string,
    level: Level = Level.INFO,
    appenders: Appender[] = []
  ) {
    if (!category) {
      throw new Error('No category provided.');
    }
    this._level = level;
    this.appenders = appenders;
  }

  get level(): Level {
    return this._level;
  }

  set level(level: Level | string) {
    this._level = Level.getLevel(level) || Level.INFO;
  }

  /**
   * Check if a level is enabled
   */
  isLevelEnabled(level: Level | string): boolean {
    const logLevel = Level.getLevel(level);
    if (!logLevel) {
      return false;
    }
    return this._level.isLessThanOrEqualTo(logLevel);
  }

  /**
   * Internal log method
   */
  private _log(level: Level, ...args: unknown[]): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const error = args.find((item) => item instanceof Error) as Error | undefined;
    const event = new LoggingEvent(
      this.category,
      level,
      args,
      this.context,
      undefined,
      error
    );

    // Send to all appenders
    for (const appender of this.appenders) {
      try {
        appender(event);
      } catch (err) {
        console.error('Error in appender:', err);
      }
    }
  }

  /**
   * Generic log method
   */
  log(level: Level | string, ...args: unknown[]): void {
    const logLevel = Level.getLevel(level);
    if (!logLevel) {
      // Treat as INFO if level not recognized
      this._log(Level.INFO, level, ...args);
    } else {
      this._log(logLevel, ...args);
    }
  }

  /**
   * Log at TRACE level
   */
  trace(...args: unknown[]): void {
    this._log(Level.TRACE, ...args);
  }

  /**
   * Check if TRACE is enabled
   */
  isTraceEnabled(): boolean {
    return this.isLevelEnabled(Level.TRACE);
  }

  /**
   * Log at DEBUG level
   */
  debug(...args: unknown[]): void {
    this._log(Level.DEBUG, ...args);
  }

  /**
   * Check if DEBUG is enabled
   */
  isDebugEnabled(): boolean {
    return this.isLevelEnabled(Level.DEBUG);
  }

  /**
   * Log at INFO level
   */
  info(...args: unknown[]): void {
    this._log(Level.INFO, ...args);
  }

  /**
   * Check if INFO is enabled
   */
  isInfoEnabled(): boolean {
    return this.isLevelEnabled(Level.INFO);
  }

  /**
   * Log at WARN level
   */
  warn(...args: unknown[]): void {
    this._log(Level.WARN, ...args);
  }

  /**
   * Check if WARN is enabled
   */
  isWarnEnabled(): boolean {
    return this.isLevelEnabled(Level.WARN);
  }

  /**
   * Log at ERROR level
   */
  error(...args: unknown[]): void {
    this._log(Level.ERROR, ...args);
  }

  /**
   * Check if ERROR is enabled
   */
  isErrorEnabled(): boolean {
    return this.isLevelEnabled(Level.ERROR);
  }

  /**
   * Log at FATAL level
   */
  fatal(...args: unknown[]): void {
    this._log(Level.FATAL, ...args);
  }

  /**
   * Check if FATAL is enabled
   */
  isFatalEnabled(): boolean {
    return this.isLevelEnabled(Level.FATAL);
  }

  /**
   * Add context to logger
   */
  addContext(key: string, value: unknown): void {
    this.context[key] = value;
  }

  /**
   * Remove context from logger
   */
  removeContext(key: string): void {
    delete this.context[key];
  }

  /**
   * Clear all context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Add an appender to this logger
   */
  addAppender(appender: Appender): void {
    this.appenders.push(appender);
  }
}
