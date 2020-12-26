import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, label } = format;
const logFormat = format.printf(
  ({
    level,
    message,
    label,
    timestamp,
  }: {
    level: string;
    message: string;
    label: string;
    timestamp: string;
  }) => `${timestamp} [${level}]: ${message} (${label})`
);
const loggers: Record<string, Logger> = {};

export const getLogger: (name: string, sendToConsole: boolean) => Logger = (
  name,
  sendToConsole = true
) => {
  if (loggers[name]) {
    return loggers[name];
  } else {
    let transportArray: (
      | transports.FileTransportInstance
      | transports.ConsoleTransportInstance
    )[] = [new transports.File({ filename: `./logs/all.log` })];

    if (sendToConsole) transportArray = [new transports.Console(), ...transportArray];

    loggers[name] = createLogger({
      level: 'info',
      exitOnError: false,
      format: combine(label({ label: name }), timestamp(), logFormat),
      transports: transportArray,
    });

    return loggers[name];
  }
};
