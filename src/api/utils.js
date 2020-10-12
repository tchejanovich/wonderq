export const withErrorHandler = async (res, requestLogic) => {
  try {
    await requestLogic();
  } catch (error) {
    res.status(500).send('Unexpected error');
  }
};
