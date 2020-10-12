const messagesStorage = {};
let nextMessageId = 1;

const insert = messageBody => {
  const message = { id: nextMessageId, body: messageBody };
  messagesStorage[nextMessageId] = message;
  nextMessageId++;
  return message;
};

const readAll = () => {
  const result = [];
  Object.values(messagesStorage).forEach(message => {
    if (!message.consumedAt) {
      message.consumedAt = Date.now();
      result.push(message);
    }
  });

  return result;
};

const all = () => Object.values(messagesStorage);

const deleteMessage = messageId => {
  const message = messagesStorage[messageId];
  delete messagesStorage[messageId];
  return message;
};

export default { insert, readAll, deleteMessage, all };
