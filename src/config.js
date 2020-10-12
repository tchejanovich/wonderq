/* eslint-disable no-unused-vars */
import path from 'path';
import merge from 'lodash/merge';

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',
    apiRoot: process.env.API_ROOT || '',
    messageConfirmationWaiting: 5 // In seconds
  },
  test: {},
  development: {
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080
  }
};

module.exports = merge(config.all, config[config.all.env]);
export default module.exports;
