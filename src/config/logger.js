import pino from 'pino';

const logger = pino({
  base: null,
  messageKey: 'message',
  redact: {
    censor: '[Hidden]',
    paths: ['*.password', '*.passwordHash'],
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level: (label, number) => ({ level: label }),
  },
});

export default logger;
