import { Mutex, Semaphore, withTimeout } from 'async-mutex';

import { messageConfirmationWaiting } from '../../config';

const messagesStorage = {};
let nextMessageId = 1;
const mutex = new Mutex();

const messages = () => Object.values(messagesStorage);

const insert = async (messageBody) => {
  const result = await mutex.runExclusive(async () => {
    const message = { id: nextMessageId, body: messageBody };
    messagesStorage[nextMessageId] = message;
    nextMessageId++;
    return message;
  });
  console.log('result', result);
  return result;
};

const consume = async () => {
  return await mutex.runExclusive(async () => {
    const result = [];
    messages().forEach((message) => {
      if (!message.consumedAt) {
        message.consumedAt = Date.now();
        result.push(message);
      }
    });

    return result;
  });
};

const deleteMessage = async (messageId) => {
  return await mutex.runExclusive(async () => {
    const message = messagesStorage[messageId];
    if (message && message.consumedAt) {
      delete messagesStorage[messageId];
      return message;
    }
    return {};
  });
};

const restoreUnconfirmed = async () => {
  return await mutex.runExclusive(async () => {
    messages().forEach((message) => {
      const { consumedAt } = message;
      if (
        consumedAt &&
      (Date.now() - consumedAt) * 1000 > messageConfirmationWaiting
      ) {
        message.consumedAt = undefined;
      }
    });
  });
};

export default { insert, consume, deleteMessage, restoreUnconfirmed };
