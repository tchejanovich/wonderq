import { Mutex } from 'async-mutex';

import { messageConfirmationWaiting } from '../../config';

const messagesStorage = {};
let nextMessageId = 1;
const mutex = new Mutex();

const messages = () => Object.values(messagesStorage);
const withMutex = async callback => await mutex.runExclusive(callback);

const insert = async (messageBody) =>
  await withMutex(async () => {
    const message = { id: nextMessageId, body: messageBody };
    messagesStorage[nextMessageId] = message;
    nextMessageId++;
    return message;
  });

const consume = async () =>
  await withMutex(async () => {
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

const restoreUnconfirmed = async () =>
  await withMutex(async () => {
    messages().forEach((message) => {
      const { id, consumedAt } = message;
      if (
        consumedAt &&
      (Date.now() - consumedAt) * 1000 > messageConfirmationWaiting
      ) {
        console.log('Restoring message', id);
        message.consumedAt = undefined;
      }
    });
  });

export default { insert, consume, deleteMessage, restoreUnconfirmed };
