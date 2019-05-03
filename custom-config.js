'use strict';

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'first-cpu-idle',
      'time-to-interactive',
      'estimated-input-latency',
      'time-to-first-byte',
    ]
  },
};
