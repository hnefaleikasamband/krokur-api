import pino from 'pino';

const logger = pino({
  base: null,
  messageKey: 'message',
  redact: {
    censor: '[Hidden]',
    paths: ['*.password', '*.passwordHash'],
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  useLevelLabels: true,
});

export default logger;
