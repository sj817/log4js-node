import { LoggingEvent } from '../LoggingEvent.js';
import { Layout } from '../layouts/index.js';

/**
 * Console appender - writes logs to stdout
 */
export function consoleAppender(layout: Layout = (event) => `${event.level.toString()} ${event.data.join(' ')}`): (event: LoggingEvent) => void {
  return (event: LoggingEvent) => {
    const output = layout(event);
    console.log(output);
  };
}
