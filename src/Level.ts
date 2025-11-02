/**
 * Represents a logging level with priority and color information
 */
export class Level {
  constructor(
    public readonly level: number,
    public readonly levelStr: string,
    public readonly colour: string
  ) {}

  toString(): string {
    return this.levelStr;
  }

  /**
   * Converts a string or Level to a Level instance
   */
  static getLevel(sArg?: string | Level | null, defaultLevel?: Level): Level | undefined {
    if (!sArg) {
      return defaultLevel;
    }

    if (sArg instanceof Level) {
      return sArg;
    }

    // Handle string case
    const levelStr = String(sArg).toUpperCase();
    return (Level[levelStr as keyof typeof Level] as Level) || defaultLevel;
  }

  /**
   * Check if this level is less than or equal to another level
   */
  isLessThanOrEqualTo(otherLevel: string | Level): boolean {
    const other = typeof otherLevel === 'string' ? Level.getLevel(otherLevel) : otherLevel;

    if (!other) {
      return false;
    }

    return this.level <= other.level;
  }

  /**
   * Check if this level is greater than or equal to another level
   */
  isGreaterThanOrEqualTo(otherLevel: string | Level): boolean {
    const other = typeof otherLevel === 'string' ? Level.getLevel(otherLevel) : otherLevel;

    if (!other) {
      return false;
    }

    return this.level >= other.level;
  }

  /**
   * Check if this level is equal to another level
   */
  isEqualTo(otherLevel: string | Level): boolean {
    const other = typeof otherLevel === 'string' ? Level.getLevel(otherLevel) : otherLevel;

    if (!other) {
      return false;
    }

    return this.level === other.level;
  }

  // Standard log levels
  static readonly ALL = new Level(Number.MIN_VALUE, 'ALL', 'grey');
  static readonly TRACE = new Level(5000, 'TRACE', 'blue');
  static readonly DEBUG = new Level(10000, 'DEBUG', 'cyan');
  static readonly INFO = new Level(20000, 'INFO', 'green');
  static readonly WARN = new Level(30000, 'WARN', 'yellow');
  static readonly ERROR = new Level(40000, 'ERROR', 'red');
  static readonly FATAL = new Level(50000, 'FATAL', 'magenta');
  static readonly MARK = new Level(Number.MAX_SAFE_INTEGER, 'MARK', 'grey');
  static readonly OFF = new Level(Number.MAX_VALUE, 'OFF', 'grey');

  static readonly levels = [
    Level.ALL,
    Level.TRACE,
    Level.DEBUG,
    Level.INFO,
    Level.WARN,
    Level.ERROR,
    Level.FATAL,
    Level.MARK,
    Level.OFF,
  ];
}
