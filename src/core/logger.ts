import chalk from 'chalk';

const logTime = () => {
  let nowDate = new Date();
  return nowDate.toLocaleDateString() + ' ' + nowDate.toLocaleTimeString([], { hour12: false });
};

export enum LOG_TYPES {
  NONE=0, ERROR, NORMAL, DEBUG, FFDEBUG
}

const chalkedTypeString = (type: LOG_TYPES) => {
  switch (type) {
    case LOG_TYPES.NORMAL:
      return chalk.bold.green('[INFO]')
    case LOG_TYPES.ERROR:
      return chalk.bold.red('[ERROR]')
    case LOG_TYPES.DEBUG:
      return chalk.bold.blue('[DEBUG]')
    case LOG_TYPES.FFDEBUG:
      return chalk.bold.blue('[FFDEBUG]')
  }
  return "[UNKNOWN]"
}

export const Logger = new (class Logger {
  level = LOG_TYPES.NORMAL

  output(type: LOG_TYPES, args: any[]) {
    if (this.level < type) return
    console.log(
      logTime(),
      process.pid,
      chalkedTypeString(type),
      ...args
    )
  }

  log(...args: any[]) {
    this.output(LOG_TYPES.NORMAL, args)
  }

  error(...args: any[]) {
    this.output(LOG_TYPES.ERROR, args)
  }

  debug(...args: any[]) {
    this.output(LOG_TYPES.DEBUG, args)
  }

  ffdebug(...args: any[]) {
    this.output(LOG_TYPES.FFDEBUG, args)
  }
})()
