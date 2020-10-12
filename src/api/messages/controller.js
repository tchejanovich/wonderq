import Storage from '../../services/storage';

export const create = ({ body }, res, next) => {
  const message = Storage.insert(body);

  res.status(201).json(message);
};

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  res.status(200).json(Storage.readAll());

export const show = ({ params }, res, next) =>
  res.status(200).json({});

export const update = ({ body, params }, res, next) =>
  res.status(200).json(body);

export const destroy = ({ params }, res, next) =>
  res.status(204).end();
