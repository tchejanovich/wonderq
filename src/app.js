import http from 'http';
import { env, port, ip, apiRoot, messageConfirmationWaiting } from './config';
import express from './services/express';
import Storage from './services/storage';
import api from './api';

const app = express(apiRoot, api);
const server = http.createServer(app);

setInterval(() => {
  console.log('Restoring unconfirmed messages');
  Storage.restoreUnconfirmed();
}, messageConfirmationWaiting * 1000);

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env);
  });
});

export default app;
