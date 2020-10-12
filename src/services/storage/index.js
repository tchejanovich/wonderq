const messages = {};
let nextMessageId = 1;

const insert = messageBody => {
  const message = { id: nextMessageId, body: messageBody };
  messages[nextMessageId] = message;
  nextMessageId++;
  return message;
};

const readAll = () => { return Object.values(messages); };

export default { insert, readAll };
