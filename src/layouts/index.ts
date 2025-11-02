import { LoggingEvent } from '../LoggingEvent.js';

/**
 * Layout function type - formats a LoggingEvent to string
 */
export type Layout = (event: LoggingEvent) => string;

/**
 * ANSI color codes
 */
const styles: Record<string, [number, number]> = {
  white: [37, 39],
  grey: [90, 39],
  black: [90, 39],
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [91, 39],
  yellow: [33, 39],
};

function colorize(str: string, style?: string): string {
  if (!style || !styles[style]) {
    return str;
  }
  const [start, end] = styles[style];
  return `\x1B[${start}m${str}\x1B[${end}m`;
}

/**
 * Basic layout - just message data
 */
export function basicLayout(): Layout {
  return (event: LoggingEvent) => {
    return event.data.map((d) => String(d)).join(' ');
  };
}

/**
 * Colored layout - adds level color
 */
export function coloredLayout(): Layout {
  return (event: LoggingEvent) => {
    const level = colorize(`[${event.level.toString()}]`, event.level.colour);
    const message = event.data.map((d) => String(d)).join(' ');
    return `${level} ${message}`;
  };
}

/**
 * Pattern layout - customizable format
 * Supports tokens: %d{DATE}, %p (level), %c (category), %m (message), %pid (process ID), %pm_id (PM2 process ID)
 */
export function patternLayout(pattern: string = '%d{ISO8601} [%p] %c - %m'): Layout {
  return (event: LoggingEvent) => {
    let result = pattern;

    // Replace date
    result = result.replace(/%d(?:\{([^}]+)\})?/g, () => {
      return event.startTime.toISOString();
    });

    // Replace process IDs first (before %p to avoid conflicts)
    result = result.replace(/%pm_id/g, process.env.pm_id || String(event.pid));
    result = result.replace(/%pid/g, String(event.pid));

    // Replace level
    result = result.replace(/%p/g, event.level.toString());

    // Replace category
    result = result.replace(/%c/g, event.categoryName);

    // Replace message
    const message = event.data.map((d) => String(d)).join(' ');
    result = result.replace(/%m/g, message);

    return result + '\n';
  };
}

/**
 * Message pass-through layout
 */
export function messagePassThroughLayout(): Layout {
  return (event: LoggingEvent) => {
    return event.data[0] as string;
  };
}
