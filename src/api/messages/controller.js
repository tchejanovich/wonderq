import Storage from '../../services/storage';

export const create = ({ body }, res) => {
  const message = Storage.insert(body);

  res.status(201).json(message);
};

export const index = (_, res) =>
  res.status(200).json(Storage.readAll());

export const all = (_, res) =>
  res.status(200).json(Storage.all());

export const update = ({ body, params }, res, next) => {
  const { id } = params;
  const message = Storage.deleteMessage(id);

  res.status(200).json(message);
};
