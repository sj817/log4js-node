import { appendFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { LoggingEvent } from '../LoggingEvent.js';
import { Layout } from '../layouts/index.js';
import { Appender } from '../types/Appender.js';

/**
 * File appender configuration
 */
export interface FileAppenderConfig {
  filename: string;
  maxLogSize?: number;
  backups?: number;
  layout?: Layout;
}

/**
 * File appender - writes logs to a file
 */
export function fileAppender(config: FileAppenderConfig): Appender {
  const { filename, layout = (event) => `${event.level.toString()} ${event.data.join(' ')}\n` } =
    config;

  // Ensure directory exists
  const dir = dirname(filename);
  mkdir(dir, { recursive: true }).catch(() => {
    // Directory might already exist
  });

  const appender = async (event: LoggingEvent) => {
    const output = layout(event);
    try {
      await appendFile(filename, output, 'utf8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  };

  // Convert async function to sync-like for appender interface
  return (event: LoggingEvent) => {
    appender(event).catch((err) => {
      console.error('File appender error:', err);
    });
  };
}
