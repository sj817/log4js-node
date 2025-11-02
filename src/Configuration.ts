import { Level } from './Level.js';
import { Logger } from './Logger.js';
import { Appender } from './types/Appender.js';
import { consoleAppender, fileAppender } from './appenders/index.js';
import { patternLayout, coloredLayout, basicLayout } from './layouts/index.js';

/**
 * Configuration for a category
 */
export interface CategoryConfig {
  appenders: string[];
  level: string;
  enableCallStack?: boolean;
}

/**
 * Configuration for the logger
 */
export interface LoggerConfig {
  appenders: Record<string, {
    type: string;
    [key: string]: unknown;
  }>;
  categories: Record<string, CategoryConfig>;
}

/**
 * Logger registry and configuration
 */
class LoggerRegistry {
  private loggers = new Map<string, Logger>();
  private appenders = new Map<string, Appender>();
  private config: LoggerConfig | null = null;
  private configured = false;

  /**
   * Configure the logging system
   */
  configure(config: LoggerConfig): void {
    this.config = config;
    this.configured = true;
    this.appenders.clear();
    this.loggers.clear();

    // Setup appenders
    for (const [name, appenderConfig] of Object.entries(config.appenders)) {
      const appender = this.createAppender(appenderConfig);
      if (appender) {
        this.appenders.set(name, appender);
      }
    }
  }

  /**
   * Create an appender from configuration
   */
  private createAppender(config: { type: string; [key: string]: unknown }): Appender | null {
    const { type } = config;

    // Create layout if specified
    let layout;
    if (config.layout && typeof config.layout === 'object') {
      const layoutConfig = config.layout as { type: string; pattern?: string };
      switch (layoutConfig.type) {
        case 'pattern':
          layout = patternLayout(layoutConfig.pattern);
          break;
        case 'colored':
        case 'coloured':
          layout = coloredLayout();
          break;
        case 'basic':
          layout = basicLayout();
          break;
        default:
          layout = patternLayout();
      }
    }

    switch (type) {
      case 'console':
      case 'stdout':
        return consoleAppender(layout);
      case 'file':
        return fileAppender({
          filename: config.filename as string,
          layout,
        });
      default:
        console.warn(`Unknown appender type: ${type}`);
        return null;
    }
  }

  /**
   * Get or create a logger
   */
  getLogger(category: string = 'default'): Logger {
    if (!this.configured) {
      // Auto-configure with default settings
      this.configure({
        appenders: {
          console: { type: 'console' }
        },
        categories: {
          default: { appenders: ['console'], level: 'INFO' }
        }
      });
    }

    if (this.loggers.has(category)) {
      return this.loggers.get(category)!;
    }

    // Get category config or use default
    const categoryConfig = this.config?.categories[category] || 
                          this.config?.categories.default ||
                          { appenders: ['console'], level: 'INFO' };

    // Get appenders for this category
    const appenders: Appender[] = [];
    for (const appenderName of categoryConfig.appenders) {
      const appender = this.appenders.get(appenderName);
      if (appender) {
        appenders.push(appender);
      }
    }

    // Create logger
    const level = Level.getLevel(categoryConfig.level) || Level.INFO;
    const logger = new Logger(category, level, appenders);
    
    this.loggers.set(category, logger);
    return logger;
  }

  /**
   * Check if configured
   */
  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Shutdown all appenders
   */
  shutdown(callback: (error?: Error) => void = () => {}): void {
    this.configured = false;
    
    const appendersToShutdown = Array.from(this.appenders.values());
    const shutdownFunctions = appendersToShutdown.filter(a => a.shutdown);
    
    if (shutdownFunctions.length === 0) {
      callback();
      return;
    }

    let completed = 0;
    let error: Error | undefined;

    const complete = (err?: Error) => {
      error = error || err;
      completed += 1;
      if (completed >= shutdownFunctions.length) {
        callback(error);
      }
    };

    for (const appender of shutdownFunctions) {
      if (appender.shutdown) {
        appender.shutdown(complete);
      }
    }

    this.appenders.clear();
    this.loggers.clear();
  }
}

// Export singleton instance
export const registry = new LoggerRegistry();

/**
 * Get a logger instance
 */
export function getLogger(category?: string): Logger {
  return registry.getLogger(category);
}

/**
 * Configure the logging system
 */
export function configure(config: LoggerConfig): void {
  registry.configure(config);
}

/**
 * Check if configured
 */
export function isConfigured(): boolean {
  return registry.isConfigured();
}

/**
 * Shutdown the logging system
 */
export function shutdown(callback?: (error?: Error) => void): void {
  registry.shutdown(callback);
}
