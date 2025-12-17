/**
 * Ryan Logger
 */
class Logger {
  constructor(prefix = 'Ryan') {
    this.prefix = prefix;
  }

  _format(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.prefix}] ${level}: ${message}`;
  }

  info(message, meta = {}) {
    console.log(this._format('INFO', message), Object.keys(meta).length ? meta : '');
  }

  warn(message, meta = {}) {
    console.warn(this._format('WARN', message), Object.keys(meta).length ? meta : '');
  }

  error(message, meta = {}) {
    console.error(this._format('ERROR', message), Object.keys(meta).length ? meta : '');
  }

  debug(message, meta = {}) {
    if (process.env.DEBUG === 'true') {
      console.log(this._format('DEBUG', message), Object.keys(meta).length ? meta : '');
    }
  }
}

module.exports = { Logger };
