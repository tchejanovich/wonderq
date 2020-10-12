import Storage from '../../services/storage';

const withErrorHandler = async (res, requestLogic) => {
  try {
    await requestLogic();
  } catch (error) {
    res.status(500).send('Unexpected error');
  }
};

export const create = async ({ body }, res) => {
  withErrorHandler(res, async () => {
    const message = await Storage.insert(body);

    res.status(201).json(message);
  });
};

export const index = async (_, res) => {
  withErrorHandler(res, async () => {
    const messages = await Storage.consume();
    res.status(200).json(messages);
  });
};

export const update = async ({ params }, res) => {
  withErrorHandler(res, async () => {
    const { id } = params;
    const message = await Storage.deleteMessage(id);

    if (message === -1) {
      res.status(404).send(`There is no consumed message with ID ${id}`);
    } else {
      res.status(200).json(message);
    }
  });
};
