const notFound = (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
};

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: error.message || 'Server error.'
  });
};

module.exports = {
  notFound,
  errorHandler
};
