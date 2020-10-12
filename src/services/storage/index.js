import { Mutex } from 'async-mutex';

import { messageConfirmationWaiting } from '../../config';
import { sleep } from '../../utils';

let messagesStorage = {};
let nextMessageId = 1;
const mutex = new Mutex();

const messages = () => Object.values(messagesStorage);
const withMutex = async (callback) => await mutex.runExclusive(callback);

// Used only for testing purposes
const restart = () => {
  messagesStorage = {};
  nextMessageId = 1;
};

const insert = async (messageBody) =>
  await withMutex(async () => {
    const message = { id: nextMessageId, body: messageBody };
    messagesStorage[nextMessageId] = message;
    nextMessageId++;
    return message;
  });

const consume = async () => await withMutex(async () => {
  // Useful for concurrency test.
  // Additional configuration may be required if the "sleep" function increases the tests execution time too much.
  if (process.env.NODE_ENV === 'test') {
    await sleep(250);
  }

  const result = [];
  messages().forEach((message) => {
    if (!message.consumedAt) {
      message.consumedAt = Date.now();
      result.push(message);
    }
  });

  return result;
});

const deleteMessage = async (messageId) =>
  await withMutex(async () => {
    const message = messagesStorage[messageId];
    if (message && message.consumedAt) {
      delete messagesStorage[messageId];
      return message;
    }
    return -1; // Result -1 means there is no consumed message with the specified messageId
  });

const SECOND = 1000; // In miliseconds
const hasConsummationExpired = (message) =>
  Date.now() - message.consumedAt >= messageConfirmationWaiting * SECOND;

const restoreUnconfirmed = async () =>
  await withMutex(async () => {
    messages().forEach((message) => {
      const { id, consumedAt } = message;
      if (consumedAt && hasConsummationExpired(message)) {
        console.log('Restoring message', id);
        message.consumedAt = undefined;
      }
    });
  });

export default { insert, consume, deleteMessage, restoreUnconfirmed, restart };
