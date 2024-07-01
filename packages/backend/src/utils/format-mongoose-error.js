function formatMongooseError(error) {
  if (!error.errors) return [];

  return Object.keys(error.errors).map((field) => ({
    path: error.errors[field].path,
    message: error.errors[field].message,
  }));
}

module.exports = formatMongooseError;
