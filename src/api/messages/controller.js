import Storage from '../../services/storage';

export const create = async ({ body }, res) => {
  const message = await Storage.insert(body);

  res.status(201).json(message);
};

export const index = async (_, res) => {
  const messages = await Storage.consume();
  res.status(200).json(messages);
};

export const update = async ({ params }, res) => {
  const { id } = params;
  const message = await Storage.deleteMessage(id);

  res.status(200).json(message);
};
